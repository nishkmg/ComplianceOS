"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, daysOverdue } from "@/lib/format-inr";

interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  grandTotal: number;
  amountPaid: number;
  outstandingAmount: number;
  status: string;
}

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

interface CustomerDetail {
  customerName: string;
  totalOutstanding: number;
  outstandingInvoices: OutstandingInvoice[];
  paymentHistory: PaymentRecord[];
}

async function fetchCustomer(customerName: string): Promise<CustomerDetail> {
  const encoded = encodeURIComponent(customerName);
  const response = await fetch(`/api/trpc/receivables.customer?input=${encodeURIComponent(JSON.stringify({ customerName }))}`);
  if (!response.ok) throw new Error("Failed to load customer data");
  const json = await response.json();
  return json.result?.data ?? { customerName, totalOutstanding: 0, outstandingInvoices: [], paymentHistory: [] };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    sent: { label: "Sent", className: "bg-blue-100 text-blue-800" },
    partially_paid: { label: "Partial", className: "bg-yellow-100 text-yellow-800" },
    paid: { label: "Paid", className: "bg-green-100 text-green-800" },
    overdue: { label: "Overdue", className: "bg-red-100 text-red-800" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

type Tab = "invoices" | "payments";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerName = typeof params.customerId === "string" ? decodeURIComponent(params.customerId) : "";
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("invoices");

  useEffect(() => {
    if (!customerName) return;
    fetchCustomer(customerName)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [customerName]);

  if (!customerName) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">No customer specified</p>
        <Link href="/receivables" className="text-blue-600 hover:underline">
          ← Back to Receivables
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Error: {error ?? "No data"}</p>
        <Link href="/receivables" className="text-blue-600 hover:underline">
          ← Back to Receivables
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/receivables")}
              className="text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{data.customerName}</h1>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Total Outstanding:{" "}
              <span className="font-semibold text-gray-900">
                {formatINR(data.totalOutstanding)}
              </span>
            </p>
          </div>
        </div>
        <Link
          href={`/payments/record?customer=${encodeURIComponent(data.customerName)}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
        >
          Record Payment
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "invoices"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Outstanding Invoices ({data.outstandingInvoices.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-2 text-sm font-medium border-b-2 ${
              activeTab === "payments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Payment History ({data.paymentHistory.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-lg shadow">
          {data.outstandingInvoices.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No outstanding invoices for this customer
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Due Date</th>
                  <th className="px-6 py-3 text-right text-gray-500 font-medium">Amount</th>
                  <th className="px-6 py-3 text-right text-gray-500 font-medium">Outstanding</th>
                  <th className="px-6 py-3 text-center text-gray-500 font-medium">Days Overdue</th>
                  <th className="px-6 py-3 text-center text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.outstandingInvoices.map((inv) => {
                  const overdue = daysOverdue(inv.dueDate);
                  const isOverdue = overdue > 0;
                  return (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(inv.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-gray-900">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold text-gray-900">
                        {formatINR(inv.outstandingAmount)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {isOverdue ? (
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-mono ${
                              overdue > 90
                                ? "bg-red-100 text-red-800"
                                : overdue > 60
                                ? "bg-orange-100 text-orange-800"
                                : overdue > 30
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {overdue}d
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Not due</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <StatusBadge status={isOverdue ? "overdue" : inv.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="bg-white rounded-lg shadow">
          {data.paymentHistory.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No payment history for this customer
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Payment #</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-6 py-3 text-right text-gray-500 font-medium">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-medium">Method</th>
                  <th className="px-6 py-3 text-center text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.paymentHistory.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{p.paymentNumber}</td>
                    <td className="px-6 py-3 text-gray-600">
                      {new Date(p.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-gray-900">
                      {formatINR(p.amount)}
                    </td>
                    <td className="px-6 py-3 text-gray-600 capitalize">{p.paymentMethod}</td>
                    <td className="px-6 py-3 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}