// @ts-nocheck
"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";

interface TrialBalanceEntry {
  code: string;
  name: string;
  debit: number;
  credit: number;
}

const mockData: TrialBalanceEntry[] = [
  { code: "10101", name: "Cash Account", debit: 500000, credit: 0 },
  { code: "10200", name: "Bank Account", debit: 1250000, credit: 0 },
  { code: "10300", name: "Trade Receivables", debit: 350000, credit: 0 },
  { code: "10400", name: "GST Input", debit: 85000, credit: 0 },
  { code: "10500", name: "Equipment", debit: 450000, credit: 0 },
  { code: "20101", name: "Trade Payables", debit: 0, credit: 180000 },
  { code: "20200", name: "GST Output", debit: 0, credit: 125000 },
  { code: "30100", name: "Capital Account", debit: 0, credit: 1665000 },
  { code: "40100", name: "Sales Revenue", debit: 0, credit: 2800000 },
  { code: "50100", name: "Purchase Expenses", debit: 1200000, credit: 0 },
  { code: "50200", name: "Operating Expenses", debit: 450000, credit: 0 },
  { code: "50210", name: "Salaries & Wages", debit: 320000, credit: 0 },
  { code: "50220", name: "Rent", debit: 120000, credit: 0 },
  { code: "50230", name: "Utilities", debit: 45000, credit: 0 },
];

export default function TrialBalancePage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");
  const totalDebit = mockData.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = mockData.reduce((sum, e) => sum + e.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-lg font-normal text-dark">Trial Balance</h1>
          <p className="font-ui text-ui-xs text-light mt-1">Verification of Debit and Credit Equality</p>
        </div>
        <div className="flex gap-2">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="filter-tab"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <span className={`px-4 py-2 font-ui text-ui-sm rounded-[6px] flex items-center gap-2 ${isBalanced ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
            {isBalanced ? "✓ Balanced" : "⚠ Out of Balance"}
          </span>
          <button className="filter-tab">Export PDF</button>
        </div>
      </div>

      <div className="report-container">
        <div className="report-header">
          <div className="report-company">Mehta Textiles Private Limited</div>
          <div className="report-title">Trial Balance</div>
          <div className="report-period">As of 31 March 2027 • All amounts in ₹</div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 border-t-2 border-success">
            <p className="font-ui text-ui-xs uppercase tracking-wide text-light mb-1">Total Debit</p>
            <p className="font-mono text-[20px] text-right text-success">{formatINR(totalDebit)}</p>
          </div>
          <div className="card p-4 border-t-2 border-danger">
            <p className="font-ui text-ui-xs uppercase tracking-wide text-light mb-1">Total Credit</p>
            <p className="font-mono text-[20px] text-right text-danger">{formatINR(totalCredit)}</p>
          </div>
          <div className="card p-4 border-t-2 border-amber">
            <p className="font-ui text-ui-xs uppercase tracking-wide text-light mb-1">Difference</p>
            <p className={`font-mono text-[20px] text-right ${isBalanced ? "text-success" : "text-danger"}`}>
              {formatINR(Math.abs(totalDebit - totalCredit))}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-ui-xs uppercase tracking-wide text-left w-32">Account Code</th>
                <th className="font-ui text-ui-xs uppercase tracking-wide text-left">Account Name</th>
                <th className="font-ui text-ui-xs uppercase tracking-wide text-right w-40">Debit (₹)</th>
                <th className="font-ui text-ui-xs uppercase tracking-wide text-right w-40">Credit (₹)</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((entry) => (
                <tr key={entry.code} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-ui-sm text-amber">{entry.code}</td>
                  <td className="font-ui text-ui-sm text-dark">{entry.name}</td>
                  <td className="report-amount text-success">
                    {entry.debit > 0 ? formatINR(entry.debit) : "—"}
                  </td>
                  <td className="report-amount text-danger">
                    {entry.credit > 0 ? formatINR(entry.credit) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-dark font-semibold">
                <td colSpan={2} className="py-4 font-ui text-ui-sm text-dark">
                  Total Summary
                </td>
                <td className="font-mono text-[14px] text-right text-success py-4">
                  {formatINR(totalDebit)}
                </td>
                <td className="font-mono text-[14px] text-right text-danger py-4">
                  {formatINR(totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        <div className="text-ui-xs text-light border-l-2 border-amber pl-4 mt-6">
          <p className="font-ui">
            <strong>Accountant's Note:</strong> This trial balance shows all ledger account balances at the current date.
            Debit and credit totals must match for the books to be in balance. Any difference should be investigated and rectified before financial statement preparation.
          </p>
        </div>
      </div>
    </div>
  );
}
