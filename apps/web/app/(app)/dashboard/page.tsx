"use client";

import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
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
