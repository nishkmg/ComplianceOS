"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inr = (v: string | number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v));

const BUCKETS = [
  { key: "current", label: "Current", tone: "bg-success-bg text-success-deep border-success/20" },
  { key: "1-30", label: "1–30 days", tone: "bg-amber-soft text-amber border-amber/30" },
  { key: "31-60", label: "31–60 days", tone: "bg-amber-soft text-amber border-amber/30" },
  { key: "61-90", label: "61–90 days", tone: "bg-danger-bg text-danger border-danger/30" },
  { key: "90+", label: "90+ days", tone: "bg-danger-bg text-danger border-danger/30" },
];

export default function PayablesPage() {
  const [status, setStatus] = useState<string>("");
  const { data: aging } = api.payables.aging.useQuery(undefined, { staleTime: 15_000 });
  const { data, isLoading } = api.payables.list.useQuery({ status: (status || undefined) as any, pageSize: 100 }, { staleTime: 15_000 });
  const bills = (data ?? []) as any[];

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Payables · Bills"
            title="Bills Payable"
            description="Vendor bills with due dates, aging and payment allocation — the mirror of receivables."
          />
        </div>
        <Link href="/payables/new" className="btn-primary flex items-center gap-2 group no-underline">
          New Bill <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </Link>
      </header>

      {/* Aging summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {BUCKETS.map((b) => (
          <div key={b.key} className="bg-surface border border-border rounded-md p-5 shadow-sm">
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">{b.label}</p>
            <p className="mt-2 font-mono text-lg font-bold text-dark">{inr(aging?.buckets?.[b.key] ?? 0)}</p>
            <span className={`mt-1 inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md ${b.tone}`}>
              {b.key === "current" ? "not due" : "overdue"}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
        <div className="p-6 border-b border-border-subtle bg-surface-muted/50 flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h3 className="font-ui text-lg font-bold text-dark">Bills</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">
              {isLoading ? "Loading…" : `${bills.length} bills`}
            </p>
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="sm:w-48 rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-4 px-6">Vendor</th>
                <th className="py-4 px-6">Bill</th>
                <th className="py-4 px-6">Due</th>
                <th className="py-4 px-6">Aging</th>
                <th className="py-4 px-6 text-right">Total</th>
                <th className="py-4 px-6 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6">
                    <Link href={`/payables/${b.id}`} className="font-bold text-dark hover:text-amber no-underline transition-colors">
                      {b.vendorName}
                    </Link>
                    <p className="text-ui-2xs text-light mt-0.5">{b.billNumber}</p>
                  </td>
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{b.billNumber}</td>
                  <td className="py-5 px-6 font-mono text-ui-xs text-mid">{fmtDate(b.dueDate)}</td>
                  <td className="py-5 px-6">
                    <span className="inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md bg-surface-muted text-mid border-border-subtle">
                      {b.aging}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right font-mono text-dark font-semibold">{inr(b.grandTotal)}</td>
                  <td className="py-5 px-6 text-right font-mono text-dark">{inr(b.outstanding)}</td>
                </tr>
              ))}
              {!isLoading && bills.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-mid font-ui text-ui-sm">No bills yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
