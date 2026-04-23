// @ts-nocheck
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

const YEARS = [2025, 2026, 2027, 2028];

export default function GSTReconciliationPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  const { data: summary, refetch } = api.gstReconciliation.matchedSummary.useQuery({ periodMonth, periodYear }, { enabled: false });
  const { data: mismatches } = api.gstReconciliation.mismatches.useQuery({ periodMonth, periodYear }, { enabled: false });

  const reconcileMutation = api.gstReconciliation.reconcile.useMutation({ onSuccess: () => refetch() });

  const handleReconcile = () => { reconcileMutation.mutateAsync({ periodMonth, periodYear }); };

  const matchedCount = summary?.salesInvoices.matched ?? 0;
  const matchedValue = summary?.totalMatchedValue ?? 0;
  const mismatchedCount = (mismatches as any[])?.length ?? 0;
  const mismatchedValue = (mismatches as any[])?.reduce((sum, m) => sum + Math.abs(m.taxAmount ?? 0), 0) ?? 0;
  const pendingCount = (summary?.salesInvoices.total ?? 0) - matchedCount;

  const mismatchReasons = (mismatches as any[])?.reduce((acc, m) => { acc[m.type] = (acc[m.type] ?? 0) + 1; return acc; }, {} as Record<string, number>) ?? {};
  const maxReasonCount = Math.max(...Object.values(mismatchReasons).map(v => Number(v) || 1), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">GST Reconciliation</h1>
          <p className="font-ui text-[12px] text-light mt-1">Match GSTR-2B with purchase records</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
            <select value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))} className="input-field font-ui">
              {MONTHS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
            <select value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))} className="input-field font-ui">
              {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
          <button onClick={handleReconcile} disabled={reconcileMutation.isPending} className="filter-tab active self-end disabled:opacity-50">
            {reconcileMutation.isPending ? "Reconciling..." : "Run Reconciliation"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-success">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Matched Invoices</p>
          <p className="font-mono text-[22px] font-medium text-success">{matchedCount}</p>
          <p className="font-mono text-[13px] text-mid mt-1">{formatIndianNumber(matchedValue)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-amber">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Mismatched</p>
          <p className="font-mono text-[22px] font-medium text-amber">{mismatchedCount}</p>
          <p className="font-mono text-[13px] text-mid mt-1">{formatIndianNumber(mismatchedValue)}</p>
        </div>
        <div className="card p-5 border-l-4 border-l-gray">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Pending</p>
          <p className="font-mono text-[22px] font-medium text-mid">{pendingCount}</p>
          <p className="font-ui text-[11px] text-light mt-1">Awaiting GSTR-2B</p>
        </div>
      </div>

      {mismatchedCount > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Mismatch Analysis</h2>
          <div className="space-y-3">
            {Object.entries(mismatchReasons).map(([reason, count]) => (
              <div key={reason} className="flex items-center gap-4">
                <span className="font-ui text-[13px] text-dark w-40 capitalize">{reason.replace("_", " ")}</span>
                <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber rounded-full" style={{ width: `${(Number(count) / maxReasonCount) * 100}%` }} />
                </div>
                <span className="font-mono text-[13px] text-mid w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/gst/reconciliation/mismatches" className="font-ui text-[12px] text-amber hover:underline">View all mismatches →</a>
          </div>
        </div>
      )}
    </div>
  );
}
