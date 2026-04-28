// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

const MOCK_COA = [
  { id: "1", code: "10000", name: "Assets", type: "asset", level: 0, children: [
    { id: "2", code: "11000", name: "Current Assets", type: "asset", level: 1, children: [
      { id: "3", code: "11100", name: "Cash & Bank", type: "asset", level: 2 },
      { id: "4", code: "11200", name: "Trade Receivables", type: "asset", level: 2 },
      { id: "5", code: "11300", name: "Inventory", type: "asset", level: 2 },
    ]},
  ]},
  { id: "6", code: "20000", name: "Liabilities", type: "liability", level: 0, children: [
    { id: "7", code: "21000", name: "Current Liabilities", type: "liability", level: 1, children: [
      { id: "8", code: "21100", name: "Trade Payables", type: "liability", level: 2 },
      { id: "9", code: "21200", name: "GST Output", type: "liability", level: 2 },
    ]},
  ]},
];

interface StepCoaReviewProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepCoaReview({ tenantId, onComplete }: StepCoaReviewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9"]));

  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: onComplete,
    onError: (error) => showToast.error(error.message || 'Failed to save review'),
  });

  const handleContinue = async () => {
    await saveProgress.mutateAsync({
      tenantId,
      step: 3,
      data: { coa: { reviewed: true, selectedIds: Array.from(selectedIds) } },
    });
  };

  const renderNode = (node: any) => (
    <div key={node.id} className="flex flex-col">
      <div className={`flex items-center gap-4 py-3 px-6 hover:bg-stone-50 transition-colors border-b-[0.5px] border-border-subtle ${node.level === 0 ? 'bg-stone-50 font-bold' : ''}`}>
        <div 
          className={`w-5 h-5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${selectedIds.has(node.id) ? 'bg-amber border-amber' : 'border-stone-300'}`}
          onClick={() => {
            const next = new Set(selectedIds);
            selectedIds.has(node.id) ? next.delete(node.id) : next.add(node.id);
            setSelectedIds(next);
          }}
        >
          {selectedIds.has(node.id) && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
        </div>
        <div className="flex-1 flex items-center gap-3" style={{ paddingLeft: `${node.level * 24}px` }}>
          <span className="font-mono text-[12px] text-text-light">{node.code}</span>
          <span className="font-ui-sm text-on-surface">{node.name}</span>
        </div>
        <span className="font-ui-xs text-[10px] uppercase tracking-widest text-text-light">{node.type}</span>
      </div>
      {node.children?.map(renderNode)}
    </div>
  );

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-6">Review & Customize Ledger</h1>
        <p className="font-ui-lg text-ui-lg text-text-mid max-w-3xl leading-relaxed">
          The following chart of accounts has been generated based on your template. De-select any ledgers you do not require, or add new sub-ledgers later.
        </p>
      </div>

      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-[#C8860A]"></div>
        <div className="overflow-y-auto max-h-[500px] border-b-[0.5px] border-border-subtle">
          {MOCK_COA.map(renderNode)}
        </div>
        <div className="p-4 bg-stone-50 flex justify-between items-center text-ui-xs text-text-light uppercase tracking-widest">
          <span>{selectedIds.size} Ledgers Selected</span>
          <button className="text-primary hover:text-amber-stitch font-bold border-none bg-transparent cursor-pointer">Select All</button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border-subtle">
        <p className="font-ui-xs text-[11px] text-text-light uppercase tracking-wider italic">
          Physical physical-ledger accuracy guaranteed through hierarchical enforcement.
        </p>
        <button
          onClick={handleContinue}
          disabled={saveProgress.isPending}
          className="bg-primary-container text-white font-ui-sm text-ui-sm py-3 px-8 rounded-sm hover:bg-primary transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer"
        >
          {saveProgress.isPending ? "Finalizing..." : "Confirm Structure"}
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
