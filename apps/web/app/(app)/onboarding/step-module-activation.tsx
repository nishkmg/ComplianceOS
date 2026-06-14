"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import { submitStep } from "@/lib/mock-mutation";
import { Icon } from '@/components/ui/icon';
import { MODULES } from "@/lib/constants";

interface StepModuleActivationProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function StepModuleActivation({ tenantId, onComplete, onBack }: StepModuleActivationProps) {
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set(["accounting", "gst", "invoicing"]));

  const [saving, setSaving] = useState(false);

  const toggleModule = (id: string) => {
    if (id === "accounting") return;
    const next = new Set(enabledModules);
    enabledModules.has(id) ? next.delete(id) : next.add(id);
    setEnabledModules(next);
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      const modules = Array.from(enabledModules).map(id => ({ module: id, enabled: true }));
      await submitStep(2, { tenantId, data: { moduleActivation: modules } });
      showToast.success('Module preferences saved');
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to save module preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <span className="font-ui text-[11px] text-ui-xs text-amber-text uppercase tracking-widest block mb-4">Architecture</span>
        <h1 className="font-ui text-display-xl text-on-surface mb-4">Configure Ledger Modules</h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Select the specific functional modules required for your organization's fiscal operations. These can be adjusted post-onboarding within system settings.
        </p>
      </div>

      {/* Grid for Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((mod) => (
          <div
            key={mod.id}
            onClick={() => toggleModule(mod.id)}
            className={`group border-[0.5px] border-border p-6 flex flex-col relative transition-colors transition-shadow duration-300 cursor-pointer ${
              enabledModules.has(mod.id) ? "bg-amber-50 border-amber shadow-sm" : "bg-surface hover:bg-surface-muted"
            }`}
          >
            {enabledModules.has(mod.id) && <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>}
            <div className="flex justify-between items-start mb-4">
              <Icon name={mod.icon} className={`text-2xl ${enabledModules.has(mod.id) ? "text-amber" : "text-light"}`} />
              {mod.required && <span className="font-ui text-[11px] text-[9px] uppercase tracking-widest bg-surface-muted text-light px-2 py-0.5 rounded-md">Required</span>}
            </div>
            <h3 className="font-ui text-lg font-bold text-on-surface mb-2">{mod.name}</h3>
            <p className="font-ui text-[13px] text-ui-sm text-text-mid flex-1 leading-relaxed">
              {mod.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={saving}
              className="font-ui text-[13px] text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              Back
            </button>
          )}
          <p className="font-ui text-[11px] text-[11px] text-text-light uppercase tracking-wider italic">
            Accounting module is always active as the system core.
          </p>
        </div>
        <button
          onClick={handleContinue}
          disabled={saving}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Establish Framework"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
