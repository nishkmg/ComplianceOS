// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KpiTile, Badge } from "@/components/ui";
import { formatIndianNumber, formatDateShort } from "@/lib/format";

interface DashboardData {
  totalOutstanding: number;
  overdueCount: number;
  topCustomers: Array<{ customerName: string; outstanding: number }>;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  narration: string;
  debit: number;
  credit: number;
  status: "draft" | "posted" | "voided";
}

export default function DashboardPage() {
  const [receivables, setReceivables] = useState<DashboardData | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trpc/receivables.dashboard").then(res => res.json()),
      fetch("/api/trpc/journal-entries.list?limit=5").then(res => res.json()),
    ])
      .then(([receivablesData, entriesData]) => {
        if (receivablesData.result?.data) setReceivables(receivablesData.result.data);
        if (entriesData.result?.data) setRecentEntries(entriesData.result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const companyName = "Demo Business Pvt Ltd";
  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-xl text-display-xl text-stone-900">{greeting}, {companyName}</h1>
          <p className="font-ui-sm text-text-mid mt-1">Here is your business summary for {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} • <span className="font-mono-md">FY 2026-27</span></p>
        </div>
        <div className="flex gap-3">
          <button className="bg-section-muted border border-border-subtle px-4 py-2 flex items-center gap-2 hover:bg-stone-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="font-ui-xs uppercase tracking-wider">Export PDF</span>
          </button>
          <Link href="/journal/new" className="bg-[#C8860A] text-white px-6 py-2 flex items-center gap-2 hover:bg-amber-700 transition-transform active:scale-95 group no-underline">
            <span className="font-ui-xs uppercase tracking-wider">Add Entry</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiTile label="Revenue MTD" value={1245000.00} variant="amber" delta={{ value: 14.2, label: "vs last month" }} icon="trending_up" />
        <KpiTile label="Expenses MTD" value={412040.50} variant="dark" delta={{ value: 2.1, label: "within budget" }} icon="shopping_cart" />
        <KpiTile label="Net Profit MTD" value={833559.50} variant="amber" delta={{ value: 67, label: "Gross Margin" }} icon="account_balance_wallet" />
        <KpiTile label="Cash & Bank" value={4512890.00} variant="neutral" subtext="Reconciled as of today" icon="account_balance" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-border-subtle shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-stone-50">
            <h3 className="font-ui-md font-bold text-stone-900">Recent Entries</h3>
            <Link className="text-ui-xs text-[#C8860A] font-bold uppercase tracking-wider hover:underline no-underline" href="/journal">View Ledger</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-light">Loading entries...</div>
            ) : recentEntries.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-section-muted border-b border-border-subtle">
                    <th className="px-6 py-3 font-ui-xs text-text-mid uppercase tracking-widest">Entry #</th>
                    <th className="px-6 py-3 font-ui-xs text-text-mid uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 font-ui-xs text-text-mid uppercase tracking-widest">Narration</th>
                    <th className="px-6 py-3 font-ui-xs text-text-mid uppercase tracking-widest text-right">Amount</th>
                    <th className="px-6 py-3 font-ui-xs text-text-mid uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-ui-sm">
                  {recentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-stone-50 transition-colors group">
                      <td className="px-6 py-4 font-mono-md text-amber-text">
                        <Link href={`/journal/${entry.id}`} className="hover:underline no-underline">{entry.entryNumber}</Link>
                      </td>
                      <td className="px-6 py-4 text-stone-600 font-mono-md">{formatDateShort(entry.date)}</td>
                      <td className="px-6 py-4 font-medium">{entry.narration}</td>
                      <td className="px-6 py-4 font-mono-md text-right">{formatIndianNumber(Math.max(entry.debit, entry.credit), { currency: true, decimals: 2 })}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'draft' ? 'amber' : 'gray'}>
                          {entry.status === 'posted' ? 'Cleared' : entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[13px] text-light">No entries yet. Create your first journal entry.</p>
                <Link href="/journal/new" className="mt-3 inline-block btn btn-primary no-underline">New Journal Entry</Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-border-subtle p-6 shadow-sm text-left">
            <h3 className="font-ui-xs text-text-mid uppercase tracking-widest mb-6">Financial Year Progress</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-ui-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#C8860A] bg-section-amber">
                    Q1 Completion
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-mono-md font-semibold inline-block text-[#C8860A]">
                    62%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-stone-100">
                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#C8860A] transition-all duration-1000" style={{ width: "62%" }}></div>
              </div>
              <p className="text-ui-xs text-text-mid leading-relaxed text-left">You are tracking <span className="font-mono-md">15%</span> ahead of your revenue goals for this quarter.</p>
            </div>
          </div>

          <div className="bg-stone-900 p-6 shadow-screenshot border-l-4 border-l-[#C8860A] text-left">
            <h3 className="font-ui-xs text-stone-400 uppercase tracking-widest mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full bg-stone-800 border border-stone-700 text-stone-100 px-4 py-4 flex items-center justify-between hover:bg-stone-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#C8860A]">add_circle</span>
                  <span className="font-ui-sm">Record New Entry</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all text-stone-500">chevron_right</span>
              </button>
              <button className="w-full bg-stone-800 border border-stone-700 text-stone-100 px-4 py-4 flex items-center justify-between hover:bg-stone-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#C8860A]">insert_chart</span>
                  <span className="font-ui-sm">View P&L Statement</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-all text-stone-500">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container border border-border-subtle p-6 overflow-hidden relative group text-left">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-stone-400 mb-2">security</span>
              <h4 className="font-ui-sm font-bold text-stone-900">Audit Readiness</h4>
              <p className="text-ui-xs text-text-mid mt-2 leading-relaxed">All supporting vouchers for the last <span className="font-mono-md">30</span> days have been digitized and linked.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <span className="material-symbols-outlined text-9xl">verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
