"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string;
  entry_number: string;
  date: string;
  narration: string;
  debit: number;
  credit: number;
  status: "draft" | "posted" | "voided";
  fiscal_year: string;
  created_at: string;
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "posted", label: "Posted" },
  { value: "voided", label: "Voided" },
] as const;

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<JournalEntry>[] = [
  {
    key: "entry_number",
    header: "Entry #",
    sortable: true,
    width: "180px",
    render: (row) => (
      <Link
        href={`/journal/${row.id}`}
        className="font-mono text-[13px] text-amber-text hover:underline no-underline"
      >
        {row.entry_number}
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
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real entries from API
  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const res = await fetch(`/api/journal/entries?tenantId=${encodeURIComponent(tenantId)}&fiscalYear=${encodeURIComponent(activeFy)}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEntries(data.entries || []);
      } catch {
        showToast.error("Failed to load journal entries");
      } finally {
        setLoading(false);
      }
    })();
  }, [tenantId, activeFy]);

  const filteredEntries = useMemo(
    () =>
      entries.filter((e) => {
        if (filter !== "all" && e.status !== filter) return false;
        if (
          search &&
          !e.narration.toLowerCase().includes(search.toLowerCase()) &&
          !e.entry_number.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [filter, search, entries]
  );

  const totalDebit = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of statusOptions) {
      c[s.value] = s.value === "all" ? entries.length : entries.filter(e => e.status === s.value).length;
    }
    return c;
  }, [entries]);

  const handleExportCSV = useCallback(() => {
    if (filteredEntries.length === 0) {
      showToast.error("No entries to export. Adjust your filters and try again.");
      return;
    }
    const header = "Entry #,Date,Narration,Debit,Credit,Status";
    const rows = filteredEntries.map(e =>
      `${e.entry_number},${e.date},"${e.narration.replace(/"/g, '""')}",${e.debit},${e.credit},${e.status}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-entries-${activeFy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success(`Exported ${filteredEntries.length} entries.`);
  }, [filteredEntries, activeFy]);

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
          <button className="btn-secondary" onClick={handleExportCSV}>
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
