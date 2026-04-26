// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

interface Payment {
  id: string;
  paymentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: "recorded" | "voided";
  type: "received" | "paid";
}

const mockPayments: Payment[] = [
  { id: "1", paymentNumber: "PAY-2026-27-001", customerName: "Acme Corp", date: "2026-04-10", amount: 50000, paymentMethod: "bank", status: "recorded", type: "received" },
  { id: "2", paymentNumber: "PAY-2026-27-002", customerName: "Beta Ltd", date: "2026-04-12", amount: 25000, paymentMethod: "cash", status: "recorded", type: "received" },
  { id: "3", paymentNumber: "PAY-2026-27-003", customerName: "Vendor X", date: "2026-04-14", amount: 120000, paymentMethod: "online", status: "recorded", type: "paid" },
  { id: "4", paymentNumber: "PAY-2026-27-004", customerName: "Gamma Pvt", date: "2026-04-15", amount: 75000, paymentMethod: "cheque", status: "recorded", type: "received" },
  { id: "5", paymentNumber: "PAY-2026-27-005", customerName: "Acme Corp", date: "2026-04-08", amount: 30000, paymentMethod: "online", status: "voided", type: "paid" },
];

export default function PaymentsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockPayments.filter((p) => {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.customerName.toLowerCase().includes(search.toLowerCase()) && !p.paymentNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Payment Ledger</h1>
          <p className="font-ui-sm text-ui-sm text-text-mid max-w-2xl">High-density overview of all incoming and outgoing fiscal transactions. Reconcile entries with your master GST log.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-ui-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <Link href="/payments/new" className="px-5 py-2.5 bg-primary-container text-white font-ui-sm text-ui-sm hover:opacity-90 transition-opacity flex items-center gap-2 no-underline">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Entry
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border-[0.5px] border-border-subtle p-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
            <input className="w-full pl-10 pr-4 py-2 border-[0.5px] border-border-subtle rounded-none text-ui-sm outline-none focus:border-primary transition-colors" placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <select className="border-[0.5px] border-border-subtle bg-white px-4 py-2 text-ui-sm rounded-none text-text-mid appearance-none pr-8 outline-none focus:border-primary transition-colors" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="received">Received</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-ui-sm text-stone-400 w-full md:w-auto justify-end">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Filters active</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[0.5px] border-border-subtle overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold">Date</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold">Payment #</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold">From/To</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold">Method</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold">Type</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold text-right">Amount (₹)</th>
              <th className="py-4 px-6 font-ui-xs text-ui-xs text-stone-500 uppercase tracking-wider font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y-[0.5px] divide-border-subtle">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="py-4 px-6 font-mono-md text-[13px] text-stone-600">{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td className="py-4 px-6 font-mono-md text-[13px] text-amber-text font-medium">{p.paymentNumber}</td>
                <td className="py-4 px-6 font-ui-sm text-stone-700">{p.customerName}</td>
                <td className="py-4 px-6 font-ui-sm text-stone-500">{p.paymentMethod}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                    p.type === 'received' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {p.type}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono-lg text-stone-900 text-right tracking-tighter">₹{p.amount.toLocaleString('en-IN')}</td>
                <td className="py-4 px-6 text-right">
                  <Badge variant={p.status === 'recorded' ? 'success' : 'gray'}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
