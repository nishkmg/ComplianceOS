"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const ayLabel: Record<string, string> = {
  "2026-27": "AY 2027-28",
  "2025-26": "AY 2026-27",
  "2024-25": "AY 2025-26",
};

const incomeHeads = [
  { key: "salary", label: "Salaries" },
  { key: "houseProperty", label: "Income from House Property" },
  { key: "businessProfit", label: "Profits and Gains of Business or Profession" },
  { key: "capitalGains", label: "Capital Gains" },
  { key: "otherSources", label: "Income from Other Sources" },
] as const;

export default function ITRComputationPage() {
  const { activeFy: selectedFY, setActiveFy: setSelectedFY } = useFiscalYear();
  const { fiscalYears: fiscalYearsList } = useFiscalYear();
  const utils = api.useUtils();

  const breakdown = api.itrComputation.getIncomeBreakdown.useQuery(
    { financialYear: selectedFY },
    { staleTime: 15_000 },
  );
  const returns = api.itrReturns.list.useQuery(
    { financialYear: selectedFY },
    { staleTime: 30_000 },
  );

  const activeReturn = useMemo(() => returns.data?.[0] ?? null, [returns.data]);

  const taxQuery = api.itrComputation.getTaxComputation.useQuery(
    { itrReturnId: activeReturn?.id ?? "" },
    { enabled: !!activeReturn },
  );
  const taxData = taxQuery.data;

  const computeIncome = api.itrComputation.computeIncomeFromBooks.useMutation({
    onSuccess: () => {
      showToast.success("Income recomputed from current data.");
      void utils.itrComputation.getIncomeBreakdown.invalidate();
      void utils.itrComputation.getTaxComputation.invalidate();
      void utils.itrReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });
  const computeTax = api.itrComputation.computeTax.useMutation({
    onSuccess: () => {
      showToast.success("Tax computed under the selected regime.");
      void utils.itrComputation.getTaxComputation.invalidate();
      void utils.itrReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const income = breakdown.data;
  const hasProjection = !!income?.lastComputedAt;

  const totalIncome = useMemo(() => {
    if (!income) return 0;
    return incomeHeads.reduce((sum, h) => {
      const amount = h.key === "capitalGains" ? Number(income.capitalGains?.total ?? "0") : Number(income[h.key] ?? "0");
      return sum + amount;
    }, 0);
  }, [income]);

  const totalDeductions = Number(activeReturn?.totalDeductions ?? "0");
  const taxableIncomeOld = Math.max(0, totalIncome - totalDeductions);
  const taxableIncomeNew = totalIncome;

  const regime = taxData?.taxRegime ?? "old";
  const netTax = Number(taxData?.netTax ?? "0");
  const taxOnTotalIncome = Number(taxData?.taxOnTotalIncome ?? "0");
  const surcharge = Number(taxData?.surcharge ?? "0");
  const cess = Number(taxData?.cess ?? "0");
  const rebate87a = Number(taxData?.rebate87a ?? "0");

  const loading = breakdown.isLoading || (returns.isLoading && !returns.data);
  const errorMsg = breakdown.error?.message ?? returns.error?.message;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-page mx-auto space-y-8 pb-12">
        <PageHeader title="ITR Computation" />
        <Card className="bg-surface border border-border p-8 text-center">
          <p className="text-danger font-medium mb-4">Failed to load ITR computation: {errorMsg}</p>
          <Button onClick={() => { void breakdown.refetch(); void returns.refetch(); }}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-0 text-left">
      {/* Sticky Header */}
      <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mx-8 -mt-8 mb-8 bg-surface sticky top-0 z-20 backdrop-blur-sm print:static print:bg-surface print:border-black">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2 print:text-dark">{ayLabel[selectedFY] ?? "AY 2027-28"} | Individual</p>
          <h1 className="font-ui text-2xl font-semibold text-dark print:text-dark">ITR Computation</h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center print:hidden">
          <select
            aria-label="Financial year"
            className="bg-surface border border-border px-3 py-2 text-ui-xs font-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-md"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
          >
            {fiscalYearsList.map((fy) => (
              <option key={fy.year} value={fy.year}>FY {fy.year}</option>
            ))}
          </select>
          {activeReturn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => computeIncome.mutate({ itrReturnId: activeReturn.id })}
              disabled={!activeReturn || computeIncome.isPending}
            >
              {computeIncome.isPending ? "Computing…" : hasProjection ? "Recompute Income" : "Compute Income"}
            </Button>
          )}
          <Link
            href={`/itr/returns/${selectedFY}`}
            className="inline-flex items-center gap-2 rounded-md bg-amber px-4 py-2 text-ui-sm font-bold text-white no-underline shadow-sm transition-colors hover:bg-amber-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {activeReturn ? "View Return" : "Create Return"} <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </div>

      <div className="max-w-page mx-auto space-y-8 pb-12">
        {!activeReturn ? (
          <EmptyState
            icon="description"
            title={`No ITR return for FY ${selectedFY}`}
            description="Create a return first; computation will pull income projections and deductions from your books."
          />
        ) : !hasProjection ? (
          <EmptyState
            icon="calculate"
            title="Income projection not computed yet"
            description="Annual income projections for this FY are empty. Income data will appear once payroll and business income events are recorded. Saved tax details for the return are shown below."
          />
        ) : (
          <>
            {/* Summary Bento */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-t-2 border-t-amber rounded-none rounded-b-xl shadow-sm print:border-black">
                <CardContent className="p-6">
                  <p className="text-ui-2xs text-mid font-bold uppercase tracking-widest mb-2">Gross Total Income</p>
                  <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(totalIncome)}</p>
                </CardContent>
              </Card>
              <Card className="border-t-2 border-t-stone-800 rounded-none rounded-b-xl shadow-sm print:border-black">
                <CardContent className="p-6">
                  <p className="text-ui-2xs text-mid font-bold uppercase tracking-widest mb-2">Total Deductions</p>
                  <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(totalDeductions)}</p>
                </CardContent>
              </Card>
              <Card className="border-t-2 border-t-stone-800 rounded-none rounded-b-xl shadow-sm print:border-black">
                <CardContent className="p-6">
                  <p className="text-ui-2xs text-mid font-bold uppercase tracking-widest mb-2">Net Taxable Income</p>
                  <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(regime === "old" ? taxableIncomeOld : taxableIncomeNew)}</p>
                </CardContent>
              </Card>
              <Card className="bg-sidebar text-white focus:border-focus border-t-2 border-t-stone-700 rounded-none rounded-b-xl shadow-lg print:bg-surface print:text-dark print:border-black">
                <CardContent className="p-6">
                  <p className="text-ui-2xs text-sidebar-muted font-bold uppercase tracking-widest mb-2 print:text-mid">Net Tax Payable</p>
                  <p className="font-mono text-2xl font-bold text-amber-bright tabular-nums print:text-dark">{formatIndianNumber(netTax)}</p>
                </CardContent>
              </Card>
            </section>

            {/* Regime Toggle */}
            <div className="flex items-center gap-4 print:hidden">
              <span className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Tax Regime</span>
              <div className="flex bg-surface-muted border border-border rounded-md p-1">
                <button
                  onClick={() => computeTax.mutate({ itrReturnId: activeReturn.id, taxRegime: "old" })}
                  disabled={computeTax.isPending}
                  className={`px-4 py-1.5 text-ui-xs font-ui font-medium rounded-sm transition-colors cursor-pointer border-none ${regime === "old" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
                >
                  Old Regime
                </button>
                <button
                  onClick={() => computeTax.mutate({ itrReturnId: activeReturn.id, taxRegime: "new" })}
                  disabled={computeTax.isPending}
                  className={`px-4 py-1.5 text-ui-xs font-ui font-medium rounded-sm transition-colors cursor-pointer border-none ${regime === "new" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
                >
                  New Regime
                </button>
              </div>
              <span className="font-ui text-ui-xs text-amber font-medium">
                {regime === "old" ? "Higher deductions, lower taxable income" : "Lower rates, fewer deductions"}
              </span>
              {taxQuery.isFetching && <Icon name="hourglass" className="text-lighter animate-spin text-sm" />}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Income + Deductions */}
              <div className="lg:col-span-2 space-y-8">
                {/* Income Sections */}
                <Card className="shadow-sm rounded-none border border-border print:border-black">
                  <CardHeader className="px-6 py-4 bg-surface-muted border-b border-border">
                    <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Income Details</h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y-[0.5px] divide-border-subtle">
                      {income && incomeHeads.map((h) => {
                        const amount = h.key === "capitalGains"
                          ? Number(income.capitalGains?.total ?? "0")
                          : Number(income[h.key] ?? "0");
                        return (
                          <div key={h.key} className="flex justify-between items-center px-6 py-3.5 hover:bg-surface-muted/50 transition-colors">
                            <span className="font-ui text-ui-sm text-dark">{h.label}</span>
                            <span className="font-mono text-ui-sm tabular-nums text-dark">{formatIndianNumber(amount)}</span>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center px-6 py-4 bg-surface-muted font-bold border-t border-border">
                        <span className="font-ui text-ui-xs uppercase tracking-widest text-dark">Gross Total Income</span>
                        <span className="font-mono text-ui-md tabular-nums text-dark">{formatIndianNumber(totalIncome)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Deductions */}
                <Card className="shadow-sm rounded-none border border-border print:border-black">
                  <CardHeader className="px-6 py-4 bg-surface-muted border-b border-border">
                    <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Deductions under Chapter VI-A</h3>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y-[0.5px] divide-border-subtle">
                      <div className="flex justify-between items-center px-6 py-3.5">
                        <span className="font-ui text-ui-sm text-dark">Total deductions (schedule-level detail is captured during return preparation)</span>
                        <span className="font-mono text-ui-sm tabular-nums text-danger">−{formatIndianNumber(totalDeductions)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4 bg-surface-muted font-bold border-t border-border">
                        <span className="font-ui text-ui-xs uppercase tracking-widest text-dark">Total Deductions</span>
                        <span className="font-mono text-ui-md tabular-nums text-danger">−{formatIndianNumber(totalDeductions)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Tax Computation */}
              <div className="space-y-6">
                <Card className="bg-sidebar text-sidebar-dim overflow-hidden shadow-xl border focus:border-focus rounded-none print:bg-surface print:text-dark print:border-black">
                  <CardHeader className="p-6 border-b focus:border-focus print:border-black">
                    <h3 className="font-ui text-lg font-bold text-amber-bright mb-1 print:text-dark">Tax Computation</h3>
                    <p className="text-ui-2xs text-sidebar-muted font-bold uppercase tracking-widest print:text-mid">
                      {regime === "old" ? "Old Tax Regime" : "New Tax Regime"} Applied
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-lighter font-mono text-sm print:divide-black">
                      <div className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs text-sidebar-muted uppercase tracking-wide print:text-mid">Net Taxable Income</span>
                        <span className="tabular-nums">{formatIndianNumber(regime === "old" ? taxableIncomeOld : taxableIncomeNew)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs text-sidebar-muted uppercase tracking-wide print:text-mid">Tax on Normal Income</span>
                        <span className="tabular-nums">{formatIndianNumber(taxOnTotalIncome)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs text-sidebar-muted uppercase tracking-wide print:text-mid">Rebate u/s 87A</span>
                        <span className="tabular-nums">{formatIndianNumber(rebate87a)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs text-sidebar-muted uppercase tracking-wide print:text-mid">Surcharge</span>
                        <span className="tabular-nums">{formatIndianNumber(surcharge)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-4">
                        <span className="text-xs text-sidebar-muted uppercase tracking-wide print:text-mid">Health & Education Cess @ 4%</span>
                        <span className="tabular-nums">{formatIndianNumber(cess)}</span>
                      </div>
                      <div className="flex justify-between items-center px-6 py-6 bg-sidebar font-bold text-lg print:bg-surface-muted">
                        <span className="text-xs text-amber-bright uppercase tracking-widest print:text-dark">Total Tax Liability</span>
                        <span className="text-amber-bright tabular-nums print:text-dark">{formatIndianNumber(netTax)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
