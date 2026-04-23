// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";

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

const statusColors: Record<string, string> = {
  recorded: "bg-green-100 text-green-800",
  voided: "bg-red-100 text-red-800",
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <Link href="/payments/new" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          + Record Payment
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Customer</label>
          <input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Method</label>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank Transfer</option>
            <option value="online">Online</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Payment #</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Method</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-center text-gray-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No payments found</td>
              </tr>
            ) : (
              filtered.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-blue-600">{payment.paymentNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{payment.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{methodLabels[payment.paymentMethod]}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[payment.status]}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-blue-600 hover:underline text-xs">View</button>
                      {payment.status === "recorded" && (
                        <button className="text-red-600 hover:underline text-xs">Void</button>
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