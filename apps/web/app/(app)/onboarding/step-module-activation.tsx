// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";

const MODULES = [
  { id: "accounting", name: "Core Ledger", desc: "Double-entry bookkeeping, financial statements, and multi-entity consolidation.", icon: "account_balance", required: true },
  { id: "gst", name: "GST Compliance", desc: "Automated GSTR-1, 2B matching, and 3B preparation. Includes e-invoicing.", icon: "gavel" },
  { id: "invoicing", name: "Billing & Invoicing", desc: "Compliant tax invoice generation, proforma tracking, and payment reminders.", icon: "receipt_long" },
  { id: "inventory", name: "Inventory Ledger", desc: "Multi-warehouse tracking, stock valuation (FIFO), and low-stock alerts.", icon: "inventory_2" },
  { id: "payroll", name: "Statutory Payroll", desc: "Salary processing, auto PF/ESI/PT calculation, and employee payslips.", icon: "groups" },
  { id: "itr", name: "ITR Returns", desc: "Income tax computation for ITR-3/4 and advance tax tracking.", icon: "description" },
];

interface StepModuleActivationProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepModuleActivation({ tenantId, onComplete }: StepModuleActivationProps) {
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set(["accounting", "gst", "invoicing"]));

  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: () => {
      showToast.success('Module preferences saved');
      onComplete();
    },
    onError: (error) => {
      showToast.error(error.message || 'Failed to save module preferences');
    },
  });

  const toggleModule = (id: string) => {
    if (id === "accounting") return;
    const next = new Set(enabledModules);
    enabledModules.has(id) ? next.delete(id) : next.add(id);
    setEnabledModules(next);
  };

  const handleContinue = async () => {
    const data = Array.from(enabledModules).map(id => ({ module: id, enabled: true }));
    await saveProgress.mutateAsync({
      tenantId,
      step: 2,
      data: { moduleActivation: data },
    });
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest block mb-4">Architecture</span>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-4">Configure Ledger Modules</h1>
        <p className="font-ui-md text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Select the specific functional modules required for your organization's fiscal operations. These can be adjusted post-onboarding within system settings.
        </p>
      </div>

      {/* Grid for Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            onClick={() => toggleModule(mod.id)}
            className={`group border-[0.5px] border-border-subtle p-6 flex flex-col relative transition-all duration-300 cursor-pointer ${
              enabledModules.has(mod.id) ? "bg-[#fff8f4] border-amber shadow-sm" : "bg-white hover:bg-stone-50"
            }`}
          >
            {enabledModules.has(mod.id) && <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C8860A]"></div>}
            <div className="flex justify-between items-start mb-4">
              <span className={`material-symbols-outlined text-2xl ${enabledModules.has(mod.id) ? "text-[#C8860A]" : "text-stone-400"}`}>
                {mod.icon}
              </span>
              {mod.required && <span className="font-ui-xs text-[9px] uppercase tracking-widest bg-stone-100 text-stone-500 px-2 py-0.5 rounded-sm">Required</span>}
            </div>
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-2">{mod.name}</h3>
            <p className="font-ui-sm text-ui-sm text-text-mid flex-1 leading-relaxed">
              {mod.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border-subtle">
        <p className="font-ui-xs text-[11px] text-text-light uppercase tracking-wider italic">
          Accounting module is always active as the system core.
        </p>
        <button
          onClick={handleContinue}
          disabled={saveProgress.isPending}
          className="bg-primary-container text-white font-ui-sm text-ui-sm py-3 px-8 rounded-sm hover:bg-primary transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer"
        >
          {saveProgress.isPending ? "Saving..." : "Establish Framework"}
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform duration-200">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
