"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

// ─── Mock data ────────────────────────────────────────────────────────────────

const equityAccounts = [
  { id: "e1", name: "Capital Account",    balance: 1000000 },
  { id: "e2", name: "Retained Earnings",  balance: 1358000 },
  { id: "e3", name: "Net Profit (Current)", balance: 2684500 },
];

const liabilityAccounts = [
  { id: "l1", name: "Trade Payables",     balance: 180000 },
  { id: "l2", name: "GST Output",         balance: 125000 },
  { id: "l3", name: "TDS Payable",        balance: 12000 },
];

const assetAccounts = [
  { id: "a1", name: "Cash Account",       balance: 500000 },
  { id: "a2", name: "Bank Account",       balance: 1250000 },
  { id: "a3", name: "Trade Receivables",  balance: 350000 },
  { id: "a4", name: "Inventory",          balance: 450000 },
  { id: "a5", name: "GST Input",          balance: 85000 },
  { id: "a6", name: "Equipment",          balance: 450000 },
  { id: "a7", name: "Furniture & Fixtures", balance: 235000 },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BalanceSheetPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");
  const [asOfDate, setAsOfDate] = useState("2027-03-31");

  const totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
  const totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
  const totalEqLiab = totalEquity + totalLiabilities;
  const balanced = Math.abs(totalEqLiab - totalAssets) < 0.01;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Financial Report
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Balance Sheet</h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-white border border-border-subtle px-3 py-1.5 text-[12px] font-ui outline-none rounded-sm"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <input
            type="date"
            value={asOfDate}
            onChange={e => setAsOfDate(e.target.value)}
            className="bg-white border border-border-subtle px-3 py-1.5 text-[12px] font-ui outline-none rounded-sm"
          />
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export PDF
          </button>
          <Link
            href="/audit-log?report=balance-sheet"
            className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <div className="bg-white border border-border-subtle shadow-sm rounded-sm max-w-[1100px]">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border-subtle">
          <h2 className="font-display text-[22px] text-dark mb-1">Mehta Textiles Private Limited</h2>
          <p className="font-ui-sm text-[12px] text-mid uppercase tracking-widest mb-1">Balance Sheet</p>
          <p className="font-mono text-[11px] text-light italic">
            As of {new Date(asOfDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}All amounts in ₹
          </p>
        </div>

        {/* Two-column layout */}
        <div className="px-8 py-6 grid gap-12 lg:grid-cols-2">
          {/* Left: Equity & Liabilities */}
          <div className="space-y-6">
            <div>
              <div className="bg-section-muted px-4 py-2 border-t-2 border-amber mb-4">
                <h3 className="font-display text-display-sm text-dark uppercase tracking-wider">Equity & Liabilities</h3>
              </div>

              <div className="mb-6">
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Equity</div>
                {equityAccounts.map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-stone-50/50 transition-colors text-ui-sm">
                    <span className="text-dark">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border-subtle mt-1 pt-2 text-ui-sm">
                  <span>Sub-total Equity</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(totalEquity)}</span>
                </div>
              </div>

              <div>
                <div className="px-4 py-1 text-[10px] uppercase tracking-widest text-light font-bold mb-2">Liabilities</div>
                {liabilityAccounts.map(a => (
                  <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-stone-50/50 transition-colors text-ui-sm">
                    <span className="text-dark">{a.name}</span>
                    <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-2 font-medium border-t border-border-subtle mt-1 pt-2 text-ui-sm">
                  <span>Sub-total Liabilities</span>
                  <span className="font-mono text-[13px]">{formatIndianNumber(totalLiabilities)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-section-muted py-3 rounded-sm">
              <span className="uppercase tracking-widest text-xs">Total Equity & Liabilities</span>
              <span className="font-mono text-[15px] tabular-nums">₹ {formatIndianNumber(totalEqLiab)}</span>
            </div>
          </div>

          {/* Right: Assets */}
          <div className="space-y-6">
            <div>
              <div className="bg-section-muted px-4 py-2 border-t-2 border-amber mb-4">
                <h3 className="font-display text-display-sm text-dark uppercase tracking-wider">Assets</h3>
              </div>
              {assetAccounts.map(a => (
                <div key={a.id} className="flex justify-between items-center px-4 py-2 hover:bg-stone-50/50 transition-colors text-ui-sm">
                  <span className="text-dark">{a.name}</span>
                  <span className="font-mono text-[13px] tabular-nums">{formatIndianNumber(a.balance)}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dark pt-4 px-4 flex justify-between items-center font-bold bg-section-muted py-3 rounded-sm">
              <span className="uppercase tracking-widest text-xs">Total Assets</span>
              <span className="font-mono text-[15px] tabular-nums">₹ {formatIndianNumber(totalAssets)}</span>
            </div>

            {balanced ? (
              <div className="px-4 py-2 bg-success-bg text-success text-[10px] uppercase font-bold tracking-widest text-center rounded-sm flex items-center justify-center gap-1.5">
                <Icon name="check_circle" size={14} /> Statement is Balanced
              </div>
            ) : (
              <div className="px-4 py-2 bg-danger-bg text-danger text-[10px] uppercase font-bold tracking-widest text-center rounded-sm flex items-center justify-center gap-1.5">
                <Icon name="warning" size={14} /> Out of Balance by ₹ {formatIndianNumber(Math.abs(totalEqLiab - totalAssets))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6 pt-4 border-t border-border-subtle mx-8">
          <p className="font-ui-xs text-[10px] text-light">This is a system-generated financial statement. E&OE.</p>
        </div>
      </div>
    </div>
  );
}
