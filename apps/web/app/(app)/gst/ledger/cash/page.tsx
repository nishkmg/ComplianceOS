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

export default function CashLedgerPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [filterTaxType, setFilterTaxType] = useState<string>("all");

  const { data: cashBalance, isLoading } = api.gstLedger.cashBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: transactions } = api.gstLedger.ledgerTransactions.useQuery({
    type: "cash",
    periodMonth,
    periodYear,
  });

  const filteredTransactions = filterTaxType === "all" 
    ? transactions 
    : transactions?.filter(t => t.taxType === filterTaxType);

  const totalBalance = (cashBalance?.balance ?? { igst: 0, cgst: 0, sgst: 0, cess: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="text-sm text-gray-500 hover:underline">
            ← Back to GST Ledger
          </Link>
          <h1 className="text-2xl font-bold mt-1">Cash Ledger</h1>
        </div>
        <Link 
          href="/gst/payment" 
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Make Payment
        </Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
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

        <select
          value={filterTaxType}
          onChange={(e) => setFilterTaxType(e.target.value)}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All Tax Types</option>
          <option value="igst">IGST</option>
          <option value="cgst">CGST</option>
          <option value="sgst">SGST</option>
          <option value="cess">Cess</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(totalBalance).map(([type, amount]) => (
          <div key={type} className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500 uppercase mb-1">{type}</p>
            <p className="text-xl font-bold text-gray-900">₹{amount.toLocaleString("en-IN")}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Transactions</h2>
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
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Bank</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Narration</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.filter((t): t is typeof filteredTransactions[0] & { ledgerType: "cash" } => t.ledgerType === "cash").map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{new Date(t.transactionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      t.transactionType === "payment" ? "bg-red-100 text-red-800" :
                      t.transactionType === "refund" ? "bg-green-100 text-green-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {t.transactionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 uppercase">{t.taxType}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{t.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600 font-medium">₹{t.balance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.challanNumber || t.referenceNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{t.bankName || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.narration || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No transactions for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
