"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

// ─── Mock data ────────────────────────────────────────────────────────────────

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const { activeFy } = useFiscalYear();
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const customerName = decodeURIComponent(customerId);

  const [activeTab, setActiveTab] = useState("Invoices");
  const { data: customerData, isLoading } = api.receivables.customer.useQuery({ customerName });

  const customer = customerData
    ? {
        name: customerData.customerName,
        gstin: "",
        address: "",
        email: "",
        totalInvoiced: customerData.outstandingInvoices.reduce((s, i) => s + i.grandTotal, 0),
        outstanding: customerData.totalOutstanding,
        overdue: customerData.outstandingInvoices.reduce(
          (s, i) => s + (new Date(i.dueDate) < new Date() ? i.outstandingAmount : 0),
          0,
        ),
        status: "Active",
        age: customerData.outstandingInvoices.length,
      }
    : null;

  const invoices = (customerData?.outstandingInvoices ?? []).map((inv) => ({
    id: inv.id,
    number: inv.invoiceNumber,
    date: new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    dueDate: new Date(inv.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    amount: inv.grandTotal,
    balance: inv.outstandingAmount,
    status: inv.status,
  }));

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui text-ui-sm text-mid">Customer not found.</p>
        <Link href="/receivables" className="mt-4 text-amber text-ui-xs font-bold uppercase tracking-wider hover:underline no-underline">Back to Receivables</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-ui-2xs text-light uppercase tracking-widest" aria-label="Breadcrumb">
        <Link href="/receivables" className="hover:text-dark transition-colors no-underline">Receivables</Link>
        <Icon name="chevron_right" size={14} className="text-lighter" />
        <span className="text-mid font-medium">{customer.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
      <PageHeader title={customer.name} />
      <Badge variant="success">Active</Badge>
    </div>
    <p className="font-ui text-ui-sm text-secondary">
            {customer.gstin} · {customer.email} · {customer.age} open invoices
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/payments/new")}>
            <Icon name="add" size={14} /> Record Payment
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-border-subtle">
          <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest mb-2 font-bold">Total Invoiced (LTD)</p>
          <p className="font-mono text-xl text-dark tabular-nums font-bold">
            {formatIndianNumber(customer.totalInvoiced, { currency: true })}
          </p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-amber">
          <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest mb-2 font-bold">Outstanding</p>
          <p className="font-mono text-xl text-amber tabular-nums font-bold">
            {formatIndianNumber(customer.outstanding, { currency: true })}
          </p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm rounded-md border-t-4 border-t-danger">
          <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest mb-2 font-bold">Overdue</p>
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
            className={`pb-3 px-1 font-ui text-ui-sm text-ui-xs font-bold uppercase tracking-widest border-b-2 border-none bg-transparent cursor-pointer transition-colors ${
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
          <p className="font-ui text-ui-sm text-mid">Payment history for this customer will appear here.</p>
        </div>
      )}
      {activeTab === "Ledger History" && (
        <div className="bg-surface border border-border p-8 rounded-md text-center">
          <p className="font-ui text-ui-sm text-mid">Ledger entries for this customer will appear here.</p>
        </div>
      )}

      {/* Invoices */}
      {activeTab === "Invoices" && (
      <div className="bg-surface border border-border shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Due Date</th>
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Balance (₹)</th>
                <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {invoices.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center font-ui text-ui-sm text-mid">No invoices found for this customer.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-mono text-ui-sm text-amber font-medium hover:underline no-underline"
                    >
                      {inv.number}
                    </Link>
                  </td>
                  <td className="py-4 px-6 font-mono text-ui-xs text-mid">{inv.date}</td>
                  <td className="py-4 px-6 font-mono text-ui-xs text-mid">{inv.dueDate}</td>
                  <td className="py-4 px-6 font-mono text-ui-sm text-dark tabular-nums text-right">
                    {formatIndianNumber(inv.amount)}
                  </td>
                  <td className="py-4 px-6 font-mono text-ui-sm tabular-nums text-right font-semibold">
                    {inv.balance > 0 ? (
                      <span className="text-danger">{formatIndianNumber(inv.balance)}</span>
                    ) : (
                      <span className="text-success">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-wider border rounded-md ${
                      inv.status === "paid" || inv.status === "draft"
                        ? "bg-surface-muted text-mid border-border"
                        : inv.balance > 0
                          ? "bg-danger-bg text-danger-deep border-danger/20"
                          : "bg-success-bg text-success-deep border-success/20"
                    }`}>
                      {inv.status === "partially_paid" ? "partially paid" : inv.status}
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
