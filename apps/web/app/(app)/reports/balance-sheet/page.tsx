"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { Badge } from "@/components/ui";

export default function BalanceSheetPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");
  const [asOfDate, setAsOfDate] = useState("2027-03-31");

  const { data: balanceSheet, isLoading } = api.balances.balanceSheet.useQuery({
    fiscalYear,
    asOf: asOfDate,
  });

  const { data: accounts } = api.accounts.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading Balance Sheet...</p>
        </div>
      </div>
    );
  }

  const bsAccounts = accounts || [];
  
  const equityAccounts = bsAccounts.filter((a: any) => a.kind === "Equity" && a.isLeaf);
  const liabilityAccounts = bsAccounts.filter((a: any) => a.kind === "Liability" && a.isLeaf);
  const assetAccounts = bsAccounts.filter((a: any) => a.kind === "Asset" && a.isLeaf);

  const totalEquity = equityAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  const totalLiabilities = liabilityAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  const totalAssets = assetAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  
  const totalEquityAndLiabilities = totalEquity + totalLiabilities;
  const balances = Math.abs(totalEquityAndLiabilities - totalAssets) < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-sm text-gray-600">FY {fiscalYear} · As of {asOfDate}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equity & Liabilities */}
        <div className="rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Equity & Liabilities</h2>
          </div>
          <div className="divide-y">
            {equityAccounts.length > 0 && (
              <div className="p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-500">Equity</h3>
                {equityAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between py-2">
                    <span className="text-sm text-gray-900">{account.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {liabilityAccounts.length > 0 && (
              <div className="p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-500">Liabilities</h3>
                {liabilityAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between py-2">
                    <span className="text-sm text-gray-900">{account.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Equity & Liabilities</span>
              <span className="font-semibold text-gray-900">
                {formatIndianNumber(totalEquityAndLiabilities)}
              </span>
            </div>
          </div>
        </div>

        {/* Assets */}
        <div className="rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
          </div>
          <div className="divide-y">
            {assetAccounts.length > 0 && (
              <div className="p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-500">Assets</h3>
                {assetAccounts.map((account: any) => (
                  <div key={account.id} className="flex justify-between py-2">
                    <span className="text-sm text-gray-900">{account.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Assets</span>
              <span className="font-semibold text-gray-900">
                {formatIndianNumber(totalAssets)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-lg p-4 ${balances ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
        <div className="flex items-center gap-2">
          {balances ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">
            {balances ? "Balance Sheet balances" : `Balance Sheet out of balance by ${formatIndianNumber(Math.abs(totalEquityAndLiabilities - totalAssets))}`}
          </span>
        </div>
      </div>
    </div>
  );
}
