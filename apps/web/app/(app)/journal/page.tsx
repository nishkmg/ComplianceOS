"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatINR } from "@/lib/format";

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  narration: string;
  debit: number;
  credit: number;
  status: "draft" | "posted" | "voided";
}

const mockEntries: JournalEntry[] = [
  { id: "1", entryNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance", debit: 500000, credit: 0, status: "posted" },
  { id: "2", entryNumber: "JE-2026-27-002", date: "2026-04-05", narration: "Sales Invoice #1", debit: 118000, credit: 0, status: "draft" },
  { id: "3", entryNumber: "JE-2026-27-003", date: "2026-04-10", narration: "Purchase equipment", debit: 0, credit: 75000, status: "posted" },
];

export default function JournalPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredEntries = mockEntries.filter((e) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search && !e.narration.toLowerCase().includes(search.toLowerCase()) && !e.entryNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div className="text-left">
          <span className="text-amber-text font-ui-xs uppercase tracking-[0.2em] mb-2 block">General Ledger</span>
          <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">Journal Entries</h1>
        </div>
        <div className="flex gap-4">
          <button className="border border-on-surface px-6 py-2 text-xs font-ui-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors cursor-pointer bg-transparent">Export CSV</button>
          <button className="border border-on-surface px-6 py-2 text-xs font-ui-xs uppercase tracking-widest hover:bg-surface-container-highest transition-colors cursor-pointer bg-transparent">Import Tally</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-[0.5px] border-border-subtle">
          <div className="flex gap-1">
            {["all", "draft", "posted", "voided"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-ui-sm transition-colors cursor-pointer border-none ${
                  filter === f ? "text-on-surface border-b-[2px] border-primary-container" : "text-text-mid hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== "all" && (
                  <span className="ml-1 text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded-full text-text-mid">
                    {mockEntries.filter(e => e.status === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                className="bg-surface-container-low border-none text-ui-xs px-4 py-2 w-64 rounded-sm focus:ring-1 focus:ring-primary-container outline-none"
                placeholder="Search entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href="/journal/new" className="bg-primary-container text-white px-4 py-2 text-xs font-ui-xs uppercase tracking-widest hover:translate-x-1 duration-200 transition-all no-underline inline-flex items-center gap-1">
              Add Entry <span className="inline-block">→</span>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sidebar border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Entry #</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Narration</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Debit (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Credit (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-6 font-mono-md text-amber-text">
                      <Link href={`/journal/${entry.id}`} className="hover:underline no-underline">{entry.entryNumber}</Link>
                    </td>
                    <td className="py-4 px-6 text-stone-600 font-mono-md">{new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-4 px-6 font-ui-sm text-on-surface font-medium">{entry.narration}</td>
                    <td className="py-4 px-6 font-mono-md text-right">{entry.debit > 0 ? formatINR(entry.debit) : "—"}</td>
                    <td className="py-4 px-6 font-mono-md text-right">{entry.credit > 0 ? formatINR(entry.credit) : "—"}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                        entry.status === 'posted' ? 'bg-green-50 text-green-700 border-green-200' :
                        entry.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-stone-50 text-stone-500 border-stone-200'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-ui-sm text-text-light">No entries found</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-on-surface">
                <td colSpan={3} className="py-4 px-6 font-ui-sm font-bold text-on-surface">Totals</td>
                <td className="py-4 px-6 font-mono-md text-right font-bold">{formatINR(totalDebit)}</td>
                <td className="py-4 px-6 font-mono-md text-right font-bold">{formatINR(totalCredit)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
