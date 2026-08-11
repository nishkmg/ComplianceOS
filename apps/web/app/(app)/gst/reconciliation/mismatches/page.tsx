"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];
const YEARS = [2024, 2025, 2026, 2027];

const severityStyles: Record<string, string> = {
  high: "bg-danger-bg text-danger-deep border-danger/20",
  medium: "bg-amber-soft text-amber border-amber-bright/30",
  low: "bg-success-bg text-success-deep border-success/20",
};

export default function GSTMismatchesPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  const mismatches = api.gstReconciliation.mismatches.useQuery(
    { periodMonth, periodYear },
    { staleTime: 15_000 },
  );

  const rows = mismatches.data ?? [];

  interface MismatchRow {
    description: string;
    severity: string;
    bookValue?: number;
    returnValue?: number;
    difference?: number;
  }

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <PageHeader title="2B Mismatches" />
        <div className="flex items-center gap-3">
          <select aria-label="Period month" className="border border-border rounded-md px-3 py-2 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))}>
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select aria-label="Period year" className="border border-border rounded-md px-3 py-2 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {mismatches.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="compare_arrows"
          title="No mismatches"
          description={`No GSTR-2B / GSTR-3B mismatches found for ${MONTHS.find((m) => m.value === periodMonth)?.label} ${periodYear}.`}
        />
      ) : (
        <div className="bg-surface border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                  <th className="py-4 px-6">Issue</th>
                  <th className="py-4 px-6 text-right">Books</th>
                  <th className="py-4 px-6 text-right">Return</th>
                  <th className="py-4 px-6 text-right">Difference</th>
                  <th className="py-4 px-6">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {rows.map((m: MismatchRow, i: number) => (
                  <tr key={i} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-4 px-6 font-ui text-ui-sm font-bold text-dark">{m.description}</td>
                    <td className="py-4 px-6 text-right text-dark tabular-nums">{m.bookValue !== undefined ? `₹ ${formatIndianNumber(m.bookValue)}` : "—"}</td>
                    <td className="py-4 px-6 text-right text-dark tabular-nums">{m.returnValue !== undefined ? `₹ ${formatIndianNumber(m.returnValue)}` : "—"}</td>
                    <td className="py-4 px-6 text-right font-bold text-danger tabular-nums">{m.difference !== undefined ? `₹ ${formatIndianNumber(m.difference)}` : "—"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${severityStyles[m.severity] ?? severityStyles.medium}`}>
                        {m.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
