// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { formatIndianNumber } from "@/lib/format";

const mockData = {
  revenue: {
    items: [
      { code: "40100", name: "Sales Revenue", amount: 250000 },
      { code: "40200", name: "Other Income", amount: 25000 },
    ],
    total: 275000,
  },
  costOfGoodsSold: {
    items: [
      { code: "50100", name: "Purchase Expenses", amount: 120000 },
    ],
    total: 120000,
  },
  operatingExpenses: {
    items: [
      { code: "50210", name: "Salaries & Wages", amount: 80000 },
      { code: "50220", name: "Rent", amount: 24000 },
      { code: "50230", name: "Utilities", amount: 12000 },
    ],
    total: 116000,
  },
};

const grossProfit = mockData.revenue.total - mockData.costOfGoodsSold.total;
const totalExpenses = mockData.costOfGoodsSold.total + mockData.operatingExpenses.total;
const netResult = mockData.revenue.total - totalExpenses;

export default function ProfitLossPage() {
  const [profitLossView, setProfitLossView] = useState("proprietorship");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-lg font-normal text-dark">Profit & Loss (Proprietorship)</h1>
          <p className="font-ui text-ui-xs text-light mt-1">Statement of profit and loss for proprietorship</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={profitLossView}
            onChange={(e) => setProfitLossView(e.target.value)}
            className="filter-tab"
          >
            <option value="schedule_iii">Schedule III</option>
            <option value="proprietorship">Proprietorship</option>
          </select>
          <button className="filter-tab">Export PDF</button>
        </div>
      </div>

      <div className="report-container max-w-4xl mx-auto">
        <div className="report-header">
          <div className="report-company">Your Business</div>
          <div className="report-title">Profit & Loss Statement</div>
          <div className="report-period">Proprietorship | For the period FY 2026-27</div>
        </div>

        {/* Revenue */}
        <div className="report-section">
          <div className="report-section-header">Revenue</div>
          {mockData.revenue.items.map((item) => (
            <div key={item.code} className="report-line indent">
              <span>{item.name}</span>
              <span className="report-amount">{formatIndianNumber(item.amount)}</span>
            </div>
          ))}
          <div className="report-line total">
            <span>Total Revenue</span>
            <span className="report-amount">{formatIndianNumber(mockData.revenue.total)}</span>
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="report-section">
          <div className="report-section-header">Cost of Goods Sold</div>
          {mockData.costOfGoodsSold.items.map((item) => (
            <div key={item.code} className="report-line indent">
              <span>{item.name}</span>
              <span className="report-amount">{formatIndianNumber(item.amount)}</span>
            </div>
          ))}
          <div className="report-line total">
            <span>Total Cost of Goods Sold</span>
            <span className="report-amount">{formatIndianNumber(mockData.costOfGoodsSold.total)}</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="report-section">
          <div className="report-line">
            <span className="font-semibold">Gross Profit</span>
            <span className="report-amount">{formatIndianNumber(grossProfit)}</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="report-section">
          <div className="report-section-header">Operating Expenses</div>
          {mockData.operatingExpenses.items.map((item) => (
            <div key={item.code} className="report-line indent">
              <span>{item.name}</span>
              <span className="report-amount">{formatIndianNumber(item.amount)}</span>
            </div>
          ))}
          <div className="report-line total">
            <span>Total Operating Expenses</span>
            <span className="report-amount">{formatIndianNumber(mockData.operatingExpenses.total)}</span>
          </div>
        </div>

        {/* Net Result */}
        <div className="report-section">
          <div className={`report-line final ${netResult < 0 ? "loss" : ""}`}>
            <span className="uppercase tracking-wide">{netResult >= 0 ? "Net Profit" : "Net Loss"}</span>
            <span className="report-amount text-[16px]">{formatIndianNumber(Math.abs(netResult))}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-hairline flex justify-between items-end">
          <div className="text-[10px] text-light italic max-w-[300px]">
            The accompanying notes form an integral part of these financial statements.
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
