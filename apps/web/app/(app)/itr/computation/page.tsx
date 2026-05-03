"use client";

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

const incomeData = {
  salary: {
    label: "Salaries",
    items: [
      { label: "Basic Salary", amount: 1800000 },
      { label: "House Rent Allowance", amount: 720000 },
      { label: "Special Allowance", amount: 480000 },
      { label: "Employer\u2019s Contribution to PF", amount: 216000 },
    ],
    total: 3216000,
  },
  business: {
    label: "Profits and Gains of Business or Profession",
    items: [
      { label: "Net Profit from Business", amount: 3500000 },
      { label: "Depreciation under IT Act", amount: 248000 },
    ],
    total: 3748000,
  },
  capitalGains: {
    label: "Capital Gains",
    items: [
      { label: "Long Term Capital Gains (Equity)", amount: 125000 },
      { label: "Short Term Capital Gains", amount: 45000 },
    ],
    total: 170000,
  },
  otherSources: {
    label: "Income from Other Sources",
    items: [
      { label: "Interest on Fixed Deposits", amount: 85000 },
      { label: "Dividend Income", amount: 24000 },
      { label: "Income from Royalty", amount: 16000 },
    ],
    total: 125000,
  },
};

const deductionData = {
  section80C: {
    label: "Section 80C",
    limit: 150000,
    items: [
      { label: "Life Insurance Premium", amount: 36000 },
      { label: "Public Provident Fund (PPF)", amount: 72000 },
      { label: "ELSS Mutual Funds", amount: 42000 },
    ],
    total: 150000,
  },
  section80D: {
    label: "Section 80D — Health Insurance",
    limit: 25000,
    items: [
      { label: "Health Insurance (Self & Family)", amount: 18000 },
      { label: "Health Insurance (Parents)", amount: 12000 },
    ],
    total: 25000,
  },
  otherDeductions: {
    label: "Other Deductions",
    items: [
      { label: "Section 80G — Donations", amount: 12000 },
      { label: "Section 80TTA — Savings Interest", amount: 10000 },
      { label: "Section 80E — Education Loan Interest", amount: 36000 },
    ],
    total: 58000,
  },
};

const taxComputationOld = {
  taxableIncome: 7253000,
  taxOnIncome: 2090900,
  rebate: 0,
  surcharge: 0,
  cess: 83636,
  totalTax: 2174536,
};

const taxComputationNew = {
  taxableIncome: 7253000,
  taxOnIncome: 1875900,
  rebate: 0,
  surcharge: 0,
  cess: 75036,
  totalTax: 1950936,
};

export default function ITRComputationPage() {
  const { activeFy: selectedFY, setActiveFy: setSelectedFY } = useFiscalYear();
  const [regime, setRegime] = useState<"old" | "new">("old");

  const tax = regime === "old" ? taxComputationOld : taxComputationNew;
  const totalIncome = Object.values(incomeData).reduce((s, sec) => s + sec.total, 0);
  const totalDeductions = Object.values(deductionData).reduce((s, sec) => s + sec.total, 0);

  return (
    <div className="space-y-0 text-left">
      {/* Sticky Header */}
      <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mx-8 -mt-8 mb-8 bg-surface/50 sticky top-0 z-20 backdrop-blur-sm print:static print:bg-white print:border-black">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2 print:text-black">AY 2026-27 | Individual</p>
          <h1 className="font-display text-2xl font-semibold text-dark print:text-black">ITR Computation</h1>
        </div>
        <div className="flex flex-wrap gap-3 items-center print:hidden">
          <select
            className="bg-surface border border-border px-3 py-2 text-[12px] font-ui outline-none rounded-md"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
          <Button variant="outline" size="sm">Save Draft</Button>
          <Button size="sm" className="gap-2">
            Finalize Return <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Summary Bento */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-t-2 border-t-amber rounded-none rounded-b-xl shadow-sm print:border-black">
            <CardContent className="p-6">
              <p className="text-[10px] text-mid font-bold uppercase tracking-widest mb-2">Gross Total Income</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-stone-800 rounded-none rounded-b-xl shadow-sm print:border-black">
            <CardContent className="p-6">
              <p className="text-[10px] text-mid font-bold uppercase tracking-widest mb-2">Total Deductions</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(totalDeductions)}</p>
            </CardContent>
          </Card>
          <Card className="border-t-2 border-t-stone-800 rounded-none rounded-b-xl shadow-sm print:border-black">
            <CardContent className="p-6">
              <p className="text-[10px] text-mid font-bold uppercase tracking-widest mb-2">Net Taxable Income</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(tax.taxableIncome)}</p>
            </CardContent>
          </Card>
          <Card className="bg-dark text-white border-stone-950 border-t-2 border-t-stone-700 rounded-none rounded-b-xl shadow-lg print:bg-white print:text-black print:border-black">
            <CardContent className="p-6">
              <p className="text-[10px] text-light font-bold uppercase tracking-widest mb-2 print:text-mid">Net Tax Payable</p>
              <p className="font-mono text-2xl font-bold text-amber-text tabular-nums print:text-black">₹ {formatIndianNumber(tax.totalTax)}</p>
            </CardContent>
          </Card>
        </section>

        {/* Regime Toggle */}
        <div className="flex items-center gap-4 print:hidden">
          <span className="font-ui text-[10px] uppercase tracking-widest text-mid font-bold">Tax Regime</span>
          <div className="flex bg-surface-muted border border-border rounded-md p-1">
            <button
              onClick={() => setRegime("old")}
              className={`px-4 py-1.5 text-[12px] font-ui font-medium rounded-sm transition-all cursor-pointer border-none ${regime === "old" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
            >
              Old Regime
            </button>
            <button
              onClick={() => setRegime("new")}
              className={`px-4 py-1.5 text-[12px] font-ui font-medium rounded-sm transition-all cursor-pointer border-none ${regime === "new" ? "bg-surface text-dark shadow-sm" : "text-mid hover:text-dark bg-transparent"}`}
            >
              New Regime
            </button>
          </div>
          <span className="font-ui text-[11px] text-amber font-medium">
            {regime === "old" ? "Higher deductions, lower taxable income" : "Lower rates, fewer deductions"}
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Income + Deductions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Income Sections */}
            <Card className="shadow-sm rounded-none border border-border print:border-black">
              <CardHeader className="px-6 py-4 bg-surface-muted border-b border-border">
                <h3 className="font-ui text-[11px] font-bold text-dark uppercase tracking-widest">Income Details</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y-[0.5px] divide-border-subtle">
                  {Object.entries(incomeData).map(([key, section]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center px-6 py-3 bg-surface-muted/40">
                        <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-mid">{section.label}</span>
                        <span className="font-mono text-[13px] font-bold tabular-nums text-dark">₹ {formatIndianNumber(section.total)}</span>
                      </div>
                      {section.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center px-6 py-3 hover:bg-surface-muted/50 transition-colors">
                          <span className="font-ui text-[13px] text-dark pl-4">{item.label}</span>
                          <span className="font-mono text-[13px] tabular-nums text-dark">₹ {formatIndianNumber(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-6 py-4 bg-surface-muted font-bold border-t border-border">
                    <span className="font-ui text-[11px] uppercase tracking-widest text-dark">Gross Total Income</span>
                    <span className="font-mono text-[14px] tabular-nums text-dark">₹ {formatIndianNumber(totalIncome)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card className="shadow-sm rounded-none border border-border print:border-black">
              <CardHeader className="px-6 py-4 bg-surface-muted border-b border-border">
                <h3 className="font-ui text-[11px] font-bold text-dark uppercase tracking-widest">Deductions under Chapter VI-A</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y-[0.5px] divide-border-subtle">
                  {Object.entries(deductionData).map(([key, section]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center px-6 py-3 bg-surface-muted/40">
                        <span className="font-ui text-[11px] font-bold uppercase tracking-wider text-mid">{section.label}</span>
                        <span className="font-mono text-[13px] font-bold tabular-nums text-dark">₹ {formatIndianNumber(section.total)}</span>
                      </div>
                      {section.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center px-6 py-3 hover:bg-surface-muted/50 transition-colors">
                          <span className="font-ui text-[13px] text-dark pl-4">{item.label}</span>
                          <span className="font-mono text-[13px] tabular-nums text-danger">−₹ {formatIndianNumber(item.amount)}</span>
                        </div>
                      ))}
                      {"limit" in section && (
                        <div className="px-6 py-1.5 text-[10px] font-ui text-light">
                          Limit: ₹ {formatIndianNumber(section.limit)} | Utilized: {Math.round((section.total / section.limit) * 100)}%
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-6 py-4 bg-surface-muted font-bold border-t border-border">
                    <span className="font-ui text-[11px] uppercase tracking-widest text-dark">Total Deductions</span>
                    <span className="font-mono text-[14px] tabular-nums text-danger">−₹ {formatIndianNumber(totalDeductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Tax Computation */}
          <div className="space-y-6">
            <Card className="bg-dark text-zinc-100 overflow-hidden shadow-xl border border-stone-800 rounded-none print:bg-white print:text-black print:border-black">
              <CardHeader className="p-6 border-b border-stone-800 print:border-black">
                <h3 className="font-display text-lg font-bold text-amber-text mb-1 print:text-black">Tax Computation</h3>
                <p className="text-[10px] text-light font-bold uppercase tracking-widest print:text-mid">
                  {regime === "old" ? "Old Tax Regime" : "New Tax Regime"} Applied
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-800 font-mono text-sm print:divide-black">
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs text-light uppercase tracking-wide print:text-mid">Net Taxable Income</span>
                    <span className="tabular-nums">₹ {formatIndianNumber(tax.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs text-light uppercase tracking-wide print:text-mid">Tax on Normal Income</span>
                    <span className="tabular-nums">₹ {formatIndianNumber(tax.taxOnIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs text-light uppercase tracking-wide print:text-mid">Rebate u/s 87A</span>
                    <span className="tabular-nums">₹ {formatIndianNumber(tax.rebate)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs text-light uppercase tracking-wide print:text-mid">Surcharge</span>
                    <span className="tabular-nums">₹ {formatIndianNumber(tax.surcharge)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs text-light uppercase tracking-wide print:text-mid">Health & Education Cess @ 4%</span>
                    <span className="tabular-nums">₹ {formatIndianNumber(tax.cess)}</span>
                  </div>
                  <div className="flex justify-between items-center px-6 py-6 bg-stone-950 font-bold text-lg print:bg-surface-muted">
                    <span className="text-xs text-amber-text uppercase tracking-widest print:text-black">Total Tax Liability</span>
                    <span className="text-amber-text tabular-nums print:text-black">₹ {formatIndianNumber(tax.totalTax)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border border-amber/30 shadow-sm print:border-black">
              <CardContent className="p-6">
                <h4 className="font-ui text-[10px] font-bold text-amber-900 mb-2 uppercase tracking-widest">Optimization Tip</h4>
                <p className="font-ui text-[13px] text-amber-800 leading-relaxed">
                  You haven&apos;t fully utilized the 80C deduction limit of ₹ 1.5L. Adding ₹ 24,000 more could save ₹ 7,200 in tax under the Old Regime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
