"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegimeComparisonPage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get("returnId") ?? "";

  const { data: itrReturn } = api.itrReturns.get.useQuery({ itrReturnId: returnId });

  const { data: comparison } = api.itrComputation.getRegimeComparison.useQuery(
    {
      totalIncome: 1000000,
      deductions: {
        chapterVIA: {
          section80C: "150000",
          section80D: "25000",
          section80E: "0",
          section80G: "0",
          section80TTA: "0",
          section80TTB: "0",
          other: "0",
          total: "175000",
        },
        otherDeductions: {
          section10AA: "0",
          section80CC: "0",
          other: "0",
          total: "0",
        },
        totalDeductions: "175000",
      },
    },
    { enabled: !!returnId }
  );

  const totalIncome = 1000000;
  const deductions = 175000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/itr/computation?returnId=${returnId}`} className="text-sm text-gray-500 hover:underline">
            ← Back to Computation
          </Link>
          <h1 className="text-2xl font-bold mt-1">Tax Regime Comparison</h1>
          {itrReturn && (
            <p className="text-sm text-gray-500">{itrReturn.returnType.toUpperCase()} - {itrReturn.assessmentYear}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Old Regime</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Income</span>
              <span className="font-medium">₹{totalIncome.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Deductions (80C, 80D, etc.)</span>
              <span className="font-medium text-green-600">-₹{deductions.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 font-medium bg-gray-50 px-4 py-3 rounded">
              <span className="text-gray-900">Taxable Income</span>
              <span className="text-gray-900">₹{(totalIncome - deductions).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{comparison?.oldRegime.tax.toLocaleString("en-IN") ?? "0"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cess (4%)</span>
              <span className="font-medium">₹{comparison?.oldRegime.cess.toLocaleString("en-IN") ?? "0"}</span>
            </div>
            <div className="flex justify-between py-2 font-bold bg-blue-50 px-4 py-3 rounded">
              <span className="text-gray-900">Total Tax</span>
              <span className="text-gray-900">₹{comparison?.oldRegime.total.toLocaleString("en-IN") ?? "0"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4">New Regime</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Income</span>
              <span className="font-medium">₹{totalIncome.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Deductions</span>
              <span className="font-medium text-gray-400">Not available</span>
            </div>
            <div className="flex justify-between py-2 font-medium bg-gray-50 px-4 py-3 rounded">
              <span className="text-gray-900">Taxable Income</span>
              <span className="text-gray-900">₹{totalIncome.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{comparison?.newRegime.tax.toLocaleString("en-IN") ?? "0"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cess (4%)</span>
              <span className="font-medium">₹{comparison?.newRegime.cess.toLocaleString("en-IN") ?? "0"}</span>
            </div>
            <div className="flex justify-between py-2 font-bold bg-blue-50 px-4 py-3 rounded">
              <span className="text-gray-900">Total Tax</span>
              <span className="text-gray-900">₹{comparison?.newRegime.total.toLocaleString("en-IN") ?? "0"}</span>
            </div>
          </div>
        </div>
      </div>

      {comparison && (
        <div className={`rounded-lg shadow p-6 ${comparison.recommended === "old" ? "bg-green-50" : "bg-blue-50"}`}>
          <h3 className="text-lg font-bold mb-2">
            Recommended: {comparison.recommended === "old" ? "Old Regime" : "New Regime"}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            You can save ₹{comparison.savings.toLocaleString("en-IN")} by choosing the {comparison.recommended} regime.
          </p>
          <p className="text-xs text-gray-500">
            This is a simplified calculation. Actual tax may vary based on surcharge, specific deductions, and other factors.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Detailed Deduction Breakdown (Old Regime)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Chapter VI-A</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">80C (LIC, PPF, ELSS, etc.)</span>
                <span className="font-medium">₹1,50,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">80D (Health Insurance)</span>
                <span className="font-medium">₹25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">80E (Education Loan Interest)</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">80G (Donations)</span>
                <span className="font-medium">₹0</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Other Deductions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">10AA (SEZ Unit)</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">80CC (NPS)</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Standard Deduction</span>
                <span className="font-medium">₹50,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
