"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
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
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber uppercase tracking-widest mb-2">
            <span>Reports</span>
            <Icon name="chevron_right" className="text-[12px]" />
            <span>Statutory Filings</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-dark">PF Challan Report</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-muted border border-border rounded-md h-9 px-3">
            <Icon name="calendar_month" className="text-light text-[18px] mr-2" />
            <select className="bg-transparent border-none text-sm font-medium outline-none cursor-pointer">
              <option>October 2024</option>
              <option>September 2024</option>
            </select>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-[18px]" /> Export ECR
          </button>
        </div>
      </header>

      <div className="space-y-6 pb-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-xs font-bold text-mid uppercase tracking-wider relative z-10">Total Employees</h3>
            <p className="font-mono text-2xl font-bold text-dark relative z-10 mt-2">142</p>
          </div>
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-xs font-bold text-mid uppercase tracking-wider relative z-10">Total Basic Wages</h3>
            <p className="font-mono text-2xl font-bold text-dark relative z-10 mt-2">₹42,50,000</p>
          </div>
          <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
            <h3 className="text-xs font-bold text-mid uppercase tracking-wider relative z-10">Total Contribution</h3>
            <p className="font-mono text-2xl font-bold text-dark relative z-10 mt-2">₹10,20,000</p>
          </div>
          <div className="bg-dark border border-stone-950 p-5 rounded-md shadow-sm text-left">
            <h3 className="text-xs font-bold text-light uppercase tracking-wider">Total Payable</h3>
            <p className="font-mono text-2xl font-bold text-amber mt-2">₹10,41,250</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-muted">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Employee Contribution Ledger</h3>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-light text-[18px]" />
              <input className="h-8 pl-9 pr-3 py-1 text-sm border border-border rounded-md focus:border-primary w-64 bg-surface outline-none" placeholder="Search UAN or Name..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted text-[11px] uppercase tracking-wider text-mid font-bold">
                  <th className="px-6 py-3">Employee Details</th>
                  <th className="px-4 py-3 text-right">Basic Wages</th>
                  <th className="px-4 py-3 text-right">PF (12%)</th>
                  <th className="px-4 py-3 text-right">EPS (8.33%)</th>
                  <th className="px-4 py-3 text-right">EPF (3.67%)</th>
                  <th className="px-6 py-3 text-right font-bold text-amber">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-mono text-sm">
                {employees.map((e, i) => (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-ui text-[13px] font-bold text-dark">{e.name}</div>
                      <div className="text-xs text-text-mt-1"><span className="text-light">{e.code}</span> <span className="text-lighter mx-2">|</span> <span className="text-light">UAN: {e.uan}</span></div>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-dark">{e.basicWages.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-mid">{e.pf.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-mid">{e.eps.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-mid">{e.epf.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-amber">{e.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted border-t-2 border-border font-bold">
                  <td className="px-6 py-4 font-ui text-[13px] uppercase tracking-widest text-xs">Total</td>
                  <td className="px-4 py-4 text-right">80,000</td>
                  <td className="px-4 py-4 text-right">3,600</td>
                  <td className="px-4 py-4 text-right">2,500</td>
                  <td className="px-4 py-4 text-right">1,100</td>
                  <td className="px-6 py-4 text-right font-bold text-amber">7,200</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-border text-sm text-mid bg-surface">
            <span>Showing 1 to {employees.length} of 142 entries</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-surface-muted disabled:opacity-50 border-none bg-transparent cursor-pointer"><Icon name="chevron_left" className="text-[20px]" /></button>
              <button className="p-1 rounded hover:bg-surface-muted border-none bg-transparent cursor-pointer"><Icon name="chevron_right" className="text-[20px]" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
