"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function PayrollPage() {
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [status, setStatus] = useState<string>("all");

  const { data: payrollRuns, isLoading } = api.payroll.list.useQuery({
    month,
    year,
    status: status !== "all" ? (status as any) : undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payroll</h1>
        <Link
          href="/payroll/process"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Process Payroll
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={String(i + 1).padStart(2, "0")}>
              {new Date(2026, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-24"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="calculated">Calculated</option>
          <option value="finalized">Finalized</option>
          <option value="voided">Voided</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Payroll #</th>
              <th className="border px-4 py-2 text-left">Employee</th>
              <th className="border px-4 py-2 text-left">Month</th>
              <th className="border px-4 py-2 text-right">Gross</th>
              <th className="border px-4 py-2 text-right">Net Pay</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns?.map((run: any) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{run.payrollNumber}</td>
                <td className="border px-4 py-2">{run.employeeName}</td>
                <td className="border px-4 py-2">{run.month}/{run.year}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(run.grossEarnings).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right font-medium">₹{parseFloat(run.netPay).toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    run.status === "finalized" ? "bg-green-100 text-green-800" :
                    run.status === "calculated" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <Link href={`/payroll/${run.id}`} className="text-blue-600 hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {payrollRuns?.length === 0 && (
              <tr>
                <td colSpan={7} className="border px-4 py-8 text-center text-gray-500">
                  No payroll runs found for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
