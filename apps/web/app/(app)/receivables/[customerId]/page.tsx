"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";

// ─── Mock data ────────────────────────────────────────────────────────────────

interface CustomerData {
  name: string; gstin: string; address: string; email: string;
  totalInvoiced: number; outstanding: number; overdue: number; status: string; age: number;
}

interface InvoiceRow {
  id: string; number: string; date: string; dueDate: string;
  amount: number; balance: number; status: string;
}

const customers: Record<string, CustomerData> = {
  reliance: {
    name: "Reliance Industries Ltd.", gstin: "27AAACA6873Q1Z2",
    address: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra — 400021",
    email: "billing@ril.com", totalInvoiced: 4250000, outstanding: 850000, overdue: 125000, status: "Active", age: 124,
  },
  acme: {
    name: "Acme Corporation", gstin: "09AABCT1234E1ZP",
    address: "12 Business Park, Andheri East, Mumbai — 400093",
    email: "accounts@acmecorp.in", totalInvoiced: 1850000, outstanding: 412000, overdue: 180000, status: "Active", age: 89,
  },
  techsol: {
    name: "TechSolutions India", gstin: "29AABCT5678K1ZR",
    address: "Whitefield Main Road, Bengaluru — 560066",
    email: "finance@techsol.in", totalInvoiced: 980000, outstanding: 245000, overdue: 0, status: "Active", age: 45,
  },
  delta: {
    name: "Delta Systems", gstin: "33AABCT9012K1ZL",
    address: "Cyber City, Hitech City, Hyderabad — 500081",
    email: "payables@deltasys.in", totalInvoiced: 750000, outstanding: 195000, overdue: 45000, status: "Active", age: 62,
  },
};

const invoicesByCustomer: Record<string, InvoiceRow[]> = {
  reliance: [
    { id: "1", number: "INV-2026-27-001", date: "15 Apr 2026", dueDate: "15 May 2026", amount: 200600, balance: 0, status: "paid" },
    { id: "2", number: "INV-2026-27-003", date: "10 May 2026", dueDate: "09 Jun 2026", amount: 150000, balance: 150000, status: "overdue" },
  ],
  acme: [
    { id: "3", number: "INV-2026-27-002", date: "18 Apr 2026", dueDate: "18 May 2026", amount: 412000, balance: 250000, status: "partial" },
  ],
  techsol: [
    { id: "4", number: "INV-2026-27-005", date: "25 Apr 2026", dueDate: "25 May 2026", amount: 245000, balance: 245000, status: "pending" },
  ],
  delta: [
    { id: "5", number: "INV-2026-27-004", date: "10 Apr 2026", dueDate: "10 May 2026", amount: 195000, balance: 195000, status: "overdue" },
  ],
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;

  const [activeTab, setActiveTab] = useState("Invoices");
  const customer = customers[customerId];
  const invoices = invoicesByCustomer[customerId] ?? [];

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui text-[13px] text-mid">Customer not found.</p>
        <Link href="/receivables" className="mt-4 text-amber text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">Back to Receivables</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] text-light uppercase tracking-widest" aria-label="Breadcrumb">
        <Link href="/receivables" className="hover:text-dark transition-colors no-underline">Receivables</Link>
        <Icon name="chevron_right" size={14} className="text-lighter" />
        <span className="text-mid font-medium">{customer.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
      <h1 className="font-display text-display-lg font-semibold text-dark tracking-tight">{customer.name}</h1>
      <Badge variant="success">Active</Badge>
    </div>
    <p className="font-ui text-[13px] text-secondary">
            {customer.gstin} · {customer.email} · {customer.age} days on ledger
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => showToast.success("Edit mode opened.")} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md flex items-center gap-1.5">
            <Icon name="edit" size={14} /> Edit Details
          </button>
          <button onClick={() => router.push("/payments/new")} className="px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors border-none rounded-md shadow-sm cursor-pointer flex items-center gap-1.5">
            <Icon name="add" size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-border-subtle">
          <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Total Invoiced (LTD)</p>
          <p className="font-mono text-xl text-dark tabular-nums font-bold">
            {formatIndianNumber(customer.totalInvoiced, { currency: true })}
          </p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-amber">
          <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Outstanding</p>
          <p className="font-mono text-xl text-amber tabular-nums font-bold">
            {formatIndianNumber(customer.outstanding, { currency: true })}
          </p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-danger">
          <p className="font-ui text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Overdue</p>
          <p className="font-mono text-xl text-danger tabular-nums font-bold">
            {formatIndianNumber(customer.overdue, { currency: true })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6">
        {["Invoices", "Payments", "Ledger History"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 font-ui text-[13px] text-[12px] font-bold uppercase tracking-widest border-b-2 border-none bg-transparent cursor-pointer transition-colors ${
              activeTab === tab
                ? "border-amber text-amber"
                : "border-transparent text-mid hover:text-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Payments" && (
        <div className="bg-surface border border-border p-8 rounded-md text-center">
          <p className="font-ui text-[13px] text-mid">Payment history for this customer will appear here.</p>
        </div>
      )}
      {activeTab === "Ledger History" && (
        <div className="bg-surface border border-border p-8 rounded-md text-center">
          <p className="font-ui text-[13px] text-mid">Ledger entries for this customer will appear here.</p>
        </div>
      )}

      {/* Invoices */}
      {activeTab === "Invoices" && (
      <div className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Due Date</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Balance (₹)</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center font-ui text-[13px] text-mid">No invoices found for this customer.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono text-[13px] text-amber font-medium hover:underline no-underline"
                    >
                      {inv.number}
                    </Link>
                  </td>
                  <td className="py-4 px-6 font-mono text-[12px] text-mid">{inv.date}</td>
                  <td className="py-4 px-6 font-mono text-[12px] text-mid">{inv.dueDate}</td>
                  <td className="py-4 px-6 font-mono text-[13px] text-dark tabular-nums text-right">
                    {formatIndianNumber(inv.amount)}
                  </td>
                  <td className="py-4 px-6 font-mono text-[13px] tabular-nums text-right font-semibold">
                    {inv.balance > 0 ? (
                      <span className="text-danger">{formatIndianNumber(inv.balance)}</span>
                    ) : (
                      <span className="text-success">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border rounded-md ${
                      inv.status === "paid"
                        ? "bg-success-bg text-success border-green-200"
                        : inv.status === "overdue"
                          ? "bg-danger-bg text-danger border-red-200"
                          : "bg-surface-muted text-mid border-border"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
