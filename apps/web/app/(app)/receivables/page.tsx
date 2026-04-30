"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const agingBuckets = [
  { label: "Current", amount: 1245000, percentage: 45 },
  { label: "1-30 Days", amount: 845200, percentage: 30 },
  { label: "31-60 Days", amount: 412040, percentage: 15 },
  { label: "61-90 Days", amount: 245000, percentage: 8 },
  { label: "> 90 Days", amount: 45000, percentage: 2 },
];

const topDebtors = [
  { name: "Reliance Industries Ltd.", amount: 850000, status: "partial" },
  { name: "Acme Corporation", amount: 412000, status: "overdue" },
  { name: "TechSolutions India", amount: 245000, status: "pending" },
];

export default function ReceivablesSummaryPage() {
  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Receivables Summary</h1>
        <p className="font-ui-md text-text-mid max-w-2xl leading-relaxed">A comprehensive view of outstanding invoices, aging buckets, and customer balances. Monitor cash flow health with precision.</p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-primary-container">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Total Outstanding</p>
          <p className="font-mono text-3xl font-bold text-on-surface">₹ 27,92,240.00</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-red-600">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Overdue (&gt;30 Days)</p>
          <p className="font-mono text-3xl font-bold text-red-600">₹ 7,02,040.50</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-stone-800">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Avg. Collection Period</p>
          <p className="font-mono text-3xl font-bold text-on-surface">24 Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Aging Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-8">Aging Breakdown</h3>
            <div className="space-y-6">
              {agingBuckets.map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-ui-sm text-sm font-medium text-on-surface">{bucket.label}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-on-surface mr-4">₹ {formatIndianNumber(bucket.amount)}</span>
                      <span className="font-ui-xs text-[10px] text-text-light">{bucket.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${bucket.label.includes('>') ? 'bg-red-600' : 'bg-primary-container'}`} 
                      style={{ width: `${bucket.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Debtors */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-ui-md font-bold text-on-surface">Top 10 Debtors</h3>
              <Link href="/receivables/list" className="text-ui-xs text-primary font-bold uppercase tracking-widest no-underline hover:underline">View All</Link>
            </div>
            <div className="divide-y-[0.5px] divide-border-subtle">
              {topDebtors.map((d) => (
                <div key={d.name} className="p-6 flex justify-between items-center hover:bg-stone-50 transition-colors">
                  <div>
                    <p className="font-ui-sm font-bold text-on-surface">{d.name}</p>
                    <span className={`inline-block px-2 py-0.5 mt-2 text-[9px] uppercase font-bold tracking-widest border rounded-sm ${
                      d.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-on-surface">₹ {formatIndianNumber(d.amount)}</p>
                    <Link href="/receivables/1" className="text-ui-xs text-text-light hover:text-primary transition-colors no-underline">Statement →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
