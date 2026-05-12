"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

const monthLabels = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

const mockPayrollRuns = [
  { id: "pr1", payrollNumber: "PR-2026-04-001", employeeName: "Rahul Sharma", month: "04", year: "2026", grossEarnings: "80000", netPay: "73700", status: "finalized" },
  { id: "pr2", payrollNumber: "PR-2026-04-002", employeeName: "Priya Singh", month: "04", year: "2026", grossEarnings: "65000", netPay: "60712", status: "calculated" },
  { id: "pr3", payrollNumber: "PR-2026-04-003", employeeName: "Vikram Das", month: "04", year: "2026", grossEarnings: "45000", netPay: "42862", status: "voided" },
];

export default function PayrollPage() {
  const router = useRouter();
  const { activeFy } = useFiscalYear();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setMonth(String(now.getMonth() + 1).padStart(2, "0"));
    setYear(String(now.getFullYear()));
    const timer = setTimeout(() => { setLoading(false); }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = mockPayrollRuns.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (month && r.month !== month) return false;
    if (year && r.year !== year) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">HR & Compliance · FY {activeFy}</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Payroll</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Process and track employee payroll</p>
        </div>
        <Link href="/payroll/process" className="btn btn-primary no-underline">
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
        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : error ? (
          <ErrorState
            title="Failed to load payroll"
            description={error}
            onRetry={() => { setLoading(true); setError(null); setTimeout(() => setLoading(false), 600); }}
            type="server"
          />
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
              {filtered.map((run: any) => (
                <tr key={run.id} className="border-b border-border hover:bg-surface-muted transition-colors">
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No payroll runs found"
                      description="No payroll data for the selected period. Process payroll to get started."
                      action={{ label: "Process Payroll", onClick: () => router.push("/payroll/process") }}
                      icon="payments"
                    />
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
