// @ts-nocheck
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const mockFY = {
  id: "1",
  year: "2026-27",
  startDate: "2026-04-01",
  endDate: "2027-03-31",
  status: "open",
  entryCount: 5,
  draftCount: 1,
};

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  pending_close: "bg-orange-100 text-orange-800",
};

export default function FiscalYearDetailPage() {
  const params = useParams();
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FY {mockFY.year}</h1>
          <p className="text-gray-500 text-sm">{mockFY.startDate} to {mockFY.endDate}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full capitalize ${statusBadge[mockFY.status]}`}>
          {mockFY.status}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Total Entries</span>
          <span className="font-medium">{mockFY.entryCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Draft Entries</span>
          <span className="font-medium">{mockFY.draftCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Days Remaining</span>
          <span className="font-medium">~275 days</span>
        </div>
      </div>

      {mockFY.draftCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Action Required:</strong> {mockFY.draftCount} draft entries exist in this FY. Post or delete all drafts before closing.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {mockFY.status === "open" && mockFY.draftCount === 0 && (
          <button
            onClick={() => setShowCloseDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Close Fiscal Year
          </button>
        )}
        {mockFY.status === "open" && mockFY.draftCount > 0 && (
          <button disabled className="px-4 py-2 bg-gray-200 text-gray-400 rounded text-sm cursor-not-allowed">
            Close Fiscal Year
          </button>
        )}
      </div>

      {showCloseDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Close FY {mockFY.year}?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This action is irreversible. All entries will be locked and cannot be modified. Are you sure?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCloseDialog(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={() => setShowCloseDialog(false)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Confirm Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}