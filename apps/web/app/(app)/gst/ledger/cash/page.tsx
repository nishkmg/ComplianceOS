// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function GSTCashLedgerPage() {
  const mockBalances = {
    igst: 142500.00,
    cgst: 45200.00,
    sgst: 45200.00,
    cess: 0.00,
  };

  const mockTransactions = [
    { id: "1", date: "24 Oct 24", desc: "Cash Deposit via Challan", ref: "CPIN-880120421", type: "Deposit", amount: 125000, balance: 232900 },
    { id: "2", date: "20 Oct 24", desc: "Liability Payment Offset", ref: "GSTR-3B-SEP", type: "Utilization", amount: -45000, balance: 107900 },
  ];

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <header className="bg-white border-b-[0.5px] border-border-subtle px-8 py-10 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-amber-text font-ui-xs text-[10px] mb-2 uppercase tracking-widest font-bold">GSTIN: 27AABCU9603R1ZX</div>
            <h1 className="font-display-xl text-display-xl text-on-surface mb-1 font-bold">Cash Ledger</h1>
            <p className="font-ui-md text-sm text-text-mid">Electronic tracking of cash deposited to the GST portal.</p>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 p-1 rounded-sm border-[0.5px] border-border-subtle">
            <button className="px-4 py-1.5 font-ui-sm text-xs text-text-mid hover:text-on-surface transition-colors cursor-pointer border-none bg-transparent font-bold">Oct 2024</button>
            <div className="w-[1px] h-4 bg-border-subtle"></div>
            <button className="px-3 py-1.5 flex items-center text-text-mid hover:text-on-surface border-none bg-transparent cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12 pb-12">
        {/* KPI Balances */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(mockBalances).map(([key, val]) => (
            <div key={key} className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-6 shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="font-ui-xs text-[10px] text-text-light mb-3 uppercase tracking-widest font-bold">{key} Balance</div>
              <div className="font-mono text-xl font-bold text-on-surface">₹ {formatIndianNumber(val)}</div>
            </div>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Electronic Cash Statement</h3>
              <button className="text-primary hover:text-amber-stitch font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Download CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Reference / CPIN</th>
                  <th className="py-4 px-6 text-right">Amount (₹)</th>
                  <th className="py-4 px-6 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-section-muted/30 transition-colors">
                    <td className="py-5 px-6 text-text-mid">{t.date}</td>
                    <td className="py-5 px-6 font-ui-sm font-bold text-on-surface">{t.desc}</td>
                    <td className="py-5 px-6 text-text-mid uppercase">{t.ref}</td>
                    <td className={`py-5 px-6 text-right font-bold ${t.amount < 0 ? 'text-red-600' : 'text-green-700'}`}>₹ {formatIndianNumber(t.amount)}</td>
                    <td className="py-5 px-6 text-right font-bold text-on-surface">₹ {formatIndianNumber(t.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
