"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  level: number;
  balance: number;
  balanceType: "dr" | "cr";
  hasChildren: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: Account[] = [
  { id: "1", code: "10000", name: "Assets",            type: "asset",     level: 0, balance: 2550000, balanceType: "dr", hasChildren: true },
  { id: "2", code: "11000", name: "Current Assets",    type: "asset",     level: 1, balance: 2550000, balanceType: "dr", hasChildren: true },
  { id: "3", code: "11100", name: "Cash & Bank",        type: "asset",     level: 2, balance: 1750000, balanceType: "dr", hasChildren: false },
  { id: "4", code: "11200", name: "Trade Receivables",  type: "asset",     level: 2, balance: 350000,  balanceType: "dr", hasChildren: false },
  { id: "5", code: "11300", name: "Inventory",          type: "asset",     level: 2, balance: 450000,  balanceType: "dr", hasChildren: false },
  { id: "6", code: "20000", name: "Liabilities",        type: "liability", level: 0, balance: 237000,  balanceType: "cr", hasChildren: true },
  { id: "7", code: "21000", name: "Current Liabilities",type: "liability", level: 1, balance: 237000,  balanceType: "cr", hasChildren: true },
  { id: "8", code: "21100", name: "Trade Payables",     type: "liability", level: 2, balance: 180000,  balanceType: "cr", hasChildren: false },
  { id: "9", code: "21200", name: "GST Output",         type: "liability", level: 2, balance: 45000,   balanceType: "cr", hasChildren: false },
  { id: "10",code: "21300", name: "TDS Payable",        type: "liability", level: 2, balance: 12000,   balanceType: "cr", hasChildren: false },
  { id: "11",code: "30000", name: "Equity",             type: "equity",    level: 0, balance: 2358000, balanceType: "cr", hasChildren: true },
  { id: "12",code: "31000", name: "Capital Account",    type: "equity",    level: 1, balance: 1000000, balanceType: "cr", hasChildren: false },
  { id: "13",code: "32000", name: "Retained Earnings",  type: "equity",    level: 1, balance: 1358000, balanceType: "cr", hasChildren: false },
  { id: "14",code: "40000", name: "Income",             type: "income",    level: 0, balance: 500000,  balanceType: "cr", hasChildren: true },
  { id: "15",code: "41000", name: "Sales Revenue",      type: "income",    level: 1, balance: 500000,  balanceType: "cr", hasChildren: false },
  { id: "16",code: "50000", name: "Expenses",           type: "expense",   level: 0, balance: 125000,  balanceType: "dr", hasChildren: true },
  { id: "17",code: "51000", name: "Op. Expenses",       type: "expense",   level: 1, balance: 125000,  balanceType: "dr", hasChildren: false },
];

// ─── Derived summary ──────────────────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  asset:     "Total Assets",
  liability: "Total Liabilities",
  equity:    "Total Equity",
  income:    "Total Income",
  expense:   "Total Expenses",
};

const typeBadgeColors: Record<string, string> = {
  asset:     "bg-blue-50 text-blue-700 border-blue-200",
  liability: "bg-amber-50 text-amber-700 border-amber-200",
  equity:    "bg-green-50 text-green-700 border-green-200",
  income:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  expense:   "bg-red-50 text-red-700 border-red-200",
};

const groupTypes = ["asset", "liability", "equity", "income", "expense"] as const;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CoAPage() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const summary = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const a of MOCK_ACCOUNTS) {
      if (a.level <= 1) continue; // only leaf + sub-group balances
      byType[a.type] = (byType[a.type] || 0) + a.balance;
    }
    const totalAssets  = byType.asset  || 0;
    const totalLiab    = byType.liability || 0;
    const totalEquity  = byType.equity   || 0;
    const totalIncome  = byType.income   || 0;
    const totalExpense = byType.expense  || 0;
    const netIncome    = totalIncome - totalExpense;
    return { totalAssets, totalLiab, totalEquity, netIncome };
  }, []);

  // Filter and flatten tree
  const visible = useMemo(() => {
    const filtered = MOCK_ACCOUNTS.filter(a => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.code.includes(search)) return false;
      return true;
    });
    // show if level 0, or any ancestor is not collapsed
    const result: Account[] = [];
    for (const a of filtered) {
      if (a.level === 0) { result.push(a); continue; }
      // walk up to find parent
      const ancestors: Account[] = [];
      let idx = filtered.indexOf(a) - 1;
      while (idx >= 0) {
        if (filtered[idx].level < a.level) ancestors.unshift(filtered[idx]);
        idx--;
      }
      const hasCollapsedAncestor = ancestors.some(p => collapsed.has(p.id));
      if (!hasCollapsedAncestor) result.push(a);
    }
    return result;
  }, [typeFilter, search, collapsed]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Chart of Accounts
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Chart of Accounts</h1>
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

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assets",     value: summary.totalAssets,  accent: "border-l-blue-500" },
          { label: "Total Liabilities",value: summary.totalLiab,    accent: "border-l-amber-500" },
          { label: "Total Equity",     value: summary.totalEquity,  accent: "border-l-green-500" },
          { label: "Net Income",       value: summary.netIncome,    accent: summary.netIncome >= 0 ? "border-l-emerald-500" : "border-l-red-500" },
        ].map(s => (
          <div key={s.label} className={`bg-white border border-border-subtle shadow-sm p-4 border-l-4 ${s.accent}`}>
            <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-mono text-lg tabular-nums ${s.value >= 0 ? 'text-dark' : 'text-danger'}`}>
              {formatIndianNumber(Math.abs(s.value), { currency: true })}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + search bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-section-muted rounded-sm p-0.5 border border-border-subtle">
          {["all", ...groupTypes].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-[11px] font-ui-sm font-medium transition-colors cursor-pointer border-none rounded-sm capitalize ${
                typeFilter === t
                  ? "bg-white text-dark shadow-sm"
                  : "text-mid hover:text-dark bg-transparent"
              }`}
            >
              {t === "all" ? "All" : t}
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

      {/* Tree table */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden rounded-sm">
        <div className="h-[2px] w-full bg-primary-container" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-border-subtle">
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest w-24">Code</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest">Account Name</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest w-24">Type</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-44">Debit (₹)</th>
                <th className="py-3 px-5 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-44">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {visible.map(acct => (
                <tr
                  key={acct.id}
                  className={`hover:bg-stone-50/50 transition-colors ${acct.level === 0 ? 'bg-stone-50 font-semibold' : ''}`}
                >
                  <td className="py-3 px-5 font-mono text-[12px] text-mid">{acct.code}</td>
                  <td
                    className="py-3 px-5 font-ui-sm text-[13px] text-dark"
                    style={{ paddingLeft: `${20 + acct.level * 24}px` }}
                  >
                    <div className="flex items-center gap-2">
                      {acct.hasChildren && (
                        <button
                          onClick={() => toggle(acct.id)}
                          className="text-light hover:text-dark cursor-pointer border-none bg-transparent p-0 transition-colors"
                          aria-label={collapsed.has(acct.id) ? "Expand" : "Collapse"}
                        >
                          <Icon
                            name={collapsed.has(acct.id) ? "chevron_right" : "expand_more"}
                            size={16}
                            className="transition-transform"
                          />
                        </button>
                      )}
                      <span className={acct.level === 0 ? 'font-semibold' : ''}>{acct.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border rounded-sm ${typeBadgeColors[acct.type] || ''}`}>
                      {acct.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 font-mono text-[12px] tabular-nums text-right">
                    {acct.balanceType === 'dr' && acct.balance > 0 ? formatIndianNumber(acct.balance, { currency: true, decimals: 2 }) : "—"}
                  </td>
                  <td className="py-3 px-5 font-mono text-[12px] tabular-nums text-right">
                    {acct.balanceType === 'cr' && acct.balance > 0 ? formatIndianNumber(acct.balance, { currency: true, decimals: 2 }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-ui-sm text-[13px] text-mid">No accounts match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
