// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function ITRSelfAssessmentPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12">
        <span className="font-ui-xs text-xs text-amber-text uppercase tracking-widest block mb-4 font-bold">Assessment Year 2024-25</span>
        <h2 className="font-display-xl text-3xl text-on-surface mb-4 font-bold">Self-Assessment Tax</h2>
        <p className="font-ui-md text-sm text-text-mid max-w-2xl leading-relaxed">Review your total tax liability, apply available credits, and determine the final self-assessment tax due before filing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Computation Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-border-subtle rounded-sm shadow-sm overflow-hidden border-t-2 border-t-primary-container">
            <div className="p-6 border-b border-border-subtle bg-stone-50">
              <h3 className="font-ui-lg text-lg font-bold text-on-surface">Tax Computation Summary</h3>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-stone-50">
                  <div className="font-ui-sm text-sm text-on-surface-variant">Total Tax Liability on Total Income</div>
                  <div className="font-mono text-sm text-on-surface font-bold">₹ 4,50,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-text-light mr-2 text-sm">remove</span>
                    <span className="font-ui-sm text-sm text-text-mid">Less: TDS Credit Claimed</span>
                  </div>
                  <div className="font-mono text-sm text-text-mid">- ₹ 1,20,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-text-light mr-2 text-sm">remove</span>
                    <span className="font-ui-sm text-sm text-text-mid">Less: TCS Credit Claimed</span>
                  </div>
                  <div className="font-mono text-sm text-text-mid">- ₹ 15,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-text-light mr-2 text-sm">remove</span>
                    <span className="font-ui-sm text-sm text-text-mid">Less: Advance Tax Paid</span>
                  </div>
                  <div className="font-mono text-sm text-text-mid">- ₹ 2,00,000</div>
                </div>
                <div className="flex justify-between items-center pt-8 mt-4 border-t border-border-subtle">
                  <div className="font-ui-lg text-lg font-bold text-on-surface">Self-Assessment Tax Due</div>
                  <div className="font-mono text-lg font-bold text-on-surface bg-stone-50 px-6 py-3 rounded-sm">₹ 1,15,000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm">Recalculate</button>
            <button className="group px-6 py-3 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest flex items-center hover:bg-primary transition-colors border-none cursor-pointer rounded-sm shadow-sm">
              Pay Tax Now
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-border-subtle p-6 rounded-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 mt-1">info</span>
              <div>
                <h4 className="font-ui-md font-bold text-on-surface mb-2">Payment Required</h4>
                <p className="font-ui-sm text-sm text-on-surface-variant leading-relaxed">
                  You must pay the Self-Assessment Tax of <span className="font-mono font-bold">₹1,15,000</span> before filing your ITR. Ensure payment is made under Minor Head 300.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-sm">
            <h4 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Recent Challans</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-ui-sm font-bold text-on-surface">Advance Tax (Inst. 3)</div>
                  <div className="font-ui-xs text-[11px] text-text-light mt-1">15 Dec 2023</div>
                </div>
                <div className="font-mono text-sm text-text-mid">₹ 1,00,000</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <div>
                  <div className="font-ui-sm font-bold text-on-surface">Advance Tax (Inst. 2)</div>
                  <div className="font-ui-xs text-[11px] text-text-light mt-1">15 Sep 2023</div>
                </div>
                <div className="font-mono text-sm text-text-mid">₹ 1,00,000</div>
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 border border-border-subtle text-text-mid font-ui-sm text-xs font-bold uppercase tracking-widest hover:text-on-surface transition-colors bg-transparent rounded-sm cursor-pointer">View All Tax Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}
