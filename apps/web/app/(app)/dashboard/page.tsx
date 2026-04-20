"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  totalOutstanding: number;
  overdueCount: number;
  topCustomers: Array<{ customerName: string; outstanding: number }>;
}

export default function DashboardPage() {
  const [receivables, setReceivables] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/trpc/receivables.dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.result?.data) {
          setReceivables(data.result.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">FY 2026-27</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue (MTD)", value: "₹0", note: "No data yet" },
          { label: "Total Expenses (MTD)", value: "₹0", note: "No data yet" },
          { label: "Net Profit (MTD)", value: "₹0", note: "No data yet" },
          { label: "Cash & Bank Balance", value: "₹0", note: "No data yet" },
          { label: "Outstanding Receivables", value: "₹0", note: "Requires Invoicing module" },
          { label: "Outstanding Payables", value: "₹0", note: "Requires Invoicing module" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Receivables</h2>
          <Link href="/receivables" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        {receivables ? (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Total Outstanding</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{receivables.totalOutstanding.toLocaleString("en-IN")}
              </p>
              {receivables.overdueCount > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {receivables.overdueCount} overdue
                </p>
              )}
            </div>
            {receivables.topCustomers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Top Customers</p>
                {receivables.topCustomers.map((c) => (
                  <div key={c.customerName} className="flex justify-between text-sm">
                    <span className="text-gray-700">{c.customerName}</span>
                    <span className="text-gray-900 font-medium">
                      ₹{c.outstanding.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No outstanding receivables</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm">No transactions yet. Create your first journal entry.</p>
          <Link href="/journal/new" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
            New Journal Entry
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">FY Progress</h2>
          <span className="text-sm text-gray-500">Apr 2026 - Mar 2027</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full" style={{ width: "25%" }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">~3 months elapsed</p>
      </div>
    </div>
  );
}
