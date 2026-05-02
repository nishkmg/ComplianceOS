"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const payments = [
  { id: "1", date: "12 Jun 2024", type: "Advance Tax", challanNo: "CH-88012", bsr: "0210452", amount: 185175, status: "completed", mode: "Net Banking" },
  { id: "2", date: "14 Sep 2024", type: "Advance Tax", challanNo: "CH-94210", bsr: "0210452", amount: 370350, status: "completed", mode: "Net Banking" },
  { id: "3", date: "15 Dec 2024", type: "Advance Tax", challanNo: "—", bsr: "—", amount: 370350, status: "pending", mode: "—" },
];

export default function ITRPaymentHistoryPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-6 mt-4">
        <div>
          <span className="font-ui-xs text-xs text-amber-text uppercase tracking-widest mb-2 block font-bold">Statutory Records</span>
          <h1 className="font-display-xl text-display-xl text-dark mb-1">Income Tax Payments</h1>
          <p className="font-ui-sm text-sm text-mid max-w-2xl leading-relaxed">Historical record of all tax payments, challans, and BSR-coded acknowledgements for current and previous assessment years.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-border-subtle text-dark font-ui-sm text-xs rounded-sm hover:bg-section-muted transition-colors flex items-center gap-2 cursor-pointer bg-transparent uppercase font-bold tracking-widest shadow-sm">
            <Icon name="print" className="text-[18px]" /> Print History
          </button>
          <button className="bg-primary-container text-white px-6 py-2.5 rounded-sm font-ui-sm text-sm hover:bg-amber-hover transition-colors flex items-center gap-2 border-none shadow-sm font-bold uppercase tracking-widest cursor-pointer">
            <Icon name="add" className="text-[18px]" /> New Challan
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-border-subtle p-8 border-t-2 border-t-primary-container shadow-sm">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Total Paid (AY 24-25)</p>
          <p className="font-mono text-3xl font-bold text-dark">₹ 5,55,525.00</p>
        </div>
        <div className="bg-white border border-border-subtle p-8 border-t-2 border-t-amber-500 shadow-sm">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Pending Liability</p>
          <p className="font-mono text-3xl font-bold text-amber-text">₹ 6,78,975.00</p>
        </div>
        <div className="bg-white border border-border-subtle p-8 border-t-2 border-t-stone-800 shadow-sm">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Challan Records</p>
          <p className="font-mono text-3xl font-bold text-dark">02</p>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-section-muted border-b border-border-subtle">
            <h3 className="font-ui-md font-bold text-dark uppercase tracking-wider text-[11px] text-light">Payment & Challan Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-section-muted border-b border-stone-100 text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Payment Date</th>
                <th className="py-4 px-6">Type / Description</th>
                <th className="py-4 px-6">Challan / BSR</th>
                <th className="py-4 px-6 text-right">Amount (₹)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-5 px-6 text-mid">{p.date}</td>
                  <td className="py-5 px-6 font-ui-sm font-bold text-dark">
                    {p.type}
                    <p className="text-[10px] text-light mt-0.5 font-normal">{p.mode}</p>
                  </td>
                  <td className="py-5 px-6 text-mid">
                    <p>{p.challanNo}</p>
                    <p className="text-[10px]">{p.bsr}</p>
                  </td>
                  <td className="py-5 px-6 text-right font-bold text-dark">₹ {formatIndianNumber(p.amount)}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border rounded-sm ${
                      p.status === 'completed' ? 'bg-success-bg text-success border-green-200' : 'bg-section-amber text-amber-text border-amber-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    {p.status === 'completed' ? (
                      <button className="text-primary-container hover:text-primary font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Download</button>
                    ) : (
                      <button className="text-primary-container hover:text-amber-text font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Record Info</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
