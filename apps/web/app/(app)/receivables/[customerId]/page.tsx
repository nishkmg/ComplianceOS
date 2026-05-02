"use client";

import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCustomer = {
  name: "Reliance Industries Ltd.",
  gstin: "27AAACA6873Q1Z2",
  address: "Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra — 400021",
  email: "billing@ril.com",
  totalInvoiced: 4250000,
  outstanding: 850000,
  overdue: 125000,
  status: "Active",
  age: 124,
};

const mockInvoices = [
  { id: "1", number: "INV-2023-089", date: "24 Oct 2023", dueDate: "23 Nov 2023", amount: 200600, balance: 0, status: "paid" },
  { id: "2", number: "INV-2023-095", date: "10 Nov 2023", dueDate: "10 Dec 2023", amount: 150000, balance: 150000, status: "overdue" },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const customer = mockCustomer;
  const invoices = mockInvoices;

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
            <h1 className="font-display-xl text-display-xl text-dark tracking-tight">{customer.name}</h1>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="font-ui-sm text-[13px] text-mid">
            {customer.gstin} · {customer.email} · {customer.age} days on ledger
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="edit" size={14} /> Edit Details
          </button>
          <button className="px-4 py-2 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors border-none rounded-sm shadow-sm cursor-pointer flex items-center gap-1.5">
            <Icon name="add" size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-subtle p-6 shadow-sm rounded-sm border-t-4 border-t-border-subtle">
          <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Total Invoiced (LTD)</p>
          <p className="font-mono text-xl text-dark tabular-nums font-bold">
            {formatIndianNumber(customer.totalInvoiced, { currency: true })}
          </p>
        </div>
        <div className="bg-white border border-border-subtle p-6 shadow-sm rounded-sm border-t-4 border-t-primary-container">
          <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Outstanding</p>
          <p className="font-mono text-xl text-primary-container tabular-nums font-bold">
            {formatIndianNumber(customer.outstanding, { currency: true })}
          </p>
        </div>
        <div className="bg-white border border-border-subtle p-6 shadow-sm rounded-sm border-t-4 border-t-danger">
          <p className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-2 font-bold">Overdue</p>
          <p className="font-mono text-xl text-danger tabular-nums font-bold">
            {formatIndianNumber(customer.overdue, { currency: true })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle flex gap-6">
        {["Invoices", "Payments", "Ledger History"].map(tab => (
          <button
            key={tab}
            className={`pb-3 px-1 font-ui-sm text-[12px] font-bold uppercase tracking-widest border-b-2 border-none bg-transparent cursor-pointer transition-colors ${
              tab === "Invoices"
                ? "border-primary-container text-primary-container"
                : "border-transparent text-mid hover:text-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoices */}
      <div className="bg-white border border-border-subtle shadow-sm rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest">Due Date</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right">Balance (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono text-[13px] text-primary-container font-medium hover:underline no-underline"
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
                    <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border rounded-sm ${
                      inv.status === "paid"
                        ? "bg-success-bg text-success border-green-200"
                        : inv.status === "overdue"
                          ? "bg-danger-bg text-danger border-red-200"
                          : "bg-section-muted text-mid border-border-subtle"
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
    </div>
  );
}
