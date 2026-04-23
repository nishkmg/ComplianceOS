// @ts-nocheck
"use client";

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
  { code: "30100", name: "Capital Account", debit: 0, credit: 1500000 },
  { code: "40100", name: "Sales Revenue", debit: 0, credit: 2800000 },
  { code: "50100", name: "Purchase Expenses", debit: 1200000, credit: 0 },
  { code: "50200", name: "Operating Expenses", debit: 450000, credit: 0 },
  { code: "50210", name: "Salaries & Wages", debit: 320000, credit: 0 },
  { code: "50220", name: "Rent", debit: 120000, credit: 0 },
  { code: "50230", name: "Utilities", debit: 45000, credit: 0 },
];

export default function TrialBalancePage() {
  const totalDebit = mockData.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = mockData.reduce((sum, e) => sum + e.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-[#1A1A1A]">Trial Balance</h1>
          <p className="text-[12px] text-[#888888] mt-1">FY 2026-27 • As of today</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-4 py-2 text-[13px] rounded-[6px] ${isBalanced ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
            {isBalanced ? "✓ Balanced" : "✗ Out of Balance"}
          </span>
          <button className="btn btn-secondary">Export Excel</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-[12px] text-[#888888] mb-1">Total Debit</p>
          <p className="font-mono text-[20px] text-[#1A7A3D]">{formatINR(totalDebit)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-[#888888] mb-1">Total Credit</p>
          <p className="font-mono text-[20px] text-[#B91C1C]">{formatINR(totalCredit)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[12px] text-[#888888] mb-1">Difference</p>
          <p className={`font-mono text-[20px] ${isBalanced ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {formatINR(Math.abs(totalDebit - totalCredit))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="text-[10px] uppercase tracking-wide text-left w-[100px]">Code</th>
              <th className="text-[10px] uppercase tracking-wide text-left">Account Name</th>
              <th className="text-[10px] uppercase tracking-wide text-right w-[150px]">Debit (₹)</th>
              <th className="text-[10px] uppercase tracking-wide text-right w-[150px]">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((entry) => (
              <tr key={entry.code}>
                <td className="font-mono text-[13px] text-[#C8860A]">{entry.code}</td>
                <td className="text-[13px] text-[#1A1A1A]">{entry.name}</td>
                <td className="font-mono text-[13px] text-right text-[#1A7A3D]">
                  {entry.debit > 0 ? formatINR(entry.debit) : "—"}
                </td>
                <td className="font-mono text-[13px] text-right text-[#B91C1C]">
                  {entry.credit > 0 ? formatINR(entry.credit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1A1A1A]">
              <td colSpan={2} className="py-4 text-[13px] font-medium text-[#1A1A1A]">
                Total
              </td>
              <td className="font-mono text-[14px] text-right text-[#1A7A3D] py-4">
                {formatINR(totalDebit)}
              </td>
              <td className="font-mono text-[14px] text-right text-[#B91C1C] py-4">
                {formatINR(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      <div className="text-[12px] text-[#888888]">
        <p>
          <strong>Note:</strong> This trial balance shows all ledger account balances at the current date. 
          Debit and credit totals must match for the books to be in balance.
        </p>
      </div>
    </div>
  );
}
