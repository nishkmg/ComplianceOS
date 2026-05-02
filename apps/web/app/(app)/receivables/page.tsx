"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { formatIndianNumber } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const agingBuckets = [
  { label: "Current",    amount: 1245000, percentage: 45 },
  { label: "1-30 Days",  amount: 845200,  percentage: 30 },
  { label: "31-60 Days", amount: 412040,  percentage: 15 },
  { label: "61-90 Days", amount: 245000,  percentage: 8 },
  { label: "> 90 Days",  amount: 45000,   percentage: 2 },
];

const topDebtors = [
  { name: "Reliance Industries Ltd.", amount: 850000, status: "partial" },
  { name: "Acme Corporation",         amount: 412000, status: "overdue" },
  { name: "TechSolutions India",      amount: 245000, status: "pending" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ReceivablesSummaryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const totalOutstanding = agingBuckets.reduce((s, b) => s + b.amount, 0);
  const totalOverdue = agingBuckets.filter(b => b.label.includes("Days") || b.label.includes(">"))
    .reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">
            Treasury
          </p>
          <h1 className="font-display text-display-lg font-semibold text-dark leading-tight">Receivables Summary</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">
            A comprehensive view of outstanding invoices, aging buckets, and customer balances.
          </p>
        </div>
      </div>

      {/* KPI tiles */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-amber">
            <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-3 font-bold">Total Outstanding</p>
            <p className="font-mono text-2xl font-bold text-dark tabular-nums">
              {formatIndianNumber(totalOutstanding, { currency: true })}
            </p>
          </div>
          <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-danger">
            <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-3 font-bold">Overdue (&gt;30 Days)</p>
            <p className="font-mono text-2xl font-bold text-danger tabular-nums">
              {formatIndianNumber(totalOverdue, { currency: true })}
            </p>
          </div>
          <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-dark">
            <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-3 font-bold">Avg. Collection Period</p>
            <p className="font-mono text-2xl font-bold text-dark">24 Days</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <TableSkeleton rows={5} columns={2} />
          </div>
          <div className="lg:col-span-5">
            <TableSkeleton rows={5} columns={2} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Aging breakdown */}
          <div className="lg:col-span-7">
            <div className="bg-surface border border-border p-6 shadow-sm rounded-md">
              <h3 className="font-ui text-[13px] font-bold text-dark mb-6 uppercase tracking-widest">Aging Breakdown</h3>
              <div className="space-y-5">
                {agingBuckets.map(bucket => (
                  <div key={bucket.label}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="font-ui text-[13px] font-medium text-dark">{bucket.label}</span>
                      <div className="text-right">
                        <span className="font-mono text-[13px] font-bold text-dark mr-3 tabular-nums">
                          {formatIndianNumber(bucket.amount, { currency: true })}
                        </span>
                        <span className="font-ui text-[10px] text-light">{bucket.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-lighter/60 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 rounded-full ${
                          bucket.label.includes(">") ? "bg-danger" : "bg-amber"
                        }`}
                        style={{ width: `${bucket.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top debtors */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
              <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
                <h3 className="font-ui text-[13px] font-bold text-dark uppercase tracking-widest">Top Debtors</h3>
                <Link href="/receivables/list" className="text-[10px] text-amber font-bold uppercase tracking-widest hover:underline no-underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-border-subtle">
                {topDebtors.map(d => (
                  <div key={d.name} className="px-6 py-5 flex justify-between items-center hover:bg-surface-muted/50 transition-colors">
                    <div>
                      <p className="font-ui text-[13px] font-semibold text-dark">{d.name}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1.5 text-[9px] uppercase font-bold tracking-widest border rounded-md ${
                        d.status === "overdue"
                          ? "bg-danger-bg text-danger border-red-200"
                          : d.status === "partial"
                            ? "bg-amber-50 text-amber-text border-amber-200"
                            : "bg-surface-muted text-mid border-border"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[13px] font-bold text-dark tabular-nums">
                        {formatIndianNumber(d.amount, { currency: true })}
                      </p>
                      <Link
                        href={`/receivables/1`}
                        className="text-[10px] text-light hover:text-amber transition-colors no-underline font-bold uppercase tracking-widest"
                      >
                        Statement →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
