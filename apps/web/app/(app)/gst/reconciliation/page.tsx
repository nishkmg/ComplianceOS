"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const mismatches = [
  { id: "1", gstin: "27AABCU9603R1ZM", name: "Acme Suppliers", inv: "SUP-001", date: "10 Apr 26", value: "1,00,000", ledgerAmount: "1,18,000", portalAmount: "1,00,000", diff: "18,000", status: "mismatch" },
  { id: "2", gstin: "29AABCT1234R1Z5", name: "Tech Components", inv: "SUP-002", date: "12 Apr 26", value: "50,000", ledgerAmount: "59,000", portalAmount: "59,000", diff: "0", status: "reconciled" },
];

export default function ITCResolutionPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border-subtle pb-8">
        <div>
          <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-2">GST Reconciliation</p>
          <h1 className="font-display-xl text-display-xl text-dark">ITC Resolution</h1>
          <p className="font-ui-sm text-mid mt-2 max-w-2xl leading-relaxed">Cross-reference your internal purchase register with the GSTR-2B statement. Resolve discrepancies to maximize claimable Input Tax Credit.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border border-border-subtle text-dark font-ui-sm text-xs rounded-sm hover:bg-section-muted transition-colors flex items-center gap-2 cursor-pointer bg-transparent uppercase tracking-widest font-bold">
            Fetch Latest 2B
          </button>
          <button className="bg-primary-container text-white px-8 py-2.5 rounded-sm font-ui-sm text-sm hover:bg-primary transition-colors cursor-pointer border-none shadow-sm font-bold uppercase tracking-widest">
            Run Auto-Match
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-border-subtle p-6 shadow-sm border-t-2 border-t-green-600">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4">Total Matched</p>
          <p className="font-mono text-xl font-bold text-success">₹ 8,45,200.00</p>
        </div>
        <div className="bg-white border border-border-subtle p-6 shadow-sm border-t-2 border-t-red-600">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4">Unresolved Mismatches</p>
          <p className="font-mono text-xl font-bold text-danger">₹ 1,12,040.50</p>
        </div>
        <div className="bg-white border border-border-subtle p-6 shadow-sm border-t-2 border-t-amber-500">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4">Supplier Missing</p>
          <p className="font-mono text-xl font-bold text-amber-text">₹ 45,120.00</p>
        </div>
        <div className="bg-white border border-border-subtle p-6 shadow-sm border-t-2 border-t-stone-800">
          <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-4">Potential ITC Saved</p>
          <p className="font-mono text-xl font-bold text-dark">₹ 12,45,600.00</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
        <div className="bg-section-muted border-b-[0.5px] border-border-subtle flex p-2 gap-2 no-print">
          <button className="px-4 py-1.5 bg-white border border-border-subtle rounded-sm text-[11px] uppercase tracking-widest font-bold text-dark cursor-pointer">All Invoices</button>
          <button className="px-4 py-1.5 hover:bg-stone-100 transition-colors rounded-sm text-[11px] uppercase tracking-widest font-bold text-mid cursor-pointer border-none bg-transparent">Mismatch (12)</button>
          <button className="px-4 py-1.5 hover:bg-stone-100 transition-colors rounded-sm text-[11px] uppercase tracking-widest font-bold text-mid cursor-pointer border-none bg-transparent">Reconciled</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-section-muted/50 border-b-[0.5px] border-border-subtle text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-3 px-6 border-r-[0.5px] border-border-subtle">Supplier / GSTIN</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border-subtle">Invoice Details</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border-subtle text-right">Ledger Amount</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border-subtle text-right">Portal (2B) Amount</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border-subtle text-right">Difference</th>
                <th className="py-3 px-6">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px] text-dark">
              {mismatches.map((m) => (
                <tr key={m.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">
                    <div className="font-ui-sm font-bold text-dark">{m.name}</div>
                    <div className="text-[11px] text-light">{m.gstin}</div>
                  </td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">
                    <div className="font-ui-sm text-sm">{m.inv}</div>
                    <div className="text-[11px] text-light">{m.date}</div>
                  </td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">₹ {m.ledgerAmount}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">₹ {m.portalAmount}</td>
                  <td className={`py-4 px-6 text-right border-r-[0.5px] border-border-subtle font-bold ${m.status === 'mismatch' ? 'text-danger' : 'text-success'}`}>₹ {m.diff}</td>
                  <td className="py-4 px-6">
                    {m.status === 'mismatch' ? (
                      <button className="text-primary hover:text-amber-stitch font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Match Manually</button>
                    ) : (
                      <span className="text-success font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                        <Icon name="check_circle" className="text-sm" /> Reconciled
                      </span>
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
