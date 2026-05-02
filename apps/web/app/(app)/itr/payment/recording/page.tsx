"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { Icon } from '@/components/ui/icon';

export default function ITRRecordPaymentPage() {
  const [type, setType] = useState("100");

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="bg-surface border-b-[0.5px] border-border px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm bg-surface/50">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2 flex items-center gap-2">
            <span>Ledger</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span>Tax Payments</span>
          </p>
          <h1 className="font-display text-display-lg font-semibold text-dark">Record ITR Payment</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-ui text-[10px] uppercase tracking-widest font-bold text-mid flex items-center gap-1">
            <Icon name="cloud_done" className="text-[16px] text-success" />
            Draft saved locally
          </span>
          <button className="bg-amber text-white px-6 py-2.5 rounded-md font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all border-none cursor-pointer shadow-sm">
            Commit to Ledger
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pb-12">
        <div className="bg-surface border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
          <div className="p-8 md:p-12 relative z-10">
            {/* Section 1: Classification */}
            <div className="mb-12">
              <h3 className="font-ui text-[10px] text-amber-text uppercase tracking-widest mb-6 border-b-[0.5px] border-border pb-2 font-bold">Classification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "100", name: "Advance Tax", code: "100" },
                  { id: "300", name: "Self Assessment", code: "300" },
                  { id: "400", name: "Tax on Regular Assessment", code: "400" },
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={`relative p-4 border rounded-md transition-all cursor-pointer ${type === item.id ? 'border-amber bg-amber-50 ring-1 ring-amber' : 'border-border bg-surface hover:bg-surface-muted'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-ui text-[13px] font-bold text-dark">{item.name}</span>
                      <Icon name={type === item.id ? 'radio_button_checked' : 'radio_button_unchecked'} className={`text-[18px] ${type === item.id ? 'text-amber' : 'text-lighter'}`} />
                    </div>
                    <p className="font-mono text-[11px] text-mid uppercase">Code: {item.code}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">BSR Code (7 Digits)</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none" placeholder="0000000" maxLength={7} />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Challan Serial Number</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none" placeholder="00000" maxLength={5} />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Date of Deposit</label>
                  <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-[13px] text-dark focus:border-primary outline-none" type="date" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Total Amount Paid (₹)</label>
                  <input className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-lg font-bold text-dark focus:border-primary outline-none" placeholder="0.00" type="number" />
               </div>
            </div>
          </div>
          <Icon name="account_balance" className="absolute -right-12 -bottom-12   text-[200px] text-section-muted opacity-30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
