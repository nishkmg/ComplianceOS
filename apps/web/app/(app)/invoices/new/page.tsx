"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstRate: number;
}

const GST_RATES = [0, 5, 12, 18, 28];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function NewInvoicePage() {
  const router = useRouter();

  const [customer, setCustomer] = useState({
    name: "Mehta Textiles Pvt. Ltd.",
    address: "45, Industrial Estate, Phase II, Ahmedabad, Gujarat 380015",
    gstin: "24AABCM9876P1Z2",
    state: "24 - Gujarat",
  });

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Statutory Audit Fees — FY 23-24", hsn: "998221", qty: 1, rate: 150000, gstRate: 18 },
  ]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    lineItems.forEach(item => {
      const base = item.qty * item.rate;
      subtotal += base;
      tax += base * (item.gstRate / 100);
    });
    return { subtotal, tax, total: subtotal + tax };
  }, [lineItems]);

  const addLine = () =>
    setLineItems(prev => [...prev, { id: Math.random().toString(36).slice(2), description: "", hsn: "", qty: 1, rate: 0, gstRate: 18 }]);

  const updateLine = (id: string, field: keyof LineItem, val: any) =>
    setLineItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: val } : item)));

  const removeLine = (id: string) =>
    setLineItems(prev => prev.filter(item => item.id !== id));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div>
            <h1 className="font-display-lg text-display-lg text-dark">New Invoice</h1>
            <p className="font-ui-xs text-[11px] text-mid mt-0.5">INV-2024-0043</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm">
            Discard
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
          {/* Client details */}
          <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
            <div className="h-[2px] w-full bg-primary-container -mt-6 mb-6" />
            <h3 className="font-ui-xs text-[10px] font-bold text-light uppercase tracking-widest pb-2 mb-5 border-b border-border-subtle">
              Client Details
            </h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Billed To</label>
                <select className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 text-[13px] font-ui-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors">
                  <option>{customer.name}</option>
                  <option>Sharma Associates</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 font-mono text-[13px] outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-white border border-border-subtle rounded-sm px-3 py-2.5 font-mono text-[13px] outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-5 border-b border-border-subtle">
              <h3 className="font-ui-xs text-[10px] font-bold text-light uppercase tracking-widest">Line Items</h3>
              <button
                onClick={addLine}
                className="text-primary-container hover:text-amber-hover font-bold text-[11px] flex items-center gap-1 transition-colors border-none bg-transparent cursor-pointer"
              >
                <Icon name="add" size={14} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map(item => (
                <div key={item.id} className="p-4 border border-border-subtle bg-section-muted relative group rounded-sm">
                  <button
                    onClick={() => removeLine(item.id)}
                    className="absolute -right-2 -top-2 bg-white border border-border-subtle rounded-full w-6 h-6 flex items-center justify-center text-light hover:text-danger hover:border-danger opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Icon name="close" size={12} />
                  </button>
                  <input
                    className="w-full bg-transparent border-b border-border-subtle border-dashed pb-1 mb-3 font-ui-sm text-[13px] outline-none focus:border-primary-container transition-colors"
                    placeholder="Item description"
                    value={item.description}
                    onChange={e => updateLine(item.id, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Qty</label>
                      <input
                        type="number"
                        className="w-full bg-transparent border-b border-border-subtle font-mono text-[13px] outline-none focus:border-primary-container transition-colors"
                        value={item.qty}
                        onChange={e => updateLine(item.id, "qty", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Rate</label>
                      <input
                        type="number"
                        className="w-full bg-transparent border-b border-border-subtle font-mono text-[13px] outline-none focus:border-primary-container transition-colors"
                        value={item.rate}
                        onChange={e => updateLine(item.id, "rate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">GST</label>
                      <select
                        className="w-full bg-transparent border-b border-border-subtle font-ui-sm text-[13px] outline-none focus:border-primary-container transition-colors"
                        value={item.gstRate}
                        onChange={e => updateLine(item.id, "gstRate", parseInt(e.target.value))}
                      >
                        {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </div>
                    <div className="space-y-1 text-right">
                      <label className="font-ui-xs text-[9px] text-light uppercase font-bold">Amount</label>
                      <p className="font-mono text-[13px] pt-1 tabular-nums">{formatIndianNumber(item.qty * item.rate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="hidden lg:block lg:col-span-7">
          <div className="sticky top-24 bg-white p-10 shadow-screenshot border border-border-subtle min-h-[842px] flex flex-col text-[13px] font-ui-sm text-dark">
            {/* Preview header */}
            <header className="flex justify-between items-start border-b border-border-subtle pb-8 mb-8">
              <div>
                <p className="font-display text-2xl font-bold tracking-tight">ComplianceOS</p>
                <p className="text-mid text-[11px] mt-2 leading-relaxed">
                  1204, Lodha Excelus<br />
                  Apollo Bunder, Mumbai 400001
                </p>
              </div>
              <div className="text-right">
                <h2 className="font-display text-xl uppercase tracking-widest text-mid/40 mb-4">Tax Invoice</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-[12px]">
                  <span className="text-light uppercase font-bold">No:</span>
                  <span className="font-mono text-right">INV-2024-0043</span>
                  <span className="text-light uppercase font-bold">Date:</span>
                  <span className="font-mono text-right">{date}</span>
                </div>
              </div>
            </header>

            {/* Bill to */}
            <section className="mb-10">
              <p className="text-[10px] text-amber-text uppercase font-bold tracking-widest mb-2">Billed To</p>
              <h4 className="font-ui-sm text-[15px] font-bold">{customer.name}</h4>
              <p className="text-mid text-sm mt-1 max-w-xs leading-relaxed">{customer.address}</p>
              <p className="text-mid text-sm mt-2 font-bold">GSTIN: {customer.gstin}</p>
            </section>

            {/* Items table */}
            <table className="w-full text-left border-collapse mb-8">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-bold w-1/2">Description</th>
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-bold text-right">Qty</th>
                  <th className="py-3 font-ui-xs text-[10px] text-light uppercase font-bold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 pr-4">
                      <p className="font-medium">{item.description || "Unspecified Item"}</p>
                      <p className="text-[11px] text-mid">HSN: {item.hsn || "—"}</p>
                    </td>
                    <td className="py-4 text-right font-mono text-[13px]">{item.qty}</td>
                    <td className="py-4 text-right font-mono text-[13px] font-bold">{formatIndianNumber(item.qty * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-auto pt-8 border-t border-border-subtle">
              <div className="w-1/2 space-y-2">
                <div className="flex justify-between text-mid text-sm">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">₹ {formatIndianNumber(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-mid text-sm">
                  <span>GST Amount</span>
                  <span className="font-mono tabular-nums">₹ {formatIndianNumber(totals.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-3 font-bold text-lg">
                  <span className="uppercase text-xs tracking-widest pt-1">Total</span>
                  <span className="font-mono text-primary-container tabular-nums">₹ {formatIndianNumber(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
