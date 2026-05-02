"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function ITRSelfAssessmentPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12">
        <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Assessment Year 2024-25</p>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">Self-Assessment Tax</h1>
        <p className="font-ui text-[13px] text-secondary max-w-2xl leading-relaxed">Review your total tax liability, apply available credits, and determine the final self-assessment tax due before filing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Computation Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden border-t-2 border-t-amber">
            <div className="p-6 border-b border-border bg-surface-muted">
              <h3 className="font-ui text-lg font-bold text-dark">Tax Computation Summary</h3>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-stone-50">
                  <div className="font-ui text-[13px] text-dark-variant">Total Tax Liability on Total Income</div>
                  <div className="font-mono text-sm text-dark font-bold">₹ 4,50,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <Icon name="remove" className="text-light mr-2 text-sm" />
                    <span className="font-ui text-[13px] text-mid">Less: TDS Credit Claimed</span>
                  </div>
                  <div className="font-mono text-sm text-mid">- ₹ 1,20,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <Icon name="remove" className="text-light mr-2 text-sm" />
                    <span className="font-ui text-[13px] text-mid">Less: TCS Credit Claimed</span>
                  </div>
                  <div className="font-mono text-sm text-mid">- ₹ 15,000</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-stone-50 pl-4">
                  <div className="flex items-center">
                    <Icon name="remove" className="text-light mr-2 text-sm" />
                    <span className="font-ui text-[13px] text-mid">Less: Advance Tax Paid</span>
                  </div>
                  <div className="font-mono text-sm text-mid">- ₹ 2,00,000</div>
                </div>
                <div className="flex justify-between items-center pt-8 mt-4 border-t border-border">
                  <div className="font-ui text-lg font-bold text-dark">Self-Assessment Tax Due</div>
                  <div className="font-mono text-lg font-bold text-dark bg-surface-muted px-6 py-3 rounded-md">₹ 1,15,000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button className="px-6 py-3 border border-border text-dark font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md">Recalculate</button>
            <button className="group px-6 py-3 bg-amber text-white font-ui text-[13px] font-bold uppercase tracking-widest flex items-center hover:bg-amber-hover transition-colors border-none cursor-pointer rounded-md shadow-sm">
              Pay Tax Now
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border p-6 rounded-md">
            <div className="flex items-start gap-3">
              <Icon name="info" className="text-amber-text mt-1" />
              <div>
                <h4 className="font-ui text-sm font-medium font-bold text-dark mb-2">Payment Required</h4>
                <p className="font-ui text-[13px] text-dark-variant leading-relaxed">
                  You must pay the Self-Assessment Tax of <span className="font-mono font-bold">₹1,15,000</span> before filing your ITR. Ensure payment is made under Minor Head 300.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border p-6 rounded-md">
            <h4 className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Recent Challans</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-ui text-[13px] font-bold text-dark">Advance Tax (Inst. 3)</div>
                  <div className="font-ui text-[11px] text-[11px] text-light mt-1">15 Dec 2023</div>
                </div>
                <div className="font-mono text-sm text-mid">₹ 1,00,000</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <div>
                  <div className="font-ui text-[13px] font-bold text-dark">Advance Tax (Inst. 2)</div>
                  <div className="font-ui text-[11px] text-[11px] text-light mt-1">15 Sep 2023</div>
                </div>
                <div className="font-mono text-sm text-mid">₹ 1,00,000</div>
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 border border-border text-mid font-ui text-[13px] font-bold uppercase tracking-widest hover:text-dark transition-colors bg-transparent rounded-md cursor-pointer">View All Tax Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}
