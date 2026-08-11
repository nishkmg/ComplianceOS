"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const now = new Date();
const DEFAULT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function ESIChallanPage() {
  const [period, setPeriod] = useState(DEFAULT_MONTH);
  const [month, year] = period.split("-");

  const challan = api.payrollReports.esiChallan.useQuery(
    { month, year },
    { staleTime: 15_000 },
  );

  const d = challan.data;
  const esiEe = Number(d?.esiEeTotal ?? "0");
  const esiEr = Number(d?.esiErTotal ?? "0");
  const total = Number(d?.total ?? "0");
  const hasData = total > 0;

  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Statutory Filings</p>
          <PageHeader title="ESI Challan Report" />
          <p className="text-ui-sm text-secondary font-ui mt-1">ESI contribution totals for monthly filing.</p>
        </div>
        <div className="flex items-center bg-surface-muted border border-border rounded-md h-9 px-3">
          <Icon name="calendar_month" className="text-light text-ui-xl mr-2" />
          <input
            aria-label="Report period"
            type="month"
            className="bg-transparent border-none text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </header>

      {challan.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon="health_and_safety"
          title={`No ESI liability for ${month}/${year}`}
          description="Statutory liabilities are recorded when a payroll run is finalized for the period."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface p-5 border border-border shadow-sm">
              <p className="text-xs font-bold text-mid uppercase mb-1">Employee Contribution (0.75%)</p>
              <p className="text-2xl font-mono font-bold text-dark">{formatIndianNumber(esiEe)}</p>
            </div>
            <div className="bg-surface p-5 border border-border shadow-sm">
              <p className="text-xs font-bold text-mid uppercase mb-1">Employer Contribution (3.25%)</p>
              <p className="text-2xl font-mono font-bold text-dark">{formatIndianNumber(esiEr)}</p>
            </div>
            <div className="bg-surface p-5 border border-border border-l-4 border-l-amber shadow-sm">
              <p className="text-xs font-bold text-amber uppercase mb-1">Total Payable</p>
              <p className="text-2xl font-mono font-bold text-dark">{formatIndianNumber(total)}</p>
            </div>
            <div className="bg-surface p-5 border border-border shadow-sm">
              <p className="text-xs font-bold text-mid uppercase mb-1">Status</p>
              <p className="text-lg font-mono font-bold mt-1">{d?.paid ? "Paid" : "Pending"}</p>
            </div>
          </div>
          <div className="bg-surface border border-border p-6 shadow-sm flex items-start gap-3">
            <Icon name="info" className="text-amber" />
            <p className="font-ui text-ui-sm text-mid leading-relaxed">
              Payable by {d?.payableByDate ?? "—"}. Employee-wise ESI contribution breakup is generated with the payroll run summary.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
