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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ledger</h1>
        <p className="text-gray-600">Account-wise transaction register</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Select Account</option>
          {leafAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </option>
          ))}
        </select>

        <select
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
          className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="2026-27">FY 2026-27</option>
          <option value="2025-26">FY 2025-26</option>
        </select>
      </div>

      {/* Ledger Table */}
      {selectedAccount && ledgerData && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Particulars</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entry #</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Credit</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {ledgerData.entries?.map((entry: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{entry.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{entry.narration}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{entry.entryNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                    {entry.debit ? formatIndianNumber(entry.debit) : "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                    {entry.credit ? formatIndianNumber(entry.credit) : "-"}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                    entry.balance >= 0 ? "text-gray-900" : "text-red-600"
                  }`}>
                    {formatIndianNumber(entry.balance)}
                  </td>
                </tr>
              ))}
              {(!ledgerData.entries || ledgerData.entries.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No transactions found for this account
                  </td>
                </tr>
              )}
            </tbody>
            {ledgerData.openingBalance || ledgerData.closingBalance && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">Closing Balance</td>
                  <td colSpan={3} className={`px-4 py-3 text-right text-sm font-bold ${
                    (ledgerData.closingBalance || 0) >= 0 ? "text-gray-900" : "text-red-600"
                  }`}>
                    {formatIndianNumber(ledgerData.closingBalance || 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {!selectedAccount && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Select an account to view its ledger</p>
        </div>
      )}
    </div>
  );
}
