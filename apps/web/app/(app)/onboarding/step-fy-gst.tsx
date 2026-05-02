"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";

const GST_TYPES = [
  { id: "regular", name: "Regular", desc: "Standard GST registration with full ITC benefits." },
  { id: "composition", name: "Composition", desc: "Simplified scheme for small businesses with fixed tax rates." },
  { id: "none", name: "Not Registered", desc: "Select if your business is below the GST threshold." },
];

interface StepFyGstProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepFyGst({ tenantId, onComplete }: StepFyGstProps) {
  const [formData, setFormData] = useState({
    fiscalYearStart: "2024-04-01",
    gstRegistration: "regular",
    gstin: "",
    itcEligible: true,
    tdsApplicable: false,
  });

  const saveProgress: any = api.onboarding.saveProgress.useMutation({
    onSuccess: () => {
      showToast.success('Fiscal settings established');
      onComplete();
    },
    onError: (error) => {
      showToast.error(error.message || 'Failed to save settings');
    },
  });

  const handleContinue = async () => {
    await saveProgress.mutateAsync({
      tenantId,
      step: 4,
      data: { fyGst: formData },
    });
  };

  const fyEnd = formData.fiscalYearStart ? new Date(new Date(formData.fiscalYearStart).setFullYear(new Date(formData.fiscalYearStart).getFullYear() + 1, 2, 31)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <span className="font-ui text-[11px] text-ui-xs text-amber-text uppercase tracking-widest block mb-4">Fiscal Policy</span>
        <h1 className="font-display text-display-xl text-on-surface mb-4">Fiscal Configuration</h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Establish the foundational tax parameters for your ledger. These settings dictate automated compliance checks and filing schedules.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Fiscal Year */}
        <section className="space-y-6">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">Fiscal Year Period</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fy-start" className="font-ui text-[13px] text-on-surface">Start Date</Label>
              <input
                id="fy-start"
                type="date"
                value={formData.fiscalYearStart}
                onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
                className="w-full bg-surface border border-border rounded-md py-3 px-4 font-mono text-sm focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-ui text-[13px] text-text-mid">End Date (Auto-calculated)</Label>
              <div className="w-full bg-surface-muted border border-border rounded-md py-3 px-4 font-mono text-sm text-text-mid cursor-not-allowed">
                {fyEnd}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: GST Type */}
        <section className="space-y-6">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">GST Registration Type</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GST_TYPES.map((t) => (
              <div
                key={t.id}
                onClick={() => setFormData({ ...formData, gstRegistration: t.id })}
                className={`p-6 border-[0.5px] rounded-md transition-all cursor-pointer ${
                  formData.gstRegistration === t.id ? "bg-amber-50 border-amber shadow-sm" : "bg-surface border-border hover:bg-surface-muted"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.gstRegistration === t.id ? 'border-amber' : 'border-stone-300'}`}>
                    {formData.gstRegistration === t.id && <div className="w-2 h-2 rounded-full bg-amber" />}
                  </div>
                  <h3 className="font-ui text-[13px] font-bold text-on-surface">{t.name}</h3>
                </div>
                <p className="font-ui text-[11px] text-[11px] text-text-mid leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: GSTIN */}
        {formData.gstRegistration !== "none" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <Label htmlFor="gstin" className="font-ui text-[13px] text-on-surface">GST Identification Number</Label>
                <input
                  id="gstin"
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full bg-surface border border-border rounded-md py-3 px-4 font-mono text-sm uppercase focus:outline-none focus:border-amber"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                />
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-ui text-[13px] font-bold text-on-surface">ITC Eligible</p>
                    <p className="font-ui text-[11px] text-[11px] text-text-mid">Can claim Input Tax Credit on purchases</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, itcEligible: !formData.itcEligible })}
                    className={`w-10 h-6 rounded-full transition-colors relative border-none cursor-pointer ${formData.itcEligible ? "bg-amber" : "bg-stone-200"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform ${formData.itcEligible ? "left-5" : "left-1"}`} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="flex items-center justify-between py-4 border-t border-border">
          <div>
            <p className="font-ui text-[13px] font-bold text-on-surface">TDS Compliance</p>
            <p className="font-ui text-[11px] text-[11px] text-text-mid">Enable automated TDS deduction modules</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, tdsApplicable: !formData.tdsApplicable })}
            className={`w-10 h-6 rounded-full transition-colors relative border-none cursor-pointer ${formData.tdsApplicable ? "bg-amber" : "bg-stone-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform ${formData.tdsApplicable ? "left-5" : "left-1"}`} />
          </button>
        </section>
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <p className="font-ui text-[11px] text-[11px] text-text-light uppercase tracking-wider italic">
          These settings can be amended later in the tax settings panel.
        </p>
        <button
          onClick={handleContinue}
          disabled={saveProgress.isPending}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer"
        >
          {saveProgress.isPending ? "Validating..." : "Finalize Config"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
