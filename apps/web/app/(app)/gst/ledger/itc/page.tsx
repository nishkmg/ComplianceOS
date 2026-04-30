"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

export default function ITCSubLedgerPage() {
  const [selectedTax, setSelectedTax] = useState("all");

  const mockTransactions = [
    { id: "1", date: "15 Oct 24", desc: "ITC on Capital Goods - B2B", ref: "SUP-8821", type: "IGST", amount: 45000, balance: 245600 },
    { id: "2", date: "12 Oct 24", desc: "ITC on Inward Supplies", ref: "SRV-9012", type: "CGST", amount: 12000, balance: 200600 },
  ];

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <header className="flex justify-between items-end mb-12 border-b-[0.5px] border-border-subtle pb-8 mt-4">
        <div>
          <p className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-3 font-bold text-[10px]">Financial Year 2024-25  |  GSTIN: 27AACCV1234F1Z5</p>
          <h1 className="font-display-xl text-display-xl text-on-surface font-bold">Input Tax Credit Ledger</h1>
          <p className="font-ui-sm text-sm text-text-mid mt-2 max-w-2xl leading-relaxed">A rigorous, chronological record of eligible credit availability, utilization against outward tax liability, and mandated reversals as per Rule 42/43.</p>
        </div>
        <div className="flex gap-4 no-print">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface rounded-sm font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent shadow-sm">
            <Icon name="filter_list" className="text-[18px]" /> Filter Period
          </button>
        </div>
      </header>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 text-text-mid">
            <Icon name="account_balance" className="text-primary-container text-[18px]" />
            <h3 className="font-ui-xs text-[10px] uppercase font-bold tracking-widest">Total Available</h3>
          </div>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ 2,45,600.00</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Utilized MTD</p>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ 85,000.00</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Pending Reversals</p>
          <p className="font-mono text-2xl font-bold text-on-surface">0</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Net Balance</p>
          <p className="font-mono text-2xl font-bold text-green-700">₹ 2,45,600.00</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Transaction History</h3>
            <div className="flex gap-4">
               <select className="bg-transparent border-[0.5px] border-border-subtle px-3 py-1 rounded text-xs outline-none font-ui-sm font-bold uppercase tracking-widest text-text-mid" value={selectedTax} onChange={e => setSelectedTax(e.target.value)}>
                  <option value="all">All Tax Types</option>
                  <option value="IGST">IGST Only</option>
                  <option value="CGST">CGST Only</option>
                  <option value="SGST">SGST Only</option>
               </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description / Reference</th>
                <th className="py-4 px-6">Tax Component</th>
                <th className="py-4 px-6 text-right">Addition (₹)</th>
                <th className="py-4 px-6 text-right">Utilization (₹)</th>
                <th className="py-4 px-6 text-right">Ledger Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {mockTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-5 px-6 text-text-mid">{t.date}</td>
                  <td className="py-5 px-6 text-left">
                    <div className="font-ui-sm font-bold text-on-surface text-sm">{t.desc}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{t.ref}</div>
                  </td>
                  <td className="py-5 px-6 font-ui-sm font-bold text-on-surface">{t.type}</td>
                  <td className="py-5 px-6 text-right text-green-700 font-bold">₹ {formatIndianNumber(t.amount)}</td>
                  <td className="py-5 px-6 text-right text-text-mid">—</td>
                  <td className="py-5 px-6 text-right font-bold text-on-surface">₹ {formatIndianNumber(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
