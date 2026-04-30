"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";

export default function FiscalYearDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-12">
        <Link className="hover:text-on-surface transition-colors no-underline flex items-center gap-1" href="/settings/fiscal-years">
          <Icon name="arrow_back" className="text-[16px]" />
          Fiscal Years
        </Link>
        <span className="text-border-subtle">/</span>
        <span className="text-on-surface">FY 2024-25</span>
      </div>

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b-[0.5px] border-border-subtle pb-8">
        <div className="text-left">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="font-display-xl text-4xl text-on-surface tracking-tight">FY 2024-25</h1>
            <span className="font-ui-xs text-[10px] uppercase tracking-widest text-amber-text border-[0.5px] border-primary-container px-3 py-1 bg-[#fff8f4] rounded-sm font-bold">Open</span>
          </div>
          <p className="font-ui-md text-ui-md text-text-mid">Reporting period: April 1, 2024 — March 31, 2025</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border-[0.5px] border-on-surface px-5 py-2.5 font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors cursor-pointer bg-transparent">
            <Icon name="download" className="text-[18px]" />
            Export Ledger
          </button>
        </div>
      </header>

      {/* Ledger Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-primary-container shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex justify-between items-start mb-6 text-text-light">
            <span className="font-ui-xs text-[10px] uppercase tracking-widest font-bold">Voucher Count</span>
            <Icon name="receipt_long" className="text-lg" />
          </div>
          <div className="font-mono text-3xl text-on-surface font-bold mb-2">12,483</div>
          <div className="font-ui-sm text-xs text-text-light flex items-center gap-1">
            <Icon name="trending_up" className="text-[14px] text-green-600" />
            <span className="text-green-700 font-bold">+4.2%</span> vs previous year
          </div>
        </div>

        <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex justify-between items-start mb-6 text-text-light">
            <span className="font-ui-xs text-[10px] uppercase tracking-widest font-bold">GST Liability</span>
            <Icon name="gavel" className="text-lg" />
          </div>
          <div className="font-mono text-3xl text-on-surface font-bold mb-2">₹ 8.42L</div>
          <div className="font-ui-sm text-xs text-text-light">
            Accrued for periods Q1-Q3
          </div>
        </div>

        <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex justify-between items-start mb-6 text-text-light">
            <span className="font-ui-xs text-[10px] uppercase tracking-widest font-bold">Last Activity</span>
            <Icon name="update" className="text-lg" />
          </div>
          <div className="font-mono text-xl text-on-surface font-bold mb-2 mt-2 leading-relaxed">24 Oct 2024<br/>14:32:01 IST</div>
          <div className="font-ui-sm text-xs text-text-light uppercase tracking-widest font-bold">
            Automated feed active
          </div>
        </div>
      </section>

      {/* Action Panel: Close Fiscal Year */}
      <section className="border-t-[0.5px] border-border-subtle pt-16 text-left">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-5">
            <h2 className="font-display-xl text-3xl text-on-surface mb-6 font-bold">Year-End Finalization</h2>
            <p className="font-ui-md text-sm text-text-mid leading-relaxed mb-6">
              Initiating the closure of a fiscal year locks all ledgers and prevents further modifications to the accounting period. This process is mandatory for generating final statutory reports.
            </p>
            <div className="bg-[#fff8f4] border-[0.5px] border-amber/30 p-6 rounded-sm">
               <p className="font-ui-sm text-xs text-amber-900 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                 <Icon name="info" className="text-sm" />
                 Closure Requirements
               </p>
               <ul className="space-y-2 list-none p-0">
                 <li className="flex items-center gap-2 font-ui-sm text-[13px] text-amber-800">
                   <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                   All draft journal entries must be posted or deleted
                 </li>
                 <li className="flex items-center gap-2 font-ui-sm text-[13px] text-amber-800">
                   <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                   GST reconciliation for all periods must be complete
                 </li>
               </ul>
            </div>
          </div>
          <div className="md:col-span-7 flex flex-col justify-center items-end">
            <button className="bg-stone-100 border border-border-subtle text-text-mid px-12 py-4 font-ui-sm font-bold uppercase tracking-widest cursor-not-allowed opacity-50">
              Close Fiscal Year
            </button>
            <p className="mt-4 text-[11px] text-text-light text-right uppercase tracking-widest">
              Available in 158 days (March 31, 2025)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
