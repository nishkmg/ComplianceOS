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
          <h1 className="font-display text-[26px] font-normal text-[#1A1A1A]">Profit & Loss Statement</h1>
          <p className="text-[12px] text-[#888888] mt-1">FY 2026-27 • April 2026 - March 2027</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("schedule3")}
            className={`px-4 py-2 text-[13px] rounded-[6px] ${
              viewMode === "schedule3" ? "bg-[#C8860A] text-white" : "bg-white border border-[#E5E5E5]"
            }`}
          >
            Schedule III
          </button>
          <button
            onClick={() => setViewMode("proprietorship")}
            className={`px-4 py-2 text-[13px] rounded-[6px] ${
              viewMode === "proprietorship" ? "bg-[#C8860A] text-white" : "bg-white border border-[#E5E5E5]"
            }`}
          >
            Proprietorship
          </button>
          <button className="btn btn-secondary">Export PDF</button>
        </div>
      </div>

      {/* Report Body */}
      <div className="card">
        <div className="p-8 space-y-6">
          {/* Title */}
          <div className="text-center border-b border-[#E5E5E5] pb-6">
            <h2 className="font-display text-[20px] font-normal text-[#1A1A1A]">Demo Business Pvt Ltd</h2>
            <p className="text-[12px] text-[#888888] mt-1">Statement of Profit and Loss</p>
            <p className="text-[10px] text-[#888888]">For the year ended 31 March 2027</p>
          </div>

          {/* Revenue */}
          <div>
            <h3 className="font-display text-[16px] font-medium text-[#1A1A1A] mb-3">{mockData.revenue.name}</h3>
            <div className="space-y-2 ml-4">
              {mockData.revenue.items.map((item) => (
                <div key={item.code} className="flex justify-between text-[13px]">
                  <span className="text-[#555555]">
                    <span className="font-mono text-[#C8860A] mr-2">{item.code}</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-right">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[13px] font-medium mt-3 pt-3 border-t border-[#E5E5E5]">
              <span>Total Revenue</span>
              <span className="font-mono">{formatINR(mockData.revenue.total)}</span>
            </div>
          </div>

          {/* Cost of Goods Sold */}
          <div>
            <h3 className="font-display text-[16px] font-medium text-[#1A1A1A] mb-3">{mockData.costOfGoodsSold.name}</h3>
            <div className="space-y-2 ml-4">
              {mockData.costOfGoodsSold.items.map((item) => (
                <div key={item.code} className="flex justify-between text-[13px]">
                  <span className="text-[#555555]">
                    <span className="font-mono text-[#C8860A] mr-2">{item.code}</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-right">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[13px] font-medium mt-3 pt-3 border-t border-[#E5E5E5]">
              <span>Total Cost of Goods Sold</span>
              <span className="font-mono">{formatINR(mockData.costOfGoodsSold.total)}</span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="flex justify-between text-[14px] font-medium pt-4 border-t-2 border-[#1A1A1A]">
            <span>Gross Profit</span>
            <span className="font-mono text-[#1A7A3D]">{formatINR(mockData.grossProfit)}</span>
          </div>

          {/* Operating Expenses */}
          <div>
            <h3 className="font-display text-[16px] font-medium text-[#1A1A1A] mb-3">{mockData.operatingExpenses.name}</h3>
            <div className="space-y-2 ml-4">
              {mockData.operatingExpenses.items.map((item) => (
                <div key={item.code} className="flex justify-between text-[13px]">
                  <span className="text-[#555555]">
                    <span className="font-mono text-[#C8860A] mr-2">{item.code}</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-right">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[13px] font-medium mt-3 pt-3 border-t border-[#E5E5E5]">
              <span>Total Operating Expenses</span>
              <span className="font-mono">{formatINR(mockData.operatingExpenses.total)}</span>
            </div>
          </div>

          {/* Operating Profit */}
          <div className="flex justify-between text-[14px] font-medium pt-4 border-t-2 border-[#1A1A1A]">
            <span>Operating Profit (EBIT)</span>
            <span className="font-mono text-[#1A7A3D]">{formatINR(mockData.operatingProfit)}</span>
          </div>

          {/* Other Income & Expenses */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h3 className="font-display text-[14px] font-medium text-[#1A1A1A] mb-3">{mockData.otherIncome.name}</h3>
              <div className="space-y-2 ml-4">
                {mockData.otherIncome.items.map((item) => (
                  <div key={item.code} className="flex justify-between text-[13px]">
                    <span className="text-[#555555]">
                      <span className="font-mono text-[#C8860A] mr-2">{item.code}</span>
                      {item.name}
                    </span>
                    <span className="font-mono text-right">{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display text-[14px] font-medium text-[#1A1A1A] mb-3">{mockData.otherExpenses.name}</h3>
              <div className="space-y-2 ml-4">
                {mockData.otherExpenses.items.map((item) => (
                  <div key={item.code} className="flex justify-between text-[13px]">
                    <span className="text-[#555555]">
                      <span className="font-mono text-[#C8860A] mr-2">{item.code}</span>
                      {item.name}
                    </span>
                    <span className="font-mono text-right">{formatINR(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="flex justify-between text-[16px] font-medium pt-6 border-t-2 border-[#1A1A1A] bg-[#F5F5F5] p-4 rounded-[8px]">
            <span>Net Profit for the Year</span>
            <span className="font-mono text-[#1A7A3D]">{formatINR(mockData.netProfit)}</span>
          </div>

          {/* Notes */}
          <div className="pt-6 border-t border-[#E5E5E5]">
            <p className="text-[10px] text-[#888888]">
              The accompanying notes form an integral part of these financial statements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
