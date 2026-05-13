"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";

export default function PayrollReportsPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="bg-surface border-b-[0.5px] border-border px-8 py-6 sticky top-0 z-30 flex justify-between items-end -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Module Overview</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Payroll Reports</h1>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-secondary">Filter Records</button>
          <button className="btn btn-primary group flex items-center gap-2">
            Generate Report
            <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <div className="space-y-8 pb-12">
        {/* Quick Actions Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border border-t-2 border-t-amber p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-surface-muted rounded text-amber-text">
                <Icon name="receipt_long" />
              </div>
              <Icon name="open_in_new" className="text-light group-hover:text-amber-text transition-colors" />
            </div>
            <h3 className="font-ui text-lg font-bold text-dark mb-3">PF Challans</h3>
            <p className="font-ui text-[13px] text-mid leading-relaxed">Generate Provident Fund remittance files for EPFO portal upload.</p>
          </div>

          <div className="bg-surface border border-border border-t-2 border-t-amber p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-surface-muted rounded text-amber-text">
                <Icon name="health_and_safety" />
              </div>
              <Icon name="open_in_new" className="text-light group-hover:text-amber-text transition-colors" />
            </div>
            <h3 className="font-ui text-lg font-bold text-dark mb-3">ESI Challans</h3>
            <p className="font-ui text-[13px] text-mid leading-relaxed">Prepare ESI contribution files with employee-wise breakup.</p>
          </div>

          <div className="bg-surface border border-border border-t-2 border-t-amber p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-surface-muted rounded text-amber-text">
                <Icon name="description" />
              </div>
              <Icon name="open_in_new" className="text-light group-hover:text-amber-text transition-colors" />
            </div>
            <h3 className="font-ui text-lg font-bold text-dark mb-3">Professional Tax</h3>
            <p className="font-ui text-[13px] text-mid leading-relaxed">Compute and file professional tax returns by state jurisdiction.</p>
          </div>
        </section>

        {/* Recent Activity */}
        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-muted border-b border-border">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Recently Generated Filings</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-stone-100 text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Report Name</th>
                <th className="py-4 px-6">Period</th>
                <th className="py-4 px-6">Generated</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-ui text-[13px]">
              <tr className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-5 px-6 font-bold text-dark">PF ECR October 2024</td>
                <td className="py-5 px-6 text-mid">Oct 2024</td>
                <td className="py-5 px-6 text-mid">15 Nov 2024</td>
                <td className="py-5 px-6 text-right">
                  <span className="inline-block px-2 py-0.5 bg-success-bg text-success border border-green-200 text-[9px] font-bold uppercase rounded-md">Filled</span>
                </td>
              </tr>
              <tr className="hover:bg-surface-muted/50 transition-colors">
                <td className="py-5 px-6 font-bold text-dark">ESI Challan Sep 2024</td>
                <td className="py-5 px-6 text-mid">Sep 2024</td>
                <td className="py-5 px-6 text-mid">15 Oct 2024</td>
                <td className="py-5 px-6 text-right">
                  <span className="inline-block px-2 py-0.5 bg-success-bg text-success border border-green-200 text-[9px] font-bold uppercase rounded-md">Filled</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
