// @ts-nocheck
"use client";

import { useState } from "react";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui";

interface AccountGroup {
  name: string;
  items: Array<{ code: string; name: string; amount: number }>;
  total: number;
}

interface ReportData {
  revenue: AccountGroup;
  costOfGoodsSold: AccountGroup;
  grossProfit: number;
  operatingExpenses: AccountGroup;
  operatingProfit: number;
  otherIncome: AccountGroup;
  otherExpenses: AccountGroup;
  netProfit: number;
}

const mockData: ReportData = {
  revenue: {
    name: "Revenue",
    items: [
      { code: "40100", name: "Sales Revenue", amount: 2800000 },
      { code: "40200", name: "Service Income", amount: 450000 },
    ],
    total: 3250000,
  },
  costOfGoodsSold: {
    name: "Cost of Goods Sold",
    items: [
      { code: "50100", name: "Purchase Expenses", amount: 1200000 },
      { code: "50150", name: "Direct Costs", amount: 180000 },
    ],
    total: 1380000,
  },
  grossProfit: 1870000,
  operatingExpenses: {
    name: "Operating Expenses",
    items: [
      { code: "50200", name: "Salaries & Wages", amount: 450000 },
      { code: "50210", name: "Rent", amount: 120000 },
      { code: "50220", name: "Utilities", amount: 45000 },
      { code: "50230", name: "Office Expenses", amount: 68000 },
    ],
    total: 683000,
  },
  operatingProfit: 1187000,
  otherIncome: {
    name: "Other Income",
    items: [
      { code: "40300", name: "Interest Income", amount: 25000 },
    ],
    total: 25000,
  },
  otherExpenses: {
    name: "Other Expenses",
    items: [
      { code: "50300", name: "Interest Expense", amount: 45000 },
      { code: "50310", name: "Bank Charges", amount: 12000 },
    ],
    total: 57000,
  },
  netProfit: 1155000,
};

export default function ProfitAndLossPage() {
  const [viewMode, setViewMode] = useState<"schedule3" | "proprietorship">("schedule3");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Profit & Loss Statement</h1>
          <p className="font-ui text-[12px] text-light mt-1">Financial Performance Summary</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("schedule3")}
            className={`filter-tab ${viewMode === "schedule3" ? "active" : ""}`}
          >
            Schedule III
          </button>
          <button
            onClick={() => setViewMode("proprietorship")}
            className={`filter-tab ${viewMode === "proprietorship" ? "active" : ""}`}
          >
            Proprietorship
          </button>
          <button className="filter-tab">Export PDF</button>
        </div>
      </div>

      {/* Report Body */}
      <div className="report-container max-w-4xl mx-auto">
        <div className="report-header">
          <h2 className="report-company">Mehta Textiles Private Limited</h2>
          <p className="report-title">Statement of Profit and Loss</p>
          <p className="report-period">For the year ended 31 March 2027 • All amounts in ₹</p>
        </div>

        {/* Revenue */}
        <div className="report-section">
          <h3 className="report-section-header">I. Revenue from Operations</h3>
          <div className="space-y-1">
            {mockData.revenue.items.map((item) => (
              <div key={item.code} className="report-line indent">
                <span>
                  <span className="font-mono text-[11px] text-amber mr-2">{item.code}</span>
                  {item.name}
                </span>
                <span className="report-amount">{formatINR(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="report-line total">
            <span>Total Revenue (I)</span>
            <span className="report-amount">{formatINR(mockData.revenue.total)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="report-section">
          <h3 className="report-section-header">II. Expenses</h3>
          
          <div className="report-line indent">
            <span>Cost of Materials Consumed</span>
            <span className="report-amount">{formatINR(mockData.costOfGoodsSold.total)}</span>
          </div>

          <div className="space-y-1 mt-2">
            {mockData.operatingExpenses.items.map((item) => (
              <div key={item.code} className="report-line indent">
                <span>
                  <span className="font-mono text-[11px] text-amber mr-2">{item.code}</span>
                  {item.name}
                </span>
                <span className="report-amount">{formatINR(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="report-line total">
            <span>Total Expenses (II)</span>
            <span className="report-amount">{formatINR(mockData.costOfGoodsSold.total + mockData.operatingExpenses.total)}</span>
          </div>
        </div>

        {/* Profit Calculation */}
        <div className="report-section pt-4 border-t border-hairline">
          <div className="report-line font-semibold">
            <span>Profit Before Exceptional Items and Tax (I - II)</span>
            <span className="report-amount">{formatINR(mockData.revenue.total - (mockData.costOfGoodsSold.total + mockData.operatingExpenses.total))}</span>
          </div>

          <div className="report-line mt-4 final">
            <span className="uppercase tracking-wider">Net Profit for the Year</span>
            <span className="report-amount text-[16px]">{formatINR(mockData.netProfit)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-hairline flex justify-between items-end">
          <div className="text-[10px] text-light italic max-w-[300px]">
            The accompanying notes form an integral part of these financial statements.
            Prepared in accordance with Indian Accounting Standards (Ind AS).
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
