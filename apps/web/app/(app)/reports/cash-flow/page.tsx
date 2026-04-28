// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

const cashFlowData = [
  { 
    title: "A. Cash from Operating Activities",
    items: [
      { label: "Profit Before Tax", amount: 2146000 },
      { label: "Adjustments for Depreciation", amount: 248000 },
      { label: "Interest Income", amount: -24600 },
      { label: "Working Capital Changes", amount: -452000 },
    ],
    total: 1917400
  },
  { 
    title: "B. Cash from Investing Activities",
    items: [
      { label: "Purchase of Fixed Assets", amount: -450000 },
      { label: "Proceeds from Sale of Investments", amount: 125000 },
      { label: "Interest Received", amount: 24600 },
    ],
    total: -300400
  },
  { 
    title: "C. Cash from Financing Activities",
    items: [
      { label: "Repayment of Bank Loan", amount: -250000 },
      { label: "Interest Paid", amount: -18500 },
    ],
    total: -268500
  },
];

export default function CashFlowPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-6 mt-4">
        <div>
          <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-2 block font-bold">Financial Report</span>
          <h1 className="font-display-xl text-3xl text-on-surface mb-2 font-bold">Statement of Cash Flows</h1>
          <p className="font-ui-sm text-sm text-text-mid leading-relaxed">For the year ended March 31, 2027 (Indirect Method)</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <button className="flex items-center gap-2 border-[0.5px] border-on-surface text-on-surface px-5 py-2.5 font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px]">print</span> Print
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white border-[0.5px] border-border-subtle rounded-lg p-12 shadow-sm max-w-[1000px] mx-auto">
        <header className="text-center mb-10 pb-8 border-b-[0.5px] border-border-subtle">
          <h1 className="font-display text-[26px] font-normal text-dark mb-1">Mehta Textiles Private Limited</h1>
          <h2 className="font-ui-lg text-text-mid uppercase tracking-widest mb-4">Cash Flow Statement</h2>
          <p className="font-ui-sm text-text-light mt-1 italic">For the year ended 31 March 2027 · FY {fiscalYear}</p>
        </header>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b-[1px] border-on-background pb-2 mb-4 font-ui-xs text-text-mid uppercase tracking-widest">
          <div className="col-span-8">Particulars</div>
          <div className="col-span-2 text-right">Current Period</div>
          <div className="col-span-2 text-right text-text-light">Previous Period</div>
        </div>

        {/* Sections */}
        {cashFlowData.map((section) => (
          <div key={section.title} className="mb-10">
            <div className="bg-stone-50 px-4 py-2 border-l-2 border-primary-container mb-4">
              <h3 className="font-ui-sm font-bold text-on-surface text-xs uppercase tracking-widest">{section.title}</h3>
            </div>
            {section.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <div className="col-span-8 font-ui-sm text-sm text-on-surface">{item.label}</div>
                <div className={`col-span-2 text-right font-mono text-sm ${item.amount < 0 ? 'text-red-600' : ''}`}>
                   {item.amount < 0 ? `(${formatIndianNumber(Math.abs(item.amount))})` : formatIndianNumber(item.amount)}
                </div>
                <div className="col-span-2 text-right font-mono text-sm text-text-light">
                   {formatIndianNumber(Math.abs(item.amount * 0.85))}
                </div>
              </div>
            ))}
            <div className="grid grid-cols-12 gap-4 py-4 bg-stone-50/50 font-bold border-t border-on-surface">
              <div className="col-span-8 font-ui-sm uppercase text-xs tracking-wide">Net Cash Flow from {section.title.split(' ')[2]}</div>
              <div className={`col-span-2 text-right font-mono text-sm ${section.total < 0 ? 'text-red-600' : ''}`}>₹ {formatIndianNumber(Math.abs(section.total))}</div>
              <div className="col-span-2"></div>
            </div>
          </div>
        ))}

        {/* Consolidation */}
        <div className="mt-12 bg-stone-900 text-white p-8 rounded-sm">
           <div className="flex justify-between items-center mb-4">
              <span className="font-ui-sm uppercase text-xs tracking-widest opacity-60">Net Change in Cash</span>
              <span className="font-mono text-xl">₹ {formatIndianNumber(1348500)}</span>
           </div>
           <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
              <span className="font-ui-sm uppercase text-xs tracking-widest font-bold text-amber-500">Closing Cash Balance</span>
              <span className="font-mono text-2xl font-bold text-amber-500">₹ {formatIndianNumber(4512890)}</span>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t-[0.5px] border-border-subtle text-center">
          <p className="font-ui-xs text-text-light">Prepared in accordance with AS-3 (Indirect Method). E&OE.</p>
        </div>
      </div>
    </div>
  );
}
