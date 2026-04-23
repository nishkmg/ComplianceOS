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
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h1>
          <p className="text-sm text-gray-600">FY {fiscalYear} · Indirect Method</p>
        </div>
        <select
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="2026-27">FY 2026-27</option>
          <option value="2025-26">FY 2025-26</option>
        </select>
      </div>

      <div className="rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Cash Flow from Activities</h2>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr className="bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-900">A. Cash from Operating Activities</td>
              <td className="px-6 py-4 text-right font-semibold text-gray-900">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-600 pl-8">Net Profit before Tax</td>
              <td className="px-6 py-3 text-right text-gray-600">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-900">B. Cash from Investing Activities</td>
              <td className="px-6 py-4 text-right font-semibold text-gray-900">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-600 pl-8">Purchase of Fixed Assets</td>
              <td className="px-6 py-3 text-right text-gray-600">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 font-semibold text-gray-900">C. Cash from Financing Activities</td>
              <td className="px-6 py-4 text-right font-semibold text-gray-900">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-600 pl-8">Proceeds from Share Capital</td>
              <td className="px-6 py-3 text-right text-gray-600">
                {formatIndianNumber(0)}
              </td>
            </tr>
          </tbody>
          <tfoot className="border-t border-gray-200 bg-blue-50">
            <tr>
              <td className="px-6 py-4 font-bold text-gray-900">Net Cash Flow (A + B + C)</td>
              <td className="px-6 py-4 text-right font-bold text-gray-900">
                {formatIndianNumber(netCashFlow)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-3 text-gray-600">Opening Cash & Cash Equivalents</td>
              <td className="px-6 py-3 text-right text-gray-600">
                {formatIndianNumber(0)}
              </td>
            </tr>
            <tr className="bg-blue-100">
              <td className="px-6 py-4 font-bold text-gray-900">Closing Cash & Cash Equivalents</td>
              <td className="px-6 py-4 text-right font-bold text-gray-900">
                {formatIndianNumber(totalCash)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {cashAccounts.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Cash & Cash Equivalents</h2>
          </div>
          <div className="divide-y">
            {cashAccounts.map((account: any) => (
              <div key={account.id} className="flex justify-between px-6 py-3">
                <span className="text-sm text-gray-900">{account.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatIndianNumber(Math.abs(parseFloat(account.balance || "0")))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
