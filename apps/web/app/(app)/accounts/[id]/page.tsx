"use client";

import { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { showToast } from '@/lib/toast';
import { getAccounts } from '@/lib/account-store';

// ─── Mock account data (fallback when tRPC is not wired) ────────────────────

interface MockAccount {
  id: string; code: string; name: string; kind: string; balance: number; balanceType: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  { id: "10101", code: "10101", name: "Cash Account",       kind: "asset",     balance: 500000,  balanceType: "Dr" },
  { id: "10200", code: "10200", name: "Bank Account",        kind: "asset",     balance: 1250000, balanceType: "Dr" },
  { id: "10300", code: "10300", name: "Trade Receivables",   kind: "asset",     balance: 350000,  balanceType: "Dr" },
  { id: "10400", code: "10400", name: "GST Input",           kind: "asset",     balance: 45000,   balanceType: "Dr" },
  { id: "20101", code: "20101", name: "Trade Payables",      kind: "liability", balance: 180000,  balanceType: "Cr" },
  { id: "20200", code: "20200", name: "GST Output",          kind: "liability", balance: 45000,   balanceType: "Cr" },
  { id: "20300", code: "20300", name: "TDS Payable",         kind: "liability", balance: 12000,   balanceType: "Cr" },
  { id: "30100", code: "30100", name: "Capital Account",     kind: "equity",    balance: 1000000, balanceType: "Cr" },
  { id: "40100", code: "40100", name: "Sales Revenue",       kind: "income",    balance: 2800000, balanceType: "Cr" },
  { id: "50200", code: "50200", name: "Operating Expenses",  kind: "expense",   balance: 450000,  balanceType: "Dr" },
];

interface Tx {
  id: string; voucherNumber: string; date: string; narration: string; debit: number; credit: number;
}

const MOCK_TRANSACTIONS_BY_FY: Record<string, Tx[]> = {
  '2026-27': [
    { id: "1", voucherNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance", debit: 500000, credit: 0 },
    { id: "2", voucherNumber: "JE-2026-27-003", date: "2026-04-10", narration: "Equipment purchase", debit: 0, credit: 75000 },
    { id: "3", voucherNumber: "JE-2026-27-004", date: "2026-04-12", narration: "Salary payment", debit: 0, credit: 320000 },
    { id: "4", voucherNumber: "JE-2026-27-006", date: "2026-04-20", narration: "Client invoice", debit: 236000, credit: 0 },
  ],
  '2025-26': [
    { id: "101", voucherNumber: "JE-2025-26-001", date: "2025-04-01", narration: "Opening balance", debit: 420000, credit: 0 },
    { id: "102", voucherNumber: "JE-2025-26-002", date: "2025-06-15", narration: "Office furniture purchase", debit: 0, credit: 120000 },
    { id: "103", voucherNumber: "JE-2025-26-003", date: "2025-09-20", narration: "Consultancy revenue", debit: 680000, credit: 0 },
    { id: "104", voucherNumber: "JE-2025-26-004", date: "2025-12-01", narration: "Annual maintenance", debit: 0, credit: 96000 },
  ],
};

const MOCK_OPENING_BALANCES: Record<string, number> = {
  "10101": 500000, "10200": 1250000, "10300": 350000, "10400": 45000,
  "20101": 180000, "20200": 45000, "20300": 12000,
  "30100": 1000000, "40100": 2800000, "50200": 450000,
};

// ─── Period options ───────────────────────────────────────────────────────────

const periods = [
  { value: "2026-27", label: "FY 2026-27" },
  { value: "2025-26", label: "FY 2025-26" },
  { value: "custom",  label: "Custom Range" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AccountDetailPage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const params = useParams();
  const id = params.id as string;
  const [period, setPeriod] = useState("fy");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [txSearch, setTxSearch] = useState("");

  const handlePeriodChange = (value: string) => {
    if (value === "custom") { setPeriod("custom"); return; }
    setFiscalYear(value);
    setPeriod("fy");
  };

  const handleCustomApply = () => {
    if (!customStart || !customEnd) { showToast.error("Select both start and end dates."); return; }
    showToast.success(`Filtered from ${customStart} to ${customEnd}`);
  };

  // tRPC queries (will be undefined until wired)
  const { data: _accounts }: any = api.accounts.list.useQuery();
  const { data: _ledgerData, isLoading }: any = api.balances.ledger.useQuery(
    { accountId: id, fiscalYear },
    { enabled: !!id }
  );

  // Fall back to mock + stored data
  const storedAccount = getAccounts().find(a => a.code === id || a.id === id);
  const account = _accounts?.find((a: any) => a.id === id)
    ?? MOCK_ACCOUNTS.find(a => a.id === id)
    ?? MOCK_ACCOUNTS.find(a => a.code === id)
    ?? (storedAccount ? {
      id: storedAccount.id,
      code: storedAccount.code,
      name: storedAccount.name,
      kind: storedAccount.kind.toLowerCase(),
      balance: 0,
      balanceType: "Dr",
    } : undefined);

  const mockTx = MOCK_TRANSACTIONS_BY_FY[fiscalYear] ?? MOCK_TRANSACTIONS_BY_FY['2026-27'];
  const transactions: Tx[] = _ledgerData?.transactions ?? mockTx;
  const openingBalance = _ledgerData?.openingBalance ?? (MOCK_OPENING_BALANCES[account?.code ?? ""] ?? 0);
  const closingBalance = _ledgerData?.closingBalance ?? (openingBalance + transactions.reduce((s, t) => s + t.debit - t.credit, 0));

  const filteredTxs = useMemo(() =>
    txSearch ? transactions.filter(t =>
      t.narration.toLowerCase().includes(txSearch.toLowerCase()) ||
      t.voucherNumber.toLowerCase().includes(txSearch.toLowerCase())
    ) : transactions,
    [txSearch, transactions]
  );

  const filteredClosingBalance = openingBalance + filteredTxs.reduce((s, t) => s + t.debit - t.credit, 0);

  let runningBalance = openingBalance;

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui text-[13px] text-mid">Account not found.</p>
        <Link href="/coa" className="mt-4 text-amber text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">
          Back to Chart of Accounts
        </Link>
      </div>
    );
  }

  const isDrNormally = account.kind === "asset" || account.kind === "expense";
  const balanceLabel = isDrNormally ? "Dr" : "Cr";
  const negateLabel = isDrNormally ? "Cr" : "Dr";

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
            <h1 className="font-display text-display-lg font-semibold text-dark tracking-tight">{account.name}</h1>
            <Badge variant={account.kind === "asset" ? "gray" : account.kind === "liability" ? "amber" : account.kind === "income" ? "success" : "gray"}>
              {account.kind}
            </Badge>
          </div>
          <p className="font-mono text-[13px] text-secondary">
            {account.code} · FY {fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { showToast.success("Statement exported."); }} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export Statement
          </button>
          <button onClick={() => { showToast.success("Edit mode opened."); }} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="edit" size={14} /> Edit Details
          </button>
        </div>
      </div>

      {/* Period selector + balance cards */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1 bg-surface-muted rounded-md p-0.5 border border-border">
          {periods.map(p => (
            <button
              key={p.value}
               onClick={() => handlePeriodChange(p.value)}
              className={`px-3 py-1.5 text-[11px] font-ui text-[13px] font-medium transition-colors cursor-pointer border-none rounded-sm ${
                p.value === "custom" ? (period === "custom") : (fiscalYear === p.value)
                  ? "bg-surface text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" className="bg-surface border border-border rounded-md px-3 py-1.5 text-[12px] font-mono" value={customStart} onChange={e => setCustomStart(e.target.value)} />
            <span className="text-light text-[10px]">to</span>
            <input type="date" className="bg-surface border border-border rounded-md px-3 py-1.5 text-[12px] font-mono" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            <button onClick={handleCustomApply} className="px-3 py-1.5 bg-amber text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-amber-hover cursor-pointer border-none">Apply</button>
          </div>
        )}
      </div>

      {/* Balance summary strip */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-5 shadow-sm rounded-md">
          <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-1">Opening Balance</p>
          <p className="font-mono text-xl text-dark tabular-nums">
            {formatIndianNumber(Math.abs(openingBalance), { currency: true })}{" "}
            <span className="text-[12px] text-mid font-ui text-[13px]">{openingBalance >= 0 ? balanceLabel : negateLabel}</span>
          </p>
        </div>
        <div className="bg-surface border border-border p-5 shadow-sm rounded-md border-l-4 border-l-amber">
          <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-1">Closing Balance</p>
          <p className="font-mono text-xl text-dark tabular-nums font-semibold">
            {formatIndianNumber(Math.abs(filteredClosingBalance), { currency: true })}{" "}
            <span className="text-[12px] text-mid font-ui text-[13px]">{filteredClosingBalance >= 0 ? balanceLabel : negateLabel}</span>
          </p>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden rounded-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted">
          <h2 className="font-ui text-[13px] font-bold text-dark uppercase tracking-widest">Transactions</h2>
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
            <input className="bg-surface border border-border text-[12px] font-ui px-8 py-1.5 w-52 rounded-md focus:ring-1 focus:ring-amber outline-none placeholder:text-light" placeholder="Search entries…" value={txSearch} onChange={e => setTxSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Voucher</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Narration</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">Debit</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">Credit</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center font-ui text-[13px] text-mid">Loading transactions…</td></tr>
              ) : filteredTxs.length > 0 ? (
                filteredTxs.map((txn, i) => {
                  runningBalance += txn.debit - txn.credit;
                  return (
                    <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-4 px-5 font-mono text-[12px] text-mid">
                        {new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] text-amber font-medium">
                        <Link href={`/journal/${txn.id}`} className="hover:underline no-underline">{txn.voucherNumber}</Link>
                      </td>
                      <td className="py-4 px-5 font-ui text-[13px] text-dark">{txn.narration}</td>
                      <td className="py-4 px-5 font-mono text-[12px] tabular-nums text-right">
                        {txn.debit > 0 ? formatIndianNumber(txn.debit, { currency: true }) : "—"}
                      </td>
                      <td className="py-4 px-5 font-mono text-[12px] tabular-nums text-right">
                        {txn.credit > 0 ? formatIndianNumber(txn.credit, { currency: true }) : "—"}
                      </td>
                      <td className={`py-4 px-5 font-mono text-[12px] tabular-nums text-right font-medium ${runningBalance >= 0 ? 'text-dark' : 'text-danger'}`}>
                        {formatIndianNumber(Math.abs(runningBalance))} {runningBalance >= 0 ? balanceLabel : negateLabel}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-12 text-center font-ui text-[13px] text-mid">No transactions found for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
