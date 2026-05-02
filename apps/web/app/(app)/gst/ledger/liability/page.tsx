"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function GSTLiabilityLedgerPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border pb-8 mt-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-dark mb-2">Liability Ledger</h1>
          <p className="font-ui text-[13px] text-secondary flex items-center gap-2">
            <Icon name="calendar_today" className="text-[16px]" />
            Current Period: April 2023 - March 2024
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 border border-border text-dark font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md shadow-sm">
            <Icon name="print" className="text-[18px]" /> Print
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface border border-border p-6 flex flex-col justify-between shadow-sm border-t-2 border-t-amber text-left">
          <span className="font-ui text-[10px] text-amber-text uppercase tracking-widest font-bold">Total Liability Generated</span>
          <div className="flex items-end justify-between mt-4">
            <span className="font-mono text-xl font-bold text-dark">₹ 12,45,800.00</span>
            <Icon name="trending_up" className="text-lighter group-hover:text-amber transition-colors" />
          </div>
        </div>
        <div className="bg-surface border border-border p-6 flex flex-col justify-between shadow-sm text-left">
          <span className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">CGST Output</span>
          <span className="font-mono text-xl font-bold text-dark mt-4">₹ 4,15,200.00</span>
        </div>
        <div className="bg-surface border border-border p-6 flex flex-col justify-between shadow-sm text-left">
          <span className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">SGST Output</span>
          <span className="font-mono text-xl font-bold text-dark mt-4">₹ 4,15,200.00</span>
        </div>
      </div>

      {/* Liability Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-amber"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b-[0.5px] border-border text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Period</th>
                <th className="py-4 px-6 text-right">IGST Output</th>
                <th className="py-4 px-6 text-right">CGST Output</th>
                <th className="py-4 px-6 text-right">SGST Output</th>
                <th className="py-4 px-6 text-right">Cess</th>
                <th className="py-4 px-6 text-right font-bold">Total Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {[
                { period: "Oct 2024", igst: "4,50,000", cgst: "1,25,000", sgst: "1,25,000", cess: "0", total: "7,00,000" },
                { period: "Sep 2024", igst: "3,80,000", cgst: "1,05,000", sgst: "1,05,000", cess: "0", total: "5,90,000" },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 font-ui text-[13px] font-bold text-dark">{r.period}</td>
                  <td className="py-5 px-6 text-right">₹ {r.igst}</td>
                  <td className="py-5 px-6 text-right">₹ {r.cgst}</td>
                  <td className="py-5 px-6 text-right">₹ {r.sgst}</td>
                  <td className="py-5 px-6 text-right">{r.cess}</td>
                  <td className="py-5 px-6 text-right font-bold text-dark">₹ {r.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-dark text-white font-bold">
                <td className="py-5 px-6 font-ui text-[13px] uppercase tracking-widest text-xs">Totals</td>
                <td className="py-5 px-6 text-right">₹ 12,45,800</td>
                <td className="py-5 px-6 text-right">₹ 3,45,000</td>
                <td className="py-5 px-6 text-right">₹ 3,45,000</td>
                <td className="py-5 px-6 text-right">—</td>
                <td className="py-5 px-6 text-right text-amber-400 font-bold">₹ 19,35,800</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
