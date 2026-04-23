// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ITRReturnType, ITRReturnStatus } from "@complianceos/shared";

const statusConfig: Record<ITRReturnStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-800", label: "Draft" },
  computed: { bg: "bg-blue-100 text-blue-800", label: "Computed" },
  generated: { bg: "bg-green-100 text-green-800", label: "Generated" },
  filed: { bg: "bg-green-100 text-green-800", label: "Filed" },
  verified: { bg: "bg-purple-100 text-purple-800", label: "Verified" },
  voided: { bg: "bg-red-100 text-red-800", label: "Voided" },
};

export default function ITRFinancialYearPage() {
  const params = useParams();
  const router = useRouter();
  const financialYear = params.financialYear as string;

  const [activeTab, setActiveTab] = useState<"itr3" | "itr4">("itr3");

  const { data: returns, isLoading } = api.itrReturns.list.useQuery({
    financialYear,
  });

  const createReturn = api.itrReturns.create.useMutation();

  const handleCreate = async (returnType: "itr3" | "itr4") => {
    try {
      const result = await createReturn.mutateAsync({ financialYear, returnType });
      router.push(`/itr/returns/${financialYear}/${result.itrReturnId}`);
    } catch (error) {
      console.error("Failed to create return:", error);
      alert("Failed to create return. Please try again.");
    }
  };

  const itr3Return = returns?.find((r) => r.returnType === "itr3");
  const itr4Return = returns?.find((r) => r.returnType === "itr4");
  const currentReturn = activeTab === "itr3" ? itr3Return : itr4Return;

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="text-sm text-gray-500 hover:underline">
            ← Back to ITR Returns
          </Link>
          <h1 className="text-2xl font-bold mt-1">ITR Returns - FY {financialYear}</h1>
          <p className="text-sm text-gray-500">Assessment Year: {financialYear.replace(/^(\d{4})-(\d{2})$/, (_, start) => `${Number(start) + 1}-${(Number(start) + 2).toString().slice(-2)}`)}</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="flex gap-4">
          {[
            { id: "itr3", label: "ITR-3", count: itr3Return ? 1 : 0 },
            { id: "itr4", label: "ITR-4", count: itr4Return ? 1 : 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {currentReturn ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{currentReturn.returnType.toUpperCase()} Return</h2>
            <span className={`px-3 py-1 text-sm rounded-full capitalize ${statusConfig[currentReturn.status].bg}`}>
              {statusConfig[currentReturn.status].label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Gross Total Income</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(currentReturn.grossTotalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Total Income</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(currentReturn.totalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Tax Payable</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(currentReturn.taxPayable ?? "0").toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/itr/returns/${financialYear}/${currentReturn.id}`}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              View Details
            </Link>
            {currentReturn.status === "draft" && (
              <Link
                href={`/itr/computation?returnId=${currentReturn.id}`}
                className="px-6 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Compute Income
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create {activeTab.toUpperCase()} Return</h2>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === "itr3" 
              ? "ITR-3 is for individuals and HUFs having income from business or profession."
              : "ITR-4 (Sugam) is for individuals, HUFs and firms (other than LLP) with presumptive income."}
          </p>
          <button
            onClick={() => handleCreate(activeTab)}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Create {activeTab.toUpperCase()} Return
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/itr/returns/${financialYear}/itr3`}
          className={`p-4 bg-white rounded-lg shadow hover:shadow-md transition ${activeTab === "itr3" ? "ring-2 ring-blue-600" : ""}`}
        >
          <h3 className="font-semibold mb-2">ITR-3</h3>
          <p className="text-sm text-gray-500">For individuals/HUFs with business income</p>
          {itr3Return && <p className="text-xs text-green-600 mt-2">✓ Return exists</p>}
        </Link>
        <Link
          href={`/itr/returns/${financialYear}/itr4`}
          className={`p-4 bg-white rounded-lg shadow hover:shadow-md transition ${activeTab === "itr4" ? "ring-2 ring-blue-600" : ""}`}
        >
          <h3 className="font-semibold mb-2">ITR-4 (Sugam)</h3>
          <p className="text-sm text-gray-500">For presumptive income scheme</p>
          {itr4Return && <p className="text-xs text-green-600 mt-2">✓ Return exists</p>}
        </Link>
      </div>
    </div>
  );
}
