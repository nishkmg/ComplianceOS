"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { formatIndianNumber } from "@/lib/format";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: string;
  status: "draft" | "sent" | "partially_paid" | "paid" | "voided" | "overdue";
}

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2026-27-001", customerName: "Acme Corp", date: "2026-04-15", dueDate: "2026-05-15", amount: "1,18,000", status: "sent" },
  { id: "2", invoiceNumber: "INV-2026-27-002", customerName: "TechStart Ltd", date: "2026-04-18", dueDate: "2026-05-18", amount: "59,000", status: "draft" },
  { id: "3", invoiceNumber: "INV-2026-27-003", customerName: "Global Traders", date: "2026-04-10", dueDate: "2026-05-10", amount: "2,36,000", status: "partially_paid" },
  { id: "4", invoiceNumber: "INV-2026-27-004", customerName: "Alpha Industries", date: "2026-04-05", dueDate: "2026-05-05", amount: "3,54,000", status: "paid" },
  { id: "5", invoiceNumber: "INV-2026-27-005", customerName: "Delayed Payments Co", date: "2026-03-20", dueDate: "2026-04-19", amount: "5,90,000", status: "overdue" },
];

const tabs = ["all", "draft", "sent", "partially_paid", "paid", "voided", "overdue"];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockInvoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (search && !inv.customerName.toLowerCase().includes(search.toLowerCase()) && !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="px-8 pt-10 pb-6 border-b-[0.5px] border-border-subtle bg-surface-container-lowest sticky top-0 z-30 -mx-8 -mt-8 mb-0" style={{ width: 'calc(100% + 64px)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1200px] mx-auto text-left">
          <div>
            <h1 className="font-display-lg text-on-surface mb-1">Invoices</h1>
            <p className="font-ui-sm text-text-mid">Manage and track your fiscal billing documents.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm rounded hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
              <Icon name="download" className="text-[18px]" />
              Export List
            </button>
            <Link href="/invoices/new" className="px-5 py-2 bg-primary-container text-white font-ui-sm rounded hover:bg-primary/90 transition-colors flex items-center gap-2 group no-underline">
              <Icon name="add" className="text-[18px]" />
              New Invoice
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 mt-6 text-left">
        <div className="flex overflow-x-auto pb-2 w-full lg:w-auto gap-1 border-b-[0.5px] border-border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 font-ui-sm whitespace-nowrap transition-colors cursor-pointer border-none bg-transparent ${
                statusFilter === tab ? "text-on-surface border-b-[2px] border-primary-container" : "text-text-mid hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {tab === "all" ? "All Invoices" : tab.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              <span className="ml-1 text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded-full text-text-mid">
                {tab === "all" ? mockInvoices.length : mockInvoices.filter(i => i.status === tab).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            className="border-[0.5px] border-border-subtle bg-white px-4 py-2 font-ui-sm outline-none focus:border-primary transition-colors w-64 text-ui-sm"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="p-2 border-[0.5px] border-border-subtle bg-white text-text-mid hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer">
            <Icon name="filter_list" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
        <div className="h-[2px] w-full bg-primary-container"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sidebar border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest w-12 border-r-[0.5px] border-border-subtle">
                  <input type="checkbox" className="rounded-[2px] border-[0.5px] border-border-subtle" />
                </th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Customer</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Due Date</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Status</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {filtered.map((inv) => (
                <tr key={inv.id} className={`hover:bg-surface-container-lowest hover:shadow-card transition-all group ${inv.status === 'overdue' ? 'bg-error-container/5' : ''}`}>
                  <td className="py-4 px-6 border-r-[0.5px] border-border-subtle">
                    <input type="checkbox" className="rounded-[2px] border-[0.5px] border-border-subtle" />
                  </td>
                  <td className="py-4 px-6 font-mono-md text-amber-text">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline no-underline">{inv.invoiceNumber}</Link>
                  </td>
                  <td className="py-4 px-6 font-ui-sm text-on-surface font-medium">{inv.customerName}</td>
                  <td className="py-4 px-6 font-mono-md text-text-mid">{new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-6 font-mono-md text-text-mid">{new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-6 font-mono-md text-right font-bold">₹{inv.amount}</td>
                  <td className="py-4 px-6 text-right">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-text-light hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent">
                      <Icon name="edit" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t-[0.5px] border-border-subtle flex items-center justify-between">
          <span className="font-mono-md text-[12px] text-text-light">Showing {filtered.length} of {mockInvoices.length} invoices</span>
          <div className="flex gap-2">
            <button className="p-2 border-[0.5px] border-border-subtle bg-stone-50 text-text-light cursor-pointer hover:bg-stone-100 transition-colors"><Icon name="chevron_left" className="text-[16px]" /></button>
            <button className="p-2 border-[0.5px] border-border-subtle bg-stone-50 text-text-light cursor-pointer hover:bg-stone-100 transition-colors"><Icon name="chevron_right" className="text-[16px]" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
