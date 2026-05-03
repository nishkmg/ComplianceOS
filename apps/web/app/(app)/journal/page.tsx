"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  narration: string;
  debit: number;
  credit: number;
  status: "draft" | "posted" | "voided";
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockEntriesByFy: Record<string, JournalEntry[]> = {
  '2026-27': [
    { id: "1", entryNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance", debit: 500000, credit: 0, status: "posted" },
    { id: "2", entryNumber: "JE-2026-27-002", date: "2026-04-05", narration: "Sales Invoice #1", debit: 118000, credit: 0, status: "draft" },
    { id: "3", entryNumber: "JE-2026-27-003", date: "2026-04-10", narration: "Purchase equipment", debit: 0, credit: 75000, status: "posted" },
    { id: "4", entryNumber: "JE-2026-27-004", date: "2026-04-12", narration: "Salary for April", debit: 320000, credit: 0, status: "posted" },
    { id: "5", entryNumber: "JE-2026-27-005", date: "2026-04-15", narration: "Rent payment", debit: 0, credit: 75000, status: "draft" },
    { id: "6", entryNumber: "JE-2026-27-006", date: "2026-04-20", narration: "Client invoice — ABC Corp", debit: 236000, credit: 0, status: "posted" },
  ],
  '2025-26': [
    { id: "101", entryNumber: "JE-2025-26-001", date: "2025-04-01", narration: "Opening balance", debit: 420000, credit: 0, status: "posted" },
    { id: "102", entryNumber: "JE-2025-26-002", date: "2025-06-15", narration: "Office furniture purchase", debit: 0, credit: 120000, status: "posted" },
    { id: "103", entryNumber: "JE-2025-26-003", date: "2025-09-20", narration: "Q2 consultancy revenue", debit: 680000, credit: 0, status: "posted" },
    { id: "104", entryNumber: "JE-2025-26-004", date: "2025-12-01", narration: "Annual maintenance contract", debit: 0, credit: 96000, status: "posted" },
    { id: "105", entryNumber: "JE-2025-26-005", date: "2026-01-15", narration: "Tax provision entry", debit: 185000, credit: 0, status: "draft" },
    { id: "106", entryNumber: "JE-2025-26-006", date: "2026-03-25", narration: "Year-end adjustments", debit: 0, credit: 45000, status: "draft" },
  ],
};

const statusOptions = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "posted", label: "Posted" },
  { value: "voided", label: "Voided" },
] as const;

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<JournalEntry>[] = [
  {
    key: "entryNumber",
    header: "Entry #",
    sortable: true,
    width: "150px",
    render: (row) => (
      <Link
        href={`/journal/${row.id}`}
        className="font-mono text-[13px] text-amber-text hover:underline no-underline"
      >
        {row.entryNumber}
      </Link>
    ),
  },
  {
    key: "date",
    header: "Date",
    sortable: true,
    width: "130px",
    render: (row) => (
      <span className="font-mono text-[12px] text-mid">
        {new Date(row.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "narration",
    header: "Narration",
    sortable: true,
  },
  {
    key: "debit",
    header: "Debit (₹)",
    align: "right",
    sortable: true,
    width: "150px",
    render: (row) => (
      <span className="font-mono text-[13px] tabular-nums">
        {row.debit > 0 ? formatIndianNumber(row.debit, { currency: true, decimals: 2 }) : "—"}
      </span>
    ),
  },
  {
    key: "credit",
    header: "Credit (₹)",
    align: "right",
    sortable: true,
    width: "150px",
    render: (row) => (
      <span className="font-mono text-[13px] tabular-nums">
        {row.credit > 0 ? formatIndianNumber(row.credit, { currency: true, decimals: 2 }) : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    sortable: true,
    width: "100px",
    render: (row) => (
      <Badge
        variant={row.status === "posted" ? "success" : row.status === "draft" ? "amber" : "gray"}
      >
        {row.status}
      </Badge>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function JournalPage() {
  const { activeFy } = useFiscalYear();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const mockEntries = mockEntriesByFy[activeFy] ?? mockEntriesByFy['2026-27'];

  useEffect(() => {
    setLoading(false);
  }, []);

  const filteredEntries = useMemo(
    () =>
      mockEntries.filter((e) => {
        if (filter !== "all" && e.status !== filter) return false;
        if (
          search &&
          !e.narration.toLowerCase().includes(search.toLowerCase()) &&
          !e.entryNumber.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [filter, search, mockEntries]
  );

  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of statusOptions) {
      c[s.value] = s.value === "all" ? mockEntries.length : mockEntries.filter(e => e.status === s.value).length;
    }
    return c;
  }, [mockEntries]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            General Ledger
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Journal Entries</h1>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Icon name="download" size={14} className="mr-1.5 inline" />Export CSV
          </button>
          <Link
            href="/journal/new"
            className="btn-primary no-underline inline-flex items-center gap-1"
          >
            Add Entry <Icon name="add" size={14} />
          </Link>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-surface-muted rounded-md p-0.5 border border-border">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-[11px] font-ui text-[13px] font-medium transition-colors cursor-pointer border-none rounded-sm ${
                filter === s.value
                  ? "bg-surface text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {s.label}
              {s.value !== "all" && (
                <span className="ml-1.5 text-[10px] text-light">({counts[s.value]})</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon
            name="search"
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none"
          />
          <input
            data-search-input
            className="bg-surface border border-border text-[12px] font-ui px-8 py-1.5 w-56 rounded-md focus:ring-1 focus:ring-amber outline-none placeholder:text-light"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DataTable */}
      {loading ? (
        <TableSkeleton rows={10} columns={6} />
      ) : (
        <DataTable<JournalEntry>
          data={filteredEntries}
          columns={columns}
          keyExtractor={(row) => row.id}
          pageSize={15}
          emptyState={
            <EmptyState
              title={search || filter !== "all" ? "No entries match your filters" : "No journal entries yet"}
              description={search || filter !== "all" ? "Try adjusting your search or filter criteria." : "Create your first entry to start recording transactions."}
              action={{ label: "New Journal Entry", onClick: () => window.location.href = "/journal/new" }}
              icon="menu_book"
            />
          }
          footer={
            filteredEntries.length > 0 ? (
              <tr className="bg-surface-muted border-t-2 border-border">
                <td colSpan={3} className="px-4 py-3 font-ui text-[10px] uppercase tracking-widest text-mid font-bold">
                  Total ({filteredEntries.length} entries)
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
                  {formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
                  {formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}
                </td>
                <td />
              </tr>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
