// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";

interface LineItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstRate: number;
}

const GST_RATES = [0, 5, 12, 18, 28];

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
    { id: '1', description: "Statutory Audit Fees - FY 23-24", hsn: "998221", qty: 1, rate: 150000, gstRate: 18 },
  ]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    lineItems.forEach(item => {
      const lineBase = item.qty * item.rate;
      subtotal += lineBase;
      tax += lineBase * (item.gstRate / 100);
    });
    return { subtotal, tax, total: subtotal + tax };
  }, [lineItems]);

  const addLine = () => {
    setLineItems([...lineItems, { id: Math.random().toString(), description: "", hsn: "", qty: 1, rate: 0, gstRate: 18 }]);
  };

  const updateLine = (id: string, field: keyof LineItem, val: any) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  return (
    <div className="bg-page-bg min-h-screen flex flex-col antialiased text-left">
      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="max-w-[1200px] w-full flex flex-col lg:flex-row gap-8">
          {/* Left: Form */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                 <button onClick={() => router.back()} className="text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                 </button>
                 <span className="font-ui-xs text-[10px] text-amber-text tracking-widest uppercase font-bold">New Invoice</span>
               </div>
               <h1 className="font-display-lg text-display-lg text-on-surface">INV-2024-0043</h1>
            </div>

            <div className="bg-white border border-border-subtle p-6 shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container"></div>
              
              <h3 className="font-ui-sm text-[11px] font-bold text-text-light uppercase tracking-widest border-b border-border-subtle pb-2 mb-6">Client Details</h3>
              <div className="space-y-6 mb-8">
                <div className="flex flex-col gap-1">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Billed To</label>
                  <select className="bg-stone-50 border border-border-subtle rounded-sm px-3 py-2 text-sm outline-none focus:border-primary">
                    <option>{customer.name}</option>
                    <option>Sharma Associates</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Date of Issue</label>
                    <input className="bg-stone-50 border border-border-subtle rounded-sm px-3 py-2 font-mono text-sm outline-none focus:border-primary" type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Due Date</label>
                    <input className="bg-stone-50 border border-border-subtle rounded-sm px-3 py-2 font-mono text-sm outline-none focus:border-primary" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <h3 className="font-ui-sm text-[11px] font-bold text-text-light uppercase tracking-widest border-b border-border-subtle pb-2 mb-6 flex justify-between items-center">
                Line Items
                <button onClick={addLine} className="text-primary-container hover:text-primary font-bold flex items-center gap-1 transition-colors border-none bg-transparent cursor-pointer"><span className="material-symbols-outlined text-sm">add</span> Add Item</button>
              </h3>

              <div className="space-y-4 mb-8">
                {lineItems.map((item) => (
                  <div key={item.id} className="p-4 border border-border-subtle bg-stone-50 relative group rounded-sm">
                    <input className="bg-transparent border-b border-border-subtle border-dashed w-full pb-1 mb-2 font-ui-sm text-sm outline-none focus:border-primary" placeholder="Item description" value={item.description} onChange={e => updateLine(item.id, 'description', e.target.value)} />
                    <div className="grid grid-cols-3 gap-4">
                       <div className="flex flex-col gap-1">
                         <label className="font-ui-xs text-[9px] text-text-light uppercase font-bold">Qty</label>
                         <input className="bg-transparent border-b border-border-subtle font-mono text-sm outline-none focus:border-primary" type="number" value={item.qty} onChange={e => updateLine(item.id, 'qty', parseFloat(e.target.value) || 0)} />
                       </div>
                       <div className="flex flex-col gap-1">
                         <label className="font-ui-xs text-[9px] text-text-light uppercase font-bold">Rate</label>
                         <input className="bg-transparent border-b border-border-subtle font-mono text-sm outline-none focus:border-primary" type="number" value={item.rate} onChange={e => updateLine(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                       </div>
                       <div className="flex flex-col gap-1">
                         <label className="font-ui-xs text-[9px] text-text-light uppercase font-bold">Tax</label>
                         <select className="bg-transparent border-b border-border-subtle font-ui-sm text-sm outline-none focus:border-primary" value={item.gstRate} onChange={e => updateLine(item.id, 'gstRate', parseInt(e.target.value))}>
                           {GST_RATES.map(r => <option key={r} value={r}>GST {r}%</option>)}
                         </select>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-border-subtle">
                 <button className="text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer font-ui-sm text-sm font-bold uppercase tracking-widest">Discard</button>
                 <div className="flex gap-4">
                    <button className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm">Save Draft</button>
                    <button className="px-8 py-3 bg-[#C8860A] text-white font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-all cursor-pointer border-none shadow-sm rounded-sm flex items-center gap-2">
                       Finalize & Send <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="hidden lg:flex w-[55%] flex-col">
            <div className="sticky top-24 bg-white p-10 shadow-screenshot border border-border-subtle min-h-[842px] flex flex-col font-ui-sm text-on-surface">
              <header className="flex justify-between items-start border-b-[0.5px] border-border-subtle pb-8 mb-8">
                <div className="flex flex-col gap-2">
                  <span className="font-display-lg text-2xl font-bold tracking-tight">ComplianceOS</span>
                  <div className="text-text-mid font-ui-xs text-[11px] leading-relaxed">
                    1204, Lodha Excelus<br/>
                    Apollo Bunder, Mumbai 400001
                  </div>
                </div>
                <div className="text-right">
                  <h1 className="font-display-xl text-2xl uppercase tracking-widest text-text-light mb-4">Tax Invoice</h1>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-[12px]">
                    <span className="text-text-light uppercase font-bold">No:</span>
                    <span className="font-mono font-medium text-right">INV-2024-0043</span>
                    <span className="text-text-light uppercase font-bold">Date:</span>
                    <span className="font-mono text-right">{date}</span>
                  </div>
                </div>
              </header>

              <section className="mb-10">
                <span className="text-[10px] text-amber-text uppercase font-bold tracking-widest block mb-2">Billed To</span>
                <h4 className="font-ui-lg text-lg font-bold">{customer.name}</h4>
                <p className="text-text-mid text-sm mt-1 max-w-xs leading-relaxed">{customer.address}</p>
                <p className="text-text-mid text-sm mt-2 font-bold">GSTIN: {customer.gstin}</p>
              </section>

              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="border-b-[0.5px] border-border-subtle">
                    <th className="py-3 font-ui-xs text-[10px] text-text-light uppercase font-bold w-1/2">Description</th>
                    <th className="py-3 font-ui-xs text-[10px] text-text-light uppercase font-bold text-right">Qty</th>
                    <th className="py-3 font-ui-xs text-[10px] text-text-light uppercase font-bold text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle divide-dashed">
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="py-4 pr-4">
                        <p className="font-bold">{item.description || "Unspecified Item"}</p>
                        <p className="text-[11px] text-text-light">HSN: {item.hsn || "—"}</p>
                      </td>
                      <td className="py-4 text-right font-mono text-[13px]">{item.qty}</td>
                      <td className="py-4 text-right font-mono text-[13px] font-bold">{formatIndianNumber(item.qty * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-auto pt-8 border-t border-border-subtle">
                <div className="w-1/2 space-y-2">
                  <div className="flex justify-between text-text-mid text-sm">
                    <span>Subtotal</span>
                    <span className="font-mono">₹ {formatIndianNumber(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-text-mid text-sm">
                    <span>GST Amount</span>
                    <span className="font-mono">₹ {formatIndianNumber(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border-subtle pt-3 font-bold text-lg">
                    <span className="uppercase text-xs tracking-widest pt-1">Total</span>
                    <span className="font-mono text-primary-container">₹ {formatIndianNumber(totals.total)}</span>
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
