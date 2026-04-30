"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const ACCOUNTS = [
  { code: "10101", name: "Cash Account", type: "Asset", balance: 500000, balanceType: "Dr" },
  { code: "10200", name: "Bank Account", type: "Asset", balance: 1250000, balanceType: "Dr" },
  { code: "10300", name: "Trade Receivables", type: "Asset", balance: 350000, balanceType: "Dr" },
  { code: "20101", name: "Trade Payables", type: "Liability", balance: 180000, balanceType: "Cr" },
  { code: "40100", name: "Sales Revenue", type: "Income", balance: 2800000, balanceType: "Cr" },
  { code: "50200", name: "Operating Expenses", type: "Expense", balance: 450000, balanceType: "Dr" },
];

export default function AccountsFlatPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b-[2px] border-primary-container pb-4 mb-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-1">Chart of Accounts</h2>
          <p className="font-ui-sm text-sm text-text-mid">Flat ledger view of all registered accounts.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2 border-[0.5px] border-on-surface text-on-surface bg-white rounded-sm hover:bg-stone-50 transition-colors font-ui-sm text-xs font-bold uppercase tracking-widest cursor-pointer shadow-sm">
            <Icon name="download" className="text-[18px]" /> Export
          </button>
          <Link href="/accounts/new" className="flex items-center gap-2 px-5 py-2 bg-primary-container text-white rounded-sm hover:bg-primary transition-opacity font-ui-sm text-xs font-bold uppercase tracking-widest no-underline shadow-sm">
            <Icon name="add" className="text-[18px]" /> New Account
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 border-[0.5px] border-border-subtle shadow-sm mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]" />
            <input className="pl-9 pr-4 py-2 bg-stone-50 border-[0.5px] border-border-subtle rounded-sm text-sm outline-none focus:border-primary w-64" placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-2 font-ui-sm text-xs text-text-mid">
          <span>Showing {ACCOUNTS.length} of {ACCOUNTS.length} accounts</span>
          <div className="flex border-[0.5px] border-border-subtle rounded-sm overflow-hidden">
            <button className="p-1 bg-white hover:bg-stone-50 transition-colors border-none cursor-pointer disabled:opacity-50"><Icon name="chevron_left" className="text-[20px]" /></button>
            <button className="p-1 bg-white hover:bg-stone-50 transition-colors border-none cursor-pointer"><Icon name="chevron_right" className="text-[20px]" /></button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-primary-container"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle text-text-light font-ui-xs text-[10px] uppercase tracking-widest font-bold">
                <th className="py-3 px-4 w-32">Account Code</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4 w-24">Type</th>
                <th className="py-3 px-4 text-right w-48">Balance (₹)</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {ACCOUNTS.map((a) => (
                <tr key={a.code} className="hover:bg-stone-50/30 transition-colors">
                  <td className="py-4 px-4 text-on-surface">{a.code}</td>
                  <td className="py-4 px-4 font-ui-sm font-bold text-on-surface">
                    <Link href={`/accounts/${a.code}`} className="hover:text-primary no-underline">{a.name}</Link>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold border rounded-sm ${
                      a.type === 'Asset' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      a.type === 'Liability' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      a.type === 'Income' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>{a.type}</span>
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-on-surface">{formatIndianNumber(a.balance)} {a.balanceType}</td>
                  <td className="py-4 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="border-none bg-transparent cursor-pointer text-stone-400 hover:text-on-surface"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-stone-50 border-t border-on-surface font-bold">
              <tr>
                <td className="py-3 px-4 font-ui-sm text-xs text-right font-semibold" colSpan={3}>Total Net Balance:</td>
                <td className="py-3 px-4 font-mono text-right tabular-nums font-semibold text-on-surface">{formatIndianNumber(ACCOUNTS.reduce((s, a) => s + a.balance, 0))}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
