"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { Badge } from "@/components/ui";
import { api } from "@/lib/api";

// ─── Period options ───────────────────────────────────────────────────────────

const periods = [
  { value: "current", label: "FY 2026-27" },
  { value: "last",    label: "FY 2025-26" },
  { value: "custom",  label: "Custom Range" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [period, setPeriod] = useState("current");

  const fiscalYear = period === "current" ? "2026-27" : period === "last" ? "2025-26" : "2026-27";

  // tRPC queries
  const { data: accounts }: any = api.accounts.list.useQuery();
  const { data: ledgerData, isLoading }: any = api.balances.ledger.useQuery(
    { accountId: id, fiscalYear },
    { enabled: !!id }
  );

  const account: any = accounts?.find((a: any) => a.id === id);
  const transactions: any[] = ledgerData?.transactions || [];
  const openingBalance = ledgerData?.openingBalance || 0;
  const closingBalance = ledgerData?.closingBalance || 0;

  let runningBalance = openingBalance;

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui-sm text-mid">Account not found.</p>
        <Link href="/coa" className="mt-4 text-primary-container text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">
          Back to Chart of Accounts
        </Link>
      </div>
    );
  }

  const balanceLabel = account.kind === "asset" || account.kind === "expense" ? "Dr" : "Cr";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] text-light uppercase tracking-widest" aria-label="Breadcrumb">
        <Link href="/coa" className="hover:text-dark transition-colors no-underline">Chart of Accounts</Link>
        <Icon name="chevron_right" size={14} className="text-lighter" />
        <span className="text-mid font-medium">{account.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display-xl text-display-xl text-dark tracking-tight">{account.name}</h1>
            <Badge variant={account.kind === "asset" ? "gray" : account.kind === "liability" ? "amber" : account.kind === "income" ? "success" : "gray"}>
              {account.kind}
            </Badge>
          </div>
          <p className="font-mono text-[13px] text-mid">
            {account.code} · {fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export Statement
          </button>
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="edit" size={14} /> Edit Details
          </button>
        </div>
      </div>

      {/* Period selector + balance cards */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-section-muted rounded-sm p-0.5 border border-border-subtle">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-[11px] font-ui-sm font-medium transition-colors cursor-pointer border-none rounded-sm ${
                period === p.value
                  ? "bg-white text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Balance summary strip */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-border-subtle p-5 shadow-sm rounded-sm">
          <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-1">Opening Balance</p>
          <p className="font-mono text-xl text-dark tabular-nums">
            {formatIndianNumber(Math.abs(openingBalance), { currency: true })}{" "}
            <span className="text-[12px] text-mid font-ui-sm">{openingBalance >= 0 ? balanceLabel : balanceLabel === "Dr" ? "Cr" : "Dr"}</span>
          </p>
        </div>
        <div className="bg-white border border-border-subtle p-5 shadow-sm rounded-sm border-l-4 border-l-primary-container">
          <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-1">Closing Balance</p>
          <p className="font-mono text-xl text-dark tabular-nums font-semibold">
            {formatIndianNumber(Math.abs(closingBalance), { currency: true })}{" "}
            <span className="text-[12px] text-mid font-ui-sm">{closingBalance >= 0 ? balanceLabel : balanceLabel === "Dr" ? "Cr" : "Dr"}</span>
          </p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden rounded-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-stone-50">
          <h2 className="font-ui-sm text-[13px] font-bold text-dark uppercase tracking-widest">Transactions</h2>
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
            <input className="bg-white border border-border-subtle text-[12px] font-ui px-8 py-1.5 w-52 rounded-sm focus:ring-1 focus:ring-primary-container outline-none placeholder:text-light" placeholder="Search entries…" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-border-subtle">
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest">Voucher</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest">Narration</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right">Debit</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right">Credit</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center font-ui-sm text-mid">Loading transactions…</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((txn: any, i: number) => {
                  runningBalance += txn.debit - txn.credit;
                  return (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-5 font-mono text-[12px] text-mid">
                        {new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-primary-container font-medium">
                        <Link href={`/journal/${txn.id}`} className="hover:underline no-underline">{txn.voucherNumber}</Link>
                      </td>
                      <td className="py-4 px-5 font-ui-sm text-[13px] text-dark">{txn.narration}</td>
                      <td className="py-4 px-5 font-mono text-[12px] tabular-nums text-right">
                        {txn.debit > 0 ? formatIndianNumber(txn.debit, { currency: true }) : "—"}
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] tabular-nums text-right">
                        {txn.credit > 0 ? formatIndianNumber(txn.credit, { currency: true }) : "—"}
                      </td>
                      <td className={`py-4 px-5 font-mono text-[12px] tabular-nums text-right font-medium ${runningBalance >= 0 ? 'text-dark' : 'text-danger'}`}>
                        {formatIndianNumber(Math.abs(runningBalance))} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-12 text-center font-ui-sm text-mid">No transactions found for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
