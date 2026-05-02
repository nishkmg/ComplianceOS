"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const comparisonData = [
  { label: "Total Gross Income", old: 4075000, new: 4075000 },
  { label: "Standard Deduction", old: 50000, new: 50000 },
  { label: "80C Deductions", old: 150000, new: 0 },
  { label: "80D Health Insurance", old: 25000, new: 0 },
  { label: "Section 24 (Home Loan)", old: 200000, new: 0 },
  { label: "Total Taxable Income", old: 3650000, new: 4025000 },
  { label: "Computed Tax", old: 1045200, new: 1000000 },
];

export default function ITRRegimeComparisonPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
        <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Assessment Year 2024-25</p>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">Regime Comparison</h1>
        <p className="font-ui text-[13px] text-secondary max-w-2xl leading-relaxed">A detailed analysis of tax liability under the Old and New tax regimes based on current inputs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-zinc-200 text-dark py-2 px-4 rounded-md font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-surface shadow-sm">
            <Icon name="print" className="text-sm" /> Print Analysis
          </button>
          <button className="bg-amber text-white py-2 px-6 rounded-md font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors flex items-center gap-2 cursor-pointer border-none shadow-sm">
            Select Regime
          </button>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="bg-success-bg border border-green-200 p-6 mb-12 flex items-start gap-4">
        <Icon name="check_circle" className="text-success text-3xl" />
        <div>
          <h3 className="font-display text-lg text-lg font-bold text-dark mb-1">New Regime Recommended</h3>
          <p className="font-ui text-[13px] text-mid">Opting for the New Regime saves <span className="font-mono text-dark font-bold text-base">₹ 45,200</span> in total tax liability for the current assessment year.</p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Old Regime Card */}
        <div className="bg-surface border border-border shadow-sm flex flex-col">
          <div className="p-6 border-b-[0.5px] border-border bg-surface-muted">
            <h3 className="font-display text-lg text-lg font-bold text-mid uppercase tracking-widest text-xs">Old Tax Regime</h3>
          </div>
          <div className="flex-1 divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
            {comparisonData.map((row, i) => (
              <div key={i} className="flex justify-between items-center p-6 hover:bg-surface-muted transition-colors">
                <span className="font-ui text-[13px] text-mid text-xs uppercase tracking-wider">{row.label}</span>
                <span className="text-dark">₹ {formatIndianNumber(row.old)}</span>
              </div>
            ))}
          </div>
          <div className="p-8 bg-surface-muted border-t-2 border-stone-800">
            <div className="flex justify-between items-center">
              <span className="font-ui text-[13px] font-bold uppercase tracking-widest text-xs text-mid">Final Liability</span>
              <span className="font-mono text-xl font-bold text-dark">₹ {formatIndianNumber(1045200)}</span>
            </div>
          </div>
        </div>

        {/* New Regime Card */}
        <div className="bg-surface border border-amber shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
          <div className="p-6 border-b-[0.5px] border-amber/20 bg-amber-50">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg text-lg font-bold text-primary uppercase tracking-widest text-xs">New Tax Regime</h3>
              <span className="bg-primary text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest">Recommended</span>
            </div>
          </div>
          <div className="flex-1 divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
            {comparisonData.map((row, i) => (
              <div key={i} className="flex justify-between items-center p-6 hover:bg-amber-50/50 transition-colors">
                <span className="font-ui text-[13px] text-mid text-xs uppercase tracking-wider">{row.label}</span>
                <span className={row.new === 0 ? "text-light opacity-50" : "text-dark"}>₹ {formatIndianNumber(row.new)}</span>
              </div>
            ))}
          </div>
          <div className="p-8 bg-amber-50 border-t-2 border-primary">
            <div className="flex justify-between items-center">
              <span className="font-ui text-[13px] font-bold uppercase tracking-widest text-xs text-primary">Final Liability</span>
              <span className="font-mono text-xl font-bold text-primary">₹ {formatIndianNumber(1000000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
