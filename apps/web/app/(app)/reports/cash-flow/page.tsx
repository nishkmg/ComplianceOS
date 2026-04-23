"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

export default function CashFlowPage() {
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  const { data: cashFlow, isLoading } = api.balances.cashFlow.useQuery({
    fiscalYear,
  });

  const { data: accounts } = api.accounts.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading Cash Flow Statement...</p>
        </div>
      </div>
    );
  }

  const cashAccounts = accounts?.filter((a: any) => a.subType === "Cash" || a.subType === "Bank") || [];
  
  const totalCash = cashAccounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance || "0"), 0);
  const netCashFlow = totalCash;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Cash Flow Statement</h1>
          <p className="font-ui text-[12px] text-light mt-1">Analysis of Cash Movements (Indirect Method)</p>
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
          <button className="filter-tab">Export PDF</button>
        </div>
      </div>

      <div className="report-container max-w-4xl mx-auto">
        <div className="report-header">
          <h2 className="report-company">Mehta Textiles Private Limited</h2>
          <p className="report-title">Statement of Cash Flows</p>
          <p className="report-period">For the year ended 31 March 2027 • All amounts in ₹</p>
        </div>

        <div className="report-section">
          <h3 className="report-section-header">A. Cash from Operating Activities</h3>
          <div className="report-line indent">
            <span>Net Profit before Tax</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
          <div className="report-line indent">
            <span>Adjustments for Working Capital changes</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
          <div className="report-line total">
            <span>Net Cash from Operating Activities (A)</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
        </div>

        <div className="report-section">
          <h3 className="report-section-header">B. Cash from Investing Activities</h3>
          <div className="report-line indent">
            <span>Purchase of Fixed Assets</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
          <div className="report-line total">
            <span>Net Cash used in Investing Activities (B)</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
        </div>

        <div className="report-section">
          <h3 className="report-section-header">C. Cash from Financing Activities</h3>
          <div className="report-line indent">
            <span>Proceeds from Share Capital</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
          <div className="report-line total">
            <span>Net Cash from Financing Activities (C)</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
        </div>

        <div className="report-section pt-4 border-t border-hairline bg-surface-muted rounded-md p-4">
          <div className="report-line font-bold">
            <span>Net Increase/Decrease in Cash (A + B + C)</span>
            <span className="report-amount">{formatIndianNumber(netCashFlow)}</span>
          </div>
          <div className="report-line mt-2">
            <span>Opening Cash & Cash Equivalents</span>
            <span className="report-amount">{formatIndianNumber(0)}</span>
          </div>
          <div className="report-line mt-2 final">
            <span className="uppercase tracking-wider">Closing Cash & Cash Equivalents</span>
            <span className="report-amount text-[16px]">{formatIndianNumber(totalCash)}</span>
          </div>
        </div>

        {cashAccounts.length > 0 && (
          <div className="mt-8">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-light font-semibold mb-2">Breakdown of Cash & Equivalents</div>
            {cashAccounts.map((account: any) => (
              <div key={account.id} className="report-line indent">
                <span className="font-ui text-[13px]">{account.name}</span>
                <span className="report-amount">
                  {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-hairline flex justify-between items-end">
          <div className="text-[10px] text-light italic max-w-[300px]">
            The accompanying notes form an integral part of these financial statements.
            Prepared in accordance with AS-3.
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
