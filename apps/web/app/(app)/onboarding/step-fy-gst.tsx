"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";
import { submitStep } from "@/lib/mock-mutation";
import { GST_TYPES } from "@/lib/constants";

function getIndianFY(): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const fyStartYear = now.getMonth() >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const start = `${fyStartYear}-04-01`;
  const end = `${fyEndYear}-03-31`;
  const label = `FY ${fyStartYear}-${String(fyEndYear).slice(2)}`;
  return { start, end, label };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

interface StepFyGstProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function StepFyGst({ tenantId, onComplete, onBack }: StepFyGstProps) {
  const fy = useMemo(() => getIndianFY(), []);

  const [formData, setFormData] = useState({
    gstRegistration: "regular",
    gstin: "",
    itcEligible: true,
    tdsApplicable: false,
  });

  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await submitStep(5, { tenantId, data: { ...formData, fiscalYearStart: fy.start } });
      showToast.success('Fiscal settings established');
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <span className="font-ui text-[11px] text-ui-xs text-amber uppercase tracking-widest block mb-4">Fiscal Policy</span>
        <h1 className="font-ui text-display-xl text-on-surface mb-4">Fiscal Configuration</h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Establish the foundational tax parameters for your ledger. These settings dictate automated compliance checks and filing schedules.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Fiscal Year (fixed for Indian compliance) */}
        <section className="space-y-6">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">Fiscal Year Period</h2>
          </div>
          <div className="bg-amber-50 border border-amber/30 rounded-md p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Icon name="calendar_month" className="text-amber text-2xl" />
              <div>
                <p className="font-ui text-lg font-bold text-on-surface">{fy.label}</p>
                <p className="font-ui text-sm text-text-mid">
                  {formatDate(fy.start)} → {formatDate(fy.end)}
                </p>
              </div>
            </div>
            <p className="font-ui text-[11px] text-text-mid/70 mt-1">
              Fixed Indian fiscal year (April–March) per Income Tax Act. Not configurable.
            </p>
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
                onClick={() => !saving && setFormData({ ...formData, gstRegistration: t.id })}
                className={`p-6 border-[0.5px] rounded-md transition-all ${saving ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${
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
                  className="w-full bg-surface border border-border rounded-md py-3 px-4 font-mono text-sm uppercase focus:outline-none focus:border-amber disabled:opacity-50"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                  disabled={saving}
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
                    onClick={() => !saving && setFormData({ ...formData, itcEligible: !formData.itcEligible })}
                    className={`w-10 h-6 rounded-full transition-colors relative border-none ${saving ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${formData.itcEligible ? "bg-amber" : "bg-stone-200"}`}
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
            onClick={() => !saving && setFormData({ ...formData, tdsApplicable: !formData.tdsApplicable })}
            className={`w-10 h-6 rounded-full transition-colors relative border-none ${saving ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${formData.tdsApplicable ? "bg-amber" : "bg-stone-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform ${formData.tdsApplicable ? "left-5" : "left-1"}`} />
          </button>
        </section>
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
            These settings can be amended later in the tax settings panel.
          </p>
        </div>
        <button
          onClick={handleContinue}
          disabled={saving}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {saving ? "Validating..." : "Finalize Config"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
