"use client";

import { useState } from "react";
import Link from "next/link";

const mockEntry = {
  id: "1", entryNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance",
  status: "posted", fiscalYear: "2026-27",
  lines: [
    { account: "Bank Account", debit: "5,00,000", credit: "0" },
    { account: "Capital Account", debit: "0", credit: "5,00,000" },
  ],
  totalDebit: "5,00,000", totalCredit: "5,00,000",
};

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  posted: "bg-green-100 text-green-800",
  voided: "bg-gray-100 text-gray-800",
};

export default function JournalEntryDetailPage() {
  const [status] = useState(mockEntry.status);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mockEntry.entryNumber}</h1>
          <p className="text-gray-500 text-sm">{mockEntry.date} · FY {mockEntry.fiscalYear}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full capitalize ${statusColors[status]}`}>{status}</span>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">{mockEntry.narration}</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Account</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Debit (₹)</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Credit (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockEntry.lines.map((line, i) => (
              <tr key={i}>
                <td className="px-6 py-3 text-gray-900">{line.account}</td>
                <td className="px-6 py-3 text-right text-gray-600">{line.debit}</td>
                <td className="px-6 py-3 text-right text-gray-600">{line.credit}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td className="px-6 py-3 font-semibold text-gray-900">Total</td>
              <td className="px-6 py-3 text-right font-semibold text-gray-900">₹{mockEntry.totalDebit}</td>
              <td className="px-6 py-3 text-right font-semibold text-gray-900">₹{mockEntry.totalCredit}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex gap-3">
        {status === "posted" && (
          <button className="px-4 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">Void Entry</button>
        )}
        <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Correct Narration</button>
      </div>
    </div>
  );
}
