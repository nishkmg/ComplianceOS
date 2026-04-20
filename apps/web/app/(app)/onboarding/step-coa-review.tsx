"use client";

import { useState, useCallback } from "react";
import { AccountTree, flattenTreeToRefinements, type TreeNode } from "./components/account-tree";

interface StepCoaReviewProps {
  templateKey: string;
  onBack: () => void;
  onNext: () => void;
}

interface SeedCoaResult {
  accountCount: number;
}

async function fetchSeedCoa(input: {
  tenantId: string;
  businessType: string;
  industry: string;
  refinements?: {
    accounts: Array<{
      code: string;
      name: string;
      isEnabled: boolean;
      children?: Array<{ code: string; name: string; isEnabled: boolean; children?: unknown[] }>;
    }>;
  };
}): Promise<SeedCoaResult> {
  const response = await fetch("/api/trpc/onboarding.seedCoa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`seedCoa failed: ${response.status} ${text}`);
  }
  const json = await response.json();
  return json.result?.data ?? { accountCount: 0 };
}

async function fetchSaveProgress(input: {
  tenantId: string;
  step: number;
  data: Record<string, unknown>;
}): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.saveProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    throw new Error(`Save progress failed: ${response.statusText}`);
  }
}

// Template display names
const TEMPLATE_LABELS: Record<string, string> = {
  sole_proprietorship_trading: "Sole Proprietorship – Trading",
  sole_proprietorship_services: "Sole Proprietorship – Services",
  partnership_trading: "Partnership – Trading",
  partnership_services: "Partnership – Services",
  llp_services: "LLP – Services",
  private_limited_trading: "Private Limited – Trading",
  private_limited_services: "Private Limited – Services",
  private_limited_manufacturing: "Private Limited – Manufacturing",
  huf_trading: "HUF – Trading",
  regulated_professional: "Regulated Professional",
};

export default function StepCoaReview({ templateKey, onBack, onNext }: StepCoaReviewProps) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [treeReady, setTreeReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intercept tree nodes from AccountTree once loaded
  // We pass a callback ref so AccountTree can notify us when it's ready
  const handleTreeReady = useCallback((nodes: TreeNode[]) => {
    setTreeNodes(nodes);
    setTreeReady(true);
  }, []);

  const handleValidateAndContinue = async () => {
    if (!treeReady || treeNodes.length === 0) {
      setError("Please wait for the chart of accounts to load.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get tenantId from session storage (set by step 1)
      const tenantId = sessionStorage.getItem("onboarding_tenant_id");
      if (!tenantId) {
        throw new Error("No tenant ID found. Please complete step 1 first.");
      }

      // Derive businessType + industry from templateKey
      const parts = templateKey.split("_");
      const businessType = parts.slice(0, -1).join("_"); // e.g. "sole_proprietorship"
      const industry = parts[parts.length - 1]; // e.g. "trading"

      // Flatten tree to refinements input
      const refinements = flattenTreeToRefinements(treeNodes);

      // Check: at least one enabled account per kind
      const enabledByKind: Record<string, number> = {};
      for (const acc of refinements.accounts) {
        if (!enabledByKind[acc.code.charAt(0)]) enabledByKind[acc.code.charAt(0)] = 0;
        if (acc.isEnabled) enabledByKind[acc.code.charAt(0)]++;
      }

      // Seed CoA
      await fetchSeedCoa({
        tenantId,
        businessType,
        industry,
        refinements,
      });

      // Save progress (step 3)
      await fetchSaveProgress({
        tenantId,
        step: 3,
        data: { coa: { templateKey, refinements } },
      });

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed chart of accounts. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const templateLabel = TEMPLATE_LABELS[templateKey] ?? templateKey;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Chart of Accounts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review and customize your chart of accounts. Toggle accounts off to exclude them from your books.
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <span className="font-medium">Template:</span> {templateLabel}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* AccountTree with ready callback */}
      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[480px] overflow-y-auto">
        <TreeLoader templateKey={templateKey} onReady={handleTreeReady} />
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          disabled={isSubmitting}
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {!treeReady ? "Loading..." : `${countEnabled(treeNodes)} accounts will be created`}
          </span>
          <button
            type="button"
            onClick={handleValidateAndContinue}
            disabled={isSubmitting || !treeReady}
            className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Seeding..." : "Validate & Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TreeLoader ─────────────────────────────────────────────────────────────────

interface TreeLoaderProps {
  templateKey: string;
  onReady: (nodes: TreeNode[]) => void;
}

// Loads the template JSON and extracts nodes to pass back via onReady
async function loadTemplateNodes(templateKey: string): Promise<TreeNode[]> {
  type TemplateAccount = {
    code: string;
    name: string;
    kind: string;
    subType: string;
    isSystem: boolean;
    children: TemplateAccount[];
  };

  const mod = await import(
    `../../../../../../../packages/db/src/seed/coa-templates/${templateKey}.json`
  );
  const accounts: TemplateAccount[] = mod.default;

  function buildNode(acc: TemplateAccount): TreeNode {
    return {
      id: acc.code,
      code: acc.code,
      name: acc.name,
      kind: acc.kind as TreeNode["kind"],
      subType: acc.subType,
      isEnabled: true,
      hasChildren: acc.children.length > 0,
      isNew: false,
      children: acc.children.map(buildNode),
    };
  }

  return accounts.map(buildNode);
}

function TreeLoader({ templateKey, onReady }: TreeLoaderProps) {
  const [nodes, setNodes] = useState<TreeNode[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useState(() => {
    loadTemplateNodes(templateKey)
      .then((n) => {
        setNodes(n);
        onReady(n);
      })
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "Failed to load template");
      });
  });

  if (loadError) {
    return (
      <div className="p-6 text-center text-sm text-red-600">
        Failed to load template: {loadError}
      </div>
    );
  }

  if (!nodes) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading chart of accounts...
      </div>
    );
  }

  return (
    <AccountTreeInternal nodes={nodes} onNodesChange={(n) => { setNodes(n); onReady(n); }} />
  );
}

// ─── AccountTreeInternal ────────────────────────────────────────────────────────
// Inline accordion-based tree (self-contained, no shadcn dependency)

interface AccountTreeInternalProps {
  nodes: TreeNode[];
  onNodesChange: (nodes: TreeNode[]) => void;
}

function AccountTreeInternal({ nodes, onNodesChange }: AccountTreeInternalProps) {
  const KIND_CONFIG: Record<TreeNode["kind"], { label: string; color: string; headerBg: string }> = {
    Asset: { label: "Assets", color: "text-blue-700", headerBg: "bg-blue-50 border-blue-200" },
    Liability: { label: "Liabilities", color: "text-orange-700", headerBg: "bg-orange-50 border-orange-200" },
    Equity: { label: "Equity", color: "text-green-700", headerBg: "bg-green-50 border-green-200" },
    Revenue: { label: "Revenue", color: "text-purple-700", headerBg: "bg-purple-50 border-purple-200" },
    Expense: { label: "Expenses", color: "text-red-700", headerBg: "bg-red-50 border-red-200" },
  };

  const grouped = nodes.reduce<Record<TreeNode["kind"], TreeNode[]>>((acc, n) => {
    acc[n.kind].push(n);
    return acc;
  }, { Asset: [], Liability: [], Equity: [], Revenue: [], Expense: [] });

  const updateNode = useCallback(
    (id: string, updates: Partial<TreeNode>) => {
      const upd = (list: TreeNode[]): TreeNode[] =>
        list.map((n) => {
          if (n.id === id) return { ...n, ...updates };
          if (n.hasChildren) return { ...n, children: upd(n.children) };
          return n;
        });
      onNodesChange(upd(nodes));
    },
    [nodes, onNodesChange]
  );

  const addChild = useCallback(
    (parentId: string, name: string) => {
      const newChild: TreeNode = {
        id: `${parentId}-NEW`,
        code: `${parentId}-NEW`,
        name,
        kind: nodes.find((n) => n.id === parentId)?.kind ?? "Asset",
        subType: "UserAdded",
        isEnabled: true,
        hasChildren: false,
        isNew: true,
        children: [],
      };
      const upd = (list: TreeNode[]): TreeNode[] =>
        list.map((n) => {
          if (n.id === parentId) return { ...n, hasChildren: true, children: [...n.children, newChild] };
          if (n.hasChildren) return { ...n, children: upd(n.children) };
          return n;
        });
      onNodesChange(upd(nodes));
    },
    [nodes, onNodesChange]
  );

  const deleteNode = useCallback(
    (id: string) => {
      const del = (list: TreeNode[]): TreeNode[] =>
        list
          .filter((n) => n.id !== id)
          .map((n) => ({ ...n, children: n.hasChildren ? del(n.children) : n.children }));
      onNodesChange(del(nodes));
    },
    [nodes, onNodesChange]
  );

  const validationErrors = useCallback((): Record<TreeNode["kind"], string | null> => {
    const errors: Partial<Record<TreeNode["kind"], string | null>> = {};
    for (const kind of ["Asset", "Liability", "Equity", "Revenue", "Expense"] as TreeNode["kind"][]) {
      const flat = flattenNodes(grouped[kind]);
      if (!flat.some((n) => n.isEnabled)) {
        errors[kind] = `At least one ${KIND_CONFIG[kind].label} account must be enabled`;
      }
    }
    return errors as Record<TreeNode["kind"], string | null>;
  }, [grouped]);

  return (
    <div className="space-y-3 p-3">
      {(Object.keys(grouped) as TreeNode["kind"][]).map((kind) =>
        grouped[kind].length > 0 ? (
          <KindGroupInline
            key={kind}
            kind={kind}
            nodes={grouped[kind]}
            config={KIND_CONFIG[kind]}
            onUpdate={updateNode}
            onAddChild={addChild}
            onDelete={deleteNode}
            error={validationErrors()[kind]}
          />
        ) : null
      )}
    </div>
  );
}

function flattenNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((n) => [n, ...flattenNodes(n.children)]);
}

function KindGroupInline({
  kind,
  nodes,
  config,
  onUpdate,
  onAddChild,
  onDelete,
  error,
}: {
  kind: TreeNode["kind"];
  nodes: TreeNode[];
  config: { label: string; color: string; headerBg: string };
  onUpdate: (id: string, updates: Partial<TreeNode>) => void;
  onAddChild: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
  error: string | null;
}) {
  const [open, setOpen] = useState(true);
  const enabledCount = flattenNodes(nodes).filter((n) => n.isEnabled).length;
  const totalCount = flattenNodes(nodes).length;

  return (
    <div className={`border rounded-lg overflow-hidden ${config.headerBg}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${config.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
          <span className="text-xs text-gray-500">{enabledCount}/{totalCount} enabled</span>
          {error && <span className="text-xs text-red-500 font-normal">⚠ {error}</span>}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="bg-white">
          {nodes.map((node) => (
            <TreeNodeRowInline
              key={node.id}
              node={node}
              depth={0}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNodeRowInline({
  node,
  depth,
  onUpdate,
  onAddChild,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  onUpdate: (id: string, updates: Partial<TreeNode>) => void;
  onAddChild: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");

  const handleNameConfirm = () => {
    if (editName.trim() && editName !== node.name) {
      onUpdate(node.id, { name: editName.trim() });
    } else {
      setEditName(node.name);
    }
    setIsEditing(false);
  };

  const handleAddChild = () => {
    if (newChildName.trim()) {
      onAddChild(node.id, newChildName.trim());
      setNewChildName("");
      setShowAddChild(false);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div
        className={`flex items-center gap-2 py-2 px-3 ${!node.isEnabled ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <span className="text-xs font-mono text-gray-400 w-16 shrink-0">{node.code}</span>

        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameConfirm();
              if (e.key === "Escape") { setEditName(node.name); setIsEditing(false); }
            }}
            onBlur={handleNameConfirm}
            className="flex-1 px-2 py-0.5 text-sm border border-blue-400 rounded outline-none"
          />
        ) : (
          <span
            className="flex-1 text-sm text-gray-800 cursor-pointer hover:text-blue-600"
            onDoubleClick={() => { setEditName(node.name); setIsEditing(true); }}
            title="Double-click to edit"
          >
            {node.name}
          </span>
        )}

        <button
          type="button"
          onClick={() => { setEditName(node.name); setIsEditing(true); }}
          className="text-gray-400 hover:text-blue-600 p-1 shrink-0"
          title="Edit name"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onUpdate(node.id, { isEnabled: !node.isEnabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
            node.isEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
          title={node.isEnabled ? "Disable account" : "Enable account"}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${node.isEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>

        <button
          type="button"
          onClick={() => setShowAddChild(!showAddChild)}
          className="text-gray-400 hover:text-green-600 p-1 shrink-0"
          title="Add sub-account"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {node.isNew && (
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="text-gray-400 hover:text-red-600 p-1 shrink-0"
            title="Delete account"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {showAddChild && (
        <div
          className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 border-t border-gray-100"
          style={{ paddingLeft: `${(depth + 1) * 24 + 12}px` }}
        >
          <span className="text-xs text-gray-400">+ Sub-account:</span>
          <input
            autoFocus
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChild();
              if (e.key === "Escape") { setNewChildName(""); setShowAddChild(false); }
            }}
            onBlur={() => { if (newChildName.trim()) handleAddChild(); else setShowAddChild(false); }}
            placeholder="Account name"
            className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded outline-none"
          />
        </div>
      )}

      {node.hasChildren && node.children.map((child) => (
        <TreeNodeRowInline
          key={child.id}
          node={child}
          depth={depth + 1}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function countEnabled(nodes: TreeNode[]): number {
  return nodes.reduce((acc, n) => {
    if (n.isEnabled) acc++;
    if (n.hasChildren) acc += countEnabled(n.children);
    return acc;
  }, 0);
}
