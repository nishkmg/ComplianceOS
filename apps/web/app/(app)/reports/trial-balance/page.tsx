"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Mock data ────────────────────────────────────────────────────────────────

const groups: TbGroup[] = [
  {
    name: "Assets",
    items: [
      { code: "10101", name: "Cash Account",        debit: 500000,  credit: 0 },
      { code: "10200", name: "Bank Account",         debit: 1250000, credit: 0 },
      { code: "10300", name: "Trade Receivables",    debit: 350000,  credit: 0 },
      { code: "10400", name: "GST Input",            debit: 85000,   credit: 0 },
      { code: "10500", name: "Equipment",            debit: 450000,  credit: 0 },
    ],
  },
  {
    name: "Liabilities",
    items: [
      { code: "20101", name: "Trade Payables",       debit: 0,       credit: 180000 },
      { code: "20200", name: "GST Output",           debit: 0,       credit: 125000 },
    ],
  },
  {
    name: "Equity",
    items: [
      { code: "30100", name: "Capital Account",      debit: 0,       credit: 1665000 },
    ],
  },
  {
    name: "Income",
    items: [
      { code: "40100", name: "Sales Revenue",        debit: 0,       credit: 2800000 },
    ],
  },
  {
    name: "Expenses",
    items: [
      { code: "50100", name: "Purchase Expenses",    debit: 1200000, credit: 0 },
      { code: "50200", name: "Operating Expenses",   debit: 450000,  credit: 0 },
      { code: "50210", name: "Salaries & Wages",     debit: 320000,  credit: 0 },
      { code: "50220", name: "Rent",                 debit: 120000,  credit: 0 },
      { code: "50230", name: "Utilities",            debit: 45000,   credit: 0 },
    ],
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TrialBalancePage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");
  const [showZero, setShowZero] = useState(false);

  const allItems = groups.flatMap(g => g.items);
  const totalDebit = allItems.reduce((s, i) => s + i.debit, 0);
  const totalCredit = allItems.reduce((s, i) => s + i.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-amber-text font-ui-xs text-[10px] uppercase tracking-[0.2em] mb-1 block">
            Report
          </span>
          <h1 className="font-display-lg text-display-lg text-dark leading-tight">Trial Balance</h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-white border border-border-subtle px-3 py-1.5 text-[12px] font-ui outline-none rounded-sm"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export PDF
          </button>
          <Link
            href="/audit-log?report=trial-balance"
            className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-ui-xs uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
          >
            Audit Trail
          </Link>
        </div>
      </div>

      {/* Report card */}
      <div className="bg-white border border-border-subtle shadow-sm rounded-sm max-w-[1000px]">
        {/* Report header */}
        <div className="text-center pt-8 pb-6 px-8 border-b border-border-subtle">
          <h2 className="font-display text-[22px] text-dark">ComplianceOS</h2>
          <p className="font-ui-sm text-[12px] text-mid mt-1 uppercase tracking-wider">Trial Balance</p>
          <p className="font-mono text-[11px] text-light mt-0.5">As at March 31, 2027 · FY {fiscalYear}</p>
        </div>

        {/* Balance check */}
        <div className={`mx-8 mt-6 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest rounded-sm flex items-center gap-2 ${
          isBalanced ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
        }`}>
          <Icon name={isBalanced ? "check_circle" : "warning"} size={16} />
          {isBalanced ? "Trial Balance is balanced" : "Trial Balance is NOT balanced"}
        </div>

        {/* Zero-balance toggle */}
        <div className="flex justify-end px-8 mt-4">
          <label className="flex items-center gap-2 font-ui-xs text-[10px] text-mid cursor-pointer">
            <input
              type="checkbox"
              checked={showZero}
              onChange={e => setShowZero(e.target.checked)}
              className="accent-primary-container"
            />
            Show zero-balance accounts
          </label>
        </div>

        {/* Groups */}
        <div className="px-8 py-6 space-y-6">
          {groups.map(group => {
            const filtered = showZero ? group.items : group.items.filter(i => i.debit > 0 || i.credit > 0);
            if (filtered.length === 0) return null;
            const groupDr = filtered.reduce((s, i) => s + i.debit, 0);
            const groupCr = filtered.reduce((s, i) => s + i.credit, 0);
            return (
              <div key={group.name}>
                <div className="bg-section-muted px-4 py-2 border-t-2 border-amber flex items-center justify-between">
                  <h3 className="font-display text-display-sm text-dark">{group.name}</h3>
                  <span className="font-mono text-[11px] text-mid">
                    Dr {formatIndianNumber(groupDr)} / Cr {formatIndianNumber(groupCr)}
                  </span>
                </div>
                {filtered.map(item => (
                  <div
                    key={item.code}
                    className="flex items-center px-4 py-2 hover:bg-stone-50/50 transition-colors border-b border-stone-50"
                  >
                    <div className="w-20 font-mono text-[11px] text-light">{item.code}</div>
                    <div className="flex-1 font-ui-sm text-[13px] text-dark">{item.name}</div>
                    <div className="w-40 text-right font-mono text-[13px] tabular-nums">
                      {item.debit > 0 ? `₹ ${formatIndianNumber(item.debit)}` : ""}
                    </div>
                    <div className="w-40 text-right font-mono text-[13px] tabular-nums">
                      {item.credit > 0 ? `₹ ${formatIndianNumber(item.credit)}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Grand total */}
        <div className="border-t-2 border-dark mx-8 py-4 flex items-center font-bold">
          <div className="flex-1 font-ui-sm text-[12px] uppercase tracking-widest">Grand Total</div>
          <div className="w-40 text-right font-mono text-[14px] tabular-nums">₹ {formatIndianNumber(totalDebit)}</div>
          <div className="w-40 text-right font-mono text-[14px] tabular-nums">₹ {formatIndianNumber(totalCredit)}</div>
        </div>

        {isBalanced && (
          <div className="mx-8 mb-6 px-4 py-2 bg-success-bg text-success font-medium text-[11px] rounded-sm">
            ✓ Total Debits match Total Credits — Trial Balance is in order
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-6 pt-2 border-t border-border-subtle mx-8">
          <p className="font-ui-xs text-[10px] text-light">This is a system-generated statement. E&OE.</p>
        </div>
      </div>
    </div>
  );
}
