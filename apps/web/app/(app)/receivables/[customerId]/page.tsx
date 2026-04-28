// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.customerId as string;

  const mockCustomer = {
    name: "Reliance Industries Ltd.",
    gstin: "27AAACA6873Q1Z2",
    address: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra - 400021",
    email: "billing@ril.com",
    totalInvoiced: 4250000,
    outstanding: 850000,
    overdue: 125000,
    status: "Active",
  };

  const mockInvoices = [
    { id: "1", number: "INV-2023-089", date: "24 Oct 2023", dueDate: "23 Nov 2023", amount: 200600, balance: 0, status: "paid" },
    { id: "2", number: "INV-2023-095", date: "10 Nov 2023", dueDate: "10 Dec 2023", amount: 150000, balance: 150000, status: "overdue" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/receivables">Receivables</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">{mockCustomer.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">{mockCustomer.name}</h1>
            <span className="bg-green-50 text-green-700 px-2 py-0.5 border border-green-200 text-[10px] font-bold uppercase rounded-sm">Active</span>
          </div>
          <p className="font-ui-sm text-text-mid">{mockCustomer.gstin} · {mockCustomer.email}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Details
          </button>
          <button className="px-5 py-2 bg-primary-container text-white font-ui-sm text-xs rounded-sm hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer border-none shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span> Record Payment
          </button>
        </div>
      </div>

      {/* KPI Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-stone-300 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4">Total Invoiced (LTD)</p>
          <p className="font-mono text-2xl font-bold text-on-surface">₹ {formatIndianNumber(mockCustomer.totalInvoiced)}</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-primary-container shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4">Total Outstanding</p>
          <p className="font-mono text-2xl font-bold text-primary">₹ {formatIndianNumber(mockCustomer.outstanding)}</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-red-600 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4">Overdue Amount</p>
          <p className="font-mono text-2xl font-bold text-red-600">₹ {formatIndianNumber(mockCustomer.overdue)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-[0.5px] border-border-subtle mb-6 flex gap-8">
        <button className="border-b-2 border-primary-container text-primary-container font-ui-sm font-bold pb-3 px-1 border-none bg-transparent cursor-pointer">Invoices</button>
        <button className="border-b-2 border-transparent text-text-mid hover:text-on-surface font-ui-sm pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Payments</button>
        <button className="border-b-2 border-transparent text-text-mid hover:text-on-surface font-ui-sm pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Ledger History</button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Due Date</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Balance (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="py-4 px-6 text-primary font-medium hover:underline cursor-pointer">
                    <Link href={`/invoices/${inv.id}`} className="no-underline text-inherit">{inv.number}</Link>
                  </td>
                  <td className="py-4 px-6 text-text-mid">{inv.date}</td>
                  <td className="py-4 px-6 text-text-mid">{inv.dueDate}</td>
                  <td className="py-4 px-6 text-right text-on-surface">{formatIndianNumber(inv.amount)}</td>
                  <td className="py-4 px-6 text-right font-bold text-on-surface">{inv.balance > 0 ? formatIndianNumber(inv.balance) : "—"}</td>
                  <td className="py-4 px-6">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
