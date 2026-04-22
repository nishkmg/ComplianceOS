"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format-inr";
import AgingTable from "@/components/receivables/aging-table";

function KpiCard({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: "green" | "yellow" | "orange" | "red";
}) {
  const borderMap = {
    green: "border-l-4 border-l-green-500",
    yellow: "border-l-4 border-l-yellow-500",
    orange: "border-l-4 border-l-orange-500",
    red: "border-l-4 border-l-red-500",
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${highlight ? borderMap[highlight] : ""}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

export default function ReceivablesDashboardPage() {
  const { data: agingReport, isLoading } = api.receivables.agingReport.useQuery();
  const { data: agingTotals } = api.receivables.aging.useQuery();

  const [showAgingTable, setShowAgingTable] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const tableData = (agingReport ?? []).map((r) => ({
    customerName: r.customerName,
    customerGstin: r.customerGstin,
    total: r.totalOutstanding,
    current: r.current030,
    days31to60: r.aging3160,
    days61to90: r.aging6190,
    days90Plus: r.aging90Plus,
  }));

  const totals = {
    current030: agingTotals?.current030 ?? 0,
    aging3160: agingTotals?.aging3160 ?? 0,
    aging6190: agingTotals?.aging6190 ?? 0,
    aging90Plus: agingTotals?.aging90Plus ?? 0,
    total: agingTotals?.total ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Receivables</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/payments/record"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
          >
            Record Payment
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard
          label="Total Outstanding"
          value={formatINR(totals.total)}
          sublabel="All receivables"
        />
        <KpiCard
          label="Current (0-30)"
          value={formatINR(totals.current030)}
          sublabel="Not yet due"
          highlight="green"
        />
        <KpiCard
          label="31-60 Days Overdue"
          value={formatINR(totals.aging3160)}
          highlight="yellow"
        />
        <KpiCard
          label="61-90 Days Overdue"
          value={formatINR(totals.aging6190)}
          highlight="orange"
        />
        <KpiCard
          label="90+ Days Overdue"
          value={formatINR(totals.aging90Plus)}
          sublabel="Critical"
          highlight="red"
        />
      </div>

      {/* Aging Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Aging Report</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Outstanding receivables by age bucket
            </p>
          </div>
          <button
            onClick={() => setShowAgingTable(!showAgingTable)}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          >
            {showAgingTable ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {showAgingTable && <AgingTable data={tableData} />}
      </div>
    </div>
  );
}
