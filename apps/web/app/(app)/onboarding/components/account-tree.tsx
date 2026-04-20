"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string; // generated code path like "1", "1-001"
  code: string; // original template code
  name: string;
  kind: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  subType: string;
  isEnabled: boolean;
  hasChildren: boolean;
  children: TreeNode[];
  isNew: boolean; // true for user-added sub-accounts
}

export type Kind = TreeNode["kind"];

export interface GroupedNodes {
  Asset: TreeNode[];
  Liability: TreeNode[];
  Equity: TreeNode[];
  Revenue: TreeNode[];
  Expense: TreeNode[];
}

// ─── Kind config ────────────────────────────────────────────────────────────────

const KIND_CONFIG: Record<Kind, { label: string; color: string; headerBg: string }> = {
  Asset: { label: "Assets", color: "text-blue-700", headerBg: "bg-blue-50 border-blue-200" },
  Liability: { label: "Liabilities", color: "text-orange-700", headerBg: "bg-orange-50 border-orange-200" },
  Equity: { label: "Equity", color: "text-green-700", headerBg: "bg-green-50 border-green-200" },
  Revenue: { label: "Revenue", color: "text-purple-700", headerBg: "bg-purple-50 border-purple-200" },
  Expense: { label: "Expenses", color: "text-red-700", headerBg: "bg-red-50 border-red-200" },
};

// ─── Tree building ─────────────────────────────────────────────────────────────

function buildTree(accounts: Array<{
  code: string;
  name: string;
  kind: string;
  subType: string;
  isSystem: boolean;
  children: Array<{
    code: string;
    name: string;
    kind: string;
    subType: string;
    isSystem: boolean;
    children: unknown[];
  }>;
}>): TreeNode[] {
  return accounts.map((acc) => ({
    id: acc.code,
    code: acc.code,
    name: acc.name,
    kind: acc.kind as Kind,
    subType: acc.subType,
    isEnabled: true,
    hasChildren: acc.children.length > 0,
    isNew: false,
    children: acc.children.map((child) => ({
      id: child.code,
      code: child.code,
      name: child.name,
      kind: child.kind as Kind,
      subType: child.subType,
      isEnabled: true,
      hasChildren: child.children.length > 0,
      isNew: false,
      children: [],
    })),
  }));
}

function flattenForRefinement(nodes: TreeNode[]): Array<{
  code: string;
  name: string;
  isEnabled: boolean;
  children?: Array<{ code: string; name: string; isEnabled: boolean; children?: unknown[] }>;
}> {
  return nodes.map((node) => ({
    code: node.code,
    name: node.name,
    isEnabled: node.isEnabled,
    children: node.hasChildren ? flattenForRefinement(node.children) : undefined,
  }));
}

// ─── Validation ────────────────────────────────────────────────────────────────

function validateTree(nodes: TreeNode[]): Record<Kind, string | null> {
  const errors: Partial<Record<Kind, string | null>> = {};
  for (const kind of ["Asset", "Liability", "Equity", "Revenue", "Expense"] as Kind[]) {
    const hasEnabled = nodes.some(
      (n) => n.kind === kind && n.isEnabled
    ) || nodes.some((n) => n.kind === kind && n.children.some((c) => c.isEnabled));
    if (!hasEnabled) {
      errors[kind] = `At least one ${KIND_CONFIG[kind].label} account must be enabled`;
    }
  }
  return errors as Record<Kind, string | null>;
}

// ─── TreeNodeRow ───────────────────────────────────────────────────────────────

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  onUpdate: (id: string, updates: Partial<TreeNode>) => void;
  onAddChild: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

function TreeNodeRow({ node, depth, onUpdate, onAddChild, onDelete, isNew: _isNew }: TreeNodeRowProps) {
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
        {/* Code */}
        <span className="text-xs font-mono text-gray-400 w-16 shrink-0">{node.code}</span>

        {/* Name */}
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameConfirm();
              if (e.key === "Escape") {
                setEditName(node.name);
                setIsEditing(false);
              }
            }}
            onBlur={handleNameConfirm}
            className="flex-1 px-2 py-0.5 text-sm border border-blue-400 rounded outline-none"
          />
        ) : (
          <span
            className="flex-1 text-sm text-gray-800 cursor-pointer hover:text-blue-600"
            onDoubleClick={() => {
              setEditName(node.name);
              setIsEditing(true);
            }}
            title="Double-click to edit"
          >
            {node.name}
          </span>
        )}

        {/* Edit pencil */}
        <button
          type="button"
          onClick={() => {
            setEditName(node.name);
            setIsEditing(true);
          }}
          className="text-gray-400 hover:text-blue-600 p-1"
          title="Edit name"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        {/* Enable/Disable toggle */}
        <button
          type="button"
          onClick={() => onUpdate(node.id, { isEnabled: !node.isEnabled })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            node.isEnabled ? "bg-blue-600" : "bg-gray-300"
          }`}
          title={node.isEnabled ? "Disable account" : "Enable account"}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              node.isEnabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>

        {/* Add sub-account */}
        <button
          type="button"
          onClick={() => setShowAddChild(!showAddChild)}
          className="text-gray-400 hover:text-green-600 p-1"
          title="Add sub-account"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Delete (only new nodes) */}
        {node.isNew && (
          <button
            type="button"
            onClick={() => onDelete(node.id)}
            className="text-gray-400 hover:text-red-600 p-1"
            title="Delete account"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Add child inline input */}
      {showAddChild && (
        <div
          className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 border-t border-gray-100"
          style={{ paddingLeft: `${(depth + 1) * 24 + 12}px` }}
        >
          <span className="text-xs text-gray-400">+ Add sub-account:</span>
          <input
            autoFocus
            value={newChildName}
            onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChild();
              if (e.key === "Escape") {
                setNewChildName("");
                setShowAddChild(false);
              }
            }}
            onBlur={() => {
              if (newChildName.trim()) handleAddChild();
              else setShowAddChild(false);
            }}
            placeholder="Account name"
            className="flex-1 px-2 py-0.5 text-sm border border-gray-300 rounded outline-none"
          />
        </div>
      )}

      {/* Children */}
      {node.hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
              isNew={child.isNew}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AccordionItem (inline, no external dependency) ───────────────────────────

function KindGroup({
  kind,
  nodes,
  onUpdate,
  onAddChild,
  onDelete,
  error,
  defaultOpen,
}: {
  kind: Kind;
  nodes: TreeNode[];
  onUpdate: (id: string, updates: Partial<TreeNode>) => void;
  onAddChild: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
  error: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const config = KIND_CONFIG[kind];
  const enabledCount = nodes.filter((n) => n.isEnabled).length;
  const totalCount = nodes.length;

  return (
    <div className={`border rounded-lg overflow-hidden ${config.headerBg}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className={`font-semibold text-sm ${config.color}`}>{config.label}</span>
          <span className="text-xs text-gray-500">
            {enabledCount}/{totalCount} enabled
          </span>
          {error && <span className="text-xs text-red-500 font-normal">⚠ {error}</span>}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="bg-white">
          {nodes.map((node) => (
            <TreeNodeRow
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

// ─── AccountTree ───────────────────────────────────────────────────────────────

interface AccountTreeProps {
  templateKey: string;
}

export function AccountTree({ templateKey }: AccountTreeProps) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load template on mount
  useState(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      try {
        // Dynamic import of JSON template
        const module = await import(
          `../../../../../../../packages/db/src/seed/coa-templates/${templateKey}.json`
        );
        const tree = buildTree(module.default);
        setNodes(tree);
      } catch {
        // Fallback: try raw import
        try {
          const templates: Record<string, unknown> = {};
          const mod = await import(
            `../../../../../../../packages/db/src/seed/coa-templates/${templateKey}.json`
          );
          const tree = buildTree(mod.default as Parameters<typeof buildTree>[0]);
          setNodes(tree);
        } catch (err) {
          console.error("Failed to load CoA template:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  });

  const handleUpdate = useCallback((id: string, updates: Partial<TreeNode>) => {
    setNodes((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) return { ...n, ...updates };
        if (n.hasChildren) {
          return {
            ...n,
            children: n.children.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ) as TreeNode[],
          };
        }
        return n;
      });
      return updated;
    });
  }, []);

  const handleAddChild = useCallback((parentId: string, name: string) => {
    setNodes((prev) => {
      const newCode = `${parentId}-NEW`;
      const newChild: TreeNode = {
        id: newCode,
        code: newCode,
        name,
        kind: prev.find((n) => n.id === parentId)?.kind ?? "Asset",
        subType: "UserAdded",
        isEnabled: true,
        hasChildren: false,
        isNew: true,
        children: [],
      };

      const updated = prev.map((n) => {
        if (n.id === parentId) {
          return {
            ...n,
            hasChildren: true,
            children: [...n.children, newChild],
          };
        }
        if (n.hasChildren) {
          return {
            ...n,
            children: addChildToParent(n.children, parentId, newChild),
          };
        }
        return n;
      });
      return updated;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNodes((prev) => {
      const removeFromTree = (list: TreeNode[]): TreeNode[] =>
        list
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            children: n.hasChildren ? removeFromTree(n.children) : n.children,
          }));
      return removeFromTree(prev);
    });
  }, []);

  const grouped = useMemo<GroupedNodes>(() => {
    const g: GroupedNodes = { Asset: [], Liability: [], Equity: [], Revenue: [], Expense: [] };
    for (const node of nodes) {
      g[node.kind].push(node);
    }
    return g;
  }, [nodes]);

  const validationErrors = useMemo(() => validateTree(nodes), [nodes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-500">Loading chart of accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Warning: disabled parent with enabled children */}
      {nodes.map((node) => {
        if (!node.isEnabled && node.hasChildren && node.children.some((c) => c.isEnabled)) {
          return (
            <div key={`warn-${node.id}`} className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200">
              Warning: &quot;{node.name}&quot; is disabled but has enabled sub-accounts. Sub-accounts will also be excluded.
            </div>
          );
        }
        return null;
      })}

      {(Object.keys(grouped) as Kind[]).map((kind) =>
        grouped[kind].length > 0 ? (
          <KindGroup
            key={kind}
            kind={kind}
            nodes={grouped[kind]}
            onUpdate={handleUpdate}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            error={validationErrors[kind]}
            defaultOpen={kind === "Asset"}
          />
        ) : null
      )}
    </div>
  );
}

function addChildToParent(children: TreeNode[], parentId: string, newChild: TreeNode): TreeNode[] {
  return children.map((c) => {
    if (c.id === parentId) {
      return { ...c, hasChildren: true, children: [...c.children, newChild] };
    }
    if (c.hasChildren) {
      return { ...c, children: addChildToParent(c.children, parentId, newChild) };
    }
    return c;
  });
}

// ─── Export flattened refinements ─────────────────────────────────────────────

export function flattenTreeToRefinements(nodes: TreeNode[]): {
  accounts: Array<{
    code: string;
    name: string;
    isEnabled: boolean;
    children?: Array<{ code: string; name: string; isEnabled: boolean; children?: unknown[] }>;
  }>;
} {
  return { accounts: flattenForRefinement(nodes) };
}
