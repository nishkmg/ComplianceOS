// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          + New Invoice
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded text-sm"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) => { setCustomerSearch(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded text-sm flex-1"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No invoices yet
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{invoice.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{invoice.date}</td>
                  <td className="px-4 py-3 text-gray-600">{invoice.dueDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{invoice.amount}</td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(invoice.status === "draft") && (
                        <Link href={`/invoices/${invoice.id}/edit`} className="text-blue-600 hover:underline text-xs">
                          Edit
                        </Link>
                      )}
                      {(invoice.status === "draft") && (
                        <button className="text-green-600 hover:underline text-xs">Post</button>
                      )}
                      {(invoice.status === "sent" || invoice.status === "partially_paid") && (
                        <button className="text-red-600 hover:underline text-xs">Void</button>
                      )}
                      <button className="text-gray-600 hover:underline text-xs">Send</button>
                      <button className="text-gray-600 hover:underline text-xs">PDF</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredInvoices.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredInvoices.length} of {filteredInvoices.length} invoices</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={filteredInvoices.length < pageSize}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
