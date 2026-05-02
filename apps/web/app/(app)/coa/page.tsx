"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
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
  asset:     "Assets",
  liability: "Liabilities",
  equity:    "Equity",
  income:    "Income",
  expense:   "Expenses",
};

const groupTypes = ["asset", "liability", "equity", "income", "expense"] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoAPage() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [addFormOpen, setAddFormOpen] = useState<Set<string>>(new Set());
  const [newAccountName, setNewAccountName] = useState("");

  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAddForm = (type: string) => {
    setAddFormOpen(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const summary = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const a of MOCK_ACCOUNTS) {
      if (a.level <= 1) continue;
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

  const groupedAccounts = useMemo(() => {
    const filtered = MOCK_ACCOUNTS.filter(a => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.code.includes(search)) return false;
      return true;
    });

    const groups: Record<string, Account[]> = {};
    for (const type of groupTypes) {
      groups[type] = filtered.filter(a => a.type === type);
    }
    return groups;
  }, [typeFilter, search]);

  const groupTotal = (accounts: Account[]) => {
    return accounts
      .filter(a => a.level >= 2)
      .reduce((sum, a) => sum + a.balance, 0);
  };

  const groupBalanceType = (type: string): "dr" | "cr" => {
    return ["asset", "expense"].includes(type) ? "dr" : "cr";
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            Chart of Accounts
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Chart of Accounts</h1>
        </div>
        <div className="flex gap-3 no-print">
          <button className="btn-secondary flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export
          </button>
          <Link
            href="/accounts/new"
            className="btn-primary no-underline flex items-center gap-1.5"
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
          <div key={s.label} className={`bg-surface border border-border shadow-sm p-4 border-l-4 ${s.accent}`}>
            <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-mono text-lg tabular-nums ${s.value >= 0 ? 'text-dark' : 'text-danger'}`}>
              {formatIndianNumber(Math.abs(s.value), { currency: true })}
            </p>
          </div>
        ))}
      </div>

      {/* Filter + search bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex gap-1 bg-surface-muted rounded-md p-0.5 border border-border">
          {["all", ...groupTypes].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 font-ui text-[13px] font-medium transition-colors cursor-pointer border-none rounded-md capitalize ${
                typeFilter === t
                  ? "bg-surface text-dark shadow-sm"
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
            className="bg-surface border border-border text-[12px] font-ui px-8 py-1.5 w-56 rounded-md focus:ring-1 focus:ring-amber outline-none placeholder:text-light"
            placeholder="Search accounts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grouped Account Sections */}
      <div className="space-y-6">
        {groupTypes.map(type => {
          const accounts = groupedAccounts[type];
          if (!accounts || accounts.length === 0) return null;

          const total = groupTotal(accounts);
          const balType = groupBalanceType(type);
          const isCollapsed = collapsed.has(type);

          return (
            <div key={type} className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
              {/* Section Header */}
              <div className="border-t-2 border-t-amber bg-surface-muted/50">
                <button
                  onClick={() => toggle(type)}
                  className="w-full flex items-center justify-between px-5 py-3 cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      name={isCollapsed ? "chevron_right" : "expand_more"}
                      size={18}
                      className="text-mid transition-transform"
                    />
                    <h2 className="font-display text-[16px] font-semibold text-dark">
                      {typeLabels[type]}
                    </h2>
                    <span className="font-ui text-[10px] uppercase tracking-widest text-light">
                      {accounts.length} accounts
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={balType === "cr" ? "success" : "amber"}>
                      {balType === "cr" ? "Cr" : "Dr"}
                    </Badge>
                    <span className="font-mono text-[13px] tabular-nums text-dark font-medium">
                      {formatIndianNumber(total, { currency: true })}
                    </span>
                  </div>
                </button>
              </div>

              {/* Account Table */}
              {!isCollapsed && (
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-muted border-b border-border">
                        <th className="py-2 px-5 font-ui text-[10px] text-light uppercase tracking-widest w-24">Code</th>
                        <th className="py-2 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Account Name</th>
                        <th className="py-2 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right w-32">Balance</th>
                        <th className="py-2 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-center w-16">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {accounts.map(acct => (
                        <tr
                          key={acct.id}
                          className="hover:bg-surface-muted/50 transition-colors"
                          style={{ backgroundColor: acct.level === 0 ? 'var(--color-surface-muted)' : undefined }}
                        >
                          <td className="py-2.5 px-5 font-mono text-[11px] text-mid">{acct.code}</td>
                          <td
                            className="py-2.5 px-5 font-ui text-[13px] text-dark"
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
                                    size={14}
                                    className="transition-transform"
                                  />
                                </button>
                              )}
                              <span className={acct.level <= 1 ? 'font-semibold' : ''}>{acct.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-5 text-right">
                            <span className="font-mono text-[13px] tabular-nums text-dark">
                              {formatIndianNumber(acct.balance, { currency: true })}
                            </span>
                          </td>
                          <td className="py-2.5 px-5 text-center">
                            <Badge variant={acct.balanceType === "cr" ? "success" : "amber"}>
                              {acct.balanceType.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Inline Add Form */}
                  <div className="px-5 py-3 bg-surface-muted/30 border-t border-border-subtle no-print">
                    {addFormOpen.has(type) ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={newAccountName}
                          onChange={e => setNewAccountName(e.target.value)}
                          placeholder={`New ${typeLabels[type]} account name…`}
                          className="flex-1 bg-surface border border-border text-[12px] font-ui px-3 py-1.5 rounded-md focus:ring-1 focus:ring-amber outline-none placeholder:text-light max-w-xs"
                          autoFocus
                        />
                        <button
                          onClick={() => { setNewAccountName(""); toggleAddForm(type); }}
                          className="text-mid hover:text-dark cursor-pointer border-none bg-transparent p-1"
                        >
                          <Icon name="close" size={14} />
                        </button>
                        <button
                          onClick={() => { setNewAccountName(""); toggleAddForm(type); }}
                          className="bg-amber text-white text-[11px] font-ui font-bold uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-amber-hover cursor-pointer border-none"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAddForm(type)}
                        className="flex items-center gap-1.5 text-mid hover:text-amber transition-colors cursor-pointer border-none bg-transparent font-ui text-[11px] uppercase tracking-wider font-bold"
                      >
                        <Icon name="add" size={12} /> Add Account
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {Object.values(groupedAccounts).every(g => g.length === 0) && (
        <div className="py-12 text-center">
          <p className="font-ui text-[13px] text-mid">No accounts match your criteria.</p>
        </div>
      )}
    </div>
  );
}
