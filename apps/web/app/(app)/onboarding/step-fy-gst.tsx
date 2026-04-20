"use client";

import { useState, useEffect } from "react";

interface FYGstStepProps {
  onNext: () => void;
  onBack: () => void;
  savedData?: {
    fyStartDate?: string;
    gstRegistration?: string;
    gstRates?: string[];
    itcEligible?: boolean;
    tdsApplicable?: boolean;
    tdsRates?: Record<string, number>;
  };
  tenantId?: string;
}

const GST_RATES = [
  { value: "0", label: "0%", description: "Exempt goods, agricultural produce" },
  { value: "5", label: "5%", description: "Necessary items, sugar, tea, edible oil" },
  { value: "12", label: "12%", description: "Computers, processed food, business services" },
  { value: "18", label: "18%", description: "Most items, electronics, professional services" },
  { value: "28", label: "28%", description: "Luxury items, cigarettes, automobiles" },
];

const TDS_SECTIONS = [
  { section: "194C", label: "Contractor", rate: 1 },
  { section: "194J", label: "Professional Fees", rate: 10 },
  { section: "194H", label: "Commission", rate: 5 },
  { section: "194F", label: "Life Insurance", rate: 2 },
];

export default function FYGstStep({ onNext, onBack, savedData, tenantId }: FYGstStepProps) {
  const currentYear = new Date().getFullYear();
  const defaultFyStart = `${currentYear}-04-01`;

  const [fyStartDate, setFyStartDate] = useState(savedData?.fyStartDate ?? defaultFyStart);
  const [gstRegistration, setGstRegistration] = useState(savedData?.gstRegistration ?? "none");
  const [gstRates, setGstRates] = useState<string[]>(savedData?.gstRates ?? []);
  const [itcEligible, setItcEligible] = useState(savedData?.itcEligible ?? false);
  const [tdsApplicable, setTdsApplicable] = useState(savedData?.tdsApplicable ?? false);
  const [tdsRates, setTdsRates] = useState<Record<string, number>>(
    savedData?.tdsRates ?? Object.fromEntries(TDS_SECTIONS.map((s) => [s.section, s.rate]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGstRegistered = gstRegistration !== "none";

  // Auto-set ITC when registration type changes
  useEffect(() => {
    if (gstRegistration === "composition") {
      setItcEligible(false);
    } else if (gstRegistration === "regular") {
      setItcEligible(true);
    }
  }, [gstRegistration]);

  const handleGstRateToggle = (rate: string) => {
    setGstRates((prev) =>
      prev.includes(rate) ? prev.filter((r) => r !== rate) : [...prev, rate]
    );
  };

  const handleTdsRateChange = (section: string, value: string) => {
    const num = parseFloat(value) || 0;
    setTdsRates((prev) => ({ ...prev, [section]: num }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create fiscal year via API
      if (tenantId) {
        const fyYear = `${currentYear}-${currentYear + 1}`;
        await fetch("/api/trpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            json: true,
            method: "fiscalYears.create",
            params: { input: { year: fyYear, startDate: fyStartDate, endDate: `${currentYear + 1}-03-31` } },
          }),
        });
      }

      // Save progress
      const payload = {
        fyStartDate,
        gstRegistration,
        gstRates: isGstRegistered ? gstRates : [],
        itcEligible: isGstRegistered ? itcEligible : false,
        tdsApplicable,
        tdsRates: tdsApplicable ? tdsRates : {},
      };

      if (tenantId) {
        await fetch("/api/trpc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            json: true,
            method: "onboarding.saveProgress",
            params: { input: { tenantId, step: 4, data: { fyGst: payload } } },
          }),
        });
      }

      onNext();
    } catch (err) {
      console.error("Failed to save FY/GST data:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Fiscal Year &amp; GST Setup</h2>
        <p className="text-sm text-gray-500">Configure your fiscal year and tax settings</p>
      </div>

      {/* FY Start Date */}
      <div>
        <label className="block text-sm font-medium mb-1">FY Start Date</label>
        <input
          type="date"
          value={fyStartDate}
          onChange={(e) => setFyStartDate(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">Your fiscal year runs from April 1 to March 31</p>
      </div>

      {/* GST Registration Type */}
      <div>
        <label className="block text-sm font-medium mb-1">GST Registration</label>
        <select
          value={gstRegistration}
          onChange={(e) => setGstRegistration(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="none">Not Registered</option>
          <option value="regular">Regular</option>
          <option value="composition">Composition</option>
        </select>
      </div>

      {/* GST Rates - only when registered */}
      {isGstRegistered && (
        <div>
          <label className="block text-sm font-medium mb-2">Applicable GST Rates</label>
          <div className="space-y-2">
            {GST_RATES.map((rate) => (
              <label key={rate.value} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={gstRates.includes(rate.value)}
                  onChange={() => handleGstRateToggle(rate.value)}
                  className="mt-0.5 w-4 h-4"
                />
                <div>
                  <span className="font-medium text-sm">{rate.label}</span>
                  <p className="text-xs text-gray-500">{rate.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ITC Eligible - only when registered */}
      {isGstRegistered && (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">ITC Eligible</label>
              <p className="text-xs text-gray-400">Input Tax Credit — can you claim GST paid on purchases?</p>
            </div>
            <button
              type="button"
              onClick={() => setItcEligible(!itcEligible)}
              className={`relative inline-flex h-6 w-11 items-center rounded transition-colors ${
                itcEligible ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  itcEligible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* TDS Applicable */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">TDS Applicable</label>
            <p className="text-xs text-gray-400">Tax Deducted at Source on payments</p>
          </div>
          <button
            type="button"
            onClick={() => setTdsApplicable(!tdsApplicable)}
            className={`relative inline-flex h-6 w-11 items-center rounded transition-colors ${
              tdsApplicable ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tdsApplicable ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* TDS Section Rates - shown when TDS applicable */}
      {tdsApplicable && (
        <div>
          <label className="block text-sm font-medium mb-3">TDS Section Rates</label>
          <div className="space-y-2">
            {TDS_SECTIONS.map((s) => (
              <div key={s.section} className="flex items-center gap-4 p-3 border rounded">
                <div className="w-24">
                  <span className="font-medium text-sm">{s.section}</span>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tdsRates[s.section]}
                    onChange={(e) => handleTdsRateChange(s.section, e.target.value)}
                    className="w-20 px-2 py-1 border rounded text-sm text-center"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
          disabled={isSubmitting}
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}