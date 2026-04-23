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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">{greeting}, {companyName}</h1>
          <p className="font-ui text-[12px] text-light mt-1">
            {today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • FY 2026-27
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/journal/new" className="filter-tab active">New Entry</Link>
          <Link href="/reports/pl" className="filter-tab">View P&L</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Total Revenue (MTD)" value={1245000.00} variant="amber" delta={{ value: 12, label: "vs last month" }} />
        <KpiTile label="Total Expenses (MTD)" value={845200.00} variant="danger" delta={{ value: 4, label: "vs last month" }} />
        <KpiTile label="Net Profit (MTD)" value={399800.00} variant="success" delta={{ value: 15, label: "vs last month" }} />
        <KpiTile label="Cash & Bank Balance" value={2450000.00} variant="neutral" subtext="Updated 5 mins ago" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-display text-[20px] font-normal text-dark">Recent Entries</h2>
              <Link href="/journal" className="text-[12px] text-light hover:text-amber">View All →</Link>
            </div>
            <div className="p-0">
              {loading ? (
                <div className="p-6 text-[13px] text-light">Loading...</div>
              ) : recentEntries.length > 0 ? (
                <table className="table table-dense">
                  <thead>
                    <tr>
                      <th className="font-ui text-[10px] uppercase tracking-wide">Entry #</th>
                      <th className="font-ui text-[10px] uppercase tracking-wide">Date</th>
                      <th className="font-ui text-[10px] uppercase tracking-wide">Narration</th>
                      <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
                      <th className="font-ui text-[10px] uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="font-mono text-[13px] text-amber">
                          <Link href={`/journal/${entry.id}`} className="hover:underline">{entry.entryNumber}</Link>
                        </td>
                        <td className="font-mono text-[13px] text-light">{formatDateShort(entry.date)}</td>
                        <td className="font-ui text-[13px] text-mid truncate max-w-[200px]">{entry.narration}</td>
                        <td className="font-mono text-[13px] text-right">{formatIndianNumber(Math.max(entry.debit, entry.credit), { currency: true, decimals: 2 })}</td>
                        <td><Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'draft' ? 'amber' : 'gray'}>{entry.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6">
                  <p className="text-[13px] text-light">No entries yet. Create your first journal entry.</p>
                  <Link href="/journal/new" className="mt-3 inline-block btn btn-primary">New Journal Entry</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-[16px] font-normal text-dark">FY Progress</h3>
                <span className="text-[10px] text-light uppercase tracking-wide">Apr 2026 – Mar 2027</span>
              </div>
              <div className="w-full bg-border rounded-[4px] h-3 mb-2">
                <div className="bg-amber h-3 rounded-[4px] transition-all" style={{ width: "25%" }} />
              </div>
              <p className="text-[10px] text-light">~3 months elapsed</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="font-display text-[16px] font-normal text-dark">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <Link href="/journal/new" className="block text-[13px] text-mid hover:text-amber py-1">→ New Journal Entry</Link>
              <Link href="/invoices/new" className="block text-[13px] text-mid hover:text-amber py-1">→ New Invoice</Link>
              <Link href="/payments/new" className="block text-[13px] text-mid hover:text-amber py-1">→ Record Payment</Link>
              <Link href="/reports/trial-balance" className="block text-[13px] text-mid hover:text-amber py-1">→ Trial Balance</Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-display text-[16px] font-normal text-dark">Receivables</h3>
              <Link href="/receivables" className="text-[12px] text-light hover:text-amber">View All →</Link>
            </div>
            <div className="p-4">
              {loading ? (
                <p className="text-[13px] text-light">Loading...</p>
              ) : receivables ? (
                <>
                  <div className="mb-4">
                    <p className="text-[12px] text-light mb-1">Total Outstanding</p>
                    <p className="font-mono text-[20px] text-right">₹{receivables.totalOutstanding.toLocaleString('en-IN')}</p>
                    {receivables.overdueCount > 0 && (
                      <p className="text-[10px] text-danger mt-1 text-right">{receivables.overdueCount} overdue</p>
                    )}
                  </div>
                  {receivables.topCustomers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-light uppercase tracking-wide">Top Customers</p>
                      {receivables.topCustomers.slice(0, 3).map((c) => (
                        <div key={c.customerName} className="flex justify-between text-[13px]">
                          <span className="text-mid">{c.customerName}</span>
                          <span className="font-mono text-dark">₹{c.outstanding.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-light">No outstanding receivables</p>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-light">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
