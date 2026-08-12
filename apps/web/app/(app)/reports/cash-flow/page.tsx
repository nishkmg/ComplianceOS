"use client";

import { useCallback } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { useRealtimeSubscription } from "@/components/providers/realtime-provider";
import { PageHeader } from "@/components/ui/page-header";

// ─── Page Component ───────────────────────────────────────────────────────────

interface CfSection { title: string; items: { label: string; amount: string }[]; total: string }

export default function CashFlowPage() {
  const { data: company } = api.tenantConfig.get.useQuery(undefined, { staleTime: 60_000 });
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();

  const utils = api.useUtils();
  const { data, isLoading, error } = api.balances.cashFlow.useQuery(
    { fiscalYear },
    { staleTime: 0, refetchInterval: 30_000 },
  );

  const invalidate = useCallback(() => {
    void utils.balances.cashFlow.invalidate();
  }, [utils]);
  useRealtimeSubscription("account_balances", invalidate);

  const sections: CfSection[] = [
    {
      title: "A. Cash Flow from Operating Activities",
      items: data?.operatingActivities ?? [],
      total: data?.cashFromOperations ?? "0",
    },
    {
      title: "B. Cash Flow from Investing Activities",
      items: data?.investingActivities ?? [],
      total: data?.cashFromInvesting ?? "0",
    },
    {
      title: "C. Cash Flow from Financing Activities",
      items: data?.financingActivities ?? [],
      total: data?.cashFromFinancing ?? "0",
    },
  ];

  const netChange = parseFloat(data?.netCashFlow || "0");
  const closingCash = netChange;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statement of Cash Flows" />
        <Card className="bg-surface border border-border p-8 text-center">
          <p className="text-danger font-medium mb-4">Failed to load cash flow statement</p>
          <Button onClick={() => utils.balances.cashFlow.invalidate()}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Statement of Cash Flows" />
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

  if (sections.every(s => s.items.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">
              Financial Report · FY {fiscalYear}
            </p>
            <PageHeader title="Statement of Cash Flows" />
            <p className="text-ui-sm text-secondary font-ui mt-1">For the year ended March 31, {parseInt(fiscalYear.split('-')[1]) + 2000} (Indirect Method)</p>
          </div>
        </div>
        <Card className="bg-surface border border-border p-12 text-center">
          <Icon name="receipt_long" size={32} className="text-light mx-auto mb-3" />
          <p className="font-ui text-lg text-dark mb-1">No entries for FY {fiscalYear}</p>
          <p className="font-ui text-ui-xs text-mid">Post journal entries to populate the cash flow statement.</p>
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
          <PageHeader title="Statement of Cash Flows" />
          <p className="text-ui-sm text-secondary font-ui mt-1">For the year ended March 31, {parseInt(fiscalYear.split('-')[1]) + 2000} (Indirect Method)</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            aria-label="Fiscal year"
            className="bg-surface border border-border px-3 py-1.5 text-ui-xs font-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Icon name="print" /> Print
          </Button>
          <Link
            href="/audit-log?report=cash-flow"
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
          <p className="font-ui text-ui-xs text-mid uppercase tracking-widest mb-1">Cash Flow Statement</p>
          <p className="font-mono text-ui-xs text-light italic">For the year ended 31 March {parseInt(fiscalYear.split('-')[1]) + 2000} · FY {fiscalYear}</p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-8 pt-6 pb-2 border-b border-dark font-ui text-ui-2xs text-light uppercase tracking-widest print:border-black">
          <div className="col-span-8">Particulars</div>
          <div className="col-span-2 text-right">Current Period (₹)</div>
          <div className="col-span-2 text-right text-mid">Previous Period (₹)</div>
        </div>

        {/* Sections */}
        <CardContent className="p-8 space-y-10">
          {sections.map(section => (
            <div key={section.title}>
              <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
                <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">{section.title}</h3>
              </div>
              <div className="divide-y-[0.5px] divide-border-subtle">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-surface-muted/50 transition-colors"
                  >
                    <div className="col-span-8 font-ui text-ui-sm text-dark pl-4">{item.label}</div>
                    <div className={`col-span-2 text-right font-mono text-ui-sm tabular-nums ${
                      parseFloat(item.amount) < 0 ? 'text-danger' : 'text-dark'
                    } print:text-dark`}>
                      {parseFloat(item.amount) < 0
                        ? `(${formatIndianNumber(Math.abs(parseFloat(item.amount)))})`
                        : formatIndianNumber(parseFloat(item.amount))}
                    </div>
                    <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-light">
                      {formatIndianNumber(Math.abs(parseFloat(item.amount)))}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-12 gap-4 items-center py-3 bg-surface-muted font-semibold border-t border-border">
                  <div className="col-span-8 font-ui text-ui-xs uppercase tracking-wider text-dark print:text-dark">
                    Net Cash from {section.title.split(" from ").pop()}
                  </div>
                  <div className={`col-span-2 text-right font-mono text-ui-sm tabular-nums ${
                    parseFloat(section.total) < 0 ? 'text-danger' : 'text-dark'
                  } print:text-dark`}>
                    {parseFloat(section.total) < 0
                      ? `(${formatIndianNumber(Math.abs(parseFloat(section.total)))})`
                      : formatIndianNumber(parseFloat(section.total))}
                  </div>
                  <div className="col-span-2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Consolidation */}
        <div className="mx-8 mb-8 space-y-4">
          <div className="grid grid-cols-12 gap-4 items-center py-3 border-t-2 border-dark print:border-black">
            <div className="col-span-8 font-ui text-ui-xs uppercase tracking-widest font-bold text-dark print:text-dark">
              Net Increase / (Decrease) in Cash & Cash Equivalents
            </div>
            <div className={`col-span-2 text-right font-mono text-ui-md tabular-nums font-bold ${
              netChange < 0 ? 'text-danger' : 'text-dark'
            } print:text-dark`}>
              {netChange < 0
                ? `(${formatIndianNumber(Math.abs(netChange))})`
                : formatIndianNumber(netChange)}
            </div>
            <div className="col-span-2" />
          </div>

          <div className="grid grid-cols-12 gap-4 items-center py-3 border-t border-border print:border-black">
            <div className="col-span-8 font-ui text-ui-xs uppercase tracking-widest text-mid print:text-dark">Cash & Cash Equivalents at Beginning of Period</div>
            <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-dark print:text-dark">{formatIndianNumber(0)}</div>
            <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-light">{formatIndianNumber(0)}</div>
          </div>

          <div className="bg-surface-muted px-6 py-5 flex justify-between items-center border-t-2 border-dark rounded-md print:bg-transparent print:border-black print:rounded-none">
            <div>
              <span className="font-ui text-ui-sm font-bold text-dark uppercase tracking-widest print:text-dark">
                Cash & Cash Equivalents at End of Period
              </span>
            </div>
            <span className="font-mono text-2xl font-bold text-dark tabular-nums print:text-dark">
              {formatIndianNumber(closingCash)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-ui-2xs text-light">Prepared in accordance with AS-3 (Indirect Method). E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
