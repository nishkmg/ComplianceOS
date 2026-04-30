"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

const tradingAccount = {
  credits: [
    { label: "Sales Revenue", amount: 12450000 },
    { label: "Closing Stock", amount: 850000 },
  ],
  debits: [
    { label: "Opening Stock", amount: 450000 },
    { label: "Purchases", amount: 8240000 },
    { label: "Direct Expenses", amount: 124500 },
  ],
  grossProfit: 4485500
};

const profitLossAccount = {
  credits: [
    { label: "Gross Profit b/d", amount: 4485500 },
    { label: "Other Income", amount: 24600 },
  ],
  debits: [
    { label: "Salaries & Wages", amount: 1245000 },
    { label: "Rent & Rates", amount: 450000 },
    { label: "Electricity & Water", amount: 85200 },
    { label: "Depreciation", amount: 248000 },
    { label: "Audit Fees", amount: 45000 },
    { label: "Miscellaneous Expenses", amount: 12400 },
  ],
  netProfit: 2684500
};

export default function ProfitLossPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  return (
    <div className="bg-page-bg text-on-surface font-ui-md min-h-screen">
      <main className="flex-1 pb-space-64 pt-6">
        <div className="max-w-[1000px] mx-auto px-gutter-desktop">
          {/* Header */}
          <div className="flex justify-between items-end mb-12 pb-4 border-b-[0.5px] border-border-subtle text-left">
            <div>
              <span className="font-ui-xs text-amber-text uppercase tracking-widest block mb-2 font-bold">Financial Performance</span>
              <h1 className="font-display-lg text-display-lg text-on-surface">Profit & Loss Account</h1>
            </div>
            <div className="flex gap-3">
              <select className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
                <option>2026-27</option>
                <option>2025-26</option>
              </select>
              <button className="px-4 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent rounded-sm uppercase font-bold tracking-widest text-xs">
                <Icon name="print" className="text-[18px]" />
                Print
              </button>
            </div>
          </div>

          {/* Report Paper */}
          <div className="bg-white border-[0.5px] border-border-subtle p-12 shadow-sm text-left">
            {/* Report Header */}
            <header className="text-center mb-12 pb-8 border-b-[0.5px] border-border-subtle">
              <h1 className="font-display text-[26px] font-normal text-dark mb-1 uppercase tracking-tight">Mehta Textiles Private Limited</h1>
              <h2 className="font-ui-lg text-text-mid uppercase tracking-widest mb-4">Trading and Profit & Loss Account</h2>
              <p className="font-ui-sm text-text-light italic">For the year ended 31 March 2027</p>
            </header>

            {/* Trading Account Section */}
            <section className="mb-16">
              <div className="bg-stone-50 px-4 py-2 border-l-2 border-amber-600 mb-4 flex justify-between items-center">
                 <h3 className="font-ui-sm font-bold text-on-surface text-xs uppercase tracking-widest">Part I: Trading Account</h3>
                 <span className="font-ui-xs text-[10px] text-text-light">FY 2026-27</span>
              </div>
              <div className="grid grid-cols-2 gap-0 border-[0.5px] border-border-subtle">
                {/* Debits side */}
                <div className="border-r-[0.5px] border-border-subtle">
                   <div className="bg-stone-50 p-2 border-b-[0.5px] border-border-subtle text-[10px] uppercase tracking-widest font-bold text-text-light px-4">Debits</div>
                   <div className="divide-y-[0.5px] divide-stone-50">
                      {tradingAccount.debits.map(d => (
                        <div key={d.label} className="flex justify-between p-4 text-ui-sm">
                           <span>{d.label}</span>
                           <span className="font-mono">₹ {formatIndianNumber(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between p-4 font-bold bg-stone-50/30">
                         <span>Gross Profit c/d</span>
                         <span className="font-mono">₹ {formatIndianNumber(tradingAccount.grossProfit)}</span>
                      </div>
                   </div>
                </div>
                {/* Credits side */}
                <div>
                   <div className="bg-stone-50 p-2 border-b-[0.5px] border-border-subtle text-[10px] uppercase tracking-widest font-bold text-text-light px-4 text-right">Credits</div>
                   <div className="divide-y-[0.5px] divide-stone-50">
                      {tradingAccount.credits.map(c => (
                        <div key={c.label} className="flex justify-between p-4 text-ui-sm">
                           <span>{c.label}</span>
                           <span className="font-mono">₹ {formatIndianNumber(c.amount)}</span>
                        </div>
                      ))}
                      <div className="p-4 flex justify-between font-bold h-[106px] items-end">
                         <span className="uppercase text-[10px] tracking-widest opacity-40">Trading Total</span>
                         <span className="font-mono">₹ {formatIndianNumber(13300000)}</span>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* P&L Account Section */}
            <section className="mb-12">
              <div className="bg-stone-50 px-4 py-2 border-l-2 border-primary-container mb-4 flex justify-between items-center">
                 <h3 className="font-ui-sm font-bold text-on-surface text-xs uppercase tracking-widest">Part II: Profit & Loss Account</h3>
              </div>
              <div className="grid grid-cols-12 gap-6">
                 <div className="col-span-8 space-y-4">
                    <div className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold border-b border-stone-100 pb-2">Administrative & Operating Expenses</div>
                    {profitLossAccount.debits.map(d => (
                      <div key={d.label} className="flex justify-between items-center text-ui-sm py-1">
                         <span className="text-text-mid">{d.label}</span>
                         <span className="font-mono text-on-surface">₹ {formatIndianNumber(d.amount)}</span>
                      </div>
                    ))}
                 </div>
                 <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-stone-50 p-6 border border-border-subtle rounded-sm">
                       <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4">Summary</p>
                       <div className="space-y-3">
                          <div className="flex justify-between text-ui-sm">
                             <span>Gross Operating Margin</span>
                             <span className="font-mono font-bold">36%</span>
                          </div>
                          <div className="flex justify-between text-ui-sm">
                             <span>Total Expenses</span>
                             <span className="font-mono">₹ 2.1M</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Net Result */}
              <div className="mt-12 bg-stone-900 text-white p-8 flex justify-between items-center">
                 <div className="text-left">
                    <h4 className="font-ui-lg text-lg font-bold text-amber-500 uppercase tracking-widest">Net Profit</h4>
                    <p className="text-stone-400 text-[11px] mt-1 uppercase tracking-widest">Transfer to Balance Sheet</p>
                 </div>
                 <div className="text-right">
                    <p className="font-mono text-3xl font-bold text-amber-500">₹ {formatIndianNumber(profitLossAccount.netProfit)}</p>
                 </div>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-[0.5px] border-border-subtle text-center">
              <p className="font-ui-xs text-text-light uppercase tracking-widest text-[10px]">Indelible Ledger Audit Trail Active · System generated on 24 Oct 2024</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
