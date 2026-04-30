"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

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
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border-subtle pb-8">
        <div>
          <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-2">GSTR-2B ITC Statement</p>
          <h1 className="font-display-xl text-display-xl text-on-surface">{monthLabel} {year}</h1>
          <p className="font-ui-sm text-text-mid mt-2 max-w-2xl leading-relaxed">ITC auto-drafted statement. Verify that all purchase invoices uploaded by your suppliers are correctly reflected in your ledger.</p>
        </div>
        <div className="text-right">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-1">Reconciliation</p>
          <div className="flex items-center md:justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="font-ui-sm font-medium">Reconciled</span>
          </div>
          <p className="font-ui-xs text-text-mid mt-1">Updated: 14 Oct 2024</p>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm border-t-2 border-t-primary-container">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-4">Total ITC Available</p>
          <p className="font-mono-lg text-primary-container font-bold">₹ 1,26,500.00</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-4">ITC Not Available</p>
          <p className="font-mono-lg text-on-surface font-bold">₹ 4,500.00</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-4">Suppliers Filed</p>
          <p className="font-mono-lg text-on-surface font-bold">12 / 14</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-4">Mismatches</p>
          <p className="font-mono-lg text-red-600 font-bold">0</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
        {/* Table Tabs */}
        <div className="bg-stone-50 border-b-[0.5px] border-border-subtle flex no-print">
          <button
            onClick={() => setActiveTable("available")}
            className={`px-8 py-4 font-ui-sm text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer border-none ${
              activeTab === "available" ? "bg-white text-on-surface border-r-[0.5px] border-border-subtle relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-container" : "text-text-mid hover:text-on-surface border-r-[0.5px] border-border-subtle bg-transparent"
            }`}
          >
            ITC Available
          </button>
          <button
            onClick={() => setActiveTable("notAvailable")}
            className={`px-8 py-4 font-ui-sm text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer border-none ${
              activeTab === "notAvailable" ? "bg-white text-on-surface border-r-[0.5px] border-border-subtle relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary-container" : "text-text-mid hover:text-on-surface border-r-[0.5px] border-border-subtle bg-transparent"
            }`}
          >
            ITC Not Available
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">GSTIN</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">Supplier Name</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">Invoice #</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle text-right">Taxable Value</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle text-right">IGST</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle text-right">CGST</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">SGST</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px] text-on-surface">
              {activeTab === 'available' ? mockData.available.map((item, idx) => (
                <tr key={idx} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">{item.gstin}</td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle font-ui-sm font-medium">{item.name}</td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">{item.inv}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">₹ {item.value}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle text-text-mid">{item.igst}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle text-text-mid">{item.cgst}</td>
                  <td className="py-4 px-6 text-right text-text-mid">{item.sgst}</td>
                </tr>
              )) : mockData.notAvailable.map((item, idx) => (
                <tr key={idx} className="hover:bg-section-muted/30 transition-colors opacity-60">
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">{item.gstin}</td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle font-ui-sm font-medium">{item.name}</td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">{item.inv}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">₹ {item.value}</td>
                  <td colSpan={3} className="py-4 px-6 text-center font-ui-xs uppercase tracking-wider text-red-600 font-bold">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4 no-print">
        <button className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent">Fetch from Portal</button>
        <button className="px-12 py-3 bg-[#C8860A] text-white font-ui-sm font-bold uppercase tracking-widest hover:bg-amber-700 transition-all cursor-pointer border-none shadow-sm">Confirm ITC →</button>
      </div>
    </div>
  );
}
