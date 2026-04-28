// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

const mockTransactions = [
  { id: "1", date: "15 Oct 24", type: "ITC Claim", taxType: "IGST", amount: 124500, balance: 4520500, ref: "GSTR-2B" },
  { id: "2", date: "10 Oct 24", type: "Tax Offset", taxType: "CGST", amount: -45000, balance: 4396000, ref: "GSTR-3B" },
  { id: "3", date: "05 Oct 24", type: "Cash Deposit", taxType: "Cess", amount: 25000, balance: 4421000, ref: "CH-88012" },
];

export default function GSTLedgerPage() {
  const [month, setMonth] = useState(7);
  const [year, setYear] = useState(2024);

  return (
    <div className="space-y-8 text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border-subtle pb-8 mt-4">
        <div>
          <h2 className="font-display-xl text-display-xl text-on-surface mb-2 font-bold">Electronic Credit Ledger</h2>
          <p className="font-ui-sm text-sm text-text-mid">Statement of Input Tax Credit for <span className="font-mono text-on-surface font-bold text-[13px]">GSTIN: 27AACPB1234F1Z5</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] uppercase text-text-mid font-bold tracking-widest">Tax Period</label>
            <div className="flex gap-2">
              <select className="bg-stone-50 border border-border-subtle rounded-sm py-2 px-3 text-xs outline-none focus:border-primary" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select className="bg-stone-50 border border-border-subtle rounded-sm py-2 px-3 text-xs outline-none focus:border-primary" value={year} onChange={e => setYear(Number(e.target.value))}>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Balances Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-text-light uppercase font-bold tracking-widest mb-4">Integrated Tax (IGST)</h3>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ 2,45,600.00</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-text-light">Electronic Cash</span>
             <span className="text-on-surface">₹ 45,000.00</span>
          </div>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-text-light uppercase font-bold tracking-widest mb-4">Central Tax (CGST)</h3>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ 1,12,040.50</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-text-light">Electronic Cash</span>
             <span className="text-on-surface">₹ 12,000.00</span>
          </div>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-text-light uppercase font-bold tracking-widest mb-4">State Tax (SGST)</h3>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ 1,12,040.50</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-text-light">Electronic Cash</span>
             <span className="text-on-surface">₹ 12,000.00</span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Ledger Transaction History</h3>
            <button className="text-primary hover:text-amber-stitch font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description / Ref</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Tax Type</th>
                <th className="py-4 px-6 text-right">Amount (₹)</th>
                <th className="py-4 px-6 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {mockTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-5 px-6 text-text-mid">{t.date}</td>
                  <td className="py-5 px-6 text-left">
                    <div className="font-ui-sm font-bold text-on-surface text-sm">{t.type}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{t.ref}</div>
                  </td>
                  <td className="py-5 px-6 font-ui-xs text-[10px] uppercase font-bold text-stone-500">Credit</td>
                  <td className="py-5 px-6 font-ui-sm font-bold text-on-surface">{t.taxType}</td>
                  <td className={`py-5 px-6 text-right font-bold ${t.amount < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {t.amount < 0 ? `(${formatIndianNumber(Math.abs(t.amount))})` : formatIndianNumber(t.amount)}
                  </td>
                  <td className="py-5 px-6 text-right text-on-surface">₹ {formatIndianNumber(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
