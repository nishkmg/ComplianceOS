// @ts-nocheck
"use client";

import { useState } from "react";
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
  status: "draft" | "sent" | "partially_paid" | "paid" | "voided";
}

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2026-27-001", customerName: "Acme Corp", date: "2026-04-15", dueDate: "2026-05-15", amount: "1,18,000", status: "sent" },
  { id: "2", invoiceNumber: "INV-2026-27-002", customerName: "TechStart Ltd", date: "2026-04-18", dueDate: "2026-05-18", amount: "59,000", status: "draft" },
  { id: "3", invoiceNumber: "INV-2026-27-003", customerName: "Global Traders", date: "2026-04-10", dueDate: "2026-05-10", amount: "2,36,000", status: "partially_paid" },
  { id: "4", invoiceNumber: "INV-2026-27-004", customerName: "Alpha Industries", date: "2026-04-05", dueDate: "2026-05-05", amount: "3,54,000", status: "paid" },
];

const statusOptions = ["all", "draft", "sent", "partially_paid", "paid", "voided"];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredInvoices = mockInvoices.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (customerSearch && !inv.customerName.toLowerCase().includes(customerSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Invoices</h1>
          <p className="font-ui text-[12px] text-light mt-1">Manage sales invoices and billing</p>
        </div>
        <Link href="/invoices/new" className="filter-tab active">
          + New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="filter-tabs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="filter-tab font-ui"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Search customer... (/)"
          value={customerSearch}
          onChange={(e) => { setCustomerSearch(e.target.value); setPage(1); }}
          className="input-field font-ui flex-1 max-w-xs ml-auto"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Invoice #</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Customer</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Due Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-ui text-light">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-[13px] text-amber px-4 py-3">
                    <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="font-ui text-[13px] text-dark px-4 py-3">{invoice.customerName}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{invoice.date}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{invoice.dueDate}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">₹{invoice.amount}</td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      {(invoice.status === "draft") && (
                        <Link href={`/invoices/${invoice.id}/edit`} className="font-ui text-[12px] text-amber hover:underline">
                          Edit
                        </Link>
                      )}
                      {(invoice.status === "draft") && (
                        <button className="font-ui text-[12px] text-success hover:underline">Post</button>
                      )}
                      {(invoice.status === "sent" || invoice.status === "partially_paid") && (
                        <button className="font-ui text-[12px] text-danger hover:underline">Void</button>
                      )}
                      <button className="font-ui text-[12px] text-mid hover:underline">Send</button>
                      <button className="font-ui text-[12px] text-mid hover:underline">PDF</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between font-ui text-[12px] text-light">
          <span>Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="filter-tab disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredInvoices.length < pageSize}
              className="filter-tab disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
