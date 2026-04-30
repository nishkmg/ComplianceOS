"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

const mockInvoice = {
  invoiceNumber: "INV-24-089",
  date: "24 Oct 2023",
  dueDate: "23 Nov 2023",
  status: "sent",
  customer: {
    name: "Reliance Industries Ltd.",
    email: "billing@ril.com",
    gstin: "27AAACA6873Q1Z2",
    address: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra - 400021",
    state: "Maharashtra (27)",
  },
  company: {
    name: "ComplianceOS",
    address: "14th Floor, Maker Chambers VI, Nariman Point, Mumbai - 400021",
    gstin: "27AAACC1234E1Z5",
  },
  lineItems: [
    { hsn: "998311", name: "Enterprise Retainer - Q3", desc: "Comprehensive financial advisory and compliance management for Q3 2023.", qty: 1, rate: 125000, amount: 125000 },
    { hsn: "998312", name: "Tax Audit Assistance", desc: "Preparation of preliminary schedules and representation.", qty: 1, rate: 45000, amount: 45000 },
  ],
  subtotal: 170000,
  cgst: 15300,
  sgst: 15300,
  grandTotal: 200600,
  totalWords: "Rupees Two Lakh Six Hundred Only.",
};

export default function InvoiceDetailPage() {
  const [invoice] = useState(mockInvoice);

  return (
    <div className="bg-page-bg min-h-screen flex flex-col items-center pt-6">
      {/* Back Navigation */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-start no-print">
        <Link href="/invoices" className="flex items-center gap-2 font-ui-sm text-ui-sm text-text-light hover:text-on-surface transition-colors no-underline">
          <Icon name="arrow_back" className="text-[16px]" />
          Back to Invoices
        </Link>
      </div>

      {/* A4 Document Wrapper */}
      <article className="bg-white w-full max-w-[210mm] shadow-screenshot border-[0.5px] border-border-subtle p-10 lg:p-14 relative text-left">
        {/* Document Header */}
        <header className="flex justify-between items-start border-b-[0.5px] border-border-subtle pb-8 mb-8">
          <div className="flex flex-col">
            <h2 className="font-display-lg text-2xl text-on-surface font-semibold mb-2">{invoice.company.name}</h2>
            <p className="font-ui-sm text-ui-sm text-text-mid max-w-[240px] leading-relaxed">{invoice.company.address}</p>
            <p className="font-ui-sm text-ui-sm text-text-mid mt-2"><span className="font-medium text-on-surface">GSTIN:</span> {invoice.company.gstin}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <h1 className="font-display text-[32px] uppercase tracking-widest text-text-light mb-4">Tax Invoice</h1>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left">
              <span className="font-ui-xs text-[10px] text-text-light uppercase tracking-wider">Invoice No:</span>
              <span className="font-mono-md text-ui-sm text-on-surface font-medium text-right">{invoice.invoiceNumber}</span>
              <span className="font-ui-xs text-[10px] text-text-light uppercase tracking-wider">Date:</span>
              <span className="font-mono-md text-ui-sm text-on-surface text-right">{invoice.date}</span>
              <span className="font-ui-xs text-[10px] text-text-light uppercase tracking-wider">Due Date:</span>
              <span className="font-mono-md text-ui-sm text-on-surface text-right">{invoice.dueDate}</span>
            </div>
          </div>
        </header>

        {/* Bill To Section */}
        <section className="mb-10">
          <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-3 border-b-[0.5px] border-border-subtle inline-block pb-1">Billed To</h3>
          <h4 className="font-ui-lg text-lg font-medium text-on-surface">{invoice.customer.name}</h4>
          <p className="font-ui-sm text-ui-sm text-text-mid mt-1 max-w-[320px] leading-relaxed">{invoice.customer.address}</p>
          <p className="font-ui-sm text-ui-sm text-text-mid mt-2"><span className="font-medium text-on-surface">GSTIN:</span> {invoice.customer.gstin}</p>
          <p className="font-ui-sm text-ui-sm text-text-mid"><span className="font-medium text-on-surface">Place of Supply:</span> {invoice.customer.state}</p>
        </section>

        {/* Line Items Table */}
        <section className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/30">
                <th className="border-b-[0.5px] border-border-subtle py-3 font-ui-xs text-[10px] text-text-light uppercase tracking-widest w-5/12">Description</th>
                <th className="border-b-[0.5px] border-border-subtle py-3 font-ui-xs text-[10px] text-text-light uppercase tracking-widest w-2/12">HSN/SAC</th>
                <th className="border-b-[0.5px] border-border-subtle py-3 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right w-1/12">Qty</th>
                <th className="border-b-[0.5px] border-border-subtle py-3 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right w-2/12">Rate (₹)</th>
                <th className="border-b-[0.5px] border-border-subtle py-3 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right w-2/12">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="font-ui-sm text-ui-sm">
              {invoice.lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="border-b-[0.5px] border-border-subtle py-4 align-top pr-4">
                    <span className="font-medium text-on-surface block">{item.name}</span>
                    <span className="text-text-mid text-[12px] mt-1 block leading-relaxed">{item.desc}</span>
                  </td>
                  <td className="border-b-[0.5px] border-border-subtle py-4 align-top font-mono text-text-mid text-sm">{item.hsn}</td>
                  <td className="border-b-[0.5px] border-border-subtle py-4 align-top font-mono text-on-surface text-right text-sm">{item.qty.toFixed(2)}</td>
                  <td className="border-b-[0.5px] border-border-subtle py-4 align-top font-mono text-on-surface text-right text-sm">{formatIndianNumber(item.rate)}</td>
                  <td className="border-b-[0.5px] border-border-subtle py-4 align-top font-mono text-on-surface text-right text-sm">{formatIndianNumber(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tax & Totals Breakdown */}
        <section className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b-[0.5px] border-border-subtle">
              <span className="font-ui-sm text-ui-sm text-text-mid">Subtotal</span>
              <span className="font-mono text-on-surface text-sm">₹ {formatIndianNumber(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-[0.5px] border-border-subtle">
              <span className="font-ui-sm text-ui-sm text-text-mid">CGST (9%)</span>
              <span className="font-mono text-on-surface text-sm">₹ {formatIndianNumber(invoice.cgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-[0.5px] border-border-subtle">
              <span className="font-ui-sm text-ui-sm text-text-mid">SGST (9%)</span>
              <span className="font-mono text-on-surface text-sm">₹ {formatIndianNumber(invoice.sgst)}</span>
            </div>
            <div className="flex justify-between py-4 border-b-2 border-[#C8860A] mt-2">
              <span className="font-ui-lg text-lg font-medium text-on-surface uppercase tracking-wide">Grand Total</span>
              <span className="font-mono text-xl font-medium text-[#C8860A]">₹ {formatIndianNumber(invoice.grandTotal)}</span>
            </div>
            <div className="text-right mt-2">
              <span className="font-ui-xs text-[10px] text-text-light italic">{invoice.totalWords}</span>
            </div>
          </div>
        </section>

        {/* Footer: Bank Details & T&C */}
        <footer className="flex justify-between items-end border-t-[0.5px] border-border-subtle pt-8">
          <div className="w-2/3 pr-8">
            <h5 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-2">Bank Details</h5>
            <div className="grid grid-cols-[100px_1fr] gap-1 font-ui-sm text-ui-sm text-on-surface">
              <span className="text-text-mid">Bank:</span> <span>HDFC Bank, Fort Branch</span>
              <span className="text-text-mid">Account Name:</span> <span>ComplianceOS Solutions</span>
              <span className="text-text-mid">Account No:</span> <span className="font-mono text-sm">50200012345678</span>
              <span className="text-text-mid">IFSC Code:</span> <span className="font-mono text-sm">HDFC0000060</span>
            </div>
            <div className="mt-6">
              <h5 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-1">Terms & Conditions</h5>
              <ol className="list-decimal list-inside font-ui-xs text-[11px] text-text-light leading-relaxed">
                <li>Payment is due within 30 days of the invoice date.</li>
                <li>Late payments will incur an interest of 1.5% per month.</li>
                <li>Subject to Mumbai jurisdiction.</li>
              </ol>
            </div>
          </div>
          <div className="w-1/3 flex flex-col items-center">
            <div className="h-16 w-32 border-b-[0.5px] border-border-subtle mb-2"></div>
            <span className="font-ui-xs text-[10px] text-text-mid text-center block w-full uppercase tracking-widest">Authorized Signatory<br/>{invoice.company.name}</span>
          </div>
        </footer>
      </article>

      {/* Action Buttons */}
      <div className="w-full max-w-[210mm] mt-8 flex justify-end gap-4 mb-16 no-print">
        <button className="px-5 py-2.5 bg-stone-100 border border-border-subtle text-[#1A1A1A] font-ui-sm text-xs font-medium hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer">
          <Icon name="edit" className="text-[18px]" />
          Edit
        </button>
        <button className="px-5 py-2.5 bg-stone-100 border border-border-subtle text-[#1A1A1A] font-ui-sm text-xs font-medium hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer">
          <Icon name="check_circle" className="text-[18px]" />
          Mark as Paid
        </button>
        <button className="px-5 py-2.5 bg-stone-100 border border-border-subtle text-[#1A1A1A] font-ui-sm text-xs font-medium hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer" onClick={() => window.print()}>
          <Icon name="download" className="text-[18px]" />
          Download PDF
        </button>
        <button className="px-6 py-2.5 bg-[#C8860A] text-white font-ui-sm text-xs font-medium hover:bg-amber-700 transition-transform active:scale-95 flex items-center gap-2 group cursor-pointer border-none">
          Send
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
