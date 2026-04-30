"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const mockPayslips = [
  { id: "1", month: "September 2024", period: "01 Sep - 30 Sep", gross: 80000, deductions: 7550, net: 72450, status: "Paid", date: "30 Sep 2024" },
  { id: "2", month: "August 2024", period: "01 Aug - 31 Aug", gross: 80000, deductions: 7550, net: 72450, status: "Paid", date: "31 Aug 2024" },
  { id: "3", month: "July 2024", period: "01 Jul - 31 Jul", gross: 75000, deductions: 6800, net: 68200, status: "Paid", date: "31 Jul 2024" },
];

export default function MyPayslipsPage() {
  const [year, setYear] = useState("2024");

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 border-b-[0.5px] border-border-subtle pb-6">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-1">My Payslips</h1>
          <p className="font-ui-sm text-sm text-text-mid max-w-lg">Access your monthly compensation statements, tax deductions, and historical earning records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border-[0.5px] border-border-subtle bg-white relative">
            <select 
              className="bg-transparent text-on-surface py-2.5 pl-4 pr-10 outline-none border-none cursor-pointer font-ui-sm text-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <Icon name="calendar_today" className="absolute right-3 pointer-events-none text-text-light text-[18px]" />
          </div>
          <button className="bg-primary-container text-white font-ui-sm text-xs py-2.5 px-6 flex items-center gap-2 hover:bg-primary transition-all rounded-sm group shadow-sm cursor-pointer border-none">
            <Icon name="download" className="text-[18px]" />
            <span className="uppercase tracking-widest font-bold">Download PDF</span>
            <Icon name="arrow_forward" className="text-[16px] transition-transform group-hover:translate-x-1 ml-1" />
          </button>
        </div>
      </div>

      {/* Employee Meta */}
      <section className="bg-white border-[0.5px] border-border-subtle mb-10 relative overflow-hidden shadow-sm p-8">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-1">Employee Name</p>
            <p className="font-ui-lg text-lg font-bold text-on-surface">Rahul Sharma</p>
          </div>
          <div>
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-1">Emp Code</p>
            <p className="font-mono text-lg font-medium text-on-surface">EMP-2024-001</p>
          </div>
          <div>
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-1">Department</p>
            <p className="font-ui-lg text-lg font-bold text-on-surface">Compliance</p>
          </div>
          <div>
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-1">UAN / PF Number</p>
            <p className="font-mono text-lg font-medium text-on-surface">100987654321</p>
          </div>
        </div>
      </section>

      {/* Payslips Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
          <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Compensation History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Month</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Gross Earnings (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Deductions (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Net Take-Home (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Status</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {mockPayslips.map((p) => (
                <tr key={p.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-4 px-6 text-left">
                    <div className="font-ui-sm font-bold text-on-surface text-sm">{p.month}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{p.period}</div>
                  </td>
                  <td className="py-4 px-6 text-right text-stone-600">{formatIndianNumber(p.gross)}</td>
                  <td className="py-4 px-6 text-right text-red-600">-{formatIndianNumber(p.deductions)}</td>
                  <td className="py-4 px-6 text-right font-bold text-on-surface">₹ {formatIndianNumber(p.net)}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase rounded-sm">Paid</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-primary hover:text-amber-stitch border-none bg-transparent cursor-pointer font-bold uppercase text-[10px] tracking-widest">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
