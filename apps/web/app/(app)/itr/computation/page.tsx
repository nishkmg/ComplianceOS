"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { IncomeHead } from "@complianceos/shared";

const incomeHeads = [
  { key: "salary", label: "Salary", icon: "💼", description: "Income from salary and pension" },
  { key: "houseProperty", label: "House Property", icon: "🏠", description: "Income from let-out and deemed let-out property" },
  { key: "businessProfit", label: "Business & Profession", icon: "💼", description: "Profits from business or profession" },
  { key: "capitalGains", label: "Capital Gains", icon: "📈", description: "Short-term and long-term capital gains" },
  { key: "otherSources", label: "Other Sources", icon: "📋", description: "Interest, dividends, and other income" },
];

export default function ITRComputationPage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get("returnId") ?? "";

  const { data: incomeBreakdown } = api.itrComputation.getIncomeBreakdown.useQuery(
    { tenantId: "" as string, financialYear: "2026-27" }
  );

  const { data: itrReturn } = api.itrReturns.get.useQuery({ itrReturnId: returnId });
  const computeIncome = api.itrComputation.computeIncome.useMutation();
  const computeTax = api.itrComputation.computeTax.useMutation();

  const [taxRegime, setTaxRegime] = useState<"old" | "new">("old");

  const handleComputeIncome = async () => {
    if (!returnId) return;
    try {
      await computeIncome.mutateAsync({ itrReturnId: returnId });
    } catch (error) {
      console.error("Failed to compute income:", error);
      alert("Failed to compute income. Please ensure income data is available.");
    }
  };

  const handleComputeTax = async () => {
    if (!returnId) return;
    try {
      await computeTax.mutateAsync({ itrReturnId: returnId, taxRegime });
    } catch (error) {
      console.error("Failed to compute tax:", error);
      alert("Failed to compute tax. Please compute income first.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="text-sm text-gray-500 hover:underline">
            ← Back to ITR Returns
          </Link>
          <h1 className="text-2xl font-bold mt-1">Income Computation</h1>
          {itrReturn && (
            <p className="text-sm text-gray-500">{itrReturn.returnType.toUpperCase()} - {itrReturn.assessmentYear}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleComputeIncome}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Compute Income
          </button>
          <button
            onClick={handleComputeTax}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Compute Tax
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {incomeHeads.map((head) => (
          <div key={head.key} className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl mb-2">{head.icon}</div>
            <h3 className="font-semibold mb-1">{head.label}</h3>
            <p className="text-xs text-gray-500 mb-3">{head.description}</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{incomeBreakdown ? Number((incomeBreakdown as any)[head.key] ?? "0").toLocaleString("en-IN") : "0"}
            </p>
            <Link
              href={`/itr/computation/${head.key.replace(" ", "-").toLowerCase()}?returnId=${returnId}`}
              className="text-blue-600 hover:underline text-xs mt-2 inline-block"
            >
              Edit →
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Computation Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Gross Total Income</span>
            <span className="font-medium">₹{incomeBreakdown?.grossTotal ?? "0"}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Chapter VI-A Deductions</span>
            <span className="font-medium text-green-600">-₹0</span>
          </div>
          <div className="flex justify-between py-2 font-medium bg-gray-50 px-4 py-3 rounded">
            <span className="text-gray-900">Total Income (Rounded)</span>
            <span className="text-gray-900">₹{incomeBreakdown?.grossTotal ?? "0"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Tax Regime Selection</h2>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTaxRegime("old")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              taxRegime === "old"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Old Regime
          </button>
          <button
            onClick={() => setTaxRegime("new")}
            className={`px-4 py-2 rounded text-sm font-medium ${
              taxRegime === "new"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            New Regime
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Selected regime will be used for tax computation. You can compare both regimes on the comparison page.
        </p>
        <Link
          href={`/itr/computation/regime-comparison?returnId=${returnId}`}
          className="text-blue-600 hover:underline text-sm mt-2 inline-block"
        >
          Compare Regimes →
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Presumptive Scheme</h2>
        <p className="text-sm text-gray-500 mb-4">
          Select presumptive taxation scheme if applicable under sections 44AD, 44ADA, or 44AE.
        </p>
        <Link
          href={`/itr/computation/presumptive-scheme?returnId=${returnId}`}
          className="text-blue-600 hover:underline text-sm"
        >
          Configure Presumptive Scheme →
        </Link>
      </div>
    </div>
  );
}
