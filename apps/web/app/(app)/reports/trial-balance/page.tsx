// @ts-nocheck
"use client";

import { useState } from "react";
import { formatIndianNumber } from "@/lib/format";

interface TrialBalanceEntry {
  code: string;
  name: string;
  debit: number;
  credit: number;
}

const groups = [
  {
    name: "Assets",
    items: [
      { code: "10101", name: "Cash Account", debit: 500000, credit: 0 },
      { code: "10200", name: "Bank Account", debit: 1250000, credit: 0 },
      { code: "10300", name: "Trade Receivables", debit: 350000, credit: 0 },
      { code: "10400", name: "GST Input", debit: 85000, credit: 0 },
      { code: "10500", name: "Equipment", debit: 450000, credit: 0 },
    ],
  },
  {
    name: "Liabilities",
    items: [
      { code: "20101", name: "Trade Payables", debit: 0, credit: 180000 },
      { code: "20200", name: "GST Output", debit: 0, credit: 125000 },
    ],
  },
  {
    name: "Equity",
    items: [
      { code: "30100", name: "Capital Account", debit: 0, credit: 1665000 },
    ],
  },
  {
    name: "Income",
    items: [
      { code: "40100", name: "Sales Revenue", debit: 0, credit: 2800000 },
    ],
  },
  {
    name: "Expenses",
    items: [
      { code: "50100", name: "Purchase Expenses", debit: 1200000, credit: 0 },
      { code: "50200", name: "Operating Expenses", debit: 450000, credit: 0 },
      { code: "50210", name: "Salaries & Wages", debit: 320000, credit: 0 },
      { code: "50220", name: "Rent", debit: 120000, credit: 0 },
      { code: "50230", name: "Utilities", debit: 45000, credit: 0 },
    ],
  },
];

export default function TrialBalancePage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  const allItems = groups.flatMap(g => g.items);
  const totalDebit = allItems.reduce((s, i) => s + i.debit, 0);
  const totalCredit = allItems.reduce((s, i) => s + i.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="bg-white border-[0.5px] border-border-subtle rounded-lg p-8 shadow-sm max-w-[1000px] mx-auto text-left">
      {/* Report Header */}
      <div className="text-center mb-8 pb-6 border-b-[0.5px] border-border-subtle">
        <h1 className="font-display text-[26px] font-normal text-dark">ComplianceOS</h1>
        <h2 className="font-ui text-ui-sm text-light mt-2 uppercase tracking-wider">Trial Balance</h2>
        <p className="font-ui text-ui-xs text-mid mt-1">As at March 31, 2027 · FY {fiscalYear}</p>
      </div>

      {/* FY Selector */}
      <div className="flex justify-end mb-6">
        <select className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
          <option>2026-27</option>
          <option>2025-26</option>
        </select>
      </div>

      {/* Balance Alert */}
      <div className={`p-4 mb-6 ${isBalanced ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'} text-ui-sm font-medium`}>
        {isBalanced ? '✓ Trial Balance is balanced' : '✗ Trial Balance is NOT balanced'}
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <div key={group.name} className="mb-6">
          <div className="bg-surface-muted px-4 py-2 border-t-2 border-amber">
            <h3 className="font-display text-display-sm font-normal text-dark">{group.name}</h3>
          </div>
          {group.items.map((item) => (
            <div key={item.code} className="flex items-center px-4 py-2 hover:bg-surface-muted text-ui-sm">
              <div className="w-20 font-mono text-[11px] text-light">{item.code}</div>
              <div className="flex-1 font-ui text-[13px] text-dark">{item.name}</div>
              <div className="w-36 text-right font-mono text-[13px]">{item.debit > 0 ? `₹ ${formatIndianNumber(item.debit)}` : ''}</div>
              <div className="w-36 text-right font-mono text-[13px]">{item.credit > 0 ? `₹ ${formatIndianNumber(item.credit)}` : ''}</div>
            </div>
          ))}
        </div>
      ))}

      {/* Totals */}
      <div className="border-t-2 border-dark mt-6 pt-4">
        <div className="flex items-center px-4 py-2 font-bold">
          <div className="flex-1 font-ui text-ui-sm">Totals</div>
          <div className="w-36 text-right font-mono text-[13px]">₹ {formatIndianNumber(totalDebit)}</div>
          <div className="w-36 text-right font-mono text-[13px]">₹ {formatIndianNumber(totalCredit)}</div>
        </div>
        {isBalanced && (
          <div className="px-4 py-2 mt-2 bg-success-bg text-success font-medium text-ui-xs rounded">
            ✓ Total Debits match Total Credits — Trial Balance is in order
          </div>
        )}
      </div>
    </div>
  );
}
