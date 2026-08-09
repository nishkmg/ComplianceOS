"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { KpiTile } from "@/components/ui/kpi-tile";
import { Donut } from "@/components/charts";

export default function ReceivablesPage() {
  const { activeFy } = useFiscalYear();
  const { data: aging, isLoading: agingLoading } = api.receivables.aging.useQuery();
  const { data: summaries, isLoading: summaryLoading } = api.receivables.summary.useQuery();
  const loading = agingLoading || summaryLoading;

  const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
  const agingBuckets = aging
    ? [
        { label: "0-30 Days", amount: aging.current030, percentage: pct(aging.current030, aging.total) },
        { label: "31-60 Days", amount: aging.aging3160, percentage: pct(aging.aging3160, aging.total) },
        { label: "61-90 Days", amount: aging.aging6190, percentage: pct(aging.aging6190, aging.total) },
        { label: "> 90 Days", amount: aging.aging90Plus, percentage: pct(aging.aging90Plus, aging.total) },
      ]
    : [];

  const totalOutstanding = aging?.total ?? 0;
  const totalOverdue = aging ? aging.aging3160 + aging.aging6190 + aging.aging90Plus : 0;
  const unpaidCount = (summaries ?? []).filter((r) => r.totalOutstanding > 0).length;

  const topDebtors = [...(summaries ?? [])]
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
    .slice(0, 5)
    .map((r) => ({
      id: encodeURIComponent(r.customerName),
      name: r.customerName,
      amount: r.totalOutstanding,
      status:
        r.totalOutstanding > 0
          ? r.aging3160 + r.aging6190 + r.aging90Plus > 0
            ? "overdue"
            : "partial"
          : "cleared",
    }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">
            Treasury
          </p>
          <h1 className="font-ui text-display-lg font-semibold text-dark leading-tight">Receivables Summary</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">
            Outstanding invoices and aging, per customer.
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
          <KpiTile label="Total Outstanding" value={formatIndianNumber(totalOutstanding, { currency: true })} icon="receipt_long" />
          <KpiTile label="Overdue (&gt;30 Days)" variant="danger" value={formatIndianNumber(totalOverdue, { currency: true })} icon="clock" />
          <KpiTile label="Unpaid Customers" variant="amber" value={String(unpaidCount)} subtext="customers" icon="groups" />
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
              <h3 className="font-ui text-[13px] font-bold text-dark mb-4 uppercase tracking-widest">Aging Breakdown</h3>
              {totalOutstanding > 0 && (
                <div className="mb-6 border-b border-border pb-5">
                  <Donut
                    caption="Receivables aging buckets"
                    data={agingBuckets.map((b) => ({ label: b.label, value: b.amount }))}
                    colors={["var(--color-success)", "var(--color-amber)", "var(--color-amber-bright)", "var(--color-danger)"]}
                    height={190}
                  />
                </div>
              )}
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
                        className={`h-full transition-[width] duration-1000 rounded-full ${
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
                <span className="text-[10px] text-light font-bold uppercase tracking-widest">FY {activeFy}</span>
              </div>
              <div className="divide-y divide-border-subtle">
                {topDebtors.map(d => (
                  <div key={d.name} className="px-6 py-5 flex justify-between items-center hover:bg-surface-muted/50 transition-colors">
                    <div>
                      <p className="font-ui text-[13px] font-semibold text-dark">{d.name}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1.5 text-[9px] uppercase font-bold tracking-widest border rounded-md ${
                        d.status === "overdue"
                          ? "bg-danger-bg text-danger-deep border-danger/20"
                          : d.status === "partial"
                            ? "bg-amber-soft text-amber border-amber-bright/30"
                            : "bg-success-bg text-success-deep border-success/20"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[13px] font-bold text-dark tabular-nums">
                        {formatIndianNumber(d.amount, { currency: true })}
                      </p>
                      <Link
                        href={`/receivables/${d.id}`}
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
