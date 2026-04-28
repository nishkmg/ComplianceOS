// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

export default function GSTPaymentPage() {
  const [period, setPeriod] = useState("October");
  const [challanData, setChallanData] = useState(null);
  const [paymentMode, setPaymentMode] = useState("online");

  const grossLiability = {
    igst: 450000, cgst: 125000, sgst: 125000, cess: 0, total: 700000
  };
  const itcAvailable = {
    igst: 350000, cgst: 100000, sgst: 100000, cess: 0, total: 550000
  };
  const netPayable = {
    igst: 100000, cgst: 25000, sgst: 25000, cess: 0, total: 150000
  };

  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b-[0.5px] border-border-subtle px-8 py-6 -mx-8 -mt-8 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/gst/ledger" className="text-text-mid hover:text-on-surface transition-colors no-underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="font-ui-xs text-xs uppercase font-bold">GST Ledger</span>
          </Link>
          <div className="h-6 w-[0.5px] bg-border-subtle"></div>
          <h1 className="font-display-lg text-lg font-bold">GST Payment</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm shadow-sm">Save Draft</button>
          <button className="px-6 py-2.5 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all cursor-pointer border-none rounded-sm shadow-sm">Pay Now</button>
        </div>
      </header>

      <div className="space-y-16 pb-16 max-w-[1200px] mx-auto">
        {/* 1. Period */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
           <div className="flex flex-col gap-2 text-left">
             <label className="font-ui-xs text-xs text-text-light uppercase tracking-widest font-bold">Return Period</label>
             <div className="relative">
               <select className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm text-on-surface focus:border-primary outline-none appearance-none" value={period} onChange={e => setPeriod(e.target.value)}>
                 <option>October 2024 (Q3)</option>
                 <option>September 2024 (Q2)</option>
               </select>
               <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-light pointer-events-none">expand_more</span>
             </div>
           </div>
        </section>

        {/* 2. Tax Liability */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b-[0.5px] border-border-subtle pb-4">
            <h3 className="font-ui-lg text-lg font-bold text-on-surface">1. Gross Tax Liability</h3>
            <span className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Derived from Outward Supplies (GSTR-1)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(grossLiability).filter(([k]) => k !== 'total').map(([key, val]) => (
              <div key={key} className="bg-white border-[0.5px] border-border-subtle p-6 border-t-2 border-t-transparent hover:border-t-primary-container transition-all shadow-sm text-left">
                <span className="font-ui-xs text-[10px] text-text-light uppercase font-bold tracking-widest">{key === 'igst' ? 'Integrated Tax (IGST)' : key === 'cgst' ? 'Central Tax (CGST)' : key === 'sgst' ? 'State Tax (SGST)' : 'Cess'}</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="font-ui-sm text-xs text-text-light">₹</span>
                  <span className="font-mono text-2xl font-bold text-on-surface">{formatIndianNumber(val)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-stone-900 text-white p-6 mt-6 flex justify-between items-center shadow-sm border border-stone-950">
            <span className="font-ui-sm text-xs font-bold uppercase tracking-widest text-stone-400">Total Gross Liability</span>
            <span className="font-mono text-2xl font-bold text-white">₹ {formatIndianNumber(grossLiability.total)}</span>
          </div>
        </section>

        {/* 3. ITC Set-off */}
        <section>
          <div className="flex justify-between items-end mb-6 border-b-[0.5px] border-border-subtle pb-4">
            <h3 className="font-ui-lg text-lg font-bold text-on-surface">2. ITC Set-off Computation</h3>
            <span className="font-ui-xs text-[10px] text-text-light uppercase font-bold tracking-widest">Cross-utilization as per GST rules (IGST first)</span>
          </div>
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                  <th className="py-4 px-6">Tax Head</th>
                  <th className="py-4 px-6 text-right">Output Liability</th>
                  <th className="py-4 px-6 text-right">ITC Available</th>
                  <th className="py-4 px-6 text-right text-primary-container font-bold">ITC Utilized</th>
                  <th className="py-4 px-6 text-right">Cash Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-mono text-sm">
                {['igst', 'cgst', 'sgst'].map((type, i) => (
                  <tr key={type} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-5 px-6 font-ui-sm font-bold uppercase">{type}</td>
                    <td className="py-5 px-6 text-right">{formatIndianNumber(Object.entries(grossLiability).find(([k]) => k === type)?.[1] || 0)}</td>
                    <td className="py-5 px-6 text-right text-green-700">{formatIndianNumber(Object.entries(itcAvailable).find(([k]) => k === type)?.[1] || 0)}</td>
                    <td className="py-5 px-6 text-right text-primary-container font-bold">{Object.entries(itcAvailable).find(([k]) => k === type)?.[1] || 0}</td>
                    <td className="py-5 px-6 text-right font-bold">
                      {(Object.entries(grossLiability).find(([k]) => k === type)?.[1] || 0) - (Object.entries(itcAvailable).find(([k]) => k === type)?.[1] || 0) > 0
                        ? formatIndianNumber((Object.entries(grossLiability).find(([k]) => k === type)?.[1] || 0) - (Object.entries(itcAvailable).find(([k]) => k === type)?.[1] || 0)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Net Payable */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-red-600">
          <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-8">3. Net Cash Payable</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(netPayable).filter(([k]) => k !== 'total').map(([key, val]) => (
              <div key={key} className="bg-stone-50 border-[0.5px] border-border-subtle p-6 text-left">
                <span className="font-ui-xs text-[10px] text-text-light uppercase font-bold tracking-widest">{key.toUpperCase()}</span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="font-mono text-xl font-bold text-red-700">₹ {formatIndianNumber(val)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-stone-900 text-white p-8 mt-6 flex justify-between items-center shadow-xl border border-stone-950">
            <span className="font-ui-sm text-xs font-bold uppercase tracking-widest text-amber-500">Due by 20th November 2024</span>
            <div className="text-right">
              <p className="font-ui-xs text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Total Amount Payable</p>
              <span className="font-mono text-3xl font-bold text-amber-500">₹ {formatIndianNumber(netPayable.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
