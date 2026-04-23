// @ts-nocheck
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
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredEntries = mockEntries.filter((entry) => {
    if (filter !== "all" && entry.status !== filter) return false;
    if (search && !entry.narration.toLowerCase().includes(search.toLowerCase()) && !entry.entryNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Journal Entries</h1>
          <p className="font-ui text-[12px] text-light mt-1">FY 2026-27 • {filteredEntries.length} entries</p>
        </div>
        <Link href="/journal/new" className="filter-tab active">+ New Entry</Link>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex items-center gap-4">
        <div className="filter-tabs">
          {["all", "draft", "posted", "voided"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab ${filter === f ? "active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by narration or entry # (/)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-search-input
          className="ml-auto input-field w-[320px]"
        />
      </div>

      {/* Table */}
      <div className="card">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Entry #</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Narration</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Debit</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Credit</th>
              <th className="font-ui text-[10px] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-mono text-[13px] text-amber">
                    <Link href={`/journal/${entry.id}`} className="hover:underline">
                      {entry.entryNumber}
                    </Link>
                  </td>
                  <td className="font-mono text-[13px] text-light">
                    {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="font-ui text-[13px] text-mid">
                    {entry.narration}
                  </td>
                  <td className="font-mono text-[13px] text-right text-success">
                    {entry.debit > 0 ? formatINR(entry.debit) : "—"}
                  </td>
                  <td className="font-mono text-[13px] text-right text-danger">
                    {entry.credit > 0 ? formatINR(entry.credit) : "—"}
                  </td>
                  <td>
                    <Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'draft' ? 'amber' : 'gray'}>
                      {entry.status}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 font-ui text-[13px] text-light">
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1A1A1A]">
              <td colSpan={3} className="py-3 font-ui text-[13px] font-medium text-mid">
                Totals
              </td>
              <td className="font-mono text-[13px] text-right text-success py-3">
                {formatINR(totalDebit)}
              </td>
              <td className="font-mono text-[13px] text-right text-danger py-3">
                {formatINR(totalCredit)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
