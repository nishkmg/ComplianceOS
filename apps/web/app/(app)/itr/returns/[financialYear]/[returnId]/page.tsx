"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";

export default function ITRReturnDetailPage() {
  const params = useParams();
  const id = params.returnId as string;
  const fy = params.financialYear as string;

  return (
    <div className="space-y-0 text-left">
      {/* Header Area */}
      <header className="bg-surface border-b-[0.5px] border-border px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm bg-surface/50">
        <div>
          <div className="flex items-center gap-2 font-ui text-[10px] text-light mb-2 uppercase tracking-widest">
            <Link className="hover:text-primary transition-colors no-underline" href="/itr/returns">Returns</Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-dark font-bold">ITR Detail</span>
          </div>
          <h1 className="font-display text-display-lg font-semibold text-dark">Financial Year {fy || "2023-24"}</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">Assessment Year: 2024-25 | PAN: ABCDE1234F</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-border text-dark px-6 py-2.5 font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="download" className="text-[18px]" />
            Export Data
          </button>
          <button className="bg-amber text-white px-6 py-2.5 font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer">
            Finalize Filing →
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
        {/* Status Tracker */}
        <div className="bg-surface border border-border p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Filing Workflow Status</h3>
            <span className="px-3 py-1 bg-amber-50 text-amber-text border border-amber-200 text-[10px] font-bold uppercase tracking-widest rounded-md">Ready for Review</span>
          </div>
          <div className="flex gap-4 w-full h-1 mb-2">
            <div className="flex-1 bg-success-bg0 rounded-md"></div>
            <div className="flex-1 bg-success-bg0 rounded-md"></div>
            <div className="flex-1 bg-section-amber0 rounded-md"></div>
            <div className="flex-1 bg-surface-muted rounded-md"></div>
            <div className="flex-1 bg-surface-muted rounded-md"></div>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-light font-bold">
            <span>Computation</span>
            <span>Deductions</span>
            <span>Review</span>
            <span>E-Verify</span>
            <span>Ack</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-surface border border-border p-8 shadow-sm">
             <h4 className="font-ui text-[13px] font-bold text-dark mb-6 border-b border-stone-50 pb-2 uppercase tracking-widest text-[10px]">Income Summary</h4>
             <div className="space-y-4">
                <div className="flex justify-between font-ui text-[13px]">
                   <span className="text-mid">Business & Profession</span>
                   <span className="font-mono text-dark">₹ 35,00,000</span>
                </div>
                <div className="flex justify-between font-ui text-[13px]">
                   <span className="text-mid">Other Sources</span>
                   <span className="font-mono text-dark">₹ 1,25,000</span>
                </div>
                <div className="flex justify-between font-ui text-[13px] pt-4 border-t border-border font-bold">
                   <span>Gross Total Income</span>
                   <span className="font-mono">₹ 36,25,000</span>
                </div>
             </div>
           </div>

           <div className="bg-dark text-white p-8 shadow-xl border border-stone-950">
             <h4 className="text-amber-text font-ui text-[13px] font-bold mb-6 uppercase tracking-widest text-[10px]">Tax Calculation</h4>
             <div className="space-y-4">
                <div className="flex justify-between font-ui text-[13px] opacity-60">
                   <span>Total Tax Liability</span>
                   <span className="font-mono">₹ 11,62,500</span>
                </div>
                <div className="flex justify-between font-ui text-[13px] opacity-60">
                   <span>Advance Tax Paid</span>
                   <span className="font-mono text-green-400">₹ 5,55,525</span>
                </div>
                <div className="flex justify-between font-ui text-[13px] text-lg pt-6 mt-4 border-t border-stone-800 font-bold">
                   <span className="text-amber-text">Net Tax Payable</span>
                   <span className="font-mono text-amber-text">₹ 6,06,975</span>
                </div>
             </div>
           </div>
        </div>

        {/* Audit Trail / Timeline */}
        <div className="bg-surface border border-border p-8 shadow-sm text-left">
           <h3 className="font-ui text-[10px] text-light uppercase tracking-widest mb-6 font-bold">Timeline</h3>
           <div className="space-y-6">
              <div className="flex gap-4 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-success-bg0 mt-1.5"></div>
                 <div>
                    <p className="font-ui text-[13px] text-dark">Computation finalized by A. Sharma</p>
                    <p className="font-mono text-[11px] text-light mt-0.5">24 Oct 2024 · 14:32:01</p>
                 </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5"></div>
                 <div>
                    <p className="font-ui text-[13px] text-dark">Income details synced from Ledger</p>
                    <p className="font-mono text-[11px] text-light mt-0.5">22 Oct 2024 · 09:15:22</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
