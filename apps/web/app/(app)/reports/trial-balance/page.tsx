"use client";

import { useState, useMemo } from 'react';
import { useCallback } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { useRealtimeSubscription } from "@/components/providers/realtime-provider";

interface TbItem {
  code: string;
  name: string;
  debit: number;
  credit: number;
}

interface TbGroup {
  name: string;
  items: TbItem[];
}

const KIND_TO_GROUP: Record<string, string> = {
  Asset: "Assets",
  Liability: "Liabilities",
  Equity: "Equity",
  Revenue: "Income",
  Expense: "Expenses",
};

const GROUP_ORDER = ["Assets", "Liabilities", "Equity", "Income", "Expenses"];

export default function TrialBalancePage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const [showZero, setShowZero] = useState(false);

  const utils = api.useUtils();
  const { data, isLoading, error } = api.balances.trialBalance.useQuery(
    { fiscalYear },
    { staleTime: 0, refetchInterval: 30_000 },
  );

  const invalidate = useCallback(() => {
    void utils.balances.trialBalance.invalidate();
  }, [utils]);
  useRealtimeSubscription("account_balances", invalidate);

  const groups = useMemo<TbGroup[]>(() => {
    if (!data?.rows) return [];
    const byGroup: Record<string, TbItem[]> = {};
    for (const r of data.rows) {
      const groupName = KIND_TO_GROUP[r.kind] ?? "Other";
      const dr = parseFloat(r.debitTotal || "0");
      const cr = parseFloat(r.creditTotal || "0");
      if (r.kind === "Asset" || r.kind === "Expense") {
        const net = dr - cr;
        const debit = net > 0 ? net : 0;
        const credit = net < 0 ? -net : 0;
        byGroup[groupName] ??= [];
        byGroup[groupName].push({ code: r.code, name: r.name, debit, credit });
      } else {
        const net = cr - dr;
        const credit = net > 0 ? net : 0;
        const debit = net < 0 ? -net : 0;
        byGroup[groupName] ??= [];
        byGroup[groupName].push({ code: r.code, name: r.name, debit, credit });
      }
    }
    return GROUP_ORDER
      .filter((g) => byGroup[g]?.length)
      .map((g) => ({ name: g, items: byGroup[g] }));
  }, [data]);

  const allItems = groups.flatMap(g => g.items);
  const totalDebit = allItems.reduce((s, i) => s + i.debit, 0);
  const totalCredit = allItems.reduce((s, i) => s + i.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-ui text-2xl font-semibold text-dark">Trial Balance</h1>
        <Card className="bg-surface border border-border p-8 text-center">
          <p className="text-danger font-medium mb-4">Failed to load trial balance</p>
          <Button onClick={() => utils.balances.trialBalance.invalidate()}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-ui text-2xl font-semibold text-dark">Trial Balance</h1>
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

  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">
              Report · FY {fiscalYear}
            </p>
            <h1 className="font-ui text-2xl font-semibold text-dark">Trial Balance</h1>
          </div>
        </div>
        <Card className="bg-surface border border-border p-12 text-center">
          <Icon name="receipt_long" size={32} className="text-light mx-auto mb-3" />
          <p className="font-ui text-lg text-dark mb-1">No entries for FY {fiscalYear}</p>
          <p className="font-ui text-ui-xs text-mid">Post a journal entry to populate the trial balance.</p>
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
            Report · FY {fiscalYear}
          </p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Trial Balance</h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            aria-label="Fiscal year" className="bg-surface border border-border px-3 py-1.5 text-ui-xs font-ui outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
            <option>2024-25</option>
          </select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`/api/reports/trial-balance/pdf?fy=${fiscalYear}`, '_blank')}>
            <Icon name="download" size={14} /> Export PDF
          </Button>
          <Link
            href="/audit-log?report=trial-balance"
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
          <h2 className="font-ui text-display-lg text-dark print:text-black">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-ui-xs text-mid mt-1 uppercase tracking-widest">Trial Balance</p>
          <p className="font-mono text-ui-xs text-light mt-0.5">As at 31 March {parseInt(fiscalYear.split('-')[1]) + 2000} · FY {fiscalYear}</p>
        </div>

        {/* Balance check */}
        <div className={`mx-8 mt-6 px-4 py-2 text-ui-xs font-semibold uppercase tracking-widest rounded-md flex items-center gap-2 ${
          isBalanced ? "bg-success-bg text-success-deep" : "bg-danger-bg text-danger-deep"
        } print:border print:rounded-none`}>
          <Icon name={isBalanced ? "check_circle" : "warning"} size={16} />
          {isBalanced ? "Trial Balance is balanced" : "Trial Balance is NOT balanced"}
        </div>

        {/* Zero-balance toggle */}
        <div className="flex justify-end px-8 mt-4 print:hidden">
          <label className="flex items-center gap-2 font-ui text-ui-2xs text-mid cursor-pointer">
            <input
              type="checkbox"
              checked={showZero}
              onChange={e => setShowZero(e.target.checked)}
              className="accent-amber"
            />
            Show zero-balance accounts
          </label>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-4 px-8 pt-6 pb-2 border-b border-dark font-ui text-ui-2xs text-light uppercase tracking-widest print:border-black">
          <div className="col-span-2">Code</div>
          <div className="col-span-5">Account Name</div>
          <div className="col-span-2 text-right">Debit (₹)</div>
          <div className="col-span-2 text-right">Credit (₹)</div>
          <div className="col-span-1" />
        </div>

        {/* Groups */}
        <div className="px-8 py-6 space-y-8">
          {groups.map(group => {
            const filtered = showZero ? group.items : group.items.filter(i => i.debit > 0 || i.credit > 0);
            if (filtered.length === 0) return null;
            const groupDr = filtered.reduce((s, i) => s + i.debit, 0);
            const groupCr = filtered.reduce((s, i) => s + i.credit, 0);
            return (
              <div key={group.name}>
                <div className="px-4 py-2 border-t-2 border-amber flex items-center justify-between print:border-black">
                  <h3 className="font-ui text-display-sm text-dark uppercase tracking-wider print:text-black">{group.name}</h3>
                  <span className="font-mono text-ui-xs text-mid">
                    Dr {formatIndianNumber(groupDr)} / Cr {formatIndianNumber(groupCr)}
                  </span>
                </div>
                {filtered.map(item => (
                  <div
                    key={item.code}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-2.5 hover:bg-surface-muted/50 transition-colors border-b 50-border print:200-border"
                  >
                    <div className="col-span-2 font-mono text-ui-xs text-light tabular-nums">{item.code}</div>
                    <div className="col-span-5 font-ui text-ui-sm text-dark">{item.name}</div>
                    <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums">
                      {item.debit > 0 ? `₹ ${formatIndianNumber(item.debit, { currency: false })}` : ""}
                    </div>
                    <div className="col-span-2 text-right font-mono text-ui-sm tabular-nums">
                      {item.credit > 0 ? `₹ ${formatIndianNumber(item.credit, { currency: false })}` : ""}
                    </div>
                    <div className="col-span-1" />
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Grand total */}
        <div className="border-t-2 border-dark mx-8 py-4 grid grid-cols-12 gap-4 items-center font-bold print:border-black">
          <div className="col-span-7 font-ui text-ui-xs uppercase tracking-widest text-dark print:text-black">Grand Total</div>
          <div className="col-span-2 text-right font-mono text-ui-md tabular-nums text-dark print:text-black">₹ {formatIndianNumber(totalDebit, { currency: false })}</div>
          <div className="col-span-2 text-right font-mono text-ui-md tabular-nums text-dark print:text-black">₹ {formatIndianNumber(totalCredit, { currency: false })}</div>
          <div className="col-span-1" />
        </div>

        {isBalanced && (
          <div className="mx-8 mb-6 px-4 py-2 bg-success-bg text-success-deep font-medium text-ui-xs rounded-md print:border print:rounded-none print:text-black print:bg-transparent">
            ✓ Total Debits match Total Credits — Trial Balance is in order
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-6 pt-2 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-ui-2xs text-light">This is a system-generated statement. E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
