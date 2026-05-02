"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountRow {
  code: string;
  name: string;
  type: string;
  balance: number;
  balanceType: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const ACCOUNTS: AccountRow[] = [
  { code: "10101", name: "Cash Account",       type: "Asset",     balance: 500000,  balanceType: "Dr" },
  { code: "10200", name: "Bank Account",        type: "Asset",     balance: 1250000, balanceType: "Dr" },
  { code: "10300", name: "Trade Receivables",   type: "Asset",     balance: 350000,  balanceType: "Dr" },
  { code: "10400", name: "GST Input",           type: "Asset",     balance: 45000,   balanceType: "Dr" },
  { code: "20101", name: "Trade Payables",      type: "Liability", balance: 180000,  balanceType: "Cr" },
  { code: "20200", name: "GST Output",          type: "Liability", balance: 45000,   balanceType: "Cr" },
  { code: "20300", name: "TDS Payable",         type: "Liability", balance: 12000,   balanceType: "Cr" },
  { code: "30100", name: "Capital Account",     type: "Equity",    balance: 1000000, balanceType: "Cr" },
  { code: "40100", name: "Sales Revenue",       type: "Income",    balance: 2800000, balanceType: "Cr" },
  { code: "50200", name: "Operating Expenses",  type: "Expense",   balance: 450000,  balanceType: "Dr" },
];

const typeBadge: Record<string, string> = {
  Asset:     "bg-blue-50 text-blue-700 border-blue-200",
  Liability: "bg-amber-50 text-amber-700 border-amber-200",
  Equity:    "bg-green-50 text-green-700 border-green-200",
  Income:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Expense:   "bg-red-50 text-red-700 border-red-200",
};

const typeOptions = ["All", "Asset", "Liability", "Equity", "Income", "Expense"];

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<AccountRow>[] = [
  {
    key: "code",
    header: "Code",
    width: "120px",
    render: (row) => <span className="font-mono text-[12px] text-mid">{row.code}</span>,
  },
  {
    key: "name",
    header: "Account Name",
    sortable: true,
    render: (row) => (
      <Link href={`/accounts/${row.code}`} className="font-ui-sm text-[13px] text-dark font-medium hover:text-primary-container no-underline transition-colors">
        {row.name}
      </Link>
    ),
  },
  {
    key: "type",
    header: "Type",
    width: "110px",
    render: (row) => (
      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border rounded-sm ${typeBadge[row.type] || ''}`}>
        {row.type}
      </span>
    ),
  },
  {
    key: "balance",
    header: "Balance (₹)",
    align: "right",
    sortable: true,
    width: "180px",
    render: (row) => (
      <span className="font-mono text-[13px] tabular-nums">
        {formatIndianNumber(row.balance, { currency: true })} <span className="text-[10px] text-mid">{row.balanceType}</span>
      </span>
    ),
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AccountsFlatPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(
    () =>
      ACCOUNTS.filter(a => {
        if (typeFilter !== "All" && a.type !== typeFilter) return false;
        if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.code.includes(search)) return false;
        return true;
      }),
    [typeFilter, search]
  );

  const totalBalance = filtered.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Ledger
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Chart of Accounts</h1>
          <p className="font-ui-sm text-sm text-mid mt-1">Flat ledger view of all registered accounts.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export
          </button>
          <Link
            href="/accounts/new"
            className="px-4 py-2 bg-primary-container text-white text-[10px] font-ui-xs uppercase tracking-widest hover:bg-amber-hover transition-colors no-underline rounded-sm flex items-center gap-1.5"
          >
            <Icon name="add" size={14} /> New Account
          </Link>
        </div>
      </div>

      {/* Filter + search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-section-muted rounded-sm p-0.5 border border-border-subtle">
          {typeOptions.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-[11px] font-ui-sm font-medium transition-colors cursor-pointer border-none rounded-sm capitalize ${
                typeFilter === t
                  ? "bg-white text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
          <input
            className="bg-white border border-border-subtle text-[12px] font-ui px-8 py-1.5 w-56 rounded-sm focus:ring-1 focus:ring-primary-container outline-none placeholder:text-light"
            placeholder="Search accounts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable<AccountRow>
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.code}
        pageSize={20}
        emptyState={
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <Icon name="account_tree" className="text-4xl text-lighter mb-4" />
            <p className="font-ui-sm text-sm text-mid mb-1">No accounts found.</p>
            <Link
              href="/accounts/new"
              className="mt-3 bg-primary-container text-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-amber-hover transition-colors no-underline rounded-sm"
            >
              Create Account
            </Link>
          </div>
        }
        footer={
          <tr className="bg-stone-50 border-t-2 border-border-subtle">
            <td colSpan={3} className="px-4 py-3 font-ui-xs text-[10px] uppercase tracking-widest text-mid font-bold">
              Total ({filtered.length} accounts)
            </td>
            <td className="px-4 py-3 font-mono text-[13px] text-dark tabular-nums text-right font-semibold">
              {formatIndianNumber(totalBalance, { currency: true })}
            </td>
          </tr>
        }
      />
    </div>
  );
}
