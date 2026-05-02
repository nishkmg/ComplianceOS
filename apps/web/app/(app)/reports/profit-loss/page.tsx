"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const tradingAccount = {
  credits: [
    { label: "Sales Revenue",    amount: 12450000 },
    { label: "Closing Stock",    amount: 850000 },
  ],
  debits: [
    { label: "Opening Stock",    amount: 450000 },
    { label: "Purchases",        amount: 8240000 },
    { label: "Direct Expenses",  amount: 124500 },
  ],
  grossProfit: 4485500,
};

const profitLoss = {
  credits: [
    { label: "Gross Profit b/d", amount: 4485500 },
    { label: "Other Income",     amount: 24600 },
  ],
  debits: [
    { label: "Salaries & Wages",        amount: 1245000 },
    { label: "Rent & Rates",            amount: 450000 },
    { label: "Electricity & Water",     amount: 85200 },
    { label: "Depreciation",            amount: 248000 },
    { label: "Audit Fees",              amount: 45000 },
    { label: "Miscellaneous Expenses",  amount: 12400 },
  ],
  netProfit: 2684500,
};

const allDebits = [...tradingAccount.debits, ...profitLoss.debits];
const allCredits = [...tradingAccount.credits, ...profitLoss.credits];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ProfitLossPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  const totalDebits = allDebits.reduce((s, d) => s + d.amount, 0) + tradingAccount.grossProfit;
  const totalCredits = allCredits.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Financial Performance
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Profit & Loss Account</h1>
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
            href="/audit-log?report=pl"
            className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report paper */}
      <div className="bg-white border border-border-subtle shadow-sm rounded-sm max-w-[1000px]">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border-subtle">
          <h2 className="font-display text-[22px] text-dark uppercase">Mehta Textiles Private Limited</h2>
          <p className="font-ui-sm text-[12px] text-mid mt-1 uppercase tracking-widest">Trading and Profit & Loss Account</p>
          <p className="font-mono text-[11px] text-light mt-0.5 italic">For the year ended 31 March 2027 · FY {fiscalYear}</p>
        </div>

        <div className="px-8 py-6 space-y-10">
          {/* Part I: Trading Account */}
          <section>
            <div className="bg-stone-50 px-4 py-2 border-l-4 border-amber-text mb-4 flex justify-between items-center">
              <h3 className="font-ui-sm text-[12px] font-bold text-dark uppercase tracking-widest">Part I: Trading Account</h3>
              <span className="font-ui-xs text-[10px] text-light">FY {fiscalYear}</span>
            </div>
            <div className="grid grid-cols-2 gap-0 border border-border-subtle">
              {/* Debits */}
              <div className="border-r border-r-border-subtle">
                <div className="bg-stone-50 p-2 border-b border-border-subtle text-[10px] uppercase tracking-widest font-bold text-light px-5">Debits</div>
                {tradingAccount.debits.map(d => (
                  <div key={d.label} className="flex justify-between px-5 py-3 text-ui-sm border-b border-stone-50">
                    <span className="text-dark">{d.label}</span>
                    <span className="font-mono text-[13px] tabular-nums">₹ {formatIndianNumber(d.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 font-bold bg-section-muted border-b border-stone-50">
                  <span>Gross Profit c/d</span>
                  <span className="font-mono text-[13px]">₹ {formatIndianNumber(tradingAccount.grossProfit)}</span>
                </div>
              </div>
              {/* Credits */}
              <div>
                <div className="bg-stone-50 p-2 border-b border-border-subtle text-[10px] uppercase tracking-widest font-bold text-light px-5 text-right">Credits</div>
                {tradingAccount.credits.map(c => (
                  <div key={c.label} className="flex justify-between px-5 py-3 text-ui-sm border-b border-stone-50">
                    <span className="text-dark">{c.label}</span>
                    <span className="font-mono text-[13px] tabular-nums">₹ {formatIndianNumber(c.amount)}</span>
                  </div>
                ))}
                <div className="px-5 py-3 flex justify-between font-bold h-[106px] items-end">
                  <span className="uppercase text-[10px] tracking-widest text-light/60">Total</span>
                  <span className="font-mono text-[13px]">₹ {formatIndianNumber(sumBy(tradingAccount.credits, 'amount'))}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Part II: P&L Account */}
          <section>
            <div className="bg-stone-50 px-4 py-2 border-l-4 border-primary-container mb-4">
              <h3 className="font-ui-sm text-[12px] font-bold text-dark uppercase tracking-widest">Part II: Profit & Loss Account</h3>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7 space-y-4">
                <div className="font-ui-xs text-[10px] text-light uppercase tracking-widest font-bold border-b border-stone-100 pb-2">Expenses</div>
                {profitLoss.debits.map(d => (
                  <div key={d.label} className="flex justify-between items-center text-ui-sm py-1">
                    <span className="text-mid">{d.label}</span>
                    <span className="font-mono text-[13px] text-dark tabular-nums">₹ {formatIndianNumber(d.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-semibold border-t border-stone-100">
                  <span className="font-ui-xs text-[10px] uppercase text-mid">Total Expenses</span>
                  <span className="font-mono text-[13px]">₹ {formatIndianNumber(sumBy(profitLoss.debits, 'amount'))}</span>
                </div>
              </div>
              <div className="col-span-5 flex flex-col gap-6">
                <div className="bg-stone-50 p-5 border border-border-subtle rounded-sm">
                  <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-ui-sm">
                      <span>Gross Margin</span>
                      <span className="font-mono text-[13px] font-bold">36%</span>
                    </div>
                    <div className="flex justify-between text-ui-sm">
                      <span>Total Income</span>
                      <span className="font-mono text-[13px]">₹ {formatIndianNumber(sumBy(profitLoss.credits, 'amount'))}</span>
                    </div>
                    <div className="flex justify-between text-ui-sm">
                      <span>Total Expenses</span>
                      <span className="font-mono text-[13px]">₹ {formatIndianNumber(sumBy(profitLoss.debits, 'amount'))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Result */}
            <div className="mt-8 bg-section-dark text-white px-8 py-6 flex justify-between items-center rounded-sm">
              <div>
                <h4 className="font-ui-sm text-[13px] font-bold text-amber-text uppercase tracking-widest">Net Profit</h4>
                <p className="text-stone-400 text-[10px] mt-0.5 uppercase tracking-widest">Transfer to Balance Sheet</p>
              </div>
              <p className="font-mono text-2xl font-bold text-amber-text tabular-nums">₹ {formatIndianNumber(profitLoss.netProfit)}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border-subtle mx-8">
          <p className="font-ui-xs text-[10px] text-light">System generated · Ledger Audit Trail Active</p>
        </div>
      </div>
    </div>
  );
}

function sumBy(arr: { amount: number }[], _key: string): number {
  return arr.reduce((s, x) => s + x.amount, 0);
}
