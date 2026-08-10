"use client";

import { useCallback, useState, useEffect } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { useRealtimeSubscription } from "@/components/providers/realtime-provider";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ProfitLossPage() {
  const [companyName, setCompanyName] = useState("Your Business");
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const r = await fetch(`/api/onboarding?tenantId=${encodeURIComponent(tenantId)}`);
        if (r.ok) {
          const d = await r.json();
          if (d.businessProfile?.name) setCompanyName(d.businessProfile.name);
        }
      } catch {}
    })();
  }, [tenantId]);
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();

  const utils = api.useUtils();
  const { data, isLoading, error } = api.balances.pAndL.useQuery(
    { fiscalYear },
    { staleTime: 0, refetchInterval: 30_000 },
  );

  const invalidate = useCallback(() => {
    void utils.balances.pAndL.invalidate();
  }, [utils]);
  useRealtimeSubscription("account_balances", invalidate);

  const revenueItems = data?.revenue ?? [];
  const expenseItems = data?.expenses ?? [];
  const operatingRevenue = data?.operatingRevenue ?? [];
  const otherIncome = data?.otherIncome ?? [];
  const directExpenses = data?.directExpenses ?? [];
  const indirectExpenses = data?.indirectExpenses ?? [];
  const totalRevenue = parseFloat(data?.totalRevenue || "0");
  const totalExpenses = parseFloat(data?.totalExpenses || "0");
  const netProfit = parseFloat(data?.netProfit || "0");
  const isProfit = netProfit >= 0;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-ui text-2xl font-semibold text-dark">Profit & Loss Account</h1>
        <Card className="bg-surface border border-border p-8 text-center">
          <p className="text-danger font-medium mb-4">Failed to load profit & loss</p>
          <Button onClick={() => utils.balances.pAndL.invalidate()}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-ui text-2xl font-semibold text-dark">Profit & Loss Account</h1>
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

  if (revenueItems.length === 0 && expenseItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">
              Financial Performance · FY {fiscalYear}
            </p>
            <h1 className="font-ui text-2xl font-semibold text-dark">Profit & Loss Account</h1>
            <p className="font-ui text-ui-sm text-secondary mt-1">Schedule III — Section 129 of Companies Act, 2013</p>
          </div>
        </div>
        <Card className="bg-surface border border-border p-12 text-center">
          <Icon name="receipt_long" size={32} className="text-light mx-auto mb-3" />
          <p className="font-ui text-lg text-dark mb-1">No entries for FY {fiscalYear}</p>
          <p className="font-ui text-ui-xs text-mid">Post journal entries to populate the profit & loss.</p>
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
            Financial Performance · FY {fiscalYear}
          </p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Profit & Loss Account</h1>
          <p className="font-ui text-ui-sm text-secondary mt-1">Schedule III — Section 129 of Companies Act, 2013</p>
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
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Icon name="print" size={14} /> Print
          </Button>
          <Link
            href="/audit-log?report=pl"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 no-underline"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report paper */}
      <Card className="bg-surface border border-border shadow-sm rounded-md max-w-[1100px] mx-auto print:shadow-none print:border-black">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border print:border-black">
          <h2 className="font-ui text-display-lg text-dark print:text-dark">{companyName}</h2>
          <p className="font-ui text-ui-xs text-mid mt-1 uppercase tracking-widest">Statement of Profit and Loss</p>
          <p className="font-mono text-ui-xs text-light mt-0.5 italic">For the year ended 31 March {parseInt(fiscalYear.split('-')[1]) + 2000} · FY {fiscalYear}</p>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Revenue From Operations */}
          <section>
            <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
              <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">I. Revenue From Operations</h3>
            </div>
            <div className="divide-y-[0.5px] divide-border-subtle">
              {(operatingRevenue.length > 0 ? operatingRevenue : revenueItems).map((item, i) => (
                <div key={`oprev-${i}`} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="col-span-8 font-ui text-ui-sm text-dark">{item.label}</div>
                  <div className="col-span-2" />
                  <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-dark font-medium">
                    ₹ {formatIndianNumber(parseFloat(item.amount), { currency: false })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Other Income */}
          {otherIncome.length > 0 && (
            <section>
              <div className="px-4 py-2 border-t-2 border-border mb-0 print:border-black">
                <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">II. Other Income</h3>
              </div>
              <div className="divide-y-[0.5px] divide-border-subtle">
                {otherIncome.map((item, i) => (
                  <div key={`oth-${i}`} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                    <div className="col-span-8 font-ui text-ui-sm text-dark">{item.label}</div>
                    <div className="col-span-2" />
                    <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-dark font-medium">
                      ₹ {formatIndianNumber(parseFloat(item.amount), { currency: false })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Total Revenue */}
          <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-surface-muted font-bold border-t-2 border-border print:border-black">
            <div className="col-span-8 font-ui text-ui-xs uppercase tracking-widest text-dark print:text-dark">III. Total Revenue (I + II)</div>
            <div className="col-span-2" />
            <div className="col-span-2 text-right font-mono text-ui-md tabular-nums text-dark print:text-dark">
              ₹ {formatIndianNumber(totalRevenue, { currency: false })}
            </div>
          </div>

          {/* Expenses */}
          <section>
            <div className="px-4 py-2 border-t-2 border-amber mb-0 print:border-black">
              <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-dark">IV. Expenses</h3>
            </div>
            <div className="divide-y-[0.5px] divide-border-subtle">
              {(directExpenses.length > 0 ? directExpenses : expenseItems).map((item, i) => (
                <div key={`exp-${i}`} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="col-span-8 font-ui text-ui-sm text-dark">{item.label}</div>
                  <div className="col-span-2" />
                  <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-dark font-medium">
                    ₹ {formatIndianNumber(Math.abs(parseFloat(item.amount)), { currency: false })}
                  </div>
                </div>
              ))}
              {indirectExpenses.length > 0 && (
                <div className="px-4 py-2 bg-surface-muted/40 font-ui text-ui-xs uppercase tracking-wider text-mid">
                  Employee benefits & other expenses
                </div>
              )}
              {indirectExpenses.map((item, i) => (
                <div key={`iexp-${i}`} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-surface-muted/50 transition-colors">
                  <div className="col-span-8 font-ui text-ui-sm text-dark">{item.label}</div>
                  <div className="col-span-2" />
                  <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums text-dark font-medium">
                    ₹ {formatIndianNumber(Math.abs(parseFloat(item.amount)), { currency: false })}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-surface-muted font-bold border-t border-border">
                <div className="col-span-8 font-ui text-ui-xs uppercase tracking-widest text-dark print:text-dark">Total Expenses</div>
                <div className="col-span-2" />
                <div className="col-span-2 text-right font-mono text-ui-md tabular-nums text-dark print:text-dark">
                  ₹ {formatIndianNumber(totalExpenses, { currency: false })}
                </div>
              </div>
            </div>
          </section>

          {/* Net Result */}
          <div className={`mt-8 px-8 py-6 flex justify-between items-center rounded-md print:rounded-none print:border-2 ${
            isProfit
              ? "bg-success-bg text-success border border-success/30 print:bg-transparent print:text-dark print:border-black"
              : "bg-danger-bg text-danger border border-danger/30 print:bg-transparent print:text-dark print:border-black"
          }`}>
            <div>
              <h4 className={`font-ui text-ui-sm font-bold uppercase tracking-widest ${isProfit ? "text-success-deep" : "text-danger-deep"} print:text-dark`}>
                {isProfit ? "Net Profit for the Period" : "Net Loss for the Period"}
              </h4>
              <p className={`text-ui-2xs mt-0.5 uppercase tracking-widest print:text-mid ${isProfit ? "text-success-deep" : "text-danger-deep"}`}>
                Transfer to Balance Sheet — Reserves & Surplus
              </p>
            </div>
            <p className={`font-mono text-2xl font-bold tabular-nums ${isProfit ? "text-success" : "text-danger"} print:text-dark`}>
              ₹ {formatIndianNumber(Math.abs(netProfit), { currency: false })}
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-ui-2xs text-light">System generated · Schedule III compliant · E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
