// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const mockInvoice = {
  id: "42",
  invoiceNumber: "INV-2024-0042",
  status: "DRAFT",
  client: "Mehta Textiles Pvt. Ltd.",
  date: "2024-10-24",
  dueDate: "2024-11-23",
  items: [
    { id: 1, description: "Statutory Audit Fees - FY 23-24", qty: 1, rate: 150000, tax: "GST 18%", hsn: "998221" },
    { id: 2, description: "Consulting Retainer - Oct 2024", qty: 1, rate: 50000, tax: "GST 18%", hsn: "998311" },
  ],
  notes: "Payment due within 30 days. Please remit to HDFC Bank A/c 50200012345678.",
};

export default function EditInvoicePage() {
  const [invoice, setInvoice] = useState(mockInvoice);

  const subtotal = invoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;

  return (
    <div className="bg-page-bg min-h-screen flex flex-col antialiased">
      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="max-w-[1200px] w-full flex flex-col lg:flex-row gap-8">
          {/* Left Column: Form */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8 text-left">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Link href="/invoices" className="text-text-mid hover:text-on-surface transition-colors flex items-center no-underline">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                </Link>
                <span className="font-ui-xs text-ui-xs text-amber-text tracking-widest uppercase">EDIT INVOICE</span>
                <span className="bg-surface-variant text-on-surface px-2 py-0.5 rounded text-[10px] font-mono font-medium ml-auto">{invoice.status}</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface">{invoice.invoiceNumber}</h1>
            </div>

            {/* Form Sections */}
            <div className="bg-white border border-border-subtle p-6 shadow-card relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
              
              <h3 className="font-ui-sm text-ui-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[11px] text-text-light border-b border-border-subtle pb-2">Client Details</h3>
              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="flex flex-col gap-1">
                  <label className="font-ui-xs text-ui-xs text-text-mid">Billed To</label>
                  <select className="bg-page-bg border border-border-subtle rounded px-3 py-2 font-ui-sm text-ui-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
                    <option selected>{invoice.client}</option>
                    <option>Sharma Enterprises</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-ui-xs text-ui-xs text-text-mid">Date of Issue</label>
                    <input className="bg-page-bg border border-border-subtle rounded px-3 py-2 font-ui-sm text-ui-sm font-mono focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" type="date" defaultValue={invoice.date} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-ui-xs text-ui-xs text-text-mid">Due Date</label>
                    <input className="bg-page-bg border border-border-subtle rounded px-3 py-2 font-ui-sm text-ui-sm font-mono focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" type="date" defaultValue={invoice.dueDate} />
                  </div>
                </div>
              </div>

              <h3 className="font-ui-sm text-ui-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[11px] text-text-light border-b border-border-subtle pb-2 flex justify-between items-center">
                Line Items
                <button className="text-primary-container hover:text-amber-stitch flex items-center gap-1 transition-colors border-none bg-transparent cursor-pointer font-ui-sm font-bold"><span className="material-symbols-outlined text-[14px]">add</span> Add Item</button>
              </h3>
              
              <div className="flex flex-col gap-4 mb-8">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 p-3 border border-border-subtle bg-page-bg relative group">
                    <button className="absolute -right-2 -top-2 bg-white border border-border-subtle rounded-full w-6 h-6 flex items-center justify-center text-text-light hover:text-red-600 hover:border-red-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <input className="bg-transparent border-b border-border-subtle border-dashed pb-1 font-ui-sm text-ui-sm focus:outline-none focus:border-primary-container outline-none" placeholder="Item description" type="text" defaultValue={item.description} />
                    <div className="flex gap-4 mt-2">
                      <div className="flex flex-col gap-1 w-20">
                        <label className="font-ui-xs text-ui-xs text-text-light">Qty</label>
                        <input className="bg-transparent border-b border-border-subtle pb-1 font-mono text-sm focus:outline-none focus:border-primary-container outline-none" type="number" defaultValue={item.qty} />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="font-ui-xs text-ui-xs text-text-light">Rate (₹)</label>
                        <input className="bg-transparent border-b border-border-subtle pb-1 font-mono text-sm focus:outline-none focus:border-primary-container outline-none" type="text" defaultValue={formatIndianNumber(item.rate)} />
                      </div>
                      <div className="flex flex-col gap-1 w-24">
                        <label className="font-ui-xs text-ui-xs text-text-light">Tax</label>
                        <select className="bg-transparent border-b border-border-subtle pb-1 font-ui-sm text-ui-sm focus:outline-none focus:border-primary-container outline-none">
                          <option selected>{item.tax}</option>
                          <option>None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1 mb-8">
                <label className="font-ui-xs text-ui-xs text-text-mid">Notes / Terms</label>
                <textarea className="bg-page-bg border border-border-subtle rounded px-3 py-2 font-ui-sm text-ui-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none" rows="2" defaultValue={invoice.notes}></textarea>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                <button className="text-red-600 font-ui-sm text-ui-sm hover:underline border-none bg-transparent cursor-pointer">Delete Draft</button>
                <div className="flex gap-3">
                  <button className="border border-on-surface text-on-surface font-ui-sm text-ui-sm px-4 py-2 rounded hover:bg-surface-variant transition-colors cursor-pointer bg-transparent">Save Draft</button>
                  <button className="bg-[#C8860A] text-white font-ui-sm text-ui-sm px-4 py-2 rounded flex items-center gap-2 hover:bg-amber-700 transition-colors group cursor-pointer border-none">
                    Finalize & Send <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:flex w-[55%] flex-col">
            <div className="sticky top-24 bg-white p-8 shadow-screenshot border border-border-subtle min-h-[800px] flex flex-col font-ui-sm text-ui-sm text-on-surface text-left">
              {/* Preview content mirroring detail view */}
              <div className="flex justify-between items-start border-b-[0.5px] border-border-subtle pb-8 mb-8">
                <div className="flex flex-col gap-2">
                  <span className="font-display-lg text-display-lg font-bold tracking-tight">ComplianceOS</span>
                  <div className="text-text-mid font-ui-xs text-ui-xs leading-relaxed">
                    1204, Lodha Excelus<br/>
                    Apollo Bunder, Mumbai 400001<br/>
                    GSTIN: 27AADCC1234E1Z5
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="font-marketing-xl text-[24px] text-text-light uppercase tracking-widest opacity-20">Tax Invoice</span>
                  <div className="flex gap-8 mt-4">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-ui-xs text-ui-xs text-text-light uppercase">Invoice No.</span>
                      <span className="font-mono text-[13px] font-medium">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-ui-xs text-ui-xs text-text-light uppercase">Date</span>
                      <span className="font-mono text-[13px] font-medium">{invoice.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mb-12">
                <div className="flex flex-col gap-2 w-1/2">
                  <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest">Billed To</span>
                  <span className="font-ui-lg text-ui-lg font-semibold">{invoice.client}</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b-[0.5px] border-border-subtle">
                    <th className="py-3 font-ui-xs text-ui-xs text-text-light uppercase font-medium w-[45%]">Description</th>
                    <th className="py-3 font-ui-xs text-ui-xs text-text-light uppercase font-medium text-right">Qty</th>
                    <th className="py-3 font-ui-xs text-ui-xs text-text-light uppercase font-medium text-right">Rate</th>
                    <th className="py-3 font-ui-xs text-ui-xs text-text-light uppercase font-medium text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle divide-dashed">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-4">{item.description}</td>
                      <td className="py-4 text-right font-mono text-[13px]">{item.qty}</td>
                      <td className="py-4 text-right font-mono text-[13px]">{formatIndianNumber(item.rate)}</td>
                      <td className="py-4 text-right font-mono text-[13px] font-medium">{formatIndianNumber(item.qty * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-auto">
                <div className="w-1/2 flex flex-col gap-3">
                  <div className="flex justify-between text-text-mid">
                    <span>Subtotal</span>
                    <span className="font-mono text-[13px]">{formatIndianNumber(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-mid">
                    <span>GST (18%)</span>
                    <span className="font-mono text-[13px]">{formatIndianNumber(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t-[0.5px] border-border-subtle pt-3 mt-1">
                    <span className="font-ui-lg text-ui-lg font-semibold">Total</span>
                    <span className="font-mono-lg text-mono-lg font-medium text-on-surface">₹ {formatIndianNumber(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
