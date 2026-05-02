"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const sections = [
  {
    title: "A. Cash from Operating Activities",
    items: [
      { label: "Profit Before Tax",                    amount: 2146000 },
      { label: "Adjustments for Depreciation",          amount: 248000 },
      { label: "Interest Income",                       amount: -24600 },
      { label: "Working Capital Changes",               amount: -452000 },
    ],
    total: 1917400,
  },
  {
    title: "B. Cash from Investing Activities",
    items: [
      { label: "Purchase of Fixed Assets",              amount: -450000 },
      { label: "Proceeds from Sale of Investments",     amount: 125000 },
      { label: "Interest Received",                     amount: 24600 },
    ],
    total: -300400,
  },
  {
    title: "C. Cash from Financing Activities",
    items: [
      { label: "Repayment of Bank Loan",                amount: -250000 },
      { label: "Interest Paid",                         amount: -18500 },
    ],
    total: -268500,
  },
];

const netChange = sections.reduce((s, sec) => s + sec.total, 0);
const closingCash = 4512890;

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CashFlowPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Financial Report
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Statement of Cash Flows</h1>
          <p className="font-ui-sm text-sm text-mid mt-1">For the year ended March 31, 2027 (Indirect Method)</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-white border border-border-subtle px-3 py-1.5 text-[12px] font-ui outline-none rounded-sm"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="print" size={14} /> Print
          </button>
          <Link
            href="/audit-log?report=cash-flow"
            className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <div className="bg-white border border-border-subtle shadow-sm rounded-sm max-w-[1000px]">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border-subtle">
          <h2 className="font-display text-[22px] text-dark mb-1">Mehta Textiles Private Limited</h2>
          <p className="font-ui-sm text-[12px] text-mid uppercase tracking-widest mb-1">Cash Flow Statement</p>
          <p className="font-mono text-[11px] text-light italic">For the year ended 31 March 2027 · FY {fiscalYear}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-8 pt-6 pb-2 border-b border-dark font-ui-xs text-[10px] text-light uppercase tracking-widest">
          <div className="col-span-8">Particulars</div>
          <div className="col-span-2 text-right">Current Period (₹)</div>
          <div className="col-span-2 text-right text-light/60">Previous Period (₹)</div>
        </div>

        {/* Sections */}
        <div className="px-8 py-4 space-y-8">
          {sections.map(section => (
            <div key={section.title}>
              <div className="bg-stone-50 px-4 py-2 border-l-4 border-primary-container mb-4">
                <h3 className="font-ui-sm text-[12px] font-bold text-dark uppercase tracking-widest">{section.title}</h3>
              </div>
              {section.items.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="col-span-8 font-ui-sm text-[13px] text-dark">{item.label}</div>
                  <div className={`col-span-2 text-right font-mono text-[13px] tabular-nums ${
                    item.amount < 0 ? 'text-danger' : 'text-dark'
                  }`}>
                    {item.amount < 0
                      ? `(${formatIndianNumber(Math.abs(item.amount))})`
                      : formatIndianNumber(item.amount)}
                  </div>
                  <div className="col-span-2 text-right font-mono text-[13px] tabular-nums text-light">
                    {formatIndianNumber(Math.abs(Math.round(item.amount * 0.85)))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-4 py-3 bg-section-muted font-semibold border-t border-border-subtle">
                <div className="col-span-8 font-ui-xs text-[10px] uppercase tracking-wider">
                  Net Cash from {section.title.split(" ")[2]}
                </div>
                <div className={`col-span-2 text-right font-mono text-[13px] tabular-nums ${
                  section.total < 0 ? 'text-danger' : 'text-dark'
                }`}>
                  {section.total < 0
                    ? `(${formatIndianNumber(Math.abs(section.total))})`
                    : formatIndianNumber(section.total)}
                </div>
                <div className="col-span-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Consolidation */}
        <div className="mx-8 mb-8 bg-section-dark text-white px-8 py-6 rounded-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="font-ui-xs text-[10px] uppercase tracking-widest text-stone-400">Net Change in Cash</span>
            <span className="font-mono text-lg tabular-nums">₹ {formatIndianNumber(Math.abs(netChange))}</span>
          </div>
          <div className="flex justify-between items-center border-t border-stone-700 pt-4 mt-4">
            <span className="font-ui-sm text-[12px] uppercase tracking-widest font-bold text-amber-text">
              Closing Cash Balance
            </span>
            <span className="font-mono text-2xl font-bold text-amber-text tabular-nums">
              ₹ {formatIndianNumber(closingCash)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border-subtle mx-8">
          <p className="font-ui-xs text-[10px] text-light">Prepared in accordance with AS-3 (Indirect Method). E&OE.</p>
        </div>
      </div>
    </div>
  );
}
