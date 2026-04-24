// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";

const GST_RATES = [5, 12, 18, 28];

interface StepFyGstProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepFyGst({ tenantId, onComplete }: StepFyGstProps) {
  const [formData, setFormData] = useState({
    fiscalYearStart: "2026-04-01",
    gstRegistration: "regular",
    applicableGstRates: [18],
    itcEligible: true,
    tdsApplicable: true,
  });

  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: () => {
      showToast.success('Fiscal year and GST settings saved');
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

  const toggleGstRate = (rate: number) => {
    setFormData((prev) => ({
      ...prev,
      applicableGstRates: prev.applicableGstRates.includes(rate)
        ? prev.applicableGstRates.filter((r) => r !== rate)
        : [...prev.applicableGstRates, rate],
    }));
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-[20px] font-normal text-dark">Fiscal Year & GST Setup</h2>
        <p className="font-ui text-[13px] text-light mt-1">
          Configure your financial year and GST settings
        </p>
      </div>

      <div className="space-y-5 max-w-md">
        <div>
          <Label htmlFor="fyStart" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
            Current Fiscal Year Start
          </Label>
          <input
            id="fyStart"
            type="date"
            value={formData.fiscalYearStart}
            onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
            className="input-field w-full font-ui"
          />
          <p className="mt-1 font-ui text-[10px] text-light">
            Indian FY runs from April 1 to March 31
          </p>
        </div>

        <div>
          <Label htmlFor="gstType" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
            GST Registration Type
          </Label>
          <select
            id="gstType"
            value={formData.gstRegistration}
            onChange={(e) => setFormData({ ...formData, gstRegistration: e.target.value })}
            className="input-field w-full font-ui"
          >
            <option value="regular">Regular</option>
            <option value="composition">Composition Scheme</option>
            <option value="none">Not Registered</option>
          </select>
        </div>

        {formData.gstRegistration !== "none" && (
          <>
            <div>
              <Label className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
                Applicable GST Rates
              </Label>
              <div className="flex gap-2">
                {GST_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => toggleGstRate(rate)}
                    className={`filter-tab ${formData.applicableGstRates.includes(rate) ? "active" : ""}`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-hairline">
              <div>
                <p className="font-ui text-[13px] text-dark">ITC Eligible</p>
                <p className="font-ui text-[10px] text-light">Can claim Input Tax Credit</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itcEligible: !formData.itcEligible })}
                className={`w-10 h-6 rounded-full transition-colors ${formData.itcEligible ? "bg-amber" : "bg-lighter"} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.itcEligible ? "left-5" : "left-1"}`} />
              </button>
            </div>
          </>
        )}

        <div className="flex items-center justify-between py-3 border-t border-hairline">
          <div>
            <p className="font-ui text-[13px] text-dark">TDS Applicable</p>
            <p className="font-ui text-[10px] text-light">Deduct TDS on specified payments</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, tdsApplicable: !formData.tdsApplicable })}
            className={`w-10 h-6 rounded-full transition-colors ${formData.tdsApplicable ? "bg-amber" : "bg-lighter"} relative`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.tdsApplicable ? "left-5" : "left-1"}`} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-end pt-6 border-t border-hairline">
        <button
          onClick={handleContinue}
          disabled={saveProgress.isPending}
          className="filter-tab active disabled:opacity-50"
        >
          {saveProgress.isPending ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
