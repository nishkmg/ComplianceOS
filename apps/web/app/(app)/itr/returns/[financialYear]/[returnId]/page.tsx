// @ts-nocheck
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ITRReturnStatus, TaxRegime, PresumptiveScheme } from "@complianceos/shared";

const statusConfig: Record<ITRReturnStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-800", label: "Draft" },
  computed: { bg: "bg-blue-100 text-blue-800", label: "Computed" },
  generated: { bg: "bg-green-100 text-green-800", label: "Generated" },
  filed: { bg: "bg-green-100 text-green-800", label: "Filed" },
  verified: { bg: "bg-purple-100 text-purple-800", label: "Verified" },
  voided: { bg: "bg-red-100 text-red-800", label: "Voided" },
};

export default function ITRReturnDetailPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const financialYear = params.financialYear as string;

  const [activeTab, setActiveTab] = useState<"computation" | "schedules" | "tax" | "payment">("computation");

  const { data: itrReturn, isLoading } = api.itrReturns.get.useQuery({ itrReturnId: returnId });
  const { data: taxComputation } = api.itrComputation.getTaxComputation.useQuery(
    { itrReturnId: returnId },
    { enabled: !!itrReturn }
  );

  const generateReturn = api.itrReturns.generate.useMutation();
  const fileReturn = api.itrReturns.file.useMutation();

  const handleGenerate = async () => {
    try {
      await generateReturn.mutateAsync({ itrReturnId: returnId, returnType: itrReturn?.returnType as "itr3" | "itr4" });
    } catch (error) {
      console.error("Failed to generate return:", error);
      alert("Failed to generate return. Please try again.");
    }
  };

  const handleFile = async () => {
    const acknowledgmentNumber = prompt("Enter Acknowledgment Number:");
    if (!acknowledgmentNumber) return;

    const verificationMode = prompt("Verification Mode (EVC, EVC-AADHAAR, EVC-DSC):", "EVC");
    if (!verificationMode) return;

    try {
      await fileReturn.mutateAsync({ itrReturnId: returnId, acknowledgmentNumber, verificationMode });
    } catch (error) {
      console.error("Failed to file return:", error);
      alert("Failed to file return. Please try again.");
    }
  };

  const handleDownloadJson = async () => {
    alert("ITR JSON download will be available after return is generated.");
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  if (!itrReturn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ITR return not found</p>
        <Link href="/itr/returns" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Returns
        </Link>
      </div>
    );
  }

  const statusConf = statusConfig[itrReturn.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="text-sm text-gray-500 hover:underline">
            ← Back to ITR Returns
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            {itrReturn.returnType.toUpperCase()} - {itrReturn.assessmentYear}
          </h1>
          <p className="text-sm text-gray-500">FY: {itrReturn.financialYear}</p>
        </div>
        <div className="flex gap-2">
          {itrReturn.status === "draft" && (
            <>
              <Link
                href={`/itr/computation?returnId=${returnId}`}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Compute
              </Link>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Generate
              </button>
            </>
          )}
          {itrReturn.status === "generated" && (
            <>
              <button
                onClick={handleFile}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                File Return
              </button>
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Download JSON
              </button>
            </>
          )}
          {itrReturn.status === "filed" && (
            <button
              onClick={handleDownloadJson}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Download JSON
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 text-sm rounded-full capitalize ${statusConf.bg}`}>
          {statusConf.label}
        </span>
        {itrReturn.taxRegime && (
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 capitalize">
            {itrReturn.taxRegime} regime
          </span>
        )}
        {itrReturn.presumptiveScheme && itrReturn.presumptiveScheme !== PresumptiveScheme.NONE && (
          <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
            Sec. {itrReturn.presumptiveScheme}
          </span>
        )}
      </div>

      <div className="border-b">
        <nav className="flex gap-4">
          {[
            { id: "computation", label: "Computation" },
            { id: "schedules", label: "Schedules" },
            { id: "tax", label: "Tax" },
            { id: "payment", label: "Payment" },
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
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "computation" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Gross Total Income</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(itrReturn.grossTotalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Total Deductions</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(itrReturn.totalDeductions ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">₹{Number(itrReturn.totalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Income Computation Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Last Computed</span>
                <span className="font-medium">{itrReturn.updatedAt ? new Date(itrReturn.updatedAt).toLocaleDateString() : "Not computed"}</span>
              </div>
              <Link
                href={`/itr/computation?returnId=${returnId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View detailed computation →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tax" && taxComputation && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Tax on Income</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(taxComputation.taxOnTotalIncome ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Surcharge</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(taxComputation.surcharge ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Cess (4%)</p>
              <p className="text-xl font-bold text-gray-900">₹{Number(taxComputation.cess ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-500 mb-1">Rebate u/s 87A</p>
              <p className="text-xl font-bold text-green-600">-₹{Number(taxComputation.rebate87a ?? "0").toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tax Paid</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Advance Tax Paid</span>
                <span className="font-medium">₹{Number(taxComputation.advanceTaxPaid ?? "0").toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Self-Assessment Tax</span>
                <span className="font-medium">₹{Number(taxComputation.selfAssessmentTax ?? "0").toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">TDS/TCS Credit</span>
                <span className="font-medium">₹{Number(taxComputation.tdsTcsCredit ?? "0").toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 font-medium bg-gray-50 px-4 py-3 rounded">
                <span className="text-gray-900">Total Tax Paid</span>
                <span className="text-gray-900">₹{Number(taxComputation.totalTaxPaid ?? "0").toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Balance Payable</h3>
              <p className="text-3xl font-bold text-red-600">₹{Number(taxComputation.balancePayable ?? "0").toLocaleString("en-IN")}</p>
              <Link
                href={`/itr/payment/self-assessment?returnId=${returnId}`}
                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
              >
                Pay Self-Assessment Tax →
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Refund Due</h3>
              <p className="text-3xl font-bold text-green-600">₹{Number(taxComputation.refundDue ?? "0").toLocaleString("en-IN")}</p>
              <p className="text-sm text-gray-500 mt-2">Will be credited to your bank account after verification</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "schedules" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Schedules</h2>
          <p className="text-sm text-gray-500">Schedules will be populated during computation.</p>
          <Link
            href={`/itr/computation?returnId=${returnId}`}
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Go to Computation →
          </Link>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Advance Tax</h2>
            <Link
              href={`/itr/payment/advance-tax?returnId=${returnId}`}
              className="text-blue-600 hover:underline"
            >
              View advance tax installments and payments →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Self-Assessment Tax</h2>
            <Link
              href={`/itr/payment/self-assessment?returnId=${returnId}`}
              className="text-blue-600 hover:underline"
            >
              Pay self-assessment tax →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            <Link
              href={`/itr/payment/history?returnId=${returnId}`}
              className="text-blue-600 hover:underline"
            >
              View all payments and challans →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
