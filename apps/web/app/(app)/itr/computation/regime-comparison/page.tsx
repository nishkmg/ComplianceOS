"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function ITRRegimeComparisonPage() {
  const { activeFy } = useFiscalYear();
  const utils = api.useUtils();

  const breakdown = api.itrComputation.getIncomeBreakdown.useQuery(
    { financialYear: activeFy },
    { staleTime: 15_000 },
  );
  const returns = api.itrReturns.list.useQuery(
    { financialYear: activeFy },
    { staleTime: 30_000 },
  );
  const activeReturn = useMemo(() => returns.data?.[0] ?? null, [returns.data]);

  const totalIncome = useMemo(() => {
    const i = breakdown.data;
    if (!i) return 0;
    return (["salary", "houseProperty", "businessProfit", "otherSources"] as const)
      .reduce((sum, k) => sum + Number(i[k] ?? "0"), 0)
      + Number(i.capitalGains?.total ?? "0");
  }, [breakdown.data]);

  const totalDeductions = Number(activeReturn?.totalDeductions ?? "0");

  const comparison = api.itrComputation.getRegimeComparison.useQuery(
    {
      totalIncome,
      deductions: {
        totalDeductions: String(totalDeductions),
      },
    },
    { enabled: totalIncome > 0 },
  );

  const applyRegime = api.itrComputation.computeTax.useMutation({
    onSuccess: (d) => {
      showToast.success(`Tax computed under the ${d.taxRegime === "new" ? "New" : "Old"} regime.`);
      void utils.itrComputation.getTaxComputation.invalidate();
      void utils.itrReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const c = comparison.data;
  const rows = c ? [
    { label: "Total Gross Income", old: totalIncome, new: totalIncome },
    { label: "Total Deductions", old: totalDeductions, new: 0 },
    { label: "Net Taxable Income", old: c.oldRegime.taxableIncome, new: c.newRegime.taxableIncome },
    { label: "Computed Tax", old: c.oldRegime.tax, new: c.newRegime.tax },
    { label: "Health & Education Cess @ 4%", old: c.oldRegime.cess, new: c.newRegime.cess },
  ] : [];

  return (
    <div className="space-y-0 text-left">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">FY {activeFy}</p>
          <h1 className="font-ui text-2xl font-semibold text-dark mb-2">Regime Comparison</h1>
          <p className="font-ui text-ui-sm text-secondary max-w-2xl leading-relaxed">
            Tax liability under the Old and New regimes based on computed income for the current FY.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="border border-border text-dark py-2 px-4 rounded-md font-ui text-ui-sm font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-surface shadow-sm">
            <Icon name="print" className="text-sm" /> Print Analysis
          </button>
          <Button
            size="sm"
            onClick={() => {
              if (!activeReturn || !c) return;
              applyRegime.mutate({ itrReturnId: activeReturn.id, taxRegime: c.recommended as "old" | "new" });
            }}
            disabled={!activeReturn || !c || applyRegime.isPending}
            className="gap-2"
          >
            Select {c?.recommended === "new" ? "New" : "Old"} Regime <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      </div>

      {breakdown.isLoading || comparison.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : !activeReturn ? (
        <EmptyState
          icon="description"
          title={`No ITR return for FY ${activeFy}`}
          description="Create a return first; the comparison uses the return's income and deduction data."
        />
      ) : totalIncome <= 0 ? (
        <EmptyState
          icon="calculate"
          title="No income data yet"
          description="Income projections for this FY are empty. The comparison will populate once income is computed."
        />
      ) : !c ? (
        <EmptyState
          icon="info"
          title="Comparison unavailable"
          description="The regime comparison could not be computed for the current income data."
        />
      ) : (
        <>
          {/* Recommendation Banner */}
          <div className="bg-success-bg border border-success/20 p-6 mb-12 flex items-start gap-4">
            <Icon name="check_circle" className="text-success text-3xl" />
            <div>
              <h3 className="font-ui text-lg font-bold text-dark mb-1">
                {c.recommended === "new" ? "New Regime Recommended" : "Old Regime Recommended"}
              </h3>
              <p className="font-ui text-ui-sm text-mid">
                Opting for the {c.recommended === "new" ? "New" : "Old"} Regime saves{" "}
                <span className="font-mono text-dark font-bold text-base">₹ {formatIndianNumber(c.savings)}</span> in total tax liability for the current assessment year.
              </p>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Old Regime Card */}
            <div className="bg-surface border border-border shadow-sm flex flex-col">
              <div className="p-6 border-b-[0.5px] border-border bg-surface-muted">
                <h3 className="font-ui text-lg font-bold text-mid uppercase tracking-widest text-xs">Old Tax Regime</h3>
              </div>
              <div className="flex-1 divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-center p-6 hover:bg-surface-muted transition-colors">
                    <span className="font-ui text-ui-sm text-mid text-xs uppercase tracking-wider">{row.label}</span>
                    <span className="text-dark">₹ {formatIndianNumber(row.old)}</span>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-surface-muted border-t-2 focus:border-focus">
                <div className="flex justify-between items-center">
                  <span className="font-ui text-ui-sm font-bold uppercase tracking-widest text-xs text-mid">Final Liability</span>
                  <span className="font-mono text-xl font-bold text-dark">₹ {formatIndianNumber(c.oldRegime.total)}</span>
                </div>
              </div>
            </div>

            {/* New Regime Card */}
            <div className={`bg-surface border shadow-lg flex flex-col relative overflow-hidden ${c.recommended === "new" ? "border-amber" : "border-border"}`}>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
              <div className={`p-6 border-b-[0.5px] ${c.recommended === "new" ? "border-amber/20 bg-amber-50" : "border-border bg-surface-muted"}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-ui text-lg font-bold text-primary uppercase tracking-widest text-xs">New Tax Regime</h3>
                  {c.recommended === "new" && (
                    <span className="bg-primary text-white px-2 py-0.5 rounded-md text-ui-2xs font-bold uppercase tracking-widest">Recommended</span>
                  )}
                </div>
              </div>
              <div className="flex-1 divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {rows.map((row, i) => (
                  <div key={i} className="flex justify-between items-center p-6 hover:bg-amber-50/50 transition-colors">
                    <span className="font-ui text-ui-sm text-mid text-xs uppercase tracking-wider">{row.label}</span>
                    <span className={row.new === 0 ? "text-light opacity-50" : "text-dark"}>₹ {formatIndianNumber(row.new)}</span>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-amber-50 border-t-2 border-primary">
                <div className="flex justify-between items-center">
                  <span className="font-ui text-ui-sm font-bold uppercase tracking-widest text-xs text-primary">Final Liability</span>
                  <span className="font-mono text-xl font-bold text-primary">₹ {formatIndianNumber(c.newRegime.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
