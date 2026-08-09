"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { EmptyState } from "@/components/ui/empty-state";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];
const YEARS = [2024, 2025, 2026, 2027];

export default function GSTMismatchesPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">2B Mismatches</h1>
        <div className="flex items-center gap-3">
          <select className="border border-border rounded-md px-3 py-2 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={periodMonth} onChange={e => setPeriodMonth(Number(e.target.value))}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select className="border border-border rounded-md px-3 py-2 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={periodYear} onChange={e => setPeriodYear(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <EmptyState icon="compare_arrows" title="No mismatches" description={`No GSTR-2B mismatches found for ${MONTHS.find(m => m.value === periodMonth)?.label} ${periodYear}. All purchase entries match.`} />
    </div>
  );
}
