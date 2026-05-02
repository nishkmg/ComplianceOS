"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditLineItem {
  id: number;
  description: string;
  qty: number;
  rate: number;
  tax: string;
  hsn: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockInvoice = {
  id: "42",
  invoiceNumber: "INV-2024-0042",
  status: "DRAFT",
  client: "Mehta Textiles Pvt. Ltd.",
  date: "2024-10-24",
  dueDate: "2024-11-23",
  items: [
    { id: 1, description: "Statutory Audit Fees — FY 23-24",  qty: 1, rate: 150000, tax: "GST 18%", hsn: "998221" },
    { id: 2, description: "Consulting Retainer — Oct 2024",   qty: 1, rate: 50000,  tax: "GST 18%", hsn: "998311" },
  ],
  notes: "Payment due within 30 days. Please remit to HDFC Bank A/c 50200012345678.",
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function EditInvoicePage() {
  const [invoice, setInvoice] = useState(mockInvoice);

  const subtotal = useMemo(() => invoice.items.reduce((s, item) => s + item.qty * item.rate, 0), [invoice.items]);
  const taxAmount = subtotal * 0.18;
  const total = subtotal + taxAmount;

  const updateItem = (id: number, field: string, val: any) =>
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => (item.id === id ? { ...item, [field]: val } : item)),
    }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-mid hover:text-dark transition-colors flex items-center no-underline">
            <Icon name="arrow_back" size={20} />
          </Link>
          <div>
            <h1 className="font-display-lg text-display-lg text-dark">Edit Invoice</h1>
            <p className="font-ui-xs text-[11px] text-mid mt-0.5 flex items-center gap-2">
              {invoice.invoiceNumber}
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm bg-section-muted text-mid border border-border-subtle">{invoice.status}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-danger text-danger text-[10px] font-bold uppercase tracking-widest hover:bg-danger-bg transition-colors cursor-pointer bg-transparent rounded-sm">
            Delete Draft
          </button>
          <button className="px-4 py-2 border border-border-subtle text-dark text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm">
            Save Draft
          </button>
          <button className="px-5 py-2 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all border-none rounded-sm shadow-sm cursor-pointer flex items-center gap-1.5">
            Finalize & Send <Icon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
            <div className="h-[2px] w-full bg-primary-container -mt-6 mb-6" />
            <h3 className="font-ui-xs text-[10px] font-bold text-light uppercase tracking-widest pb-2 mb-5 border-b border-border-subtle">Client Details</h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Billed To</label>
                <select className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 text-[13px] font-ui-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors">
                  <option>{invoice.client}</option>
                  <option>Sharma Enterprises</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Date</label>
                  <input type="date" className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 font-mono text-[13px] outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" defaultValue={invoice.date} />
                </div>
                <div className="space-y-1">
                  <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Due Date</label>
                  <input type="date" className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 font-mono text-[13px] outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" defaultValue={invoice.dueDate} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-5 border-b border-border-subtle">
              <h3 className="font-ui-xs text-[10px] font-bold text-light uppercase tracking-widest">Line Items</h3>
              <button className="text-primary-container hover:text-amber-hover font-bold text-[11px] flex items-center gap-1 transition-colors border-none bg-transparent cursor-pointer">
                <Icon name="add" size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {invoice.items.map(item => (
                <div key={item.id} className="p-4 border border-border-subtle bg-section-muted relative group rounded-sm">
                  <button className="absolute -right-2 -top-2 bg-white border border-border-subtle rounded-full w-6 h-6 flex items-center justify-center text-light hover:text-danger hover:border-danger opacity-0 group-hover:opacity-100 transition-all cursor-pointer" aria-label="Remove item">
                    <Icon name="close" size={12} />
                  </button>
                  <input
                    className="w-full bg-transparent border-b border-border-subtle border-dashed pb-1 mb-3 font-ui-sm text-[13px] outline-none focus:border-primary-container transition-colors"
                    placeholder="Item description"
                    defaultValue={item.description}
                    onChange={e => updateItem(item.id, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Qty</label>
                      <input type="number" className="w-full bg-transparent border-b border-border-subtle font-mono text-[13px] outline-none focus:border-primary-container transition-colors" defaultValue={item.qty} onChange={e => updateItem(item.id, "qty", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Rate</label>
                      <input type="number" className="w-full bg-transparent border-b border-border-subtle font-mono text-[13px] outline-none focus:border-primary-container transition-colors" defaultValue={item.rate} onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Tax</label>
                      <select className="w-full bg-transparent border-b border-border-subtle font-ui-sm text-[13px] outline-none focus:border-primary-container transition-colors" defaultValue={item.tax}>
                        <option>GST 18%</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Notes / Terms</label>
            <textarea className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 font-ui-sm text-[13px] outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors resize-none" rows={2} defaultValue={invoice.notes} />
          </div>
        </div>

        {/* Right: preview */}
        <div className="hidden lg:block lg:col-span-7">
          <div className="sticky top-24 bg-white p-10 shadow-screenshot border border-border-subtle min-h-[800px] flex flex-col text-[13px] font-ui-sm text-dark">
            <div className="flex justify-between items-start border-b border-border-subtle pb-8 mb-8">
              <div>
                <p className="font-display text-2xl font-bold tracking-tight">ComplianceOS</p>
                <p className="text-mid text-[11px] mt-2 leading-relaxed">1204, Lodha Excelus<br />Apollo Bunder, Mumbai 400001<br />GSTIN: 27AADCC1234E1Z5</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl uppercase tracking-widest text-mid/20 mb-4">Tax Invoice</p>
                <div className="flex gap-6 mt-4">
                  <div className="text-left">
                    <p className="font-ui-xs text-[10px] text-light uppercase">No.</p>
                    <p className="font-mono text-[13px] font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-ui-xs text-[10px] text-light uppercase">Date</p>
                    <p className="font-mono text-[13px] font-medium">{invoice.date}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <p className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold mb-2">Billed To</p>
              <p className="text-[15px] font-semibold">{invoice.client}</p>
            </div>

            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-medium w-[45%]">Description</th>
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-medium text-right">Qty</th>
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-medium text-right">Rate</th>
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-medium text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4">{item.description}</td>
                    <td className="py-4 text-right font-mono text-[13px]">{item.qty}</td>
                    <td className="py-4 text-right font-mono text-[13px]">{formatIndianNumber(item.rate)}</td>
                    <td className="py-4 text-right font-mono text-[13px] font-medium">{formatIndianNumber(item.qty * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-auto pt-6 border-t border-border-subtle">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between text-mid">
                  <span>Subtotal</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(subtotal)}</span>
                </div>
                <div className="flex justify-between text-mid">
                  <span>GST (18%)</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(taxAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-3 font-medium">
                  <span className="font-ui-sm text-[15px]">Total</span>
                  <span className="font-mono text-[15px] font-semibold text-dark">₹ {formatIndianNumber(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
