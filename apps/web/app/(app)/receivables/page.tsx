// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge, KpiTile } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

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
        <KpiTile label="Total Outstanding" value={formatIndianNumber(totals.total)} subtext="All receivables" variant="neutral" />
        <KpiTile label="Current (0-30)" value={formatIndianNumber(totals.current030)} subtext="Not yet due" variant="success" />
        <KpiTile label="31-60 Days Overdue" value={formatIndianNumber(totals.aging3160)} variant="amber" />
        <KpiTile label="61-90 Days Overdue" value={formatIndianNumber(totals.aging6190)} variant="amber" />
        <KpiTile label="90+ Days Overdue" value={formatIndianNumber(totals.aging90Plus)} subtext="Critical" variant="danger" />
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
