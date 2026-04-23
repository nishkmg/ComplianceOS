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
          <h1 className="font-display text-[26px] font-normal text-dark">Balance Sheet</h1>
          <p className="font-ui text-[12px] text-light mt-1">Statement of Financial Position</p>
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
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="filter-tab"
          />
          <button className="filter-tab">Export PDF</button>
        </div>
      </div>

      <div className="report-container max-w-6xl mx-auto">
        <div className="report-header">
          <h2 className="report-company">Mehta Textiles Private Limited</h2>
          <p className="report-title">Balance Sheet</p>
          <p className="report-period">As of {new Date(asOfDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} • All amounts in ₹</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Equity & Liabilities */}
          <div className="report-section">
            <h3 className="report-section-header">Equity & Liabilities</h3>
            
            <div className="mb-6">
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-light font-semibold mb-2">Equity</div>
              {equityAccounts.map((account: any) => (
                <div key={account.id} className="report-line indent">
                  <span>{account.name}</span>
                  <span className="report-amount">
                    {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                  </span>
                </div>
              ))}
              <div className="report-line indent font-medium border-t border-hairline mt-1 pt-2">
                <span>Sub-total Equity</span>
                <span className="report-amount">{formatIndianNumber(totalEquity)}</span>
              </div>
            </div>

            <div>
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-light font-semibold mb-2">Liabilities</div>
              {liabilityAccounts.map((account: any) => (
                <div key={account.id} className="report-line indent">
                  <span>{account.name}</span>
                  <span className="report-amount">
                    {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                  </span>
                </div>
              ))}
              <div className="report-line indent font-medium border-t border-hairline mt-1 pt-2">
                <span>Sub-total Liabilities</span>
                <span className="report-amount">{formatIndianNumber(totalLiabilities)}</span>
              </div>
            </div>

            <div className="report-line total mt-6">
              <span className="uppercase tracking-wide">Total Equity & Liabilities</span>
              <span className="report-amount text-[15px]">
                {formatIndianNumber(totalEquityAndLiabilities)}
              </span>
            </div>
          </div>

          {/* Assets */}
          <div className="report-section">
            <h3 className="report-section-header">Assets</h3>
            
            <div className="mb-6">
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-light font-semibold mb-2">Current & Non-Current Assets</div>
              {assetAccounts.map((account: any) => (
                <div key={account.id} className="report-line indent">
                  <span>{account.name}</span>
                  <span className="report-amount">
                    {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                  </span>
                </div>
              ))}
            </div>

            <div className="report-line total mt-auto">
              <span className="uppercase tracking-wide">Total Assets</span>
              <span className="report-amount text-[15px]">
                {formatIndianNumber(totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Balance Status Footer */}
        <div className={`mt-12 p-4 rounded-md flex items-center justify-center gap-2 font-ui text-[13px] ${balances ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
          {balances ? (
            <span className="font-semibold tracking-wide">✓ Balance Sheet in equilibrium</span>
          ) : (
            <span className="font-semibold tracking-wide">⚠ Balance Sheet out of balance by {formatIndianNumber(Math.abs(totalEquityAndLiabilities - totalAssets))}</span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-hairline flex justify-between items-end">
          <div className="text-[10px] text-light italic max-w-[300px]">
            The accompanying notes form an integral part of these financial statements.
            Figures in brackets represent negative values.
          </div>
          <div className="text-right">
            <div className="w-32 h-px bg-dark mb-2 ml-auto" />
            <div className="text-[11px] font-semibold text-dark uppercase tracking-wide">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}
