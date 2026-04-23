// @ts-nocheck
"use client";

import { useState } from "react";

const mockFYs = [
  { id: "1", year: "2026-27", startDate: "2026-04-01", endDate: "2027-03-31", status: "open", entryCount: 5, draftCount: 1 },
  { id: "2", year: "2025-26", startDate: "2025-04-01", endDate: "2026-03-31", status: "closed", entryCount: 142, draftCount: 0 },
];

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  pending_close: "bg-orange-100 text-orange-800",
};

export default function FiscalYearsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fiscal Years</h1>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          + New FY
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">FY</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Start</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">End</th>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Status</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Entries</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Drafts</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockFYs.map((fy) => (
              <tr key={fy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{fy.year}</td>
                <td className="px-6 py-4 text-gray-600">{fy.startDate}</td>
                <td className="px-6 py-4 text-gray-600">{fy.endDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusBadge[fy.status]}`}>
                    {fy.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-600">{fy.entryCount}</td>
                <td className="px-6 py-4 text-right text-gray-600">{fy.draftCount > 0 ? <span className="text-orange-600 font-medium">{fy.draftCount}</span> : "0"}</td>
                <td className="px-6 py-4 text-right">
                  {fy.status === "open" && fy.draftCount === 0 && (
                    <button className="text-sm text-blue-600 hover:underline">Close FY</button>
                  )}
                  {fy.status === "open" && fy.draftCount > 0 && (
                    <span className="text-xs text-gray-400">Has drafts</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> You have 2 open fiscal years. The older FY (2025-26) will be flagged for closure after the grace period ends.
        </p>
      </div>
    </div>
  );
}