// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";

export default function PayrollReportsPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="bg-white border-b-[0.5px] border-border-subtle px-8 py-6 sticky top-0 z-30 flex justify-between items-end -mx-8 -mt-8 mb-8">
        <div>
          <h2 className="font-ui-xs text-xs text-text-light uppercase tracking-widest mb-1 font-bold">Module Overview</h2>
          <h1 className="font-display-lg text-display-lg text-on-surface">Payroll Reports</h1>
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm shadow-sm">Filter Records</button>
          <button className="px-5 py-2 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors group border-none cursor-pointer rounded-sm shadow-sm">
            Generate Report
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </header>

      <div className="space-y-8 pb-12">
        {/* Quick Actions Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-stone-50 rounded text-amber-text">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <span className="material-symbols-outlined text-text-light group-hover:text-amber-text transition-colors">open_in_new</span>
            </div>
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-3">PF Challans</h3>
            <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Generate Provident Fund remittance files for EPFO portal upload.</p>
          </div>

          <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-stone-50 rounded text-amber-text">
                <span className="material-symbols-outlined">health_and_safety</span>
              </div>
              <span className="material-symbols-outlined text-text-light group-hover:text-amber-text transition-colors">open_in_new</span>
            </div>
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-3">ESI Challans</h3>
            <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Prepare ESI contribution files with employee-wise breakup.</p>
          </div>

          <div className="bg-white border-[0.5px] border-border-subtle border-t-2 border-t-primary-container p-8 hover:shadow-sm transition-shadow cursor-pointer group text-left">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-stone-50 rounded text-amber-text">
                <span className="material-symbols-outlined">description</span>
              </div>
              <span className="material-symbols-outlined text-text-light group-hover:text-amber-text transition-colors">open_in_new</span>
            </div>
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-3">Professional Tax</h3>
            <p className="font-ui-sm text-sm text-text-mid leading-relaxed">Compute and file professional tax returns by state jurisdiction.</p>
          </div>
        </section>

        {/* Recent Activity */}
        <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Recently Generated Filings</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Report Name</th>
                <th className="py-4 px-6">Period</th>
                <th className="py-4 px-6">Generated</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-ui-sm">
              <tr className="hover:bg-stone-50/50 transition-colors">
                <td className="py-5 px-6 font-bold text-on-surface">PF ECR October 2024</td>
                <td className="py-5 px-6 text-text-mid">Oct 2024</td>
                <td className="py-5 px-6 text-text-mid">15 Nov 2024</td>
                <td className="py-5 px-6 text-right">
                  <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold uppercase rounded-sm">Filled</span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50/50 transition-colors">
                <td className="py-5 px-6 font-bold text-on-surface">ESI Challan Sep 2024</td>
                <td className="py-5 px-6 text-text-mid">Sep 2024</td>
                <td className="py-5 px-6 text-text-mid">15 Oct 2024</td>
                <td className="py-5 px-6 text-right">
                  <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold uppercase rounded-sm">Filled</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
