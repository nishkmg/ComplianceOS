"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { KpiTile } from "@/components/ui/kpi-tile";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton, KPISkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber, formatDateShort } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Fallback mock data (displayed when tRPC fetch fails or has no data) ──────

const mockReceivables: DashboardData = {
  totalOutstanding: 2845000,
  overdueCount: 3,
  topCustomers: [
    { customerName: "ABC Corp", outstanding: 850000 },
    { customerName: "XYZ Industries", outstanding: 620000 },
    { customerName: "PQR Trading", outstanding: 410000 },
  ],
};

const mockEntries: JournalEntry[] = [
  { id: "1", entryNumber: "JE-2026-0001", date: "2026-04-28", narration: "Office supplies purchase", debit: 45000, credit: 0, status: "posted" },
  { id: "2", entryNumber: "JE-2026-0002", date: "2026-04-27", narration: "Client payment received — ABC Corp", debit: 0, credit: 850000, status: "posted" },
  { id: "3", entryNumber: "JE-2026-0003", date: "2026-04-25", narration: "Salary for April 2026", debit: 320000, credit: 0, status: "draft" },
  { id: "4", entryNumber: "JE-2026-0004", date: "2026-04-22", narration: "Rent payment — April", debit: 75000, credit: 0, status: "posted" },
  { id: "5", entryNumber: "JE-2026-0005", date: "2026-04-20", narration: "IT services invoice — Q1", debit: 0, credit: 234000, status: "posted" },
];

// ─── Column definition for the Recent Entries DataTable ────────────────────────

const entryColumns: ColumnDef<JournalEntry>[] = [
  {
    key: "entryNumber",
    header: "Entry #",
    sortable: true,
    width: "130px",
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
    width: "100px",
    render: (row) => (
      <span className="font-mono text-[12px] text-mid">{formatDateShort(row.date)}</span>
    ),
  },
  {
    key: "narration",
    header: "Narration",
    sortable: true,
  },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    sortable: true,
    width: "160px",
    render: (row) => (
      <span className="font-mono text-[13px] text-dark tabular-nums">
        {formatIndianNumber(Math.max(row.debit, row.credit), { currency: true, decimals: 2 })}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    sortable: true,
    width: "110px",
    render: (row) => (
      <Badge
        variant={row.status === "posted" ? "success" : row.status === "draft" ? "amber" : "gray"}
      >
        {row.status === "posted" ? "Cleared" : row.status}
      </Badge>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [receivables, setReceivables] = useState<DashboardData | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trpc/receivables.dashboard").then(r => r.json()).catch(() => null),
      fetch("/api/trpc/journal-entries.list?limit=5").then(r => r.json()).catch(() => null),
    ])
      .then(([rData, eData]) => {
        if (rData?.result?.data) setReceivables(rData.result.data);
        if (eData?.result?.data) setEntries(eData.result.data);
      })
      .catch(() => { /* fall through to mock data */ })
      .finally(() => setLoading(false));
  }, []);

  // Fall back to mock data when tRPC returns nothing
  const displayReceivables = receivables ?? mockReceivables;
  const displayEntries = !loading && entries.length === 0 ? mockEntries : entries;

  const companyName = "Demo Business Pvt Ltd";
  const today = new Date();
  const greeting =
    today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-display-xl text-dark">
              {greeting}, {companyName}
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-wider text-mid bg-surface-muted px-2 py-0.5 rounded-md border border-border shrink-0 font-medium">
              FY 2026-27
            </span>
          </div>
          <p className="text-[13px] text-secondary font-ui mt-1">
            Here is your business summary for{" "}
            {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface border border-border px-4 py-2 flex items-center gap-2 hover:bg-surface-muted transition-colors cursor-pointer rounded-md shadow-sm">
            <Icon name="download" size={16} className="text-mid" />
            <span className="font-ui text-[10px] uppercase tracking-wider text-mid font-bold">Export PDF</span>
          </button>
          <Link
            href="/journal/new"
            className="bg-amber text-white px-5 py-2 flex items-center gap-2 hover:bg-amber-hover transition-colors active:scale-95 group no-underline rounded-md shadow-sm"
          >
            <span className="font-ui text-[10px] uppercase tracking-wider font-bold">Add Entry</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiTile
            label="Revenue MTD"
            value={1245000.00}
            variant="amber"
            delta={{ value: 14.2, label: "vs last month" }}
            icon="trending_up"
          />
          <KpiTile
            label="Expenses MTD"
            value={412040.50}
            variant="neutral"
            delta={{ value: 2.1, label: "within budget" }}
            icon="shopping_cart"
          />
          <KpiTile
            label="Net Profit MTD"
            value={833559.50}
            variant="amber"
            delta={{ value: 67, label: "Gross Margin" }}
            icon="account_balance_wallet"
          />
          <KpiTile
            label="Cash & Bank"
            value={4512890.00}
            variant="neutral"
            subtext="Reconciled as of today"
            icon="account_balance"
          />
        </div>
      )}

      {/* ── Receivables Summary Widget ────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border shadow-sm rounded-xl p-6 flex items-start gap-4 transition-shadow hover:shadow-md">
            <div className="w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <Icon name="account_balance" size={18} className="text-amber" />
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-widest text-mid mb-1 font-bold">Total Outstanding</p>
              <p className="font-mono text-xl text-dark tabular-nums font-semibold">
                {formatIndianNumber(displayReceivables.totalOutstanding, { currency: true })}
              </p>
            </div>
          </div>
          <div className="bg-surface border border-border shadow-sm rounded-xl p-6 flex items-start gap-4 transition-shadow hover:shadow-md">
            <div className="w-10 h-10 rounded-md bg-danger-bg flex items-center justify-center shrink-0">
              <Icon name="warning" size={18} className="text-danger" />
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-widest text-mid mb-1 font-bold">
                Overdue
              </p>
              <p className="font-mono text-xl text-dark tabular-nums font-semibold">
                {displayReceivables.overdueCount}
              </p>
            </div>
          </div>
          <div className="bg-surface border border-border shadow-sm rounded-xl p-6 flex items-start gap-4 transition-shadow hover:shadow-md">
            <div className="w-10 h-10 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
              <Icon name="group" size={18} className="text-amber" />
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-widest text-mid mb-1 font-bold">
                Top Customer
              </p>
              <p className="font-ui text-sm font-semibold text-dark">
                {displayReceivables.topCustomers[0]?.customerName ?? "—"}
              </p>
              <p className="font-mono text-[13px] text-mid tabular-nums mt-0.5">
                {displayReceivables.topCustomers[0]?.outstanding
                  ? formatIndianNumber(displayReceivables.topCustomers[0].outstanding, { currency: true })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Grid: 8+4 split ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Recent Entries DataTable ──────────────────────────────── */}
        <div className="lg:col-span-8">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <DataTable<JournalEntry>
              data={displayEntries}
              columns={entryColumns}
              keyExtractor={(row) => row.id}
              pageSize={10}
              emptyState={
                <EmptyState
                  title="No journal entries yet"
                  description="Create your first journal entry to start recording transactions."
                  action={{ label: "New Journal Entry", onClick: () => window.location.href = "/journal/new" }}
                  icon="menu_book"
                />
              }
              footer={
                <tr className="bg-surface-muted border-t-2 border-border">
                  <td colSpan={3} className="px-4 py-3 font-ui text-[10px] uppercase tracking-widest text-mid font-bold">
                    Total
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
                    {formatIndianNumber(
                      displayEntries.reduce((sum, e) => sum + Math.max(e.debit, e.credit), 0),
                      { currency: true, decimals: 2 }
                    )}
                  </td>
                  <td></td>
                </tr>
              }
            />
          )}
        </div>

        {/* ── Right sidebar widgets ──────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* FY Progress */}
          <div className="bg-surface border border-border p-6 shadow-sm rounded-xl">
            <h3 className="font-ui text-[10px] text-mid uppercase tracking-widest mb-6 font-bold">
              Financial Year Progress
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="font-ui text-[10px] font-bold px-2 py-1 uppercase rounded-md text-amber bg-amber-50">
                  Q1 Completion
                </span>
                <span className="font-mono text-[13px] font-semibold text-amber">62%</span>
              </div>
              <div className="overflow-hidden h-1.5 mb-4 rounded-full bg-border">
                <div
                  className="h-full bg-amber transition-all duration-1000"
                  style={{ width: "62%" }}
                />
              </div>
              <p className="font-ui text-[11px] text-mid leading-relaxed">
                You are tracking{" "}
                <span className="font-mono text-[12px] text-dark font-medium">15%</span> ahead of your revenue
                goals for this quarter.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark p-6 border-l-4 border-l-amber shadow-sm rounded-r-xl">
            <h3 className="font-ui text-[10px] text-light uppercase tracking-widest mb-6 font-bold">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/journal/new"
                className="w-full bg-zinc-800 border border-mid text-zinc-100 px-4 py-3.5 flex items-center justify-between hover:bg-zinc-700 hover:border-mid transition-colors group no-underline rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon name="add_circle" size={16} className="text-amber" />
                  <span className="font-ui text-[13px] font-medium">Record New Entry</span>
                </div>
                <Icon
                  name="chevron_right"
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-all text-light group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/reports/profit-loss"
                className="w-full bg-zinc-800 border border-mid text-zinc-100 px-4 py-3.5 flex items-center justify-between hover:bg-zinc-700 hover:border-mid transition-colors group no-underline rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon name="insert_chart" size={16} className="text-amber" />
                  <span className="font-ui text-[13px] font-medium">View P&L Statement</span>
                </div>
                <Icon
                  name="chevron_right"
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-all text-light group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Audit Readiness */}
          <div className="bg-surface border border-border p-6 overflow-hidden relative group shadow-sm rounded-xl">
            <div className="relative z-10">
              <Icon name="security" size={20} className="text-light mb-2" />
              <h4 className="font-ui text-[13px] font-bold text-dark">Audit Readiness</h4>
              <p className="font-ui text-[11px] text-mid mt-2 leading-relaxed">
                All supporting vouchers for the last{" "}
                <span className="font-mono text-[12px] font-medium">30</span> days have been digitized and linked.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Icon name="verified" size={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
