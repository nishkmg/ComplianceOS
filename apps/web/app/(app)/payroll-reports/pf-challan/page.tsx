// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const employees = [
  { name: "Rahul Sharma", code: "EMP-001", uan: "100987654321", basicWages: 45000, pf: 1800, eps: 1250, epf: 550, total: 3600 },
  { name: "Priya Singh", code: "EMP-002", uan: "100987654322", basicWages: 35000, pf: 1800, eps: 1250, epf: 550, total: 3600 },
];

export default function PFChallanPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="flex justify-between items-center px-8 h-20 border-b border-border-subtle bg-white/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1">
            <span>Reports</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span>Statutory Filings</span>
          </div>
          <h2 className="font-display-lg text-lg font-bold text-on-surface tracking-tight">PF Challan Report</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-stone-50 border border-border-subtle rounded-sm h-9 px-3">
            <span className="material-symbols-outlined text-stone-400 text-[18px] mr-2">calendar_month</span>
            <select className="bg-transparent border-none text-sm font-medium outline-none cursor-pointer">
              <option>October 2024</option>
              <option>September 2024</option>
            </select>
          </div>
          <button className="bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-primary transition-colors flex items-center gap-2 border-none cursor-pointer shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export ECR
          </button>
        </div>
      </header>

      <div className="space-y-6 pb-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-border-subtle p-5 rounded-sm shadow-sm text-left">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider relative z-10">Total Employees</h3>
            <p className="font-mono text-2xl font-bold text-on-surface relative z-10 mt-2">142</p>
          </div>
          <div className="bg-white border border-border-subtle p-5 rounded-sm shadow-sm text-left">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider relative z-10">Total Basic Wages</h3>
            <p className="font-mono text-2xl font-bold text-on-surface relative z-10 mt-2">₹42,50,000</p>
          </div>
          <div className="bg-white border border-border-subtle p-5 rounded-sm shadow-sm text-left">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider relative z-10">Total Contribution</h3>
            <p className="font-mono text-2xl font-bold text-on-surface relative z-10 mt-2">₹10,20,000</p>
          </div>
          <div className="bg-stone-900 border border-stone-950 p-5 rounded-sm shadow-sm text-left">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Payable</h3>
            <p className="font-mono text-2xl font-bold text-[#C8860A] mt-2">₹10,41,250</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-border-subtle rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-stone-50">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Employee Contribution Ledger</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">search</span>
              <input className="h-8 pl-9 pr-3 py-1 text-sm border border-border-subtle rounded-sm focus:border-primary w-64 bg-white outline-none" placeholder="Search UAN or Name..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                  <th className="px-6 py-3">Employee Details</th>
                  <th className="px-4 py-3 text-right">Basic Wages</th>
                  <th className="px-4 py-3 text-right">PF (12%)</th>
                  <th className="px-4 py-3 text-right">EPS (8.33%)</th>
                  <th className="px-4 py-3 text-right">EPF (3.67%)</th>
                  <th className="px-6 py-3 text-right font-bold text-[#C8860A]">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-mono text-sm">
                {employees.map((e, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-ui-sm font-bold text-on-surface">{e.name}</div>
                      <div className="text-xs text-text-mt-1"><span className="text-text-light">{e.code}</span> <span className="text-stone-300 mx-2">|</span> <span className="text-text-light">UAN: {e.uan}</span></div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-on-surface">{e.basicWages.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-stone-600">{e.pf.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-stone-600">{e.eps.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-stone-600">{e.epf.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary-container">{e.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-stone-50 border-t-2 border-on-surface font-bold">
                  <td className="px-6 py-4 font-ui-sm uppercase tracking-widest text-xs">Total</td>
                  <td className="px-4 py-4 text-right">80,000</td>
                  <td className="px-4 py-4 text-right">3,600</td>
                  <td className="px-4 py-4 text-right">2,500</td>
                  <td className="px-4 py-4 text-right">1,100</td>
                  <td className="px-6 py-4 text-right font-bold text-primary-container">7,200</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-border-subtle text-sm text-stone-500 bg-white">
            <span>Showing 1 to {employees.length} of 142 entries</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-stone-100 disabled:opacity-50 border-none bg-transparent cursor-pointer"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
              <button className="p-1 rounded hover:bg-stone-100 border-none bg-transparent cursor-pointer"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
