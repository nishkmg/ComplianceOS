// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

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
    green: "border-l-4 border-l-green",
    yellow: "border-l-4 border-l-amber",
    orange: "border-l-4 border-l-orange",
    red: "border-l-4 border-l-danger",
  };

  return (
    <div className={`card p-5 ${highlight ? borderMap[highlight] : ""}`}>
      <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-2">{label}</p>
      <p className="font-mono text-[22px] font-medium text-dark">{value}</p>
      {sublabel && <p className="font-ui text-[11px] text-mid mt-1">{sublabel}</p>}
    </div>
  );
}

export default function ReceivablesDashboardPage() {
  const { data: agingReport, isLoading } = api.receivables.agingReport.useQuery();
  const { data: agingTotals } = api.receivables.aging.useQuery();

  const [showAgingTable, setShowAgingTable] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-40 bg-surface-muted rounded animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-surface-muted rounded animate-pulse" />
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
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Receivables</h1>
          <p className="font-ui text-[12px] text-light mt-1">Track outstanding customer payments</p>
        </div>
        <Link href="/payments/record" className="filter-tab active">
          Record Payment
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard label="Total Outstanding" value={formatIndianNumber(totals.total)} sublabel="All receivables" />
        <KpiCard label="Current (0-30)" value={formatIndianNumber(totals.current030)} sublabel="Not yet due" highlight="green" />
        <KpiCard label="31-60 Days Overdue" value={formatIndianNumber(totals.aging3160)} highlight="yellow" />
        <KpiCard label="61-90 Days Overdue" value={formatIndianNumber(totals.aging6190)} highlight="orange" />
        <KpiCard label="90+ Days Overdue" value={formatIndianNumber(totals.aging90Plus)} sublabel="Critical" highlight="red" />
      </div>

      {/* Aging Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-[18px] font-normal text-dark">Aging Report</h2>
            <p className="font-ui text-[11px] text-light mt-0.5">Outstanding receivables by age bucket</p>
          </div>
          <button onClick={() => setShowAgingTable(!showAgingTable)} className="filter-tab">
            {showAgingTable ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {showAgingTable && <AgingTable data={tableData} />}
      </div>
    </div>
  );
}
