// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface LineItem {
  id: string;
  description: string;
  accountId: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
  discount: number;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const GST_RATES = [0, 5, 12, 18, 28];

const REVENUE_ACCOUNTS = [
  { id: "rev-1", code: "4-1", name: "Sales Account" },
  { id: "rev-2", code: "4-2", name: "Service Revenue" },
  { id: "rev-3", code: "4-3", name: "Other Income" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Mock invoice data - in real app would fetch by ID
const getMockInvoice = (id: string) => ({
  id,
  invoiceNumber: "INV-2026-27-002",
  status: "draft",
  customer: {
    name: "TechStart Ltd",
    email: "accounts@techstart.com",
    gstin: "29AABCU9603R1ZM",
    address: "Startup Hub, Whitefield\nBengaluru, Karnataka 560066",
    state: "Karnataka",
  },
  date: "2026-04-18",
  dueDate: "2026-05-18",
  lineItems: [
    { id: "li-1", description: "Software Development Services", accountId: "rev-2", qty: 20, unitPrice: 2500, gstRate: 18, discount: 0 },
  ],
  notes: "",
  terms: "Payment due within 30 days",
});

export default function EditInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const mockInvoice = getMockInvoice(invoiceId);
  const tenantState = "Maharashtra";
  const isIntraState = mockInvoice.customer.state === tenantState;

  const [customer, setCustomer] = useState(mockInvoice.customer);
  const [invoiceDate, setInvoiceDate] = useState(mockInvoice.date);
  const [dueDate, setDueDate] = useState(mockInvoice.dueDate);
  const [notes, setNotes] = useState(mockInvoice.notes);
  const [terms, setTerms] = useState(mockInvoice.terms);
  const [lineItems, setLineItems] = useState<LineItem[]>(
    mockInvoice.lineItems.map((item) => ({ ...item }))
  );

  const handleLineChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addLine = () => {
    setLineItems((items) => [
      ...items,
      { id: generateId(), description: "", accountId: "", qty: 1, unitPrice: 0, gstRate: 18, discount: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((items) => items.filter((item) => item.id !== id));
    }
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalDiscount = 0;

    lineItems.forEach((item) => {
      const baseAmount = item.qty * item.unitPrice;
      const discountAmount = baseAmount * (item.discount / 100);
      const taxableAmount = baseAmount - discountAmount;
      const gstAmount = taxableAmount * (item.gstRate / 100);

      subtotal += taxableAmount;
      totalDiscount += discountAmount;

      if (isIntraState) {
        totalCgst += gstAmount / 2;
        totalSgst += gstAmount / 2;
      } else {
        totalIgst += gstAmount;
      }
    });

    return {
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      discount: totalDiscount,
      grandTotal: subtotal + totalCgst + totalSgst + totalIgst,
    };
  }, [lineItems, isIntraState]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Invoice</h1>
        <Link href={`/invoices/${invoiceId}`} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">
          Cancel
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Customer Section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  value={customer.gstin}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                <textarea
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Line Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 w-12">#</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2 w-32">Account</th>
                  <th className="pb-2 w-20">Qty</th>
                  <th className="pb-2 w-28">Unit Price</th>
                  <th className="pb-2 w-20">GST%</th>
                  <th className="pb-2 w-20">Disc%</th>
                  <th className="pb-2 w-28 text-right">Amount</th>
                  <th className="pb-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const baseAmount = item.qty * item.unitPrice;
                  const discountAmount = baseAmount * (item.discount / 100);
                  const taxableAmount = baseAmount - discountAmount;
                  const gstAmount = taxableAmount * (item.gstRate / 100);
                  const lineTotal = taxableAmount + gstAmount;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 text-gray-500">{index + 1}</td>
                      <td className="py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineChange(item.id, "description", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="py-2">
                        <select
                          value={item.accountId}
                          onChange={(e) => handleLineChange(item.id, "accountId", e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option value="">Select</option>
                          {REVENUE_ACCOUNTS.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleLineChange(item.id, "qty", Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                          min="1"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleLineChange(item.id, "unitPrice", Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleLineChange(item.id, "gstRate", Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                        >
                          {GST_RATES.map((rate) => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleLineChange(item.id, "discount", Number(e.target.value))}
                          className="w-full px-2 py-1 border rounded"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="py-2 text-right font-medium">
                        ₹{formatCurrency(lineTotal)}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => removeLine(item.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={lineItems.length === 1}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={addLine}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Line
            </button>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Terms</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4 sticky top-4">
            <h2 className="text-lg font-semibold">Invoice Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            <hr />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{formatCurrency(totals.subtotal)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST</span>
                    <span className="font-medium">₹{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST</span>
                    <span className="font-medium">₹{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST</span>
                  <span className="font-medium">₹{formatCurrency(totals.igst)}</span>
                </div>
              )}
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-₹{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total</span>
                <span>₹{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>

            <hr />

            <div className="space-y-2">
              <button className="w-full px-4 py-2 border rounded hover:bg-gray-50">
                Save as Draft
              </button>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Preview & Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
