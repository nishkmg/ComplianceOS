"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { useRealtimeSubscription } from "@/components/providers/realtime-provider";
import { PageHeader } from "@/components/ui/page-header";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { data: company } = api.tenantConfig.get.useQuery(undefined, { staleTime: 60_000 });
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const fyEndDate = `${parseInt(fiscalYear.split('-')[1]) + 2000}-03-31`;
  const [asOfDate, setAsOfDate] = useState(fyEndDate);
  useEffect(() => { setAsOfDate(fyEndDate); }, [fiscalYear]);

  const utils = api.useUtils();
  const { data, isLoading, error } = api.balances.balanceSheet.useQuery(
    { fiscalYear, asOf: asOfDate !== fyEndDate ? asOfDate : undefined },
    { staleTime: 0, refetchInterval: 30_000 },
  );

  const invalidate = useCallback(() => {
    void utils.balances.balanceSheet.invalidate();
  }, [utils]);
  useRealtimeSubscription("account_balances", invalidate);

  const equityAndLiabilities = data?.equityAndLiabilities ?? [];
  const assetItems = data?.assets ?? [];
  const totalEqLiab = parseFloat(data?.totalEquityAndLiabilities || "0");
  const totalAssetsVal = parseFloat(data?.totalAssets || "0");
  const balanced = Math.abs(totalEqLiab - totalAssetsVal) < 0.01;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Balance Sheet" />
        <Card className="bg-surface border border-border p-8 text-center">
          <p className="text-danger font-medium mb-4">Failed to load balance sheet</p>
          <Button onClick={() => utils.balances.balanceSheet.invalidate()}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Balance Sheet" />
        <Card className="bg-surface border border-border p-8">
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-surface-muted rounded w-1/3" />
            <div className="h-4 bg-surface-muted rounded w-1/2" />
            <div className="h-4 bg-surface-muted rounded w-2/3" />
            <div className="h-4 bg-surface-muted rounded w-1/2" />
            <div className="h-4 bg-surface-muted rounded w-3/4" />
          </div>
        </Card>
      </div>
    );
  }

  if (equityAndLiabilities.length === 0 && assetItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">
              Financial Report · FY {fiscalYear}
            </p>
            <PageHeader title="Balance Sheet" />
          </div>
        </div>
        <Card className="bg-surface border border-border p-12 text-center">
          <Icon name="receipt_long" size={32} className="text-light mx-auto mb-3" />
          <p className="font-ui text-lg text-dark mb-1">No entries for FY {fiscalYear}</p>
          <p className="font-ui text-ui-xs text-mid">Post journal entries to populate the balance sheet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">
            Financial Report · FY {fiscalYear}
          </p>
          <PageHeader title="Balance Sheet" />
        </div>
        <div className="flex gap-3 items-center">
          <select
            aria-label="Fiscal year" className="bg-surface border border-border px-3 py-1.5 text-ui-xs font-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
          <input
            aria-label="Fiscal year"
            type="date"
            value={asOfDate}
            onChange={e => setAsOfDate(e.target.value)}
            className="bg-surface border border-border px-3 py-1.5 text-ui-xs font-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-md"
          />
          <Link
            href="/audit-log?report=balance-sheet"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 no-underline"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <Card className="bg-surface border border-border shadow-sm rounded-md max-w-[1100px] mx-auto print:shadow-none print:border-black">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border print:border-black">
          <h2 className="font-ui text-display-lg text-dark mb-1 print:text-dark">{company?.name ?? "—"}</h2>
          <p className="font-ui text-ui-xs text-mid uppercase tracking-widest mb-1">Balance Sheet</p>
          <p className="font-mono text-ui-xs text-light italic">
            As of {new Date(asOfDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}All amounts in ₹
          </p>
        </div>

        {/* Two-column layout */}
        <div className="px-8 py-6 grid gap-12 lg:grid-cols-2">
          {/* Left: Equity & Liabilities */}
          <div className="space-y-8">
            <div>
              <div className="px-4 py-2 border-t-2 border-amber mb-4 print:border-black">
                <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">Equity & Liabilities</h3>
              </div>

              <div className="divide-y-[0.5px] divide-border-subtle">
                {equityAndLiabilities.map((item, i) => (
                  <div key={`${item.label}-${i}`} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark">{item.label}</span>
                    <span className="font-mono text-ui-sm tabular-nums">{formatIndianNumber(parseFloat(item.amount), { currency: false })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-surface-muted py-3 rounded-md print:bg-transparent print:border-black print:rounded-none">
              <span className="uppercase tracking-widest text-xs print:text-dark">Total Equity & Liabilities</span>
              <span className="font-mono text-[15px] tabular-nums print:text-dark">{formatIndianNumber(totalEqLiab, { currency: false })}</span>
            </div>
          </div>

          {/* Right: Assets */}
          <div className="space-y-8">
            <div>
              <div className="px-4 py-2 border-t-2 border-amber mb-4 print:border-black">
                <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">Assets</h3>
              </div>

              <div className="divide-y-[0.5px] divide-border-subtle">
                {assetItems.map((item, i) => (
                  <div key={`${item.label}-${i}`} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark">{item.label}</span>
                    <span className="font-mono text-ui-sm tabular-nums">{formatIndianNumber(parseFloat(item.amount), { currency: false })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-surface-muted py-3 rounded-md print:bg-transparent print:border-black print:rounded-none">
              <span className="uppercase tracking-widest text-xs print:text-dark">Total Assets</span>
              <span className="font-mono text-[15px] tabular-nums print:text-dark">{formatIndianNumber(totalAssetsVal, { currency: false })}</span>
            </div>

            {balanced ? (
              <div className="px-4 py-2 bg-success-bg text-success text-ui-2xs uppercase font-bold tracking-widest text-center rounded-md flex items-center justify-center gap-1.5 print:bg-transparent print:text-dark print:border print:rounded-none">
                <Icon name="check_circle" size={14} /> Statement is Balanced
              </div>
            ) : (
              <div className="px-4 py-2 bg-danger-bg text-danger-deep text-ui-2xs uppercase font-bold tracking-widest text-center rounded-md flex items-center justify-center gap-1.5 print:bg-transparent print:text-dark print:border print:rounded-none">
                <Icon name="warning" size={14} /> Out of Balance by {formatIndianNumber(Math.abs(totalEqLiab - totalAssetsVal), { currency: false })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-ui-2xs text-light">This is a system-generated financial statement. E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
