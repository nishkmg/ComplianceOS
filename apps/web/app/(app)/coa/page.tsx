"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  level: number;
  balance: number;
  balanceType: "dr" | "cr";
  hasChildren: boolean;
}

const MOCK_ACCOUNTS: Account[] = [
  { id: "1", code: "10000", name: "Assets", type: "asset", level: 0, balance: 0, balanceType: "dr", hasChildren: true },
  { id: "2", code: "11000", name: "Current Assets", type: "asset", level: 1, balance: 0, balanceType: "dr", hasChildren: true },
  { id: "3", code: "11100", name: "Cash & Bank", type: "asset", level: 2, balance: 1750000, balanceType: "dr", hasChildren: false },
  { id: "4", code: "11200", name: "Trade Receivables", type: "asset", level: 2, balance: 350000, balanceType: "dr", hasChildren: false },
  { id: "5", code: "11300", name: "Inventory", type: "asset", level: 2, balance: 450000, balanceType: "dr", hasChildren: false },
  { id: "6", code: "20000", name: "Liabilities", type: "liability", level: 0, balance: 0, balanceType: "cr", hasChildren: true },
  { id: "7", code: "21000", name: "Current Liabilities", type: "liability", level: 1, balance: 0, balanceType: "cr", hasChildren: true },
  { id: "8", code: "21100", name: "Trade Payables", type: "liability", level: 2, balance: 180000, balanceType: "cr", hasChildren: false },
  { id: "9", code: "21200", name: "GST Output", type: "liability", level: 2, balance: 45000, balanceType: "cr", hasChildren: false },
  { id: "10", code: "21300", name: "TDS Payable", type: "liability", level: 2, balance: 12000, balanceType: "cr", hasChildren: false },
  { id: "11", code: "30000", name: "Equity", type: "equity", level: 0, balance: 0, balanceType: "cr", hasChildren: true },
  { id: "12", code: "31000", name: "Capital Account", type: "equity", level: 1, balance: 1000000, balanceType: "cr", hasChildren: false },
  { id: "13", code: "32000", name: "Retained Earnings", type: "equity", level: 1, balance: 1358000, balanceType: "cr", hasChildren: false },
  { id: "14", code: "40000", name: "Income", type: "income", level: 0, balance: 0, balanceType: "cr", hasChildren: true },
  { id: "15", code: "41000", name: "Sales Revenue", type: "income", level: 1, balance: 500000, balanceType: "cr", hasChildren: false },
  { id: "16", code: "50000", name: "Expenses", type: "expense", level: 0, balance: 0, balanceType: "dr", hasChildren: true },
  { id: "17", code: "51000", name: "Operating Expenses", type: "expense", level: 1, balance: 125000, balanceType: "dr", hasChildren: false },
];

const typeColors: Record<string, string> = {
  asset: "bg-blue-50 text-blue-700 border-blue-200",
  liability: "bg-amber-50 text-amber-700 border-amber-200",
  equity: "bg-green-50 text-green-700 border-green-200",
  income: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expense: "bg-red-50 text-red-700 border-red-200",
};

const groupTypes = ["asset", "liability", "equity", "income", "expense"];

export default function CoAPage() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const toggle = (id: string) => {
    const next = new Set(collapsed);
    collapsed.has(id) ? next.delete(id) : next.add(id);
    setCollapsed(next);
  };

  const filtered = MOCK_ACCOUNTS.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.code.includes(search)) return false;
    return true;
  });

  const visible = filtered.filter((a) => {
    if (a.level === 0) return true;
    let parent = MOCK_ACCOUNTS.find((p) => filtered.some((c) => c.id === a.id && p.hasChildren && filtered.indexOf(p) < filtered.indexOf(a) && p.level < a.level));
    return !collapsed.has(a.id) || true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div className="text-left">
          <span className="text-amber-text font-ui-xs uppercase tracking-[0.2em] mb-2 block">Chart of Accounts</span>
          <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">Chart of Accounts</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm rounded hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="download" className="text-[18px]" /> Export
          </button>
          <Link href="/accounts/new" className="px-5 py-2 bg-primary-container text-white font-ui-sm rounded hover:bg-primary/90 transition-colors flex items-center gap-2 group no-underline">
            <Icon name="add" className="text-[18px]" /> Add Account
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {["all", ...groupTypes].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 font-ui-sm transition-colors cursor-pointer border-none ${
                typeFilter === t ? "text-on-surface border-b-[2px] border-primary-container" : "text-text-mid hover:text-on-surface"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <input className="bg-surface-container-low border-none text-ui-xs px-4 py-2 w-64 rounded-sm focus:ring-1 focus:ring-primary-container outline-none" placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
        <div className="h-[2px] w-full bg-primary-container"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F6] border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Code</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Account Name</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Type</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Debit (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {visible.map((acct) => (
                <tr key={acct.id} className={`hover:bg-stone-50 transition-colors ${acct.level === 0 ? 'font-bold bg-stone-50' : ''}`}>
                  <td className="py-3 px-6 font-mono-md text-text-mid">{acct.code}</td>
                  <td className={`py-3 px-6 font-ui-sm ${acct.level === 0 ? 'font-bold' : 'font-medium'} text-on-surface`} style={{ paddingLeft: `${20 + acct.level * 24}px` }}>
                    <div className="flex items-center gap-2">
                      {acct.hasChildren && (
                        <button onClick={() => toggle(acct.id)} className="text-text-light hover:text-on-surface cursor-pointer border-none bg-transparent p-0">
                          <Icon name={collapsed.has(acct.id) ? 'chevron_right' : 'expand_more'} className="text-[16px] transition-transform" />
                        </button>
                      )}
                      {acct.name}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${typeColors[acct.type] || ''}`}>
                      {acct.type}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono-md text-right">{acct.balanceType === 'dr' && acct.balance > 0 ? formatIndianNumber(acct.balance, { currency: true, decimals: 2 }) : "—"}</td>
                  <td className="py-3 px-6 font-mono-md text-right">{acct.balanceType === 'cr' && acct.balance > 0 ? formatIndianNumber(acct.balance, { currency: true, decimals: 2 }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
