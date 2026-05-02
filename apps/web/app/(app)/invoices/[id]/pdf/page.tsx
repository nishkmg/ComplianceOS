"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

const mockInvoice = {
  invoiceNumber: "INV-2024-0042",
  date: "24 Oct 2024",
  dueDate: "23 Nov 2024",
  client: "Reliance Industries Ltd.",
  clientAddress: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra - 400021",
  clientGstin: "27AAACA6873Q1Z2",
  items: [
    { name: "Enterprise Retainer - Q3", hsn: "998311", qty: 1, rate: 125000, amount: 125000 },
    { name: "Tax Audit Assistance", hsn: "998312", qty: 1, rate: 45000, amount: 45000 },
  ],
  subtotal: 170000,
  tax: 30600,
  total: 200600,
  totalWords: "Rupees Two Lakh Six Hundred Only."
};

export default function InvoicePdfPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="bg-page-bg min-h-screen flex flex-col antialiased text-left">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-surface border-b-[0.5px] border-border px-8 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            <Icon name="arrow_back" />
          </button>
          <span className="font-ui text-[13px] font-bold uppercase tracking-widest text-on-surface">Invoice PDF Preview</span>
        </div>
        <div className="flex gap-4">
           <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md shadow-sm">
             Share Link
           </button>
           <button onClick={() => window.print()} className="bg-amber text-white px-8 py-2 rounded-md font-ui text-[13px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all border-none cursor-pointer shadow-sm">
             Download PDF
           </button>
        </div>
      </header>

      <main className="flex-1 p-12 flex justify-center overflow-y-auto">
        {/* A4 Document Container */}
        <article className="bg-surface w-full max-w-[210mm] shadow-screenshot border-[0.5px] border-border p-16 relative flex flex-col text-on-surface">
           <div className="absolute top-0 left-0 right-0 h-1 bg-amber"></div>
           
           <div className="flex justify-between items-start border-b-[0.5px] border-border pb-10 mb-10">
              <div className="flex flex-col gap-2">
                 <h2 className="font-display text-lg text-2xl font-bold tracking-tight">ComplianceOS</h2>
                 <div className="text-text-mid font-ui text-[13px] text-[12px] leading-relaxed max-w-[280px]">
                    1204, Lodha Excelus<br/>
                    Apollo Bunder, Mumbai 400001<br/>
                    GSTIN: 27AADCC1234E1Z5
                 </div>
              </div>
              <div className="text-right">
                 <h1 className="font-display text-[32px] uppercase tracking-[0.2em] text-text-light mb-6">Tax Invoice</h1>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
                    <span className="font-ui text-[10px] text-text-light uppercase tracking-widest font-bold">Invoice No:</span>
                    <span className="font-mono text-sm font-bold text-right">{mockInvoice.invoiceNumber}</span>
                    <span className="font-ui text-[10px] text-text-light uppercase tracking-widest font-bold">Date:</span>
                    <span className="font-mono text-sm text-right">{mockInvoice.date}</span>
                 </div>
              </div>
           </div>

           <div className="flex justify-between mb-12">
              <div className="flex flex-col gap-2">
                 <span className="font-ui text-[10px] text-amber-text uppercase tracking-widest font-bold">Billed To</span>
                 <h4 className="font-ui text-lg font-bold">{mockInvoice.client}</h4>
                 <div className="text-text-mid font-ui text-[13px] leading-relaxed max-w-[340px] mt-1">
                    {mockInvoice.clientAddress}<br/>
                    <span className="font-bold text-on-surface block mt-2">GSTIN: {mockInvoice.clientGstin}</span>
                 </div>
              </div>
           </div>

           <table className="w-full text-left border-collapse mb-12">
              <thead>
                 <tr className="border-b-[0.5px] border-border">
                    <th className="py-4 font-ui text-[10px] text-text-light uppercase tracking-widest font-bold">Description</th>
                    <th className="py-4 font-ui text-[10px] text-text-light uppercase tracking-widest font-bold text-right">HSN/SAC</th>
                    <th className="py-4 font-ui text-[10px] text-text-light uppercase tracking-widest font-bold text-right">Qty</th>
                    <th className="py-4 font-ui text-[10px] text-text-light uppercase tracking-widest font-bold text-right">Amount (₹)</th>
                 </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle divide-dashed">
                 {mockInvoice.items.map((item, i) => (
                   <tr key={i}>
                      <td className="py-5 pr-8">
                         <p className="font-bold font-ui text-[13px]">{item.name}</p>
                      </td>
                      <td className="py-5 text-right font-mono text-sm text-text-mid">{item.hsn}</td>
                      <td className="py-5 text-right font-mono text-sm">{item.qty}</td>
                      <td className="py-5 text-right font-mono text-sm font-bold">{formatIndianNumber(item.amount)}</td>
                   </tr>
                 ))}
              </tbody>
           </table>

           <div className="flex justify-end mt-auto">
              <div className="w-1/2 space-y-3">
                 <div className="flex justify-between text-text-mid text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">₹ {formatIndianNumber(mockInvoice.subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-text-mid text-sm">
                    <span>GST (18%)</span>
                    <span className="font-mono">₹ {formatIndianNumber(mockInvoice.tax)}</span>
                 </div>
                 <div className="flex justify-between border-t-2 border-amber pt-4 mt-2">
                    <span className="font-ui text-lg font-bold uppercase tracking-widest">Grand Total</span>
                    <span className="font-mono text-2xl font-bold text-amber">₹ {formatIndianNumber(mockInvoice.total)}</span>
                 </div>
                 <p className="text-right font-ui text-[10px] text-text-light italic mt-2">{mockInvoice.totalWords}</p>
              </div>
           </div>

           <footer className="mt-16 pt-8 border-t-[0.5px] border-border flex justify-between items-end">
              <div className="w-2/3">
                 <h5 className="font-ui text-[10px] text-text-light uppercase tracking-widest mb-2 font-bold">Bank Details</h5>
                 <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-1 font-ui text-[13px] text-[12px]">
                    <span className="text-text-mid">Bank Name:</span> <span className="font-bold">HDFC Bank, Fort Branch</span>
                    <span className="text-text-mid">Account No:</span> <span className="font-mono">50200012345678</span>
                    <span className="text-text-mid">IFSC Code:</span> <span className="font-mono">HDFC0000060</span>
                 </div>
              </div>
              <div className="text-right flex flex-col items-center">
                 <div className="w-32 h-16 border-b border-border mb-2"></div>
                 <p className="font-ui text-[10px] text-text-light uppercase tracking-widest font-bold">Authorized Signatory</p>
                 <p className="font-ui text-[10px] text-text-mid mt-0.5">ComplianceOS Solutions</p>
              </div>
           </footer>
        </article>
      </main>
    </div>
  );
}
