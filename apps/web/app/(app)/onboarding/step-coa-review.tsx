"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { submitStep } from "@/lib/mock-mutation";

type CoaNode = {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  children?: CoaNode[];
};

// ─── Template-specific CoA trees ───────────────────────────────────────
const COA_TREES: Record<string, CoaNode[]> = {
  trading: [
    { id: "a1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "a2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "a3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "a4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
        { id: "a5", code: "11300", name: "Inventory", type: "asset", level: 2 },
        { id: "a6", code: "11400", name: "Inventory COGS Accrual", type: "asset", level: 2 },
      ]},
    ]},
    { id: "a7", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "a8", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "a9", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "a10", code: "21200", name: "GST Output", type: "liability", level: 2 },
      ]},
    ]},
    { id: "a11", code: "30000", name: "Income", type: "revenue", level: 0, children: [
      { id: "a12", code: "31000", name: "Sales Revenue", type: "revenue", level: 2 },
      { id: "a13", code: "31100", name: "Sales Returns", type: "revenue", level: 2 },
    ]},
    { id: "a14", code: "40000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "a15", code: "41000", name: "Cost of Goods Sold", type: "expense", level: 2 },
      { id: "a16", code: "42000", name: "Operating Expenses", type: "expense", level: 2 },
    ]},
  ],
  services: [
    { id: "b1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "b2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "b3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "b4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
        { id: "b5", code: "11300", name: "Work in Progress", type: "asset", level: 2 },
      ]},
    ]},
    { id: "b6", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "b7", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "b8", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "b9", code: "21200", name: "GST Output", type: "liability", level: 2 },
        { id: "b10", code: "21300", name: "Unearned Revenue", type: "liability", level: 2 },
      ]},
    ]},
    { id: "b11", code: "30000", name: "Income", type: "revenue", level: 0, children: [
      { id: "b12", code: "31000", name: "Service Revenue", type: "revenue", level: 2 },
      { id: "b13", code: "31100", name: "Retainer Income", type: "revenue", level: 2 },
    ]},
    { id: "b14", code: "40000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "b15", code: "41000", name: "Billable Expenses", type: "expense", level: 2 },
      { id: "b16", code: "42000", name: "Operating Expenses", type: "expense", level: 2 },
    ]},
  ],
  manufacturing: [
    { id: "c1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "c2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "c3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "c4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
        { id: "c5", code: "11300", name: "Raw Materials", type: "asset", level: 2 },
        { id: "c6", code: "11400", name: "Work in Progress", type: "asset", level: 2 },
        { id: "c7", code: "11500", name: "Finished Goods", type: "asset", level: 2 },
      ]},
    ]},
    { id: "c8", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "c9", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "c10", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "c11", code: "21200", name: "GST Output", type: "liability", level: 2 },
      ]},
    ]},
    { id: "c12", code: "30000", name: "Income", type: "revenue", level: 0, children: [
      { id: "c13", code: "31000", name: "Sales Revenue", type: "revenue", level: 2 },
    ]},
    { id: "c14", code: "40000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "c15", code: "41000", name: "Raw Material Consumed", type: "expense", level: 2 },
      { id: "c16", code: "41100", name: "Factory Overheads", type: "expense", level: 2 },
      { id: "c17", code: "42000", name: "Operating Expenses", type: "expense", level: 2 },
    ]},
  ],
  proprietorship: [
    { id: "d1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "d2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "d3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "d4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
      ]},
    ]},
    { id: "d5", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "d6", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "d7", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "d8", code: "21200", name: "GST Output", type: "liability", level: 2 },
      ]},
    ]},
    { id: "d9", code: "30000", name: "Capital", type: "equity", level: 0, children: [
      { id: "d10", code: "31000", name: "Proprietor's Capital", type: "equity", level: 2 },
      { id: "d11", code: "31100", name: "Drawings", type: "equity", level: 2 },
    ]},
    { id: "d12", code: "40000", name: "Income", type: "revenue", level: 0, children: [
      { id: "d13", code: "41000", name: "Revenue", type: "revenue", level: 2 },
    ]},
    { id: "d14", code: "50000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "d15", code: "51000", name: "Operating Expenses", type: "expense", level: 2 },
    ]},
  ],
  pvt_ltd: [
    { id: "e1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "e2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "e3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "e4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
      ]},
      { id: "e5", code: "12000", name: "Fixed Assets", type: "asset", level: 1, children: [
        { id: "e6", code: "12100", name: "Office Equipment", type: "asset", level: 2 },
        { id: "e7", code: "12200", name: "Accumulated Depreciation", type: "asset", level: 2 },
      ]},
    ]},
    { id: "e8", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "e9", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "e10", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "e11", code: "21200", name: "GST Output", type: "liability", level: 2 },
      ]},
    ]},
    { id: "e12", code: "30000", name: "Shareholders Equity", type: "equity", level: 0, children: [
      { id: "e13", code: "31000", name: "Share Capital", type: "equity", level: 2 },
      { id: "e14", code: "31100", name: "Reserves & Surplus", type: "equity", level: 2 },
    ]},
    { id: "e15", code: "40000", name: "Income", type: "revenue", level: 0, children: [
      { id: "e16", code: "41000", name: "Revenue", type: "revenue", level: 2 },
    ]},
    { id: "e17", code: "50000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "e18", code: "51000", name: "Operating Expenses", type: "expense", level: 2 },
      { id: "e19", code: "51100", name: "Depreciation", type: "expense", level: 2 },
    ]},
  ],
  llp: [
    { id: "f1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
      { id: "f2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
        { id: "f3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
        { id: "f4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
      ]},
    ]},
    { id: "f5", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
      { id: "f6", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
        { id: "f7", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
        { id: "f8", code: "21200", name: "GST Output", type: "liability", level: 2 },
      ]},
    ]},
    { id: "f9", code: "30000", name: "Partners Capital", type: "equity", level: 0, children: [
      { id: "f10", code: "31000", name: "Partner A Capital", type: "equity", level: 2 },
      { id: "f11", code: "31100", name: "Partner B Capital", type: "equity", level: 2 },
      { id: "f12", code: "31200", name: "Partner Current A/c", type: "equity", level: 2 },
    ]},
    { id: "f13", code: "40000", name: "Income", type: "revenue", level: 0, children: [
      { id: "f14", code: "41000", name: "Revenue", type: "revenue", level: 2 },
    ]},
    { id: "f15", code: "50000", name: "Expenses", type: "expense", level: 0, children: [
      { id: "f16", code: "51000", name: "Operating Expenses", type: "expense", level: 2 },
      { id: "f17", code: "51100", name: "Partner Remuneration", type: "expense", level: 2 },
    ]},
  ],
};

function collectAllIds(nodes: any[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children) ids.push(...collectAllIds(node.children));
  }
  return ids;
}

interface StepCoaReviewProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function StepCoaReview({ tenantId, onComplete, onBack }: StepCoaReviewProps) {
  const [templateId, setTemplateId] = useState<string>("trading");
  const [loadingTree, setLoadingTree] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/onboarding?tenantId=${encodeURIComponent(tenantId)}`);
        if (!res.ok) return;
        const data = await res.json();
        const tid: string = data.onboardingData?.coa_template || "trading";
        setTemplateId(tid);
      } catch {
      } finally {
        setLoadingTree(false);
      }
    })();
  }, [tenantId]);

  const currentTree = COA_TREES[templateId] || COA_TREES.trading;

  useEffect(() => {
    if (!loadingTree) {
      setSelectedIds(new Set(collectAllIds(currentTree)));
    }
  }, [loadingTree]); // eslint-disable-line react-hooks/exhaustive-deps

  const ALL_COA_IDS = collectAllIds(currentTree);

  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await submitStep(4, { tenantId, data: { selectedIds: Array.from(selectedIds), reviewed: true } });
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const renderNode = (node: any) => (
    <div key={node.id} className="flex flex-col">
      <div className={`flex items-center gap-4 py-3 px-6 hover:bg-surface-muted transition-colors border-b-[0.5px] border-border ${node.level === 0 ? 'bg-surface-muted font-bold' : ''}`}>
        <div 
          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.has(node.id) ? 'bg-amber border-amber' : 'focus:border-focus'}`}
          onClick={() => {
            const next = new Set(selectedIds);
            selectedIds.has(node.id) ? next.delete(node.id) : next.add(node.id);
            setSelectedIds(next);
          }}
        >
          {selectedIds.has(node.id) && <Icon name="check" className="text-white text-ui-lg" />}
        </div>
        <div className="flex-1 flex items-center gap-3" style={{ paddingLeft: `${node.level * 24}px` }}>
          <span className="font-mono text-ui-xs text-text-light">{node.code}</span>
          <span className="font-ui text-ui-sm text-on-surface">{node.name}</span>
        </div>
        <span className="font-ui text-ui-2xs uppercase tracking-widest text-text-light">{node.type}</span>
      </div>
      {node.children?.map(renderNode)}
    </div>
  );

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-6">Review & Customize Ledger</h1>
        <p className="font-ui text-ui-lg text-text-mid max-w-3xl leading-relaxed">
          The following chart of accounts has been generated based on your template. De-select any ledgers you do not require, or add new sub-ledgers later.
        </p>
      </div>

      <div className="bg-surface border-[0.5px] border-border shadow-sm overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-amber"></div>
        <div className="overflow-y-auto max-h-[500px] border-b-[0.5px] border-border">
          {loadingTree ? (
            <div className="flex items-center justify-center py-12 text-text-mid font-ui text-sm">Loading ledger structure...</div>
          ) : (
            currentTree.map(renderNode)
          )}
        </div>
        <div className="p-4 bg-surface-muted flex justify-between items-center text-ui-xs text-text-light uppercase tracking-widest">
          <span>{selectedIds.size} Ledgers Selected</span>
          <button
            onClick={() => {
              setSelectedIds(selectedIds.size === ALL_COA_IDS.length ? new Set() : new Set(ALL_COA_IDS));
            }}
            className="text-primary hover:text-amber-stitch font-bold border-none bg-transparent cursor-pointer"
          >
            {selectedIds.size === ALL_COA_IDS.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="font-ui text-ui-sm text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              <Icon name="arrow_back" className="text-ui-xl" />
              Back
            </button>
          )}
          <p className="font-ui text-ui-xs text-ui-xs text-text-light uppercase tracking-wider italic">
            Physical physical-ledger accuracy guaranteed through hierarchical enforcement.
          </p>
        </div>
        <button
          onClick={handleContinue}
          disabled={saving}
          className="bg-amber text-white font-ui text-ui-sm text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {saving ? "Finalizing..." : "Confirm Structure"}
          <Icon name="arrow_forward" className="text-ui-xl group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
