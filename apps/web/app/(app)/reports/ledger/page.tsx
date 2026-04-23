"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

export default function LedgerReportPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: ledgerData } = api.balances.ledger.useQuery(
    { accountId: selectedAccount, fiscalYear },
    { enabled: !!selectedAccount }
  );

  const leafAccounts = accounts?.filter((a) => a.isLeaf) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Account Ledger</h1>
          <p className="font-ui text-[12px] text-light mt-1">Transaction History for Individual Accounts</p>
        </div>
        <div className="flex gap-2">
          <button className="filter-tab">Export PDF</button>
          <button className="filter-tab">Export Excel</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-[10px] text-light uppercase tracking-wide mb-1 font-ui font-medium">Select Account</label>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full filter-tab"
          >
            <option value="">Select an account...</option>
            {leafAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="block text-[10px] text-light uppercase tracking-wide mb-1 font-ui font-medium">Fiscal Year</label>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="w-full filter-tab"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {selectedAccount && ledgerData && (
        <div className="card overflow-hidden">
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left w-24">Date</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Particulars</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left w-32">Entry #</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right w-32">Debit (₹)</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right w-32">Credit (₹)</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right w-32">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.entries?.map((entry: any, idx: number) => (
                <tr key={idx} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-[13px] text-light">{entry.date}</td>
                  <td className="font-ui text-[13px] text-dark">{entry.narration}</td>
                  <td className="font-mono text-[13px] text-amber">{entry.entryNumber}</td>
                  <td className="font-mono text-[13px] text-right text-success">
                    {entry.debit ? formatIndianNumber(entry.debit) : "—"}
                  </td>
                  <td className="font-mono text-[13px] text-right text-danger">
                    {entry.credit ? formatIndianNumber(entry.credit) : "—"}
                  </td>
                  <td className={`font-mono text-[13px] text-right ${entry.balance >= 0 ? "text-dark" : "text-danger"}`}>
                    {formatIndianNumber(entry.balance)}
                  </td>
                </tr>
              ))}
              {(!ledgerData.entries || ledgerData.entries.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-12 text-center font-ui text-[13px] text-light">
                    No transactions found for this account in FY {fiscalYear}
                  </td>
                </tr>
              )}
            </tbody>
            {ledgerData.closingBalance !== undefined && (
              <tfoot>
                <tr className="bg-surface-muted font-semibold">
                  <td colSpan={3} className="py-4 px-4 font-ui text-[13px] text-dark">Closing Ledger Balance</td>
                  <td colSpan={3} className={`py-4 px-4 text-right font-mono text-[15px] ${
                    (ledgerData.closingBalance || 0) >= 0 ? "text-success" : "text-danger"
                  }`}>
                    {formatIndianNumber(ledgerData.closingBalance || 0)} {(ledgerData.closingBalance || 0) >= 0 ? "Dr" : "Cr"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {!selectedAccount && (
        <div className="card p-24 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
            <span className="text-2xl text-light">📖</span>
          </div>
          <h2 className="font-display text-[20px] text-dark mb-2">Select an Account</h2>
          <p className="font-ui text-[13px] text-light max-w-xs">
            Choose a leaf account from your Chart of Accounts to view its detailed transaction history.
          </p>
        </div>
      )}
    </div>
  );
}
