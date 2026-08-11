"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

const sectionMeta = {
  "44ad": { businessType: "trading", label: "Section 44AD", sub: "Eligible Business", hint: "6% deemed income on turnover ≤ ₹3 crore" },
  "44ada": { businessType: "service", profession: "accountancy", label: "Section 44ADA", sub: "Specified Profession", hint: "50% deemed income (gross receipts ≤ ₹75 lakh)" },
} as const;

export default function ITRPresumptivePage() {
  const [section, setSection] = useState<"44ad" | "44ada">("44ad");
  const [turnover, setTurnover] = useState(1500000);

  const meta = sectionMeta[section];
  const recommendation = api.itrComputation.recommendScheme.useQuery(
    { businessType: meta.businessType, turnover, profession: "profession" in meta ? meta.profession : undefined },
    { enabled: turnover > 0 },
  );

  const result = recommendation.data;
  const presumptiveIncome = Number(result?.presumptiveIncome ?? "0");
  const effectiveRate = turnover > 0 ? (presumptiveIncome / turnover) * 100 : 0;

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2 flex items-center gap-2">
          <Icon name="calculate" className="text-ui-md" />
          Tax Calculation Engine
        </p>
        <PageHeader title="Presumptive Taxation Model" />
        <p className="font-ui text-ui-sm text-secondary max-w-2xl leading-relaxed">
          Evaluate deemed income under sections 44AD (Business) and 44ADA (Profession). Eligibility and presumptive income are computed from your inputs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-page mx-auto">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface border border-border p-8 rounded-md border-t-2 border-t-amber shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-ui text-lg font-bold text-dark mb-6">Parameter Configuration</h2>
            <div className="space-y-8">
              {/* Scheme Selection */}
              <div className="text-left">
                <span className="block font-ui text-ui-sm uppercase font-bold tracking-widest text-mid mb-3">Applicable Section</span>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(sectionMeta) as Array<"44ad" | "44ada">).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSection(key)}
                      className={`relative flex flex-col p-4 border rounded-md cursor-pointer transition-colors text-left ${section === key ? "border-amber bg-amber-soft" : "border-border hover:bg-surface-muted"}`}
                    >
                      <span className="font-ui text-dark font-bold">{sectionMeta[key].label}</span>
                      <span className="font-ui text-ui-2xs text-mid mt-1 uppercase">{sectionMeta[key].sub}</span>
                      {section === key && <Icon name="check_circle" className="absolute top-4 right-4 text-amber" />}
                    </button>
                  ))}
                </div>
                <p className="text-ui-2xs text-light mt-3">{meta.hint}</p>
              </div>

              {/* Turnover Input */}
              <div className="text-left">
                <label className="block font-ui text-ui-sm uppercase font-bold tracking-widest text-mid mb-2" htmlFor="turnover">Total Turnover / Gross Receipts</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-mid">₹</span>
                  <input
                    id="turnover"
                    className="w-full bg-surface-muted border border-border rounded-md py-3 pl-10 pr-4 font-mono text-sm focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    type="number"
                    min={0}
                    value={turnover}
                    onChange={(e) => setTurnover(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-sidebar text-white p-8 rounded-md shadow-xl flex flex-col border focus:border-focus">
            <h3 className="font-ui text-lg font-bold text-amber-bright mb-8">Computation Result</h3>

            {recommendation.isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Icon name="hourglass" className="text-whiteer animate-spin text-3xl" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b focus:border-focus pb-4">
                  <span className="font-ui text-ui-sm text-white">Presumptive Income</span>
                  <span className="font-mono text-2xl font-bold text-white">{formatIndianNumber(presumptiveIncome)}</span>
                </div>

                <div className="flex justify-between items-center text-white">
                  <span className="font-ui text-ui-2xs uppercase tracking-widest">Effective Rate</span>
                  <span className="font-mono text-sm">{effectiveRate.toFixed(2)}%</span>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Icon name={result?.eligible ? "check_circle" : "info"} className={result?.eligible ? "text-amber" : "text-white"} />
                  <p className="font-ui text-ui-sm text-white leading-relaxed">
                    {result?.reasoning ?? "Enter turnover to evaluate eligibility."}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-auto pt-12">
              <Link
                href="/itr/computation"
                className="w-full bg-amber text-white dark:text-amber-ink py-4 font-ui text-ui-sm font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors rounded-md border-none flex items-center justify-center gap-2 no-underline"
              >
                Back to Computation
                <Icon name="arrow_forward" />
              </Link>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 shadow-sm text-left">
            <div className="flex items-start gap-3">
              <Icon name="info" className="text-amber" />
              <div>
                <h4 className="font-ui text-ui-sm font-bold text-dark text-xs uppercase tracking-widest mb-1">Compliance Note</h4>
                <p className="font-ui text-ui-sm text-mid leading-relaxed">
                  Presumptive income is a deemed figure — tax audit under section 44AB may still apply based on turnover thresholds and your actual books. Confirm thresholds for the applicable assessment year before filing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
