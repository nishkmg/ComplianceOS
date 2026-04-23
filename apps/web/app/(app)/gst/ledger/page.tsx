// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function GSTLedgerPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);

  const { data: cashBalance, isLoading: cashLoading } = api.gstLedger.cashBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: itcBalance, isLoading: itcLoading } = api.gstLedger.itcBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: liabilityBalance, isLoading: liabilityLoading } = api.gstLedger.liabilityBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: transactions } = api.gstLedger.ledgerTransactions.useQuery({
    type: "cash",
    periodMonth,
    periodYear,
  });

  const totalCashBalance = (cashBalance?.balance ?? { igst: 0, cgst: 0, sgst: 0, cess: 0 });
  const totalITC = (itcBalance?.igst.closingBalance ?? 0) + 
                   (itcBalance?.cgst.closingBalance ?? 0) + 
                   (itcBalance?.sgst.closingBalance ?? 0) + 
                   (itcBalance?.cess.closingBalance ?? 0);
  
  const totalLiability = (liabilityBalance?.igst.output ?? 0) + 
                        (liabilityBalance?.cgst.output ?? 0) + 
                        (liabilityBalance?.sgst.output ?? 0) + 
                        (liabilityBalance?.cess.output ?? 0);
  
  const netLiability = Math.max(0, totalLiability - totalITC);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">GST Ledger</h1>
        <div className="flex gap-2">
          <Link 
            href="/gst/payment" 
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Make Payment
          </Link>
          <Link 
            href="/gst/payment/history" 
            className="px-4 py-2 bg-white border text-sm rounded hover:bg-gray-50"
          >
            Payment History
          </Link>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={periodMonth}
          onChange={(e) => setPeriodMonth(Number(e.target.value))}
          className="px-3 py-2 border rounded text-sm"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="number"
          value={periodYear}
          onChange={(e) => setPeriodYear(Number(e.target.value))}
          className="px-3 py-2 border rounded text-sm w-24"
          min={2000}
          max={2100}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Cash Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{Object.values(totalCashBalance).reduce((a, b) => a + b, 0).toLocaleString("en-IN")}
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>IGST:</span>
              <span>₹{totalCashBalance.igst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>₹{totalCashBalance.cgst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>₹{totalCashBalance.sgst.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cess:</span>
              <span>₹{totalCashBalance.cess.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <Link href="/gst/ledger/cash" className="mt-3 block text-sm text-blue-600 hover:underline">
            View Details →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">ITC Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalITC.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>IGST:</span>
              <span>₹{(itcBalance?.igst.closingBalance ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>₹{(itcBalance?.cgst.closingBalance ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>₹{(itcBalance?.sgst.closingBalance ?? 0).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cess:</span>
              <span>₹{(itcBalance?.cess.closingBalance ?? 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <Link href="/gst/ledger/itc" className="mt-3 block text-sm text-blue-600 hover:underline">
            View Details →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Net Liability</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{netLiability.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total Payable:</span>
              <span>₹{totalLiability.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Less ITC:</span>
              <span>₹{totalITC.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <Link href="/gst/payment" className="mt-3 block text-sm text-blue-600 hover:underline">
            Pay Now →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link href="/gst/ledger/cash" className="text-sm text-blue-600 hover:underline">
            View All →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Tax Type</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Balance</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions && transactions.length > 0 ? (
              transactions.filter((t): t is typeof transactions[0] & { ledgerType: "cash" } => t.ledgerType === "cash").slice(0, 10).map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{t.transactionDate || new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full capitalize bg-gray-100 text-gray-800">
                      {t.ledgerType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 uppercase">{t.taxType}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{t.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{t.balance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.referenceNumber || t.challanNumber || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
