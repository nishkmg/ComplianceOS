// @ts-nocheck
"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const incomeHeads = [
  { key: "salary", label: "Salary", icon: "💼", description: "Income from salary and pension" },
  { key: "houseProperty", label: "House Property", icon: "🏠", description: "Income from let-out and deemed let-out property" },
  { key: "businessProfit", label: "Business & Profession", icon: "💼", description: "Profits from business or profession" },
  { key: "capitalGains", label: "Capital Gains", icon: "📈", description: "Short-term and long-term capital gains" },
  { key: "otherSources", label: "Other Sources", icon: "📋", description: "Interest, dividends, and other income" },
];

const Page = function ITRComputationPage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get("returnId") ?? "";
  const { data: incomeBreakdown } = api.itrComputation.getIncomeBreakdown.useQuery({ tenantId: "" as string, financialYear: "2026-27" });
  const { data: itrReturn } = api.itrReturns.get.useQuery({ itrReturnId: returnId });
  const computeIncome = api.itrComputation.computeIncome.useMutation();
  const computeTax = api.itrComputation.computeTax.useMutation();
  const [taxRegime, setTaxRegime] = useState<"old" | "new">("old");

  const handleComputeIncome = async () => {
    if (!returnId) return;
    try { await computeIncome.mutateAsync({ itrReturnId: returnId }); }
    catch (error) { console.error("Failed to compute income:", error); }
  };

  const handleComputeTax = async () => {
    if (!returnId) return;
    try { await computeTax.mutateAsync({ itrReturnId: returnId, taxRegime }); }
    catch (error) { console.error("Failed to compute tax:", error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="font-ui text-[12px] text-amber hover:underline">← Back to ITR Returns</Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">Income Computation</h1>
          {itrReturn && <p className="font-ui text-[12px] text-light mt-1">{itrReturn.returnType.toUpperCase()} - {itrReturn.assessmentYear}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={handleComputeIncome} className="filter-tab active">Compute Income</button>
          <button onClick={handleComputeTax} className="filter-tab bg-success text-white hover:bg-success/90">Compute Tax</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {incomeHeads.map((head) => (
          <div key={head.key} className="card p-5">
            <div className="text-2xl mb-2">{head.icon}</div>
            <h3 className="font-display text-[14px] font-normal text-dark mb-1">{head.label}</h3>
            <p className="font-ui text-[11px] text-light mb-3">{head.description}</p>
            <p className="font-mono text-[18px] font-medium text-dark">₹{incomeBreakdown ? Number((incomeBreakdown as any)[head.key] ?? "0").toLocaleString("en-IN") : "0"}</p>
            <Link href={`/itr/computation/${head.key.replace(" ", "-").toLowerCase()}?returnId=${returnId}`} className="font-ui text-[12px] text-amber hover:underline mt-2 inline-block">Edit →</Link>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Computation Summary</h2>
        <div className="space-y-2 font-ui text-[13px]">
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-light">Gross Total Income</span>
            <span className="font-mono text-dark">₹{incomeBreakdown?.grossTotal ?? "0"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-hairline">
            <span className="text-light">Chapter VI-A Deductions</span>
            <span className="font-mono text-success">-₹0</span>
          </div>
          <div className="flex justify-between py-3 font-medium bg-surface-muted px-4 rounded">
            <span className="text-dark">Total Income (Rounded)</span>
            <span className="font-mono text-dark">₹{incomeBreakdown?.grossTotal ?? "0"}</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Tax Regime Selection</h2>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setTaxRegime("old")} className={`filter-tab ${taxRegime === "old" ? "active" : ""}`}>Old Regime</button>
          <button onClick={() => setTaxRegime("new")} className={`filter-tab ${taxRegime === "new" ? "active" : ""}`}>New Regime</button>
        </div>
        <p className="font-ui text-[12px] text-light mb-3">Selected regime will be used for tax computation. You can compare both regimes on the comparison page.</p>
        <Link href={`/itr/computation/regime-comparison?returnId=${returnId}`} className="font-ui text-[12px] text-amber hover:underline">Compare Regimes →</Link>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Presumptive Scheme</h2>
        <p className="font-ui text-[12px] text-light mb-4">Select presumptive taxation scheme if applicable under sections 44AD, 44ADA, or 44AE.</p>
        <Link href={`/itr/computation/presumptive-scheme?returnId=${returnId}`} className="font-ui text-[12px] text-amber hover:underline">Configure Presumptive Scheme →</Link>
      </div>
    </div>
  );
}

export default function ITRComputationPageWrapper() {
  return (
    <Suspense fallback={<div className="py-12 text-center font-ui text-light">Loading...</div>}>
      <Page />
    </Suspense>
  );
}
