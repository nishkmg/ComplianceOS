"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge, DataTable, type ColumnDef } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

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

const mockEntries: JournalEntry[] = [
  { id: "1", entryNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance", debit: 500000, credit: 0, status: "posted" },
  { id: "2", entryNumber: "JE-2026-27-002", date: "2026-04-05", narration: "Sales Invoice #1", debit: 118000, credit: 0, status: "draft" },
  { id: "3", entryNumber: "JE-2026-27-003", date: "2026-04-10", narration: "Purchase equipment", debit: 0, credit: 75000, status: "posted" },
  { id: "4", entryNumber: "JE-2026-27-004", date: "2026-04-12", narration: "Salary for April", debit: 320000, credit: 0, status: "posted" },
  { id: "5", entryNumber: "JE-2026-27-005", date: "2026-04-15", narration: "Rent payment", debit: 0, credit: 75000, status: "draft" },
  { id: "6", entryNumber: "JE-2026-27-006", date: "2026-04-20", narration: "Client invoice — ABC Corp", debit: 236000, credit: 0, status: "posted" },
];

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
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

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
    [filter, search]
  );

  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of statusOptions) {
      c[s.value] = s.value === "all" ? mockEntries.length : mockEntries.filter(e => e.status === s.value).length;
    }
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            General Ledger
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Journal Entries</h1>
        </div>
        <div className="flex gap-3">
          <button className="border border-border-subtle px-4 py-2 text-[10px] font-ui-xs uppercase tracking-widest text-mid hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm">
            <Icon name="download" size={14} className="mr-1.5 inline" />Export CSV
          </button>
          <Link
            href="/journal/new"
            className="bg-primary-container text-white px-5 py-2 text-[10px] font-ui-xs uppercase tracking-widest hover:bg-amber-hover transition-all no-underline inline-flex items-center gap-1 rounded-sm"
          >
            Add Entry <Icon name="add" size={14} />
          </Link>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-section-muted rounded-sm p-0.5 border border-border-subtle">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 text-[11px] font-ui-sm font-medium transition-colors cursor-pointer border-none rounded-sm ${
                filter === s.value
                  ? "bg-white text-dark shadow-sm"
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
            className="bg-white border border-border-subtle text-[12px] font-ui px-8 py-1.5 w-56 rounded-sm focus:ring-1 focus:ring-primary-container outline-none placeholder:text-light"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable<JournalEntry>
        data={filteredEntries}
        columns={columns}
        keyExtractor={(row) => row.id}
        pageSize={15}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Icon name="menu_book" className="text-4xl text-lighter mb-4" />
            <p className="font-ui-sm text-sm text-mid mb-1">
              {search || filter !== "all"
                ? "No entries match your filter criteria."
                : "No journal entries yet."}
            </p>
            <p className="font-ui-xs text-[11px] text-light mb-4">
              {search || filter !== "all"
                ? "Try adjusting your search or filter."
                : "Create your first entry to start recording transactions."}
            </p>
            <Link
              href="/journal/new"
              className="bg-primary-container text-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-amber-hover transition-colors no-underline rounded-sm"
            >
              New Journal Entry
            </Link>
          </div>
        }
        footer={
          filteredEntries.length > 0 ? (
            <tr className="bg-stone-50 border-t-2 border-border-subtle">
              <td colSpan={3} className="px-4 py-3 font-ui-xs text-[10px] uppercase tracking-widest text-mid font-bold">
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
    </div>
  );
}
