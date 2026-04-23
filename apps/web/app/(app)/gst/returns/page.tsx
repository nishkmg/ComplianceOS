// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface GSTReturn {
  id: string;
  returnNumber: string;
  returnType: "gstr1" | "gstr2b" | "gstr3b" | "gstr9" | "gstr4" | "itc_reconciliation";
  taxPeriodMonth: string;
  taxPeriodYear: string;
  status: "draft" | "generated" | "filed" | "amended" | "completed";
  totalOutwardSupplies: string;
  totalEligibleItc: string;
  totalTaxPayable: string;
  totalTaxPaid: string;
  filingDate?: string;
  dueDate: string;
}

const statusConfig: Record<GSTReturn["status"], { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-800", label: "Draft" },
  generated: { bg: "bg-blue-100 text-blue-800", label: "Generated" },
  filed: { bg: "bg-green-100 text-green-800", label: "Filed" },
  amended: { bg: "bg-yellow-100 text-yellow-800", label: "Amended" },
  completed: { bg: "bg-green-100 text-green-800", label: "Completed" },
};

const returnTypes = ["all", "gstr1", "gstr2b", "gstr3b"] as const;
const statuses = ["all", "draft", "generated", "filed", "amended"] as const;
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

export default function GSTReturnsPage() {
  const [periodMonth, setPeriodMonth] = useState<number | undefined>(undefined);
  const [periodYear, setPeriodYear] = useState<number | undefined>(undefined);
  const [returnType, setReturnType] = useState<(typeof returnTypes)[number]>("all");
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: returns, isLoading } = api.gstReturns.list.useQuery({
    periodMonth,
    periodYear,
    returnType: returnType !== "all" ? returnType : undefined,
    status: status !== "all" ? status : undefined,
  });

  const filteredReturns = returns ?? [];

  const generateGSTR1 = api.gstReturns.generateGSTR1.useMutation();
  const generateGSTR2B = api.gstReturns.generateGSTR2B.useMutation();
  const generateGSTR3B = api.gstReturns.generateGSTR3B.useMutation();
  const fileReturn = api.gstReturns.file.useMutation();
  const amendReturn = api.gstReturns.amend.useMutation();

  const handleGenerate = async (month: number, year: number, type: GSTReturn["returnType"]) => {
    try {
      if (type === "gstr1") {
        await generateGSTR1.mutateAsync({ periodMonth: month, periodYear: year });
      } else if (type === "gstr2b") {
        await generateGSTR2B.mutateAsync({ periodMonth: month, periodYear: year });
      } else if (type === "gstr3b") {
        await generateGSTR3B.mutateAsync({ periodMonth: month, periodYear: year });
      }
    } catch (error) {
      console.error("Failed to generate return:", error);
    }
  };

  const handleFile = async (returnId: string) => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;

    try {
      await fileReturn.mutateAsync({ returnId, arn });
    } catch (error) {
      console.error("Failed to file return:", error);
    }
  };

  const handleAmend = async (returnId: string) => {
    const changesJson = prompt("Enter changes as JSON:");
    if (!changesJson) return;

    try {
      const changes = JSON.parse(changesJson);
      await amendReturn.mutateAsync({ returnId, changes });
    } catch (error) {
      console.error("Failed to amend return:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">GST Returns</h1>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          Generate All
        </button>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <select
          value={periodMonth ?? ""}
          onChange={(e) => { setPeriodMonth(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="">All Months</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Year (e.g., 2026)"
          value={periodYear ?? ""}
          onChange={(e) => { setPeriodYear(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
          className="px-3 py-2 border rounded text-sm w-32"
          min={2000}
          max={2100}
        />

        <select
          value={returnType}
          onChange={(e) => { setReturnType(e.target.value as (typeof returnTypes)[number]); setPage(1); }}
          className="px-3 py-2 border rounded text-sm"
        >
          {returnTypes.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Return Types" : t.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as (typeof statuses)[number]); setPage(1); }}
          className="px-3 py-2 border rounded text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Return #</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Period</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Liability</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">ITC</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Payable</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Filed Date</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No GST returns yet
                </td>
              </tr>
            ) : (
              filteredReturns.map((ret) => {
                const statusConf = statusConfig[ret.status] ?? { bg: "bg-gray-100 text-gray-800", label: ret.status };
                return (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/gst/returns/${ret.taxPeriodYear}-${ret.taxPeriodMonth}`} className="text-blue-600 hover:underline">
                        {ret.returnNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium uppercase">{ret.returnType}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {months.find((m) => m.value === Number(ret.taxPeriodMonth))?.label} {ret.taxPeriodYear}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ret.dueDate}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{Number(ret.totalTaxPayable).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{Number(ret.totalEligibleItc).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right text-gray-600">₹{Number(ret.totalTaxPaid).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusConf.bg}`}>
                        {statusConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ret.filingDate ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {ret.status === "draft" && (
                          <button
                            onClick={() => handleGenerate(Number(ret.taxPeriodMonth), Number(ret.taxPeriodYear), ret.returnType)}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Generate
                          </button>
                        )}
                        <Link href={`/gst/returns/${ret.taxPeriodYear}-${ret.taxPeriodMonth}/${ret.returnType}`} className="text-gray-600 hover:underline text-xs">
                          View
                        </Link>
                        {ret.status === "generated" && (
                          <button onClick={() => handleFile(ret.id)} className="text-green-600 hover:underline text-xs">
                            File
                          </button>
                        )}
                        {ret.status === "filed" && (
                          <button onClick={() => handleAmend(ret.id)} className="text-yellow-600 hover:underline text-xs">
                            Amend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredReturns.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredReturns.length} returns</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredReturns.length < pageSize}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
