"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { Icon } from '@/components/ui/icon';

const kpiTiles = [
  { label: "Inventory Value", value: "45,20,500.00", delta: "+2.4% vs last period", variant: "neutral", icon: "account_balance_wallet" },
  { label: "Low Stock Alerts", value: "24", delta: "Action required in 48h", variant: "amber", icon: "warning" },
  { label: "Out of Stock", value: "08", delta: "Procurement pending", variant: "danger", icon: "error" },
  { label: "HSN Compliance", value: "100%", delta: "All SKUs mapped", variant: "success", icon: "verified" },
];

const lowStock = [
  { sku: "RM-002", name: "Steel Rods 12mm", available: 200, unit: "pcs", warehouse: "Main Depot", status: "low" },
  { sku: "FG-002", name: "Finished Widget B", available: 50, unit: "pcs", warehouse: "Unit 2", status: "critical" },
  { sku: "RM-089", name: "Polyester Resin", available: 120, unit: "kg", warehouse: "Main Depot", status: "low" },
];

export default function InventoryDashboardPage() {
  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <span className="font-ui-xs text-ui-xs text-amber-text tracking-[0.15em] uppercase mb-3 block">Operations Control</span>
          <h1 className="font-display-xl text-display-xl text-on-surface leading-none">Inventory Overview</h1>
          <p className="font-ui-sm text-ui-sm text-text-mid mt-3 max-w-lg">Strategic assessment of working capital locked in commodities and finished goods across all entities.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/inventory/products/new" className="px-5 py-3 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-sm rounded-sm hover:bg-stone-50 transition-colors no-underline">
            Manage Products
          </Link>
          <button className="bg-primary-container text-white font-ui-sm text-sm px-6 py-3 rounded-sm hover:bg-primary transition-all flex items-center justify-center gap-2 border-none cursor-pointer shadow-sm">
            Stock Adjustment <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiTiles.map((tile) => (
          <div key={tile.label} className={`bg-white border-[0.5px] border-border-subtle border-t-2 p-6 shadow-sm hover:shadow-md transition-all ${
            tile.variant === 'amber' ? 'border-t-primary-container' :
            tile.variant === 'danger' ? 'border-t-red-600' :
            tile.variant === 'success' ? 'border-t-green-600' :
            'border-t-stone-800'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <span className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">{tile.label}</span>
              <Icon name={tile.icon} className={`${
                tile.variant === 'amber' ? 'text-primary-container' :
                tile.variant === 'danger' ? 'text-danger' :
                tile.variant === 'success' ? 'text-success' :
                'text-stone-400'
              }`} />
            </div>
            <div className={`font-mono text-2xl font-bold mb-2 ${tile.variant === 'amber' ? 'text-primary-container' : 'text-on-surface'}`}>
              {tile.variant !== 'success' && tile.label.includes('Value') ? '₹ ' : ''}{tile.value}
            </div>
            <p className="text-[10px] font-mono text-text-light flex items-center gap-1">
              <Icon name="info" className="text-sm" />
              {tile.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Distribution Chart Placeholder */}
          <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6">Stock Valuation Distribution</h3>
            <div className="flex-1 bg-section-muted border border-dashed border-border-subtle flex items-center justify-center relative overflow-hidden">
               <div className="text-center">
                 <div className="w-48 h-48 rounded-full border-[12px] border-primary-container border-r-transparent border-b-stone-200 rotate-45 mb-4 mx-auto"></div>
                 <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Weighted Value by Category</p>
               </div>
            </div>
          </div>

          {/* Low Stock Table */}
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b-[0.5px] border-border-subtle flex justify-between items-center bg-stone-50">
              <h3 className="font-ui-md font-bold text-on-surface">Critical Reorder List</h3>
              <Link href="/inventory/stock" className="text-ui-xs text-primary font-bold uppercase tracking-widest no-underline hover:underline">View Full Ledger</Link>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b-[0.5px] border-border-subtle">
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">SKU / Item</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Balance</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Warehouse</th>
                  <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {lowStock.map((item) => (
                  <tr key={item.sku} className="hover:bg-stone-50 transition-colors">
                    <td className="py-4 px-6 text-left">
                      <div className="font-ui-sm font-bold text-on-surface">{item.name}</div>
                      <div className="text-[11px] text-text-light mt-0.5">{item.sku}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-on-surface">{item.available} {item.unit}</td>
                    <td className="py-4 px-6 font-ui-sm text-text-mid">{item.warehouse}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                        item.status === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-stone-900 p-8 border-l-4 border-l-primary-container text-left shadow-sm">
            <h3 className="text-white font-ui-xs text-[10px] uppercase tracking-widest font-bold mb-6 opacity-60">Inventory Actions</h3>
            <div className="flex flex-col gap-4">
              <button className="bg-stone-800 border border-stone-700 text-stone-100 p-4 flex items-center justify-between hover:bg-stone-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="inventory" className="text-primary-container" />
                  <span className="font-ui-sm">Inward Stock</span>
                </div>
                <Icon name="chevron_right" className="opacity-0 group-hover:opacity-100 transition-all text-stone-500" />
              </button>
              <button className="bg-stone-800 border border-stone-700 text-stone-100 p-4 flex items-center justify-between hover:bg-stone-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="local_shipping" className="text-primary-container" />
                  <span className="font-ui-sm">Dispatch Order</span>
                </div>
                <Icon name="chevron_right" className="opacity-0 group-hover:opacity-100 transition-all text-stone-500" />
              </button>
              <button className="bg-stone-800 border border-stone-700 text-stone-100 p-4 flex items-center justify-between hover:bg-stone-700 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Icon name="assessment" className="text-primary-container" />
                  <span className="font-ui-sm">Valuation Report</span>
                </div>
                <Icon name="chevron_right" className="opacity-0 group-hover:opacity-100 transition-all text-stone-500" />
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border-[0.5px] border-amber/30 p-8 shadow-sm text-left relative overflow-hidden group">
            <div className="relative z-10">
              <Icon name="analytics" className="text-primary-container mb-4" />
              <h4 className="font-ui-lg text-lg font-bold text-on-surface mb-2">Dead Stock Analysis</h4>
              <p className="font-ui-sm text-sm text-text-mid leading-relaxed">System has identified items worth ₹ 2.4L that haven't moved in 180 days. Consider liquidation or write-down.</p>
            </div>
            <Icon name="inventory_2" className="absolute -right-8 -bottom-8 text-[120px] opacity-5 transform group-hover:rotate-12 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
