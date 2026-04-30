"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const computationRows = [
  { label: "Income from Business/Profession", amount: 3500000, type: "income" },
  { label: "Income from House Property", amount: 450000, type: "income" },
  { label: "Income from Other Sources", amount: 125000, type: "income" },
  { label: "Gross Total Income", amount: 4075000, type: "total" },
  { label: "Chapter VI-A Deductions", amount: 150000, type: "deduction" },
  { label: "Total Taxable Income", amount: 3925000, type: "total" },
];

export default function ITRComputationPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Page Title & Actions */}
      <div className="px-8 py-8 border-b border-border-subtle flex justify-between items-end -mx-8 -mt-8 mb-8 bg-white/50 sticky top-0 z-20 backdrop-blur-sm">
        <div>
          <p className="font-ui-xs text-xs text-amber-text uppercase tracking-widest mb-1 font-bold">AY 2024-25 | Individual</p>
          <h2 className="text-3xl font-display-xl font-bold text-on-surface">ITR Computation</h2>
        </div>
        <div className="flex gap-3">
          <button className="border border-stone-300 text-stone-700 px-6 py-2 rounded-sm text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer bg-white shadow-sm">Save Draft</button>
          <button className="bg-primary-container text-white px-6 py-2 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 cursor-pointer border-none font-bold uppercase tracking-widest">
            Finalize Return <Icon name="arrow_forward" className="text-sm" />
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Summary Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-border-subtle border-t-2 border-t-amber-600 p-6 shadow-sm">
            <p className="text-[10px] text-text-mid font-bold uppercase tracking-widest mb-2">Gross Total Income</p>
            <p className="font-mono text-2xl font-bold text-on-surface">₹ 40,75,000</p>
          </div>
          <div className="bg-white border border-border-subtle border-t-2 border-t-stone-800 p-6 shadow-sm">
            <p className="text-[10px] text-text-mid font-bold uppercase tracking-widest mb-2">Total Deductions</p>
            <p className="font-mono text-2xl font-bold text-on-surface">₹ 1,50,000</p>
          </div>
          <div className="bg-white border border-border-subtle border-t-2 border-t-stone-800 p-6 shadow-sm">
            <p className="text-[10px] text-text-mid font-bold uppercase tracking-widest mb-2">Net Taxable Income</p>
            <p className="font-mono text-2xl font-bold text-on-surface">₹ 39,25,000</p>
          </div>
          <div className="bg-stone-900 border border-stone-950 border-t-2 border-t-stone-700 p-6 shadow-lg text-white">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-2">Net Tax Payable</p>
            <p className="font-mono text-2xl font-bold text-amber-500">₹ 12,34,500</p>
          </div>
        </section>

        {/* Detailed Computation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
                <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Income Breakdown</h3>
              </div>
              <div className="divide-y-[0.5px] divide-border-subtle">
                {computationRows.map((row, i) => (
                  <div key={i} className={`flex justify-between items-center p-6 hover:bg-stone-50 transition-colors ${row.type === 'total' ? 'bg-stone-50/50 border-t border-on-surface' : ''}`}>
                    <span className={`font-ui-sm ${row.type === 'total' ? 'font-bold uppercase tracking-wider text-xs' : 'text-on-surface'}`}>{row.label}</span>
                    <span className={`font-mono text-sm ${row.type === 'total' ? 'font-bold' : row.type === 'deduction' ? 'text-red-600' : 'text-on-surface'}`}>
                      {row.type === 'deduction' ? '-' : ''}₹ {formatIndianNumber(row.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Tax Computation Card */}
            <div className="bg-stone-900 text-stone-100 overflow-hidden shadow-xl border border-stone-800">
              <div className="p-6 border-b border-stone-800">
                <h3 className="font-display-lg text-lg font-bold text-amber-500 mb-1">Tax Computation</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Old Tax Regime Applied</p>
              </div>
              <div className="divide-y divide-stone-800 font-mono text-sm">
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-xs text-stone-400 uppercase tracking-wide">Tax on Normal Income</span>
                  <span>₹ 11,62,500</span>
                </div>
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-xs text-stone-400 uppercase tracking-wide">Surcharge</span>
                  <span>₹ 0</span>
                </div>
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-xs text-stone-400 uppercase tracking-wide">Health & Education Cess</span>
                  <span>₹ 72,000</span>
                </div>
                <div className="flex justify-between items-center px-6 py-6 bg-stone-950 font-bold text-lg">
                  <span className="text-xs text-amber-500 uppercase tracking-widest">Total Liability</span>
                  <span className="text-amber-500">₹ 12,34,500</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber/30 p-6 shadow-sm">
              <h4 className="font-ui-sm font-bold text-amber-900 mb-2 uppercase tracking-widest text-[10px]">Optimization Tips</h4>
              <p className="font-ui-sm text-[13px] text-amber-800 leading-relaxed">
                You haven't fully utilized the 80C deduction limit of ₹ 1.5L. Adding ₹ 24,000 more could save ₹ 7,200 in tax.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
