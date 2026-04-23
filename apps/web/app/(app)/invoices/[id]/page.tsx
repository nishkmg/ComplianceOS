// @ts-nocheck
"use client";

import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { formatIndianNumber } from "@/lib/format";

interface LineItem {
  id: string;
  description: string;
  account: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
  cgst: number;
  sgstIgst: number;
  amount: number;
}

interface Payment {
  id: string;
  paymentNumber: string;
  date: string;
  amount: number;
  method: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "voided";
  customer: {
    name: string;
    email: string;
    gstin: string;
    address: string;
    state: string;
  };
  date: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  grandTotal: number;
  notes: string;
  terms: string;
  payments: Payment[];
  timeline: { date: string; event: string }[];
}

const mockInvoice: Invoice = {
  id: "1",
  invoiceNumber: "INV-2026-27-001",
  status: "sent",
  customer: {
    name: "Acme Corporation",
    email: "billing@acme.com",
    gstin: "27AABCU9603R1ZM",
    address: "123 Business Park, Sector 62\nNoida, Uttar Pradesh 201301",
    state: "Uttar Pradesh",
  },
  date: "2026-04-15",
  dueDate: "2026-05-15",
  lineItems: [
    { id: "1", description: "Consulting Services - April 2026", account: "Service Revenue", qty: 40, unitPrice: 2500, gstRate: 18, cgst: 9000, sgstIgst: 9000, amount: 59000 },
    { id: "2", description: "Software Development - Phase 1", account: "Service Revenue", qty: 1, unitPrice: 50000, gstRate: 18, cgst: 4500, sgstIgst: 4500, amount: 59000 },
  ],
  subtotal: 100000,
  cgst: 13500,
  sgst: 13500,
  igst: 0,
  discount: 0,
  grandTotal: 127000,
  notes: "Thank you for your continued partnership!",
  terms: "Payment due within 30 days. Please include invoice number with payment.",
  payments: [
    { id: "p1", paymentNumber: "PAY-001", date: "2026-04-20", amount: 50000, method: "NEFT" },
  ],
  timeline: [
    { date: "2026-04-15 10:30 AM", event: "Invoice created" },
    { date: "2026-04-15 10:35 AM", event: "Invoice sent to customer" },
  ],
};

export default function InvoiceDetailPage() {
  const invoice = mockInvoice;
  const isIntraState = invoice.customer.state === "Maharashtra";
  const canEdit = invoice.status === "draft";
  const canPost = invoice.status === "draft";
  const canSend = invoice.status === "draft" || invoice.status === "sent";
  const canVoid = invoice.status === "sent" || invoice.status === "partially_paid";
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = invoice.grandTotal - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[26px] font-normal text-dark">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="font-ui text-[12px] text-light mt-1">Issued to {invoice.customer.name}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/invoices/${invoice.id}/edit`} className="filter-tab">
              Edit
            </Link>
          )}
          {canPost && (
            <button className="filter-tab active bg-success hover:bg-success/90">
              Post Invoice
            </button>
          )}
          {canSend && (
            <button className="filter-tab active">
              Send
            </button>
          )}
          {canVoid && (
            <button className="filter-tab bg-danger text-white hover:bg-danger/90">
              Void
            </button>
          )}
          <button className="filter-tab">Download PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-3">Bill To</h2>
            <div className="font-ui text-[13px] space-y-0.5">
              <p className="font-medium text-dark">{invoice.customer.name}</p>
              <p className="text-mid">{invoice.customer.email}</p>
              {invoice.customer.gstin && <p className="text-light font-mono">GSTIN: {invoice.customer.gstin}</p>}
              <p className="text-mid whitespace-pre-line mt-1">{invoice.customer.address}</p>
              <p className="text-light">{invoice.customer.state}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-3">Line Items</h2>
            <table className="table table-dense">
              <thead>
                <tr>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left w-8">#</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left">Description</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left">Account</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-16">Qty</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-24">Unit Price</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-16">GST%</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-24">CGST</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-24">{isIntraState ? "SGST" : "IGST"}</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-hairline">
                    <td className="py-3 font-mono text-[13px] text-light">{index + 1}</td>
                    <td className="py-3 font-ui text-[13px] text-dark">{item.description}</td>
                    <td className="py-3 font-ui text-[13px] text-mid">{item.account}</td>
                    <td className="py-3 font-mono text-[13px] text-right text-dark">{item.qty}</td>
                    <td className="py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(item.unitPrice)}</td>
                    <td className="py-3 font-mono text-[13px] text-right text-mid">{item.gstRate}%</td>
                    <td className="py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(item.cgst)}</td>
                    <td className="py-3 font-mono text-[13px] text-right text-dark">{formatIndianNumber(item.sgstIgst)}</td>
                    <td className="py-3 font-mono text-[13px] text-right font-medium text-dark">{formatIndianNumber(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="card p-5">
              <h2 className="font-display text-[16px] font-normal text-dark mb-2">Notes</h2>
              <p className="font-ui text-[13px] text-mid">{invoice.notes}</p>
            </div>
          )}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-2">Terms & Conditions</h2>
            <p className="font-ui text-[13px] text-mid">{invoice.terms}</p>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-[16px] font-normal text-dark mb-3">Payment History</h2>
              <table className="table table-dense">
                <thead>
                  <tr>
                    <th className="font-ui text-[10px] uppercase tracking-wide text-left">Payment #</th>
                    <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
                    <th className="font-ui text-[10px] uppercase tracking-wide text-left">Method</th>
                    <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-hairline">
                      <td className="py-3 font-mono text-[13px] text-amber">{payment.paymentNumber}</td>
                      <td className="py-3 font-mono text-[13px] text-light">{payment.date}</td>
                      <td className="py-3 font-ui text-[13px] text-mid">{payment.method}</td>
                      <td className="py-3 font-mono text-[13px] text-right font-medium text-dark">{formatIndianNumber(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Summary</h2>
            <div className="space-y-2 font-ui text-[13px]">
              <div className="flex justify-between">
                <span className="text-light">Invoice Date</span>
                <span className="font-mono text-dark">{invoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light">Due Date</span>
                <span className="font-mono text-dark">{invoice.dueDate}</span>
              </div>
              <hr className="border-hairline" />
              <div className="flex justify-between">
                <span className="text-light">Subtotal</span>
                <span className="font-mono text-dark">{formatIndianNumber(invoice.subtotal)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-light">CGST</span>
                    <span className="font-mono text-dark">{formatIndianNumber(invoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light">SGST</span>
                    <span className="font-mono text-dark">{formatIndianNumber(invoice.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-light">IGST</span>
                  <span className="font-mono text-dark">{formatIndianNumber(invoice.igst)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-light">Discount</span>
                  <span className="font-mono text-success">-{formatIndianNumber(invoice.discount)}</span>
                </div>
              )}
              <hr className="border-hairline" />
              <div className="flex justify-between font-display text-[16px] font-medium">
                <span className="text-dark">Grand Total</span>
                <span className="text-dark">{formatIndianNumber(invoice.grandTotal)}</span>
              </div>
              {invoice.payments.length > 0 && (
                <>
                  <hr className="border-hairline" />
                  <div className="flex justify-between font-ui text-[13px]">
                    <span className="text-success">Paid</span>
                    <span className="font-mono text-success">-{formatIndianNumber(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between font-display text-[16px] font-medium">
                    <span className="text-dark">Balance Due</span>
                    <span className="text-dark">{formatIndianNumber(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-3">Timeline</h2>
            <div className="space-y-3">
              {invoice.timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber flex-shrink-0" />
                  <div>
                    <p className="font-ui text-[13px] text-dark font-medium">{event.event}</p>
                    <p className="font-mono text-[11px] text-light">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
            {invoice.status === "draft" && (
              <button className="mt-4 font-ui text-[12px] text-amber hover:underline">
                Mark as Sent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
