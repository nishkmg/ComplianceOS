"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const reportData = [
  { sku: "RM-001", name: "Cotton Yarn 40s", category: "Raw Material", qty: 3800, cost: 245, value: 931000 },
  { sku: "RM-002", name: "Steel Rods 12mm", category: "Raw Material", qty: 200, cost: 68, value: 13600 },
  { sku: "FG-001", name: "Finished Widget A", category: "Finished Good", qty: 1500, cost: 850, value: 1275000 },
];

export default function InventoryReportsPage() {
  const [reportType, setReportType] = useState("valuation");

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mt-0 mb-8">
        <div className="text-left">
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Inventory Reports</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Inventory Valuation</h1>
          <p className="text-[13px] text-secondary font-ui mt-1 max-w-2xl leading-relaxed">Comprehensive breakdown of current stock levels, calculated asset values, and recent movement metrics across all registered warehouses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Icon name="print" className="text-[18px]" />
            Print Report
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-[18px]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-amber flex flex-col lg:flex-row gap-6 items-end">
        <div className="w-full lg:w-1/3 text-left">
          <label className="block font-ui text-[10px] uppercase tracking-widest text-amber-text mb-2 font-bold">Report Type</label>
          <div className="relative">
            <select 
              className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-[13px] text-dark focus:border-primary outline-none appearance-none"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="valuation">Valuation Summary (FIFO)</option>
              <option value="movement">Stock Movement Log</option>
              <option value="expiry">Expiry & Obsolescence</option>
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
          </div>
        </div>
        <div className="w-full lg:w-1/4 text-left">
          <label className="block font-ui text-[10px] uppercase tracking-widest text-mid mb-2 font-bold">As of Date</label>
          <input className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none" type="date" defaultValue="2024-03-31" />
        </div>
        <button className="lg:ml-auto px-8 py-3 bg-dark text-white font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-md border-none cursor-pointer shadow-sm">
          Run Analysis
        </button>
      </div>

      {/* Report Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-muted border-b-[0.5px] border-border text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">Product Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-right">Qty on Hand</th>
                <th className="py-4 px-6 text-right">Avg Cost (₹)</th>
                <th className="py-4 px-6 text-right">Inventory Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {reportData.map((row) => (
                <tr key={row.sku} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-amber-text">{row.sku}</td>
                  <td className="py-4 px-6 font-ui text-[13px] font-bold text-dark">{row.name}</td>
                  <td className="py-4 px-6 font-ui text-[13px] text-mid">{row.category}</td>
                  <td className="py-4 px-6 text-right text-dark">{row.qty.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right text-mid">{row.cost.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right font-bold text-dark">{formatIndianNumber(row.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-dark text-white font-bold border-t-2 border-amber">
                <td colSpan={3} className="py-5 px-6 font-ui text-[13px] uppercase tracking-widest text-xs">Consolidated Value</td>
                <td className="py-5 px-6 text-right font-mono text-lg" colSpan={3}>
                  ₹ {formatIndianNumber(reportData.reduce((s, r) => s + r.value, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
