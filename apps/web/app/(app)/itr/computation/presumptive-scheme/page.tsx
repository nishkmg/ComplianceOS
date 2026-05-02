"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function ITRPresumptivePage() {
  const [section, setSection] = useState("44ad");
  const [turnover, setTurnover] = useState(15000000);
  const [digitalTurnover, setDigitalTurnover] = useState(12000000);

  const presumptiveIncome = section === "44ad" 
    ? (digitalTurnover * 0.06) + ((turnover - digitalTurnover) * 0.08)
    : (turnover * 0.5);

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-10 text-left">
        <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2 flex items-center gap-2">
          <Icon name="calculate" className="text-[14px]" />
          Tax Calculation Engine
        </p>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">Presumptive Taxation Model</h1>
        <p className="font-ui text-[13px] text-secondary max-w-2xl leading-relaxed">
          Evaluate deemed income under sections 44AD (Business) and 44ADA (Profession). Compare presumptive outputs against actual book profit to determine audit applicability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1200px] mx-auto">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface border border-border p-8 rounded-md border-t-2 border-t-amber shadow-sm hover:shadow-md transition-all">
            <h2 className="font-display text-lg text-lg font-bold text-dark mb-6">Parameter Configuration</h2>
            <form className="space-y-8">
              {/* Scheme Selection */}
              <div className="text-left">
                <label className="block font-ui text-[13px] uppercase font-bold tracking-widest text-mid mb-3">Applicable Section</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setSection("44ad")}
                    className={`relative flex flex-col p-4 border rounded-md cursor-pointer transition-all ${section === '44ad' ? 'border-amber bg-amber-50' : 'border-border hover:bg-surface-muted'}`}
                  >
                    <span className="font-ui text-dark font-bold">Section 44AD</span>
                    <span className="font-ui text-[10px] text-mid mt-1 uppercase">Eligible Business</span>
                    {section === '44ad' && <Icon name="check_circle" className="absolute top-4 right-4 text-amber" />}
                  </div>
                  <div 
                    onClick={() => setSection("44ada")}
                    className={`relative flex flex-col p-4 border rounded-md cursor-pointer transition-all ${section === '44ada' ? 'border-amber bg-amber-50' : 'border-border hover:bg-surface-muted'}`}
                  >
                    <span className="font-ui text-dark font-bold">Section 44ADA</span>
                    <span className="font-ui text-[10px] text-mid mt-1 uppercase">Specified Profession</span>
                    {section === '44ada' && <Icon name="check_circle" className="absolute top-4 right-4 text-amber" />}
                  </div>
                </div>
              </div>

              {/* Turnover Input */}
              <div className="text-left">
                <label className="block font-ui text-[13px] uppercase font-bold tracking-widest text-mid mb-2" htmlFor="turnover">Total Turnover / Gross Receipts</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-mid">₹</span>
                  <input 
                    className="w-full bg-surface-muted border border-border rounded-md py-3 pl-10 pr-4 font-mono text-sm focus:border-primary outline-none" 
                    type="number" 
                    value={turnover}
                    onChange={(e) => setTurnover(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {section === "44ad" && (
                <div className="text-left">
                  <label className="block font-ui text-[13px] uppercase font-bold tracking-widest text-mid mb-2" htmlFor="digital">Turnover via Digital Modes</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-mid">₹</span>
                    <input 
                      className="w-full bg-surface-muted border border-border rounded-md py-3 pl-10 pr-4 font-mono text-sm focus:border-primary outline-none" 
                      type="number" 
                      value={digitalTurnover}
                      onChange={(e) => setDigitalTurnover(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <p className="text-[10px] text-light mt-2 italic">Bank transfers, UPI, credit/debit cards, and other prescribed digital modes qualify for 6% rate.</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-dark text-white p-8 rounded-md shadow-xl flex flex-col border border-stone-800">
            <h3 className="font-display text-lg text-lg font-bold text-amber-text mb-8">Computation Result</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-stone-800 pb-4">
                <span className="font-ui text-[13px] text-light">Presumptive Income</span>
                <span className="font-mono text-2xl font-bold text-white">₹ {formatIndianNumber(presumptiveIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center text-light">
                <span className="font-ui text-[10px] uppercase tracking-widest">Effective Rate</span>
                <span className="font-mono text-sm">{((presumptiveIncome / turnover) * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="mt-auto pt-12">
               <button className="w-full bg-amber text-white py-4 font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all rounded-md border-none cursor-pointer flex items-center justify-center gap-2">
                 Apply to Computation
                 <Icon name="arrow_forward" />
               </button>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 shadow-sm text-left">
             <div className="flex items-start gap-3">
               <Icon name="info" className="text-amber" />
               <div>
                 <h4 className="font-ui text-[13px] font-bold text-dark text-xs uppercase tracking-widest mb-1">Audit Applicability</h4>
                 <p className="font-ui text-[13px] text-mid leading-relaxed">
                   Turnover exceeds ₹ 2 Cr. Audit under Section 44AB is mandatory regardless of profit percentage unless 95% of receipts/payments are digital.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
