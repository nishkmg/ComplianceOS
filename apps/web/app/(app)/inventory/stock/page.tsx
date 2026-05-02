"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";

interface StockItem {
  id: string;
  sku: string;
  name: string;
  available: number;
  committed: number;
  netAvailable: number;
  unit: string;
  warehouse: string;
  status: "healthy" | "low" | "critical";
}

const mockStock: StockItem[] = [
  { id: "1", sku: "RM-001", name: "Cotton Yarn - 40s Count", available: 5000, committed: 1200, netAvailable: 3800, unit: "kg", warehouse: "Main Depot (BOM)", status: "healthy" },
  { id: "2", sku: "RM-002", name: "Steel Rods 12mm", available: 1000, committed: 800, netAvailable: 200, unit: "pcs", warehouse: "Main Depot (BOM)", status: "low" },
  { id: "3", sku: "RM-003", name: "Packaging Material - Corrugated", available: 150, committed: 100, netAvailable: 50, unit: "box", warehouse: "Main Depot (BOM)", status: "critical" },
  { id: "4", sku: "FG-001", name: "Finished Widget A", available: 2000, committed: 500, netAvailable: 1500, unit: "pcs", warehouse: "Unit 2 (Pune)", status: "healthy" },
  { id: "5", sku: "FG-002", name: "Finished Widget B", available: 500, committed: 450, netAvailable: 50, unit: "pcs", warehouse: "Unit 2 (Pune)", status: "critical" },
];

export default function StockPage() {
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Inventory Management</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Stock Levels</h1>
          <p className="text-[13px] text-secondary font-ui mt-1 max-w-lg">Real-time assessment of warehouse commodities, commitments, and procurement statuses.</p>
        </div>
        <button className="btn btn-primary group flex items-center gap-2">
          Adjust Stock <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>
        <div className="px-6 py-4 border-b-[0.5px] border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="filter_list" className="text-light text-[18px]" />
            <span className="font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-widest">Active Warehouse: Main Depot (BOM)</span>
          </div>
          <div className="flex gap-4">
            <button className="font-ui text-[11px] text-ui-xs text-mid hover:text-dark transition-colors tracking-widest uppercase cursor-pointer border-none bg-transparent">Export CSV</button>
            <button className="font-ui text-[11px] text-ui-xs text-mid hover:text-dark transition-colors tracking-widest uppercase cursor-pointer border-none bg-transparent">Print</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-muted">
                <th className="px-6 py-4 border-b-[0.5px] border-border font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-[0.1em] font-medium w-1/3">Product / SKU</th>
                <th className="px-6 py-4 border-b-[0.5px] border-border font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-[0.1em] font-medium text-right">Available</th>
                <th className="px-6 py-4 border-b-[0.5px] border-border font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-[0.1em] font-medium text-right">Committed</th>
                <th className="px-6 py-4 border-b-[0.5px] border-border font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-[0.1em] font-medium text-right">Net Available</th>
                <th className="px-6 py-4 border-b-[0.5px] border-border font-ui text-[11px] text-ui-xs text-dark-variant uppercase tracking-[0.1em] font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {mockStock.map((item) => (
                <tr key={item.id} className="hover:bg-surface-muted/50 transition-colors group">
                  <td className="px-6 py-5 text-left">
                    <div className="font-ui text-[13px] text-dark font-medium">{item.name}</div>
                    <div className="font-mono text-[12px] text-mid mt-0.5">{item.sku} · {item.warehouse}</div>
                  </td>
                  <td className="px-6 py-5 font-mono text-right text-dark">{item.available.toLocaleString('en-IN')} {item.unit}</td>
                  <td className="px-6 py-5 font-mono text-right text-mid">{item.committed.toLocaleString('en-IN')} {item.unit}</td>
                  <td className="px-6 py-5 font-mono text-right font-bold text-dark">{item.netAvailable.toLocaleString('en-IN')} {item.unit}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                      item.status === 'healthy' ? 'bg-success-bg text-success border-green-200' :
                      item.status === 'low' ? 'bg-amber-50 text-amber-text border-amber-200' :
                      'bg-danger-bg text-danger border-red-200'
                    }`}>
                      {item.status === 'healthy' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Critical'}
                    </span>
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
