"use client";

import { useState } from "react";
import Link from "next/link";

const mockEntries = [
  { id: "1", entryNumber: "JE-2026-27-001", date: "2026-04-01", narration: "Opening balance", status: "posted", total: "5,00,000" },
  { id: "2", entryNumber: "JE-2026-27-002", date: "2026-04-05", narration: "Sales Invoice #1", status: "draft", total: "1,18,000" },
];

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  posted: "bg-green-100 text-green-800",
  voided: "bg-gray-100 text-gray-800",
};

export default function JournalPage() {
  const [filter, setFilter] = useState<string>("all");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal Entries</h1>
        <Link href="/journal/new" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          + New Entry
        </Link>
      </div>

      <div className="flex gap-2">
        {["all", "draft", "posted", "voided"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-white border"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Entry #</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Narration</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/journal/${entry.id}`} className="text-blue-600 hover:underline">
                    {entry.entryNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.date}</td>
                <td className="px-4 py-3 text-gray-600">{entry.narration}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusColors[entry.status]}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">₹{entry.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
