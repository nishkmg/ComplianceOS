"use client";

import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockInvoice = {
  invoiceNumber: "INV-24-089",
  date: "24 Oct 2023",
  dueDate: "23 Nov 2023",
  status: "sent",
  customer: {
    name: "Reliance Industries Ltd.",
    email: "billing@ril.com",
    gstin: "27AAACA6873Q1Z2",
    address: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra — 400021",
    state: "Maharashtra (27)",
  },
  company: {
    name: "ComplianceOS",
    address: "14th Floor, Maker Chambers VI, Nariman Point, Mumbai — 400021",
    gstin: "27AAACC1234E1Z5",
  },
  lineItems: [
    { hsn: "998311", name: "Enterprise Retainer — Q3", desc: "Comprehensive financial advisory and compliance management for Q3 2023.", qty: 1, rate: 125000, amount: 125000 },
    { hsn: "998312", name: "Tax Audit Assistance", desc: "Preparation of preliminary schedules and representation.", qty: 1, rate: 45000, amount: 45000 },
  ],
  subtotal: 170000,
  cgst: 15300,
  sgst: 15300,
  grandTotal: 200600,
  totalWords: "Rupees Two Lakh Six Hundred Only.",
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const inv = mockInvoice;

  return (
    <div className="max-w-[210mm] mx-auto space-y-6 no-print">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-[12px] text-mid hover:text-dark transition-colors no-underline"
        >
          <Icon name="arrow_back" size={16} /> Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <InvoiceStatusBadge status={inv.status as any} />
          <div className="h-4 w-[0.5px] bg-border-subtle mx-1" />
          <Link
            href={`/invoices/${"1"}/edit`}
            className="px-3 py-1.5 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
          >
            Edit
          </Link>
          <button className="px-3 py-1.5 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1">
            <Icon name="check_circle" size={12} /> Mark Paid
          </button>
          <button className="px-3 py-1.5 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors border-none rounded-sm cursor-pointer flex items-center gap-1">
            Send <Icon name="arrow_forward" size={12} />
          </button>
        </div>
      </div>

      {/* A4 document */}
      <article className="bg-white border border-border-subtle shadow-screenshot p-10 lg:p-14 text-left print:shadow-none print:border-none">
        {/* Document header */}
        <header className="flex justify-between items-start border-b border-border-subtle pb-8 mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark mb-2">{inv.company.name}</h2>
            <p className="font-ui-sm text-[13px] text-mid max-w-[240px] leading-relaxed">{inv.company.address}</p>
            <p className="font-ui-sm text-[13px] text-mid mt-2">
              <span className="font-medium text-dark">GSTIN:</span> {inv.company.gstin}
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-[28px] uppercase tracking-widest text-mid/30 mb-4">Tax Invoice</h1>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left text-[13px]">
              <span className="font-ui-xs text-[10px] text-light uppercase tracking-wider">Invoice No:</span>
              <span className="font-mono text-dark font-medium text-right">{inv.invoiceNumber}</span>
              <span className="font-ui-xs text-[10px] text-light uppercase tracking-wider">Date:</span>
              <span className="font-mono text-dark text-right">{inv.date}</span>
              <span className="font-ui-xs text-[10px] text-light uppercase tracking-wider">Due Date:</span>
              <span className="font-mono text-dark text-right">{inv.dueDate}</span>
            </div>
          </div>
        </header>

        {/* Bill To */}
        <section className="mb-10">
          <h3 className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-3 border-b border-border-subtle inline-block pb-1">Billed To</h3>
          <h4 className="font-ui-sm text-[15px] font-medium text-dark">{inv.customer.name}</h4>
          <p className="font-ui-sm text-[13px] text-mid mt-1 max-w-[320px] leading-relaxed">{inv.customer.address}</p>
          <p className="font-ui-sm text-[13px] text-mid mt-2"><span className="font-medium text-dark">GSTIN:</span> {inv.customer.gstin}</p>
          <p className="font-ui-sm text-[13px] text-mid"><span className="font-medium text-dark">Place of Supply:</span> {inv.customer.state}</p>
        </section>

        {/* Line items table */}
        <section className="mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="border-b border-border-subtle py-3 font-ui-xs text-[10px] text-light uppercase tracking-widest w-5/12">Description</th>
                <th className="border-b border-border-subtle py-3 font-ui-xs text-[10px] text-light uppercase tracking-widest w-2/12">HSN/SAC</th>
                <th className="border-b border-border-subtle py-3 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-1/12">Qty</th>
                <th className="border-b border-border-subtle py-3 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-2/12">Rate (₹)</th>
                <th className="border-b border-border-subtle py-3 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-2/12">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((item, i) => (
                <tr key={i}>
                  <td className="border-b border-border-subtle py-4 align-top pr-4">
                    <span className="font-medium text-dark block">{item.name}</span>
                    <span className="text-mid text-[12px] mt-1 block leading-relaxed">{item.desc}</span>
                  </td>
                  <td className="border-b border-border-subtle py-4 align-top font-mono text-mid text-sm">{item.hsn}</td>
                  <td className="border-b border-border-subtle py-4 align-top font-mono text-dark text-right text-sm">{item.qty.toFixed(2)}</td>
                  <td className="border-b border-border-subtle py-4 align-top font-mono text-dark text-right text-sm">{formatIndianNumber(item.rate)}</td>
                  <td className="border-b border-border-subtle py-4 align-top font-mono text-dark text-right text-sm">{formatIndianNumber(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tax & totals */}
        <section className="flex justify-end mb-12">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="font-ui-sm text-[13px] text-mid">Subtotal</span>
              <span className="font-mono text-[13px] tabular-nums">₹ {formatIndianNumber(inv.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="font-ui-sm text-[13px] text-mid">CGST (9%)</span>
              <span className="font-mono text-[13px] tabular-nums">₹ {formatIndianNumber(inv.cgst)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border-subtle">
              <span className="font-ui-sm text-[13px] text-mid">SGST (9%)</span>
              <span className="font-mono text-[13px] tabular-nums">₹ {formatIndianNumber(inv.sgst)}</span>
            </div>
            <div className="flex justify-between py-4 border-b-2 border-primary-container mt-2">
              <span className="font-ui-sm text-[15px] font-medium text-dark uppercase tracking-wide">Grand Total</span>
              <span className="font-mono text-lg font-medium text-primary-container tabular-nums">₹ {formatIndianNumber(inv.grandTotal)}</span>
            </div>
            <p className="text-right mt-2 font-ui-xs text-[10px] text-mid italic">{inv.totalWords}</p>
          </div>
        </section>

        {/* Bank details & T&C */}
        <footer className="flex justify-between items-end border-t border-border-subtle pt-8">
          <div className="w-2/3 pr-8">
            <h5 className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-2">Bank Details</h5>
            <div className="grid grid-cols-[100px_1fr] gap-1 font-ui-sm text-[13px] text-dark">
              <span className="text-mid">Bank:</span> <span>HDFC Bank, Fort Branch</span>
              <span className="text-mid">Account Name:</span> <span>ComplianceOS Solutions</span>
              <span className="text-mid">Account No:</span> <span className="font-mono">50200012345678</span>
              <span className="text-mid">IFSC Code:</span> <span className="font-mono">HDFC0000060</span>
            </div>
            <div className="mt-6">
              <h5 className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-1">Terms & Conditions</h5>
              <ol className="list-decimal list-inside font-ui-xs text-[11px] text-mid leading-relaxed">
                <li>Payment is due within 30 days of the invoice date.</li>
                <li>Late payments will incur an interest of 1.5% per month.</li>
                <li>Subject to Mumbai jurisdiction.</li>
              </ol>
            </div>
          </div>
          <div className="w-1/3 flex flex-col items-center">
            <div className="h-16 w-32 border-b border-border-subtle mb-2" />
            <span className="font-ui-xs text-[10px] text-mid text-center block w-full uppercase tracking-widest">
              Authorized Signatory<br />{inv.company.name}
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
}
