"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { KpiTile, Badge, DataTable, type ColumnDef } from "@/components/ui";
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
            <h1 className="font-display-xl text-display-xl text-dark">
              {greeting}, {companyName}
            </h1>
            <span className="font-mono text-[10px] uppercase tracking-wider text-mid bg-section-muted px-2 py-0.5 rounded-sm border border-border-subtle shrink-0">
              FY 2026-27
            </span>
          </div>
          <p className="font-ui-sm text-sm text-mid mt-1">
            Here is your business summary for{" "}
            {today.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-section-muted border border-border-subtle px-4 py-2 flex items-center gap-2 hover:bg-lighter/60 transition-colors cursor-pointer rounded-sm">
            <Icon name="download" size={16} className="text-mid" />
            <span className="font-ui-xs text-[10px] uppercase tracking-wider text-mid">Export PDF</span>
          </button>
          <Link
            href="/journal/new"
            className="bg-primary-container text-white px-5 py-2 flex items-center gap-2 hover:bg-amber-hover transition-colors active:scale-95 group no-underline rounded-sm"
          >
            <span className="font-ui-xs text-[10px] uppercase tracking-wider">Add Entry</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
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
          variant="dark"
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

      {/* ── Receivables Summary Widget ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-subtle shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-section-amber flex items-center justify-center shrink-0">
            <Icon name="account_balance" size={18} className="text-primary-container" />
          </div>
          <div>
            <p className="font-ui-xs text-[10px] uppercase tracking-widest text-mid mb-1">Total Outstanding</p>
            <p className="font-mono text-xl text-dark tabular-nums">
              {formatIndianNumber(displayReceivables.totalOutstanding, { currency: true })}
            </p>
          </div>
        </div>
        <div className="bg-white border border-border-subtle shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-danger-bg flex items-center justify-center shrink-0">
            <Icon name="warning" size={18} className="text-danger" />
          </div>
          <div>
            <p className="font-ui-xs text-[10px] uppercase tracking-widest text-mid mb-1">
              Overdue
            </p>
            <p className="font-mono text-xl text-dark tabular-nums">
              {displayReceivables.overdueCount}
            </p>
          </div>
        </div>
        <div className="bg-white border border-border-subtle shadow-sm p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-section-amber flex items-center justify-center shrink-0">
            <Icon name="group" size={18} className="text-primary-container" />
          </div>
          <div>
            <p className="font-ui-xs text-[10px] uppercase tracking-widest text-mid mb-1">
              Top Customer
            </p>
            <p className="font-ui-sm text-sm font-semibold text-dark">
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

      {/* ── Main Grid: 8+4 split ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left: Recent Entries DataTable ──────────────────────────────── */}
        <div className="lg:col-span-8">
          <DataTable<JournalEntry>
            data={displayEntries}
            columns={entryColumns}
            keyExtractor={(row) => row.id}
            loading={loading && entries.length === 0}
            pageSize={10}
            emptyState={
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Icon name="menu_book" className="text-4xl text-lighter mb-4" />
                <p className="font-ui-sm text-sm text-mid mb-4">
                  No entries yet. Create your first journal entry.
                </p>
                <Link
                  href="/journal/new"
                  className="bg-primary-container text-white px-5 py-2 text-[12px] font-bold uppercase tracking-wider hover:bg-amber-hover transition-colors no-underline rounded-sm"
                >
                  New Journal Entry
                </Link>
              </div>
            }
            footer={
              <tr className="bg-stone-50 border-t-2 border-border-subtle">
                <td colSpan={3} className="px-4 py-3 font-ui-xs text-[10px] uppercase tracking-widest text-mid font-bold">
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
        </div>

        {/* ── Right sidebar widgets ──────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* FY Progress */}
          <div className="bg-white border border-border-subtle p-6 shadow-sm">
            <h3 className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-6">
              Financial Year Progress
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="font-ui-xs text-[10px] font-semibold px-2 py-1 uppercase rounded-sm text-primary-container bg-section-amber">
                  Q1 Completion
                </span>
                <span className="font-mono text-[13px] font-semibold text-primary-container">62%</span>
              </div>
              <div className="overflow-hidden h-1.5 mb-4 rounded bg-lighter/60">
                <div
                  className="h-full bg-primary-container transition-all duration-1000"
                  style={{ width: "62%" }}
                />
              </div>
              <p className="font-ui-xs text-[11px] text-mid leading-relaxed">
                You are tracking{" "}
                <span className="font-mono text-[12px] text-dark">15%</span> ahead of your revenue
                goals for this quarter.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-section-dark p-6 border-l-4 border-l-primary-container shadow-sm">
            <h3 className="font-ui-xs text-[10px] text-stone-400 uppercase tracking-widest mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/journal/new"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 px-4 py-3.5 flex items-center justify-between hover:bg-stone-700 transition-colors group no-underline rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon name="add_circle" size={16} className="text-primary-container" />
                  <span className="font-ui-sm text-[13px]">Record New Entry</span>
                </div>
                <Icon
                  name="chevron_right"
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-all text-stone-500"
                />
              </Link>
              <Link
                href="/reports/profit-loss"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 px-4 py-3.5 flex items-center justify-between hover:bg-stone-700 transition-colors group no-underline rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon name="insert_chart" size={16} className="text-primary-container" />
                  <span className="font-ui-sm text-[13px]">View P&L Statement</span>
                </div>
                <Icon
                  name="chevron_right"
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-all text-stone-500"
                />
              </Link>
            </div>
          </div>

          {/* Audit Readiness */}
          <div className="bg-white border border-border-subtle p-6 overflow-hidden relative group shadow-sm">
            <div className="relative z-10">
              <Icon name="security" size={20} className="text-lighter mb-2" />
              <h4 className="font-ui-sm text-[13px] font-bold text-dark">Audit Readiness</h4>
              <p className="font-ui-xs text-[11px] text-mid mt-2 leading-relaxed">
                All supporting vouchers for the last{" "}
                <span className="font-mono text-[12px]">30</span> days have been digitized and linked.
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
