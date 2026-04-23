// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

const monthLabels = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Payroll</h1>
          <p className="font-ui text-[12px] text-light mt-1">Process and track employee payroll</p>
        </div>
        <Link href="/payroll/process" className="filter-tab active">
          Process Payroll
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field font-ui">
            {monthLabels.map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-field font-ui w-24"
            min={2000}
            max={2100}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field font-ui">
            <option value="all">All Status</option>
            <option value="calculated">Calculated</option>
            <option value="finalized">Finalized</option>
            <option value="voided">Voided</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 font-ui text-light">Loading payroll runs...</div>
        ) : (
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Payroll #</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Employee</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Month</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Gross</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Net Pay</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRuns?.map((run: any) => (
                <tr key={run.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-[13px] text-amber px-4 py-3">{run.payrollNumber}</td>
                  <td className="font-ui text-[13px] text-dark px-4 py-3">{run.employeeName}</td>
                  <td className="font-mono text-[13px] text-mid px-4 py-3">{run.month}/{run.year}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(parseFloat(run.grossEarnings))}</td>
                  <td className="font-mono text-[13px] text-right text-dark font-medium px-4 py-3">{formatIndianNumber(parseFloat(run.netPay))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={run.status === "finalized" ? "success" : run.status === "calculated" ? "amber" : "gray"}>
                      {run.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/payroll/${run.id}`} className="font-ui text-[12px] text-amber hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {payrollRuns?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-ui text-light">
                    No payroll runs found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
