"use client";

import { useState } from 'react';
import Link from "next/link";
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

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

const tbDataByFy: Record<string, TbGroup[]> = {
  '2026-27': [
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
  ],
  '2025-26': [
    {
      name: "Assets",
      items: [
        { code: "10101", name: "Cash Account",        debit: 420000,  credit: 0 },
        { code: "10200", name: "Bank Account",         debit: 980000,  credit: 0 },
        { code: "10300", name: "Trade Receivables",    debit: 280000,  credit: 0 },
        { code: "10400", name: "GST Input",            debit: 62000,   credit: 0 },
        { code: "10500", name: "Equipment",            debit: 450000,  credit: 0 },
      ],
    },
    {
      name: "Liabilities",
      items: [
        { code: "20101", name: "Trade Payables",       debit: 0,       credit: 145000 },
        { code: "20200", name: "GST Output",           debit: 0,       credit: 96000 },
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
        { code: "40100", name: "Sales Revenue",        debit: 0,       credit: 2150000 },
      ],
    },
    {
      name: "Expenses",
      items: [
        { code: "50100", name: "Purchase Expenses",    debit: 960000,  credit: 0 },
        { code: "50200", name: "Operating Expenses",   debit: 380000,  credit: 0 },
        { code: "50210", name: "Salaries & Wages",     debit: 280000,  credit: 0 },
        { code: "50220", name: "Rent",                 debit: 120000,  credit: 0 },
        { code: "50230", name: "Utilities",            debit: 38000,   credit: 0 },
      ],
    },
  ],
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function TrialBalancePage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const [showZero, setShowZero] = useState(false);

  const groups = tbDataByFy[fiscalYear] ?? tbDataByFy['2026-27'];
  const allItems = groups.flatMap(g => g.items);
  const totalDebit = allItems.reduce((s, i) => s + i.debit, 0);
  const totalCredit = allItems.reduce((s, i) => s + i.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">
            Report
          </p>
          <h1 className="font-display text-2xl font-semibold text-dark">Trial Balance</h1>
        </div>
        <div className="flex gap-3 items-center">
          <select
            className="bg-surface border border-border px-3 py-1.5 text-[12px] font-ui outline-none rounded-md"
            value={fiscalYear}
            onChange={e => setFiscalYear(e.target.value)}
          >
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Icon name="download" size={14} /> Export PDF
          </Button>
          <Link
            href="/audit-log?report=trial-balance"
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
          <h2 className="font-display text-[24px] text-dark print:text-black">Mehta Textiles Private Limited</h2>
          <p className="font-ui text-[12px] text-mid mt-1 uppercase tracking-widest">Trial Balance</p>
          <p className="font-mono text-[11px] text-light mt-0.5">As at March 31, 2027 · FY {fiscalYear}</p>
        </div>

        {/* Balance check */}
        <div className={`mx-8 mt-6 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest rounded-md flex items-center gap-2 ${
          isBalanced ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
        } print:border print:rounded-none`}>
          <Icon name={isBalanced ? "check_circle" : "warning"} size={16} />
          {isBalanced ? "Trial Balance is balanced" : "Trial Balance is NOT balanced"}
        </div>

        {/* Zero-balance toggle */}
        <div className="flex justify-end px-8 mt-4 print:hidden">
          <label className="flex items-center gap-2 font-ui text-[10px] text-mid cursor-pointer">
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
        <div className="grid grid-cols-12 gap-4 px-8 pt-6 pb-2 border-b border-dark font-ui text-[10px] text-light uppercase tracking-widest print:border-black">
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
                  <h3 className="font-display text-display-sm text-dark uppercase tracking-wider print:text-black">{group.name}</h3>
                  <span className="font-mono text-[11px] text-mid">
                    Dr {formatIndianNumber(groupDr)} / Cr {formatIndianNumber(groupCr)}
                  </span>
                </div>
                {filtered.map(item => (
                  <div
                    key={item.code}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-2.5 hover:bg-surface-muted/50 transition-colors border-b border-stone-50 print:border-stone-200"
                  >
                    <div className="col-span-2 font-mono text-[11px] text-light tabular-nums">{item.code}</div>
                    <div className="col-span-5 font-ui text-[13px] text-dark">{item.name}</div>
                    <div className="col-span-2 text-right font-mono text-[13px] tabular-nums">
                      {item.debit > 0 ? `₹ ${formatIndianNumber(item.debit)}` : ""}
                    </div>
                    <div className="col-span-2 text-right font-mono text-[13px] tabular-nums">
                      {item.credit > 0 ? `₹ ${formatIndianNumber(item.credit)}` : ""}
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
          <div className="col-span-7 font-ui text-[12px] uppercase tracking-widest text-dark print:text-black">Grand Total</div>
          <div className="col-span-2 text-right font-mono text-[14px] tabular-nums text-dark print:text-black">₹ {formatIndianNumber(totalDebit)}</div>
          <div className="col-span-2 text-right font-mono text-[14px] tabular-nums text-dark print:text-black">₹ {formatIndianNumber(totalCredit)}</div>
          <div className="col-span-1" />
        </div>

        {isBalanced && (
          <div className="mx-8 mb-6 px-4 py-2 bg-success-bg text-success font-medium text-[11px] rounded-md print:border print:rounded-none print:text-black print:bg-transparent">
            ✓ Total Debits match Total Credits — Trial Balance is in order
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-6 pt-2 border-t border-border mx-8 print:border-black">
          <p className="font-ui text-[10px] text-light">This is a system-generated statement. E&OE.</p>
        </div>
      </Card>
    </div>
  );
}
