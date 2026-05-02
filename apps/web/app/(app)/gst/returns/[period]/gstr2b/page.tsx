"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { Icon } from '@/components/ui/icon';

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

export default function GSTR2BDetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);
  const monthLabel = months.find(m => m.value === month)?.label || "September";

  const [activeTab, setActiveTable] = useState("available");

  const mockData = {
    available: [
      { gstin: "27AABCU9603R1ZM", name: "Acme Suppliers", inv: "SUP-001", date: "10 Apr 26", value: "1,00,000", igst: "0", cgst: "9,000", sgst: "9,000", total: "18,000" },
      { gstin: "29AABCT1234R1Z5", name: "Tech Components", inv: "SUP-002", date: "12 Apr 26", value: "50,000", igst: "9,000", cgst: "0", sgst: "0", total: "9,000" },
    ],
    notAvailable: [
      { gstin: "07AAACR1234E1Z1", name: "Delhi Logistics", inv: "DL-992", date: "05 Apr 26", value: "25,000", igst: "4,500", reason: "GSTIN Inactive" },
    ]
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">GSTR-2B ITC Statement</p>
          <h1 className="font-display text-display-lg font-semibold text-dark">{monthLabel} {year}</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">ITC auto-drafted statement. Verify that all purchase invoices uploaded by your suppliers are correctly reflected in your ledger.</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-[11px] text-light uppercase tracking-widest mb-1">Reconciliation</p>
          <div className="flex items-center md:justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="font-ui text-[13px] font-medium">Reconciled</span>
          </div>
          <p className="font-ui text-[11px] text-mid mt-1">Updated: 14 Oct 2024</p>
        </div>
      </div>

      {/* ITC Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Total ITC Available</p>
          <p className="font-mono text-[14px] tabular-nums text-amber font-bold">₹ 1,26,500.00</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">ITC Not Available</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">₹ 4,500.00</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Suppliers Filed</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">12 / 14</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Mismatches</p>
          <p className="font-mono text-[14px] tabular-nums text-danger font-bold">0</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
        {/* Table Tabs */}
        <div className="bg-surface-muted border-b border-border flex no-print">
          <button
            onClick={() => setActiveTable("available")}
            className={`px-6 py-3 font-ui text-[11px] uppercase tracking-widest font-bold transition-colors cursor-pointer border-none ${
              activeTab === "available"
                ? "bg-surface text-dark border-r border-border relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber"
                : "text-mid hover:text-dark border-r border-border bg-transparent"
            }`}
          >
            ITC Available
          </button>
          <button
            onClick={() => setActiveTable("notAvailable")}
            className={`px-6 py-3 font-ui text-[11px] uppercase tracking-widest font-bold transition-colors cursor-pointer border-none ${
              activeTab === "notAvailable"
                ? "bg-surface text-dark border-r border-border relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber"
                : "text-mid hover:text-dark border-r border-border bg-transparent"
            }`}
          >
            ITC Not Available
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Supplier</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">GSTIN</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Invoice #</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Date</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">SGST</th>
                <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Eligible ITC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {activeTab === 'available' ? mockData.available.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-ui text-[12px] text-dark font-medium border-r border-border">{item.name}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-mid border-r border-border">{item.gstin}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{item.inv}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-mid border-r border-border">{item.date}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {item.value}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{item.igst}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{item.cgst}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{item.sgst}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark font-bold">₹ {item.total}</td>
                </tr>
              )) : mockData.notAvailable.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors opacity-60">
                  <td className="py-2.5 px-4 font-ui text-[12px] text-dark font-medium border-r border-border">{item.name}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-mid border-r border-border">{item.gstin}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{item.inv}</td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-mid border-r border-border">{item.date}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {item.value}</td>
                  <td colSpan={4} className="py-2.5 px-4 text-center font-ui text-[11px] uppercase tracking-wider text-danger font-bold">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 no-print">
        <button className="px-5 py-2.5 border border-border text-dark font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md">Fetch from Portal</button>
        <button className="px-10 py-2.5 bg-amber text-white font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all cursor-pointer border-none shadow-sm rounded-md">Confirm ITC →</button>
      </div>
    </div>
  );
}
