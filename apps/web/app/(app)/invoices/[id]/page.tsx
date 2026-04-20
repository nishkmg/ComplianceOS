"use client";

import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function InvoiceDetailPage() {
  const invoice = mockInvoice;
  const isIntraState = invoice.customer.state === "Maharashtra"; // Simplified for demo
  const canEdit = invoice.status === "draft";
  const canPost = invoice.status === "draft";
  const canSend = invoice.status === "draft" || invoice.status === "sent";
  const canVoid = invoice.status === "sent" || invoice.status === "partially_paid";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="text-gray-500 mt-1">Issued to {invoice.customer.name}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/invoices/${invoice.id}/edit`} className="px-4 py-2 border rounded hover:bg-gray-50">
              Edit
            </Link>
          )}
          {canPost && (
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Post Invoice
            </button>
          )}
          {canSend && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Send
            </button>
          )}
          {canVoid && (
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Void
            </button>
          )}
          <button className="px-4 py-2 border rounded hover:bg-gray-50">
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Bill To</h2>
            <div className="text-sm">
              <p className="font-medium">{invoice.customer.name}</p>
              <p className="text-gray-600">{invoice.customer.email}</p>
              {invoice.customer.gstin && <p className="text-gray-500">GSTIN: {invoice.customer.gstin}</p>}
              <p className="text-gray-600 whitespace-pre-line mt-1">{invoice.customer.address}</p>
              <p className="text-gray-500">{invoice.customer.state}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Line Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 w-8">#</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Account</th>
                  <th className="pb-2 w-16 text-right">Qty</th>
                  <th className="pb-2 w-24 text-right">Unit Price</th>
                  <th className="pb-2 w-16 text-right">GST%</th>
                  <th className="pb-2 w-24 text-right">CGST</th>
                  <th className="pb-2 w-24 text-right">{isIntraState ? "SGST" : "IGST"}</th>
                  <th className="pb-2 w-28 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 text-gray-500">{index + 1}</td>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-gray-600">{item.account}</td>
                    <td className="py-3 text-right">{item.qty}</td>
                    <td className="py-3 text-right">₹{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right">{item.gstRate}%</td>
                    <td className="py-3 text-right">₹{formatCurrency(item.cgst)}</td>
                    <td className="py-3 text-right">₹{formatCurrency(item.sgstIgst)}</td>
                    <td className="py-3 text-right font-medium">₹{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Terms & Conditions</h2>
            <p className="text-sm text-gray-600">{invoice.terms}</p>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-3">Payment History</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Payment #</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-2 text-blue-600">{payment.paymentNumber}</td>
                      <td className="py-2 text-gray-600">{payment.date}</td>
                      <td className="py-2 text-gray-600">{payment.method}</td>
                      <td className="py-2 text-right font-medium">₹{formatCurrency(payment.amount)}</td>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date</span>
                <span className="font-medium">{invoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date</span>
                <span className="font-medium">{invoice.dueDate}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{formatCurrency(invoice.subtotal)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST</span>
                    <span className="font-medium">₹{formatCurrency(invoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST</span>
                    <span className="font-medium">₹{formatCurrency(invoice.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST</span>
                  <span className="font-medium">₹{formatCurrency(invoice.igst)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-₹{formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span>₹{formatCurrency(invoice.grandTotal)}</span>
              </div>
              {invoice.payments.length > 0 && (
                <>
                  <hr />
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>-₹{formatCurrency(invoice.payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Balance Due</span>
                    <span>₹{formatCurrency(invoice.grandTotal - invoice.payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Timeline</h2>
            <div className="space-y-3">
              {invoice.timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{event.event}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
            {invoice.status === "draft" && (
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-800">
                Mark as Sent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
