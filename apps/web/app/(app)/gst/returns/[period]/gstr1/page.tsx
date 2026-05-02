"use client";

import { useParams } from "next/navigation";
import { Icon } from '@/components/ui/icon';
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

interface GSTR1Data {
  b2bInvoices: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    gstin: string;
    partyName: string;
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    totalTaxAmount: string;
  }>;
  b2cLarge: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
  }>;
  b2cSmall: Array<{
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
  }>;
  exports: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    portCode: string;
    shippingBillNumber: string;
    shippingBillDate: string;
    taxableValue: string;
  }>;
  creditDebitNotes: Array<{
    noteNumber: string;
    noteDate: string;
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    gstin: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
  }>;
}

export default function GSTR1DetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);
  const monthLabel = months.find(m => m.value === month)?.label || "September";

  const [activeTable, setActiveTable] = useState("b2b");

  // Mock data for demonstration
  const mockData: GSTR1Data = {
    b2bInvoices: [
      { invoiceNumber: "INV-2026-27-001", invoiceDate: "15 Apr 26", gstin: "27AABCU9603R1ZM", partyName: "Acme Corp", placeOfSupply: "27-Maharashtra", taxableValue: "1,00,000", igstAmount: "0", cgstAmount: "9,000", sgstAmount: "9,000", totalTaxAmount: "18,000" },
      { invoiceNumber: "INV-2026-27-002", invoiceDate: "18 Apr 26", gstin: "29AABCT1234R1Z5", partyName: "TechStart Ltd", placeOfSupply: "29-Karnataka", taxableValue: "50,000", igstAmount: "9,000", cgstAmount: "0", sgstAmount: "0", totalTaxAmount: "9,000" },
    ],
    b2cLarge: [
      { invoiceNumber: "INV-2026-27-003", invoiceDate: "20 Apr 26", placeOfSupply: "27-Maharashtra", taxableValue: "2,50,000", igstAmount: "0", cgstAmount: "22,500", sgstAmount: "22,500" },
    ],
    b2cSmall: [
      { placeOfSupply: "27-Maharashtra", taxableValue: "50,000", igstAmount: "0", cgstAmount: "4,500", sgstAmount: "4,500" },
    ],
    exports: [
      { invoiceNumber: "EXP-2026-27-001", invoiceDate: "22 Apr 26", portCode: "INBOM1", shippingBillNumber: "SB123456", shippingBillDate: "21 Apr 26", taxableValue: "5,00,000" },
    ],
    creditDebitNotes: [
      { noteNumber: "CN-001", noteDate: "25 Apr 26", originalInvoiceNumber: "INV-2026-27-001", originalInvoiceDate: "15 Apr 26", gstin: "27AABCU9603R1ZM", taxableValue: "10,000", igstAmount: "0", cgstAmount: "900", sgstAmount: "900" },
    ],
  };

  const tabs = [
    { id: "b2b", label: "4A, 4B, 4C, 6B, 6C - B2B Invoices" },
    { id: "b2cLarge", label: "5A, 5B - B2C Large Invoices" },
    { id: "b2cSmall", label: "7 - B2C Small (Others)" },
    { id: "exports", label: "6A - Exports" },
    { id: "cdn", label: "9B - Credit / Debit Notes" },
  ];

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">GSTR-1 Outward Supplies</p>
          <h1 className="font-display text-display-lg font-semibold text-dark">{monthLabel} {year}</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">Details of outward supplies of goods or services. Ensure all B2B invoices and B2C aggregates are accurately reconciled before filing.</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-[11px] text-light uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center md:justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-amber"></span>
            <span className="font-ui text-[13px] font-medium">Pending Filing</span>
          </div>
          <p className="font-ui text-[11px] text-mid mt-1">Due: 11 Oct 2024</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Total Taxable</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">₹ 12,45,600.00</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Total IGST</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">₹ 2,24,208.00</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Total CGST</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">₹ 1,12,104.00</p>
        </div>
        <div className="bg-surface border border-border shadow-sm rounded-md p-4 border-t-2 border-t-amber">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2">Total SGST</p>
          <p className="font-mono text-[14px] tabular-nums text-dark font-bold">₹ 1,12,104.00</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
        {/* Table Tabs */}
        <div className="bg-surface-muted border-b border-border flex overflow-x-auto no-print">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTable(tab.id)}
              className={`px-5 py-3 font-ui text-[11px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors cursor-pointer border-none ${
                activeTable === tab.id
                  ? "bg-surface text-dark border-r border-border relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber"
                  : "text-mid hover:text-dark border-r border-border bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="p-3 border-b border-border flex justify-between items-center bg-surface no-print">
          <div className="relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light" />
            <input className="pl-9 pr-4 py-1.5 border border-border bg-surface-muted rounded-md text-[12px] w-56 outline-none focus:border-primary font-ui" placeholder="Search invoices..." />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-border text-dark font-ui text-[11px] rounded-md hover:bg-surface-muted transition-colors cursor-pointer bg-transparent">Download JSON</button>
            <button className="px-3 py-1.5 bg-amber text-white font-ui text-[11px] rounded-md hover:bg-amber-hover transition-colors cursor-pointer border-none">Import Excel</button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              {activeTable === "b2b" && (
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Invoice #</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Customer</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Date</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">SGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Total</th>
                </tr>
              )}
              {activeTable === "b2cLarge" && (
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Invoice #</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Date</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">POS</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">SGST</th>
                </tr>
              )}
              {activeTable === "b2cSmall" && (
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Place of Supply</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">SGST</th>
                </tr>
              )}
              {activeTable === "exports" && (
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Invoice #</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Date</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Port Code</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Shipping Bill</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Taxable Value</th>
                </tr>
              )}
              {activeTable === "cdn" && (
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Note #</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Date</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Original Inv</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">GSTIN</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">SGST</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {activeTable === "b2b" && mockData.b2bInvoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-ui text-[12px] text-dark border-r border-border">{inv.partyName}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-mid border-r border-border">{inv.invoiceDate}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {inv.taxableValue}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.igstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.cgstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.sgstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark font-bold">₹ {inv.totalTaxAmount}</td>
                </tr>
              ))}
              {activeTable === "b2cLarge" && mockData.b2cLarge.map((inv, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-mid border-r border-border">{inv.invoiceDate}</td>
                  <td className="py-2.5 px-4 font-ui text-[12px] text-dark border-r border-border">{inv.placeOfSupply}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {inv.taxableValue}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.igstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.cgstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid">{inv.sgstAmount}</td>
                </tr>
              ))}
              {activeTable === "b2cSmall" && mockData.b2cSmall.map((inv, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-ui text-[12px] text-dark border-r border-border">{inv.placeOfSupply}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {inv.taxableValue}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.igstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.cgstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid">{inv.sgstAmount}</td>
                </tr>
              ))}
              {activeTable === "exports" && mockData.exports.map((inv, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-mid border-r border-border">{inv.invoiceDate}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.portCode}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.shippingBillNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark">₹ {inv.taxableValue}</td>
                </tr>
              ))}
              {activeTable === "cdn" && mockData.creditDebitNotes.map((inv, idx) => (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.noteNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-mid border-r border-border">{inv.noteDate}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.originalInvoiceNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-dark border-r border-border">{inv.gstin}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-dark border-r border-border">₹ {inv.taxableValue}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.igstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid border-r border-border">{inv.cgstAmount}</td>
                  <td className="py-2.5 px-4 font-mono text-[12px] tabular-nums text-right text-mid">{inv.sgstAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 no-print">
        <button className="px-5 py-2.5 border border-border text-dark font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md">Discard Return</button>
        <button className="px-10 py-2.5 bg-amber text-white font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all cursor-pointer border-none shadow-sm rounded-md">File Return →</button>
      </div>
    </div>
  );
}
