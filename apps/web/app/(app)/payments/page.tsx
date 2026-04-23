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
}

const mockPayments: Payment[] = [
  { id: "1", paymentNumber: "PAY-2026-27-001", customerName: "Acme Corp", date: "2026-04-10", amount: 50000, paymentMethod: "bank", status: "recorded" },
  { id: "2", paymentNumber: "PAY-2026-27-002", customerName: "Beta Ltd", date: "2026-04-12", amount: 25000, paymentMethod: "cash", status: "recorded" },
  { id: "3", paymentNumber: "PAY-2026-27-003", customerName: "Gamma Pvt", date: "2026-04-15", amount: 75000, paymentMethod: "cheque", status: "recorded" },
  { id: "4", paymentNumber: "PAY-2026-27-004", customerName: "Acme Corp", date: "2026-04-08", amount: 30000, paymentMethod: "online", status: "voided" },
];

const methodLabels: Record<string, string> = {
  cash: "Cash",
  bank: "Bank Transfer",
  online: "Online",
  cheque: "Cheque",
};

export default function PaymentsPage() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const filtered = mockPayments.filter((p) => {
    const matchCustomer = p.customerName.toLowerCase().includes(customerSearch.toLowerCase());
    const matchMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    const matchDateFrom = !dateFrom || p.date >= dateFrom;
    const matchDateTo = !dateTo || p.date <= dateTo;
    return matchCustomer && matchMethod && matchDateFrom && matchDateTo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Payments</h1>
          <p className="font-ui text-[12px] text-light mt-1">Record and track customer payments</p>
        </div>
        <Link href="/payments/new" className="filter-tab active">
          + Record Payment
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Customer</label>
            <input
              type="text"
              placeholder="Search customer..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="input-field font-ui w-48"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field font-ui"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field font-ui"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="input-field font-ui"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="online">Online</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Payment #</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Customer</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Method</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-ui text-light">
                  No payments found
                </td>
              </tr>
            ) : (
              filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-[13px] text-amber px-4 py-3">
                    <Link href={`/payments/${payment.id}`} className="hover:underline">
                      {payment.paymentNumber}
                    </Link>
                  </td>
                  <td className="font-ui text-[13px] text-dark px-4 py-3">{payment.customerName}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{payment.date}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">
                    {formatIndianNumber(payment.amount)}
                  </td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3">{methodLabels[payment.paymentMethod]}</td>
                  <td className="px-4 py-3">
                    <Badge variant={payment.status === "recorded" ? "success" : "gray"}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-3 justify-center">
                      <Link href={`/payments/${payment.id}`} className="font-ui text-[12px] text-amber hover:underline">
                        View
                      </Link>
                      {payment.status === "recorded" && (
                        <button className="font-ui text-[12px] text-danger hover:underline">Void</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
