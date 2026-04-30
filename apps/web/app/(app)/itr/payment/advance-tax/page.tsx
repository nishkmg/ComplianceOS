"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const instalments = [
  { id: 1, label: "1st Instalment", dueDate: "15 Jun 2024", percentage: "15%", amount: 185175, status: "paid", datePaid: "12 Jun 2024" },
  { id: 2, label: "2nd Instalment", dueDate: "15 Sep 2024", percentage: "30%", amount: 370350, status: "paid", datePaid: "14 Sep 2024" },
  { id: 3, label: "3rd Instalment", dueDate: "15 Dec 2024", percentage: "30%", amount: 370350, status: "pending", datePaid: "—" },
  { id: 4, label: "4th Instalment", dueDate: "15 Mar 2025", percentage: "25%", amount: 308625, status: "pending", datePaid: "—" },
];

export default function ITRAdvanceTaxPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-6">
        <div>
          <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest mb-2 block font-bold">Tax Compliance Calendar</span>
          <h2 className="font-display-xl text-display-xl text-on-surface mb-2">Advance Tax Tracking</h2>
          <p className="font-ui-sm text-sm text-text-mid max-w-2xl leading-relaxed">Ensure timely payment of advance tax instalments to avoid penal interest under Section 234B and 234C.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-white shadow-sm uppercase font-bold tracking-widest">
            <Icon name="download" className="text-[18px]" /> Export Ledger
          </button>
          <button className="bg-primary-container text-white px-8 py-2.5 rounded-sm font-ui-sm text-sm hover:bg-primary transition-colors cursor-pointer border-none shadow-sm uppercase font-bold tracking-widest">
            Record Payment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Liability Summary */}
        <section className="bg-stone-900 text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border border-stone-950">
          <div className="text-left flex-1">
            <h3 className="text-amber-500 font-ui-lg text-lg font-bold mb-2">Projected Annual Liability</h3>
            <p className="text-stone-400 font-ui-sm text-sm leading-relaxed">Based on your current fiscal P&L data and estimated non-business income for FY 2024-25.</p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-2">Estimated Net Tax</p>
            <p className="font-mono text-4xl font-bold text-white">₹ 12,34,500.00</p>
          </div>
        </section>

        {/* Instalment Table */}
        <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Instalment Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Instalment</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Due Date</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Target</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Amount (₹)</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Status</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {instalments.map((i) => (
                  <tr key={i.id} className="hover:bg-section-muted/30 transition-colors">
                    <td className="py-5 px-6 font-ui-sm font-bold text-on-surface">{i.label}</td>
                    <td className="py-5 px-6 text-text-mid">{i.dueDate}</td>
                    <td className="py-5 px-6 text-text-mid">{i.percentage}</td>
                    <td className="py-5 px-6 text-right font-bold text-on-surface">{formatIndianNumber(i.amount)}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                        i.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right text-text-light">{i.datePaid}</td>
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
