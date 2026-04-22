"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

interface GSTReturnDetail {
  id: string;
  returnNumber: string;
  returnType: "gstr1" | "gstr2b" | "gstr3b";
  taxPeriodMonth: string;
  taxPeriodYear: string;
  status: "draft" | "generated" | "filed" | "amended";
  totalOutwardSupplies: string;
  totalEligibleItc: string;
  totalTaxPayable: string;
  totalTaxPaid: string;
  filingDate?: string;
  dueDate: string;
}

export default function GSTReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [period] = (params.period as string).split("-");
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);

  const [activeTab, setActiveTab] = useState<"gstr1" | "gstr2b" | "gstr3b">("gstr1");

  const { data: returns, isLoading } = api.gstReturns.list.useQuery({
    periodMonth: month,
    periodYear: year,
  });

  const gstr1 = returns?.find((r) => r.returnType === "gstr1");
  const gstr2b = returns?.find((r) => r.returnType === "gstr2b");
  const gstr3b = returns?.find((r) => r.returnType === "gstr3b");

  const currentReturn = activeTab === "gstr1" ? gstr1 : activeTab === "gstr2b" ? gstr2b : gstr3b;

  const generateGSTR1 = api.gstReturns.generateGSTR1.useMutation();
  const generateGSTR2B = api.gstReturns.generateGSTR2B.useMutation();
  const generateGSTR3B = api.gstReturns.generateGSTR3B.useMutation();
  const fileReturn = api.gstReturns.file.useMutation();

  const handleGenerateAll = async () => {
    try {
      await Promise.all([
        generateGSTR1.mutateAsync({ periodMonth: month, periodYear: year }),
        generateGSTR2B.mutateAsync({ periodMonth: month, periodYear: year }),
        generateGSTR3B.mutateAsync({ periodMonth: month, periodYear: year }),
      ]);
    } catch (error) {
      console.error("Failed to generate returns:", error);
    }
  };

  const handleFileReturn = async (returnId: string) => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;

    try {
      await fileReturn.mutateAsync({ returnId, arn });
    } catch (error) {
      console.error("Failed to file return:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GST Return - {months.find((m) => m.value === month)?.label} {year}</h1>
          <p className="text-sm text-gray-500">Tax Period: {months.find((m) => m.value === month)?.label} {year}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateAll}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Generate All
          </button>
          {currentReturn && currentReturn.status === "generated" && (
            <button
              onClick={() => handleFileReturn(currentReturn.id)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              File Return
            </button>
          )}
        </div>
      </div>

      <div className="border-b">
        <nav className="flex gap-4">
          {[
            { id: "gstr1", label: "GSTR-1", count: gstr1 ? 1 : 0 },
            { id: "gstr2b", label: "GSTR-2B", count: gstr2b ? 1 : 0 },
            { id: "gstr3b", label: "GSTR-3B", count: gstr3b ? 1 : 0 },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Turnover</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{currentReturn ? Number(currentReturn.totalOutwardSupplies).toLocaleString("en-IN") : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Outward Supplies</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Tax Liability</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{currentReturn ? Number(currentReturn.totalTaxPayable).toLocaleString("en-IN") : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total Tax</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">ITC Available</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{currentReturn ? Number(currentReturn.totalEligibleItc).toLocaleString("en-IN") : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Input Tax Credit</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Net Payable</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{currentReturn ? (Number(currentReturn.totalTaxPayable) - Number(currentReturn.totalEligibleItc)).toLocaleString("en-IN") : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">After ITC</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Return Summary</h2>
        {currentReturn ? (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Return Number</span>
              <span className="font-medium">{currentReturn.returnNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Return Type</span>
              <span className="font-medium uppercase">{currentReturn.returnType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                currentReturn.status === "filed" ? "bg-green-100 text-green-800" :
                currentReturn.status === "generated" ? "bg-blue-100 text-blue-800" :
                currentReturn.status === "amended" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {currentReturn.status}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Due Date</span>
              <span className="font-medium">{currentReturn.dueDate}</span>
            </div>
            {currentReturn.filingDate && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Filed Date</span>
                <span className="font-medium">{currentReturn.filingDate}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total Tax Payable</span>
              <span className="font-medium">₹{Number(currentReturn.totalTaxPayable).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Total ITC</span>
              <span className="font-medium">₹{Number(currentReturn.totalEligibleItc).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax Paid</span>
              <span className="font-medium">₹{Number(currentReturn.totalTaxPaid).toLocaleString("en-IN")}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available for this return type</p>
        )}
      </div>

      <div className="flex gap-4">
        <Link
          href={`/gst/returns/${params.period}/gstr1`}
          className={`flex-1 p-4 bg-white rounded-lg shadow hover:shadow-md transition ${activeTab === "gstr1" ? "ring-2 ring-blue-600" : ""}`}
        >
          <h3 className="font-semibold mb-2">GSTR-1</h3>
          <p className="text-sm text-gray-500">Outward supplies details</p>
          {gstr1 && <p className="text-xs text-green-600 mt-2">✓ Generated</p>}
        </Link>
        <Link
          href={`/gst/returns/${params.period}/gstr2b`}
          className={`flex-1 p-4 bg-white rounded-lg shadow hover:shadow-md transition ${activeTab === "gstr2b" ? "ring-2 ring-blue-600" : ""}`}
        >
          <h3 className="font-semibold mb-2">GSTR-2B</h3>
          <p className="text-sm text-gray-500">Input tax credit details</p>
          {gstr2b && <p className="text-xs text-green-600 mt-2">✓ Generated</p>}
        </Link>
        <Link
          href={`/gst/returns/${params.period}/gstr3b`}
          className={`flex-1 p-4 bg-white rounded-lg shadow hover:shadow-md transition ${activeTab === "gstr3b" ? "ring-2 ring-blue-600" : ""}`}
        >
          <h3 className="font-semibold mb-2">GSTR-3B</h3>
          <p className="text-sm text-gray-500">Summary return</p>
          {gstr3b && <p className="text-xs text-green-600 mt-2">✓ Generated</p>}
        </Link>
      </div>
    </div>
  );
}
