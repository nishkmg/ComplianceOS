"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";

const fiscalYears = [
  { id: "1", name: "FY 2024-25", period: "01 Apr 2024 - 31 Mar 2025", status: "open", entries: 12483, lastActivity: "24 Oct 2024" },
  { id: "2", name: "FY 2023-24", period: "01 Apr 2023 - 31 Mar 2024", status: "closed", entries: 45120, lastActivity: "15 Apr 2024" },
  { id: "3", name: "FY 2022-23", period: "01 Apr 2022 - 31 Mar 2023", status: "archived", entries: 38902, lastActivity: "10 Apr 2023" },
];

export default function FiscalYearsPage() {
  return (
    <div className="space-y-10 text-left">
      {/* Page Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Settings / Fiscal Years</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Fiscal Years</h1>
          <p className="text-[13px] text-secondary font-ui mt-1 max-w-2xl leading-relaxed">Manage accounting periods, statutory boundaries, and ledger lifecycle constraints for your organization.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="btn-secondary">
            Close FY
          </button>
          <button className="btn-primary flex items-center gap-2 group">
            Create FY <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border-zinc-200 border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-surface-muted/50">
              <div>
                <h3 className="font-ui text-lg font-bold text-dark">Ledger Periods</h3>
                <p className="font-ui text-[10px] text-light uppercase tracking-widest mt-1">Indian Financial Calendar</p>
              </div>
              <button className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer">
                <Icon name="filter_list" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-stone-100 text-light font-ui text-[10px] uppercase tracking-widest">
                    <th className="py-4 px-6">Financial Year</th>
                    <th className="py-4 px-6">Reporting Period</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 font-ui text-[13px]">
                  {fiscalYears.map((fy) => (
                    <tr key={fy.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-5 px-6">
                        <Link href={`/settings/fiscal-years/${fy.id}`} className="font-bold text-dark hover:text-primary no-underline transition-colors">{fy.name}</Link>
                        <p className="text-[10px] text-light mt-0.5">{fy.entries.toLocaleString()} Entries</p>
                      </td>
                      <td className="py-5 px-6 font-mono text-[12px] text-mid">{fy.period}</td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest border rounded-md ${
                          fy.status === 'open' ? 'bg-success-bg text-success border-green-200' :
                          fy.status === 'closed' ? 'bg-surface-muted text-mid border-zinc-200' :
                          'bg-surface-muted text-light border-stone-100'
                        }`}>
                          {fy.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Link href={`/settings/fiscal-years/${fy.id}`} className="text-amber hover:text-primary font-bold uppercase text-[10px] tracking-widest no-underline">View Details</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark text-white p-8 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 text-left">
              <h4 className="text-amber-text font-ui text-lg font-bold mb-3">Statutory Lock</h4>
              <p className="text-light text-sm leading-relaxed mb-6">Current policy prevents modifications to any closed fiscal periods. This ensures 100% data integrity for historical audit trails.</p>
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-amber-text/80">
                <Icon name="verified_user" className="text-sm" />
                Policy Enforced
              </div>
            </div>
            <Icon name="lock" className="absolute -right-8 -bottom-8 text-[120px] opacity-5 transform group-hover:rotate-12 transition-transform" />
          </div>

          <div className="bg-amber-50 border border-amber/30 p-8 shadow-sm text-left">
            <h4 className="font-ui text-sm font-medium font-bold text-dark mb-4 uppercase tracking-widest text-[10px]">Data Retention</h4>
            <p className="text-ui-sm text-sm text-mid leading-relaxed">ComplianceOS retains ledger data for up to 8 years as per IT Act requirements. Archived years can be exported as read-only CSV at any time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
