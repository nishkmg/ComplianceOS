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

export default function ITCLedgerPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [selectedTaxType, setSelectedTaxType] = useState<string>("all");

  const { data: itcBalance } = api.gstLedger.itcBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: transactions } = api.gstLedger.ledgerTransactions.useQuery({
    type: "itc",
    periodMonth,
    periodYear,
  });

  const filteredTransactions = selectedTaxType === "all"
    ? transactions
    : transactions?.filter(t => t.taxType === selectedTaxType);

  const taxTypes = ["igst", "cgst", "sgst", "cess"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="text-sm text-gray-500 hover:underline">
            ← Back to GST Ledger
          </Link>
          <h1 className="text-2xl font-bold mt-1">ITC Ledger</h1>
        </div>
        <Link 
          href="/gst/payment" 
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Utilize ITC
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
          value={selectedTaxType}
          onChange={(e) => setSelectedTaxType(e.target.value)}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All Tax Types</option>
          <option value="igst">IGST</option>
          <option value="cgst">CGST</option>
          <option value="sgst">SGST</option>
          <option value="cess">Cess</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {taxTypes.map((type) => {
          const data = itcBalance?.[type] ?? { openingBalance: 0, itcAvailable: 0, itcReversed: 0, itcUtilized: 0, closingBalance: 0 };
          return (
            <div key={type} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 uppercase">{type}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  data.closingBalance > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  ₹{data.closingBalance.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening:</span>
                  <span className="text-gray-900">₹{data.openingBalance.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Additions:</span>
                  <span className="text-green-600">+₹{data.itcAvailable.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reversals:</span>
                  <span className="text-red-600">-₹{data.itcReversed.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilized:</span>
                  <span className="text-blue-600">-₹{data.itcUtilized.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span className="text-gray-700">Closing:</span>
                  <span className="text-gray-900">₹{data.closingBalance.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">ITC Transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Tax Type</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Opening</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">ITC Available</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Reversed</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Utilized</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Closing</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Period</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Source</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Supplier</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.filter((t): t is typeof filteredTransactions[0] & { ledgerType: "itc" } => t.ledgerType === "itc").map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-full uppercase bg-gray-100 text-gray-800">
                      {t.taxType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{t.openingBalance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{t.itcAvailable.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{t.itcReversed.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-blue-600">₹{t.itcUtilized.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">₹{t.closingBalance.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {months.find(m => m.value === Number(t.taxPeriodMonth))?.label} {t.taxPeriodYear}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.sourceDocumentNumber || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.supplierName ? (
                      <div>
                        <div className="text-gray-900">{t.supplierName}</div>
                        <div className="text-xs text-gray-500">{t.supplierGstin}</div>
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No ITC transactions for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
