// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";

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

export default function NewInvoicePage() {
  const router = useRouter();
  const today = new Date();
  const defaultDueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    gstin: "",
    address: "",
    state: "",
  });

  const [invoiceDate, setInvoiceDate] = useState(today.toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(defaultDueDate.toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days");

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: generateId(), description: "", accountId: "", qty: 1, unitPrice: 0, gstRate: 18, discount: 0 },
  ]);

  const tenantState = "Maharashtra";
  const isIntraState = customer.state === tenantState;

  const handleLineChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addLine = () => {
    setLineItems((items) => [...items, { id: generateId(), description: "", accountId: "", qty: 1, unitPrice: 0, gstRate: 18, discount: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length > 1) setLineItems((items) => items.filter((item) => item.id !== id));
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

    return { subtotal, cgst: totalCgst, sgst: totalSgst, igst: totalIgst, discount: totalDiscount, grandTotal: subtotal + totalCgst + totalSgst + totalIgst };
  }, [lineItems, isIntraState]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">New Invoice</h1>
          <p className="font-ui text-[12px] text-light mt-1">Create a new customer invoice</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="filter-tab">
            Cancel (Esc)
          </button>
          <button type="submit" className="filter-tab active">
            Save Draft (⌘S)
          </button>
          <button type="submit" className="filter-tab active">
            Create Invoice (⌘↵)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Customer Section */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Customer Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="input-field font-ui"
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="input-field font-ui"
                  placeholder="billing@acme.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">GSTIN</label>
                <input
                  type="text"
                  value={customer.gstin}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value.toUpperCase() })}
                  className="input-field font-mono"
                  placeholder="27AABCU9603R1ZM"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">State</label>
                <select
                  value={customer.state}
                  onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                  className="input-field font-ui"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Billing Address</label>
                <textarea
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="input-field font-ui"
                  rows={2}
                  placeholder="123 Business Park, Sector 62..."
                />
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Line Items</h2>
            <table className="table table-dense">
              <thead>
                <tr>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left w-12">#</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left">Description</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left w-32">Account</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-20">Qty</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-28">Unit Price</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-20">GST%</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-20">Disc%</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-right w-28">Amount</th>
                  <th className="font-ui text-[10px] uppercase tracking-wide text-left w-10"></th>
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
                    <tr key={item.id} className="border-b border-hairline">
                      <td className="py-3 font-mono text-[13px] text-light">{index + 1}</td>
                      <td className="py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineChange(item.id, "description", e.target.value)}
                          className="input-field font-ui w-full"
                          placeholder="Consulting services"
                        />
                      </td>
                      <td className="py-3">
                        <select
                          value={item.accountId}
                          onChange={(e) => handleLineChange(item.id, "accountId", e.target.value)}
                          className="input-field font-ui w-full"
                        >
                          <option value="">Select</option>
                          {REVENUE_ACCOUNTS.map((acc) => (
                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleLineChange(item.id, "qty", Number(e.target.value))}
                          className="input-field font-mono w-full text-right"
                          min="1"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleLineChange(item.id, "unitPrice", Number(e.target.value))}
                          className="input-field font-mono w-full text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-3">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleLineChange(item.id, "gstRate", Number(e.target.value))}
                          className="input-field font-mono w-full text-right"
                        >
                          {GST_RATES.map((rate) => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => handleLineChange(item.id, "discount", Number(e.target.value))}
                          className="input-field font-mono w-full text-right"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="py-3 font-mono text-[13px] text-right font-medium text-dark">
                        {formatIndianNumber(lineTotal)}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => removeLine(item.id)}
                          className="font-ui text-[13px] text-danger hover:underline disabled:opacity-30"
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
            <button type="button" onClick={addLine} className="font-ui text-[13px] text-amber hover:underline mt-3">
              + Add Line (N)
            </button>
          </div>

          {/* Notes & Terms */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field font-ui"
                  rows={2}
                  placeholder="Thank you for your business..."
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="input-field font-ui"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Invoice Settings */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Invoice Settings</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="input-field font-ui"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-field font-ui"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h2 className="font-display text-[16px] font-normal text-dark mb-4">Summary</h2>
            <div className="space-y-2 font-ui text-[13px]">
              <div className="flex justify-between">
                <span className="text-light">Subtotal</span>
                <span className="font-mono text-dark">{formatIndianNumber(totals.subtotal)}</span>
              </div>
              {isIntraState ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-light">CGST</span>
                    <span className="font-mono text-dark">{formatIndianNumber(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-light">SGST</span>
                    <span className="font-mono text-dark">{formatIndianNumber(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-light">IGST</span>
                  <span className="font-mono text-dark">{formatIndianNumber(totals.igst)}</span>
                </div>
              )}
              {totals.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-light">Discount</span>
                  <span className="font-mono text-success">-{formatIndianNumber(totals.discount)}</span>
                </div>
              )}
              <hr className="border-hairline" />
              <div className="flex justify-between font-display text-[16px] font-medium">
                <span className="text-dark">Grand Total</span>
                <span className="text-dark">{formatIndianNumber(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Tax Info */}
          <div className="card p-5 bg-surface-muted">
            <p className="font-ui text-[11px] text-light">
              {isIntraState ? (
                <span>Intra-state supply • CGST + SGST applicable</span>
              ) : customer.state ? (
                <span>Inter-state supply • IGST applicable</span>
              ) : (
                <span>Select customer state to determine tax applicability</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
