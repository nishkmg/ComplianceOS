"use client";

import { useState } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

// ─── Mock data ────────────────────────────────────────────────────────────────

type BsEquity = { id: string; name: string; balance: number };
type BsLiability = { id: string; name: string; balance: number };
type BsAsset = { id: string; name: string; balance: number };

const bsDataByFy: Record<string, { equity: BsEquity[]; liabilities: BsLiability[]; assets: BsAsset[] }> = {
  '2026-27': {
    equity: [
      { id: "e1", name: "Share Capital",        balance: 1000000 },
      { id: "e2", name: "Reserves & Surplus",   balance: 1358000 },
      { id: "e3", name: "Net Profit (Current)", balance: 2684500 },
    ],
    liabilities: [
      { id: "l1", name: "Trade Payables",     balance: 180000 },
      { id: "l2", name: "GST Output",         balance: 125000 },
      { id: "l3", name: "TDS Payable",        balance: 12000 },
      { id: "l4", name: "Short-term Borrowings", balance: 250000 },
    ],
    assets: [
      { id: "a1", name: "Cash & Cash Equivalents", balance: 500000 },
      { id: "a2", name: "Bank Balances",          balance: 1250000 },
      { id: "a3", name: "Trade Receivables",      balance: 350000 },
      { id: "a4", name: "Inventory",              balance: 450000 },
      { id: "a5", name: "GST Input (Tax Asset)",  balance: 85000 },
      { id: "a6", name: "Property, Plant & Equipment", balance: 450000 },
      { id: "a7", name: "Furniture & Fixtures",   balance: 235000 },
      { id: "a8", name: "Intangible Assets",      balance: 120000 },
    ],
  },
  '2025-26': {
    equity: [
      { id: "e1", name: "Share Capital",        balance: 1000000 },
      { id: "e2", name: "Reserves & Surplus",   balance: 1120000 },
      { id: "e3", name: "Net Profit (Current)", balance: 2145000 },
    ],
    liabilities: [
      { id: "l1", name: "Trade Payables",     balance: 145000 },
      { id: "l2", name: "GST Output",         balance: 96000 },
      { id: "l3", name: "TDS Payable",        balance: 8500 },
      { id: "l4", name: "Short-term Borrowings", balance: 200000 },
    ],
    assets: [
      { id: "a1", name: "Cash & Cash Equivalents", balance: 420000 },
      { id: "a2", name: "Bank Balances",          balance: 980000 },
      { id: "a3", name: "Trade Receivables",      balance: 280000 },
      { id: "a4", name: "Inventory",              balance: 380000 },
      { id: "a5", name: "GST Input (Tax Asset)",  balance: 62000 },
      { id: "a6", name: "Property, Plant & Equipment", balance: 450000 },
      { id: "a7", name: "Furniture & Fixtures",   balance: 235000 },
      { id: "a8", name: "Intangible Assets",      balance: 120000 },
    ],
  },
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const [asOfDate, setAsOfDate] = useState("2027-03-31");
  const fyData = bsDataByFy[fiscalYear] ?? bsDataByFy['2026-27'];
  const { equity: equityAccounts, liabilities: liabilityAccounts, assets: assetAccounts } = fyData;

  const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
  const totalEqLiab = totalEquity + totalLiabilities;
  const balanced = Math.abs(totalEqLiab - totalAssets) < 0.01;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            Financial Report
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Balance Sheet</h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-surface border border-border px-3 py-1.5 text-[12px] font-ui outline-none rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
          </select>
          <input
            type="date"
            value={asOfDate}
            onChange={e => setAsOfDate(e.target.value)}
            className="bg-surface border border-border px-3 py-1.5 text-[12px] font-ui outline-none rounded-md"
          />
          <Button variant="outline" size="sm" className="gap-1.5">
            <Icon name="download" size={14} /> Export PDF
          </Button>
          <Link
            href="/audit-log?report=balance-sheet"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 no-underline"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <Card className="bg-surface border border-border shadow-sm rounded-md max-w-[1100px] mx-auto print:shadow-none print:border-black">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border print:border-black">
          <h2 className="font-display text-[24px] text-dark mb-1 print:text-black">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-[12px] text-mid uppercase tracking-widest mb-1">Balance Sheet</p>
          <p className="font-mono text-[11px] text-light italic">
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
                <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">Equity & Liabilities</h3>
              </div>

              <div className="mb-6">
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Shareholders&apos; Funds</div>
                {equityAccounts.map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark pl-4">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border mt-1 pt-2 text-ui-sm">
                  <span className="text-dark">Sub-total Equity</span>
                  <span className="font-mono text-[13px] tabular-nums font-bold">{formatIndianNumber(totalEquity)}</span>
                </div>
              </div>

              <div>
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Current Liabilities</div>
                {liabilityAccounts.map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark pl-4">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border mt-1 pt-2 text-ui-sm">
                  <span className="text-dark">Sub-total Liabilities</span>
                  <span className="font-mono text-[13px] tabular-nums font-bold">{formatIndianNumber(totalLiabilities)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-surface-muted py-3 rounded-md print:bg-transparent print:border-black print:rounded-none">
              <span className="uppercase tracking-widest text-xs print:text-black">Total Equity & Liabilities</span>
              <span className="font-mono text-[15px] tabular-nums print:text-black">₹ {formatIndianNumber(totalEqLiab)}</span>
            </div>
          </div>

          {/* Right: Assets */}
          <div className="space-y-8">
            <div>
              <div className="px-4 py-2 border-t-2 border-amber mb-4 print:border-black">
                <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">Assets</h3>
              </div>

              <div className="mb-6">
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Non-Current Assets</div>
                {assetAccounts.slice(5).map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark pl-4">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border mt-1 pt-2 text-ui-sm">
                  <span className="text-dark">Sub-total Non-Current Assets</span>
                  <span className="font-mono text-[13px] tabular-nums font-bold">
                    {formatIndianNumber(assetAccounts.slice(5).reduce((s, a) => s + a.balance, 0))}
                  </span>
                </div>
              </div>

              <div>
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Current Assets</div>
                {assetAccounts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-surface-muted/50 transition-colors text-ui-sm">
                    <span className="text-dark pl-4">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border mt-1 pt-2 text-ui-sm">
                  <span className="text-dark">Sub-total Current Assets</span>
                  <span className="font-mono text-[13px] tabular-nums font-bold">
                    {formatIndianNumber(assetAccounts.slice(0, 5).reduce((s, a) => s + a.balance, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-surface-muted py-3 rounded-md print:bg-transparent print:border-black print:rounded-none">
              <span className="uppercase tracking-widest text-xs print:text-black">Total Assets</span>
              <span className="font-mono text-[15px] tabular-nums print:text-black">₹ {formatIndianNumber(totalAssets)}</span>
            </div>

            {balanced ? (
              <div className="px-4 py-2 bg-success-bg text-success text-[10px] uppercase font-bold tracking-widest text-center rounded-md flex items-center justify-center gap-1.5 print:bg-transparent print:text-black print:border print:rounded-none">
                <Icon name="check_circle" size={14} /> Statement is Balanced
              </div>
            ) : (
              <div className="px-4 py-2 bg-danger-bg text-danger text-[10px] uppercase font-bold tracking-widest text-center rounded-md flex items-center justify-center gap-1.5 print:bg-transparent print:text-black print:border print:rounded-none">
                <Icon name="warning" size={14} /> Out of Balance by ₹ {formatIndianNumber(Math.abs(totalEqLiab - totalAssets))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-[10px] text-light">This is a system-generated financial statement. E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
