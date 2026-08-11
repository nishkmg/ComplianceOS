"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodPicker } from "@/components/ui/period-picker";

const now = new Date();
const DEFAULT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function PFChallanPage() {
  const [period, setPeriod] = useState(DEFAULT_MONTH);
  const [month, year] = period.split("-");

  const challan = api.payrollReports.pfChallan.useQuery(
    { month, year },
    { staleTime: 15_000 },
  );

  const d = challan.data;
  const pfEe = Number(d?.pfEeTotal ?? "0");
  const pfEr = Number(d?.pfErTotal ?? "0");
  const eps = Number(d?.epsTotal ?? "0");
  const total = Number(d?.total ?? "0");
  const hasData = total > 0;

  return (
    <div className="space-y-0 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-ui-2xs font-bold text-amber uppercase tracking-widest mb-2">
            <span>Reports</span>
            <Icon name="chevron_right" className="text-ui-xs" />
            <span>Statutory Filings</span>
          </div>
          <PageHeader title="PF Challan Report" />
        </div>
        <div className="flex items-center gap-4">
          <PeriodPicker value={period} onChange={setPeriod} />
        </div>
      </header>

      <div className="space-y-6 pb-12">
        {challan.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
          </div>
        ) : !hasData ? (
          <EmptyState
            icon="receipt_long"
            title={`No PF liability for ${month}/${year}`}
            description="Statutory liabilities are recorded when a payroll run is finalized for the period."
          />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
                <h3 className="text-xs font-bold text-mid uppercase tracking-wider">PF Employee (12%)</h3>
                <p className="font-mono text-2xl font-bold text-dark mt-2">{formatIndianNumber(pfEe)}</p>
              </div>
              <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
                <h3 className="text-xs font-bold text-mid uppercase tracking-wider">PF Employer (12%)</h3>
                <p className="font-mono text-2xl font-bold text-dark mt-2">{formatIndianNumber(pfEr)}</p>
              </div>
              <div className="bg-surface border border-border p-5 rounded-md shadow-sm text-left">
                <h3 className="text-xs font-bold text-mid uppercase tracking-wider">EPS (8.33%)</h3>
                <p className="font-mono text-2xl font-bold text-dark mt-2">{formatIndianNumber(eps)}</p>
              </div>
              <div className="bg-dark border focus:border-focus p-5 rounded-md shadow-sm text-left">
                <h3 className="text-xs font-bold text-light uppercase tracking-wider">Total Payable</h3>
                <p className="font-mono text-2xl font-bold text-amber mt-2">{formatIndianNumber(total)}</p>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 shadow-sm flex items-start gap-3">
              <Icon name="info" className="text-amber" />
              <p className="font-ui text-ui-sm text-mid leading-relaxed">
                {d?.paid ? "Marked as paid" : "Pending remittance"} · payable by {d?.payableByDate ?? "—"}. Employee-wise ECR (E-CR) file generation for EPFO upload is a separate export, not yet available.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
