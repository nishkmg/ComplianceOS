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
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
        <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Tax Compliance Calendar</p>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">Advance Tax Tracking</h1>
        <p className="font-ui text-[13px] text-secondary max-w-2xl leading-relaxed">Ensure timely payment of advance tax instalments to avoid penal interest under Section 234B and 234C.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-border text-dark font-ui text-[13px] rounded-md hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-surface shadow-sm uppercase font-bold tracking-widest">
            <Icon name="download" className="text-[18px]" /> Export Ledger
          </button>
          <button className="bg-amber text-white px-8 py-2.5 rounded-md font-ui text-[13px] hover:bg-amber-hover transition-colors cursor-pointer border-none shadow-sm uppercase font-bold tracking-widest">
            Record Payment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Liability Summary */}
        <section className="bg-dark text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border border-stone-950">
          <div className="text-left flex-1">
            <h3 className="text-amber-text font-ui text-lg font-bold mb-2">Projected Annual Liability</h3>
            <p className="text-light font-ui text-[13px] leading-relaxed">Based on your current fiscal P&L data and estimated non-business income for FY 2024-25.</p>
          </div>
          <div className="text-right">
            <p className="text-light font-ui text-[10px] uppercase tracking-[0.2em] mb-2">Estimated Net Tax</p>
            <p className="font-mono text-4xl font-bold text-white">₹ 12,34,500.00</p>
          </div>
        </section>

        {/* Instalment Table */}
        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-muted border-b border-border">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Instalment Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Instalment</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Due Date</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Target</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Amount (₹)</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Status</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {instalments.map((i) => (
                  <tr key={i.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-5 px-6 font-ui text-[13px] font-bold text-dark">{i.label}</td>
                    <td className="py-5 px-6 text-mid">{i.dueDate}</td>
                    <td className="py-5 px-6 text-mid">{i.percentage}</td>
                    <td className="py-5 px-6 text-right font-bold text-dark">{formatIndianNumber(i.amount)}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                        i.status === 'paid' ? 'bg-success-bg text-success border-green-200' : 'bg-amber-50 text-amber-text border-amber-200'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right text-light">{i.datePaid}</td>
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
