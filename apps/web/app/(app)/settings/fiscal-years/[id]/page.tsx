// @ts-nocheck
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui";

const mockFY = {
  id: "1",
  year: "2026-27",
  startDate: "2026-04-01",
  endDate: "2027-03-31",
  status: "open",
  entryCount: 5,
  draftCount: 1,
};

export default function FiscalYearDetailPage() {
  const params = useParams();
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">FY {mockFY.year}</h1>
          <p className="font-ui text-[12px] text-light mt-1">{mockFY.startDate} to {mockFY.endDate}</p>
        </div>
        <Badge variant={mockFY.status === "open" ? "success" : mockFY.status === "pending_close" ? "amber" : "gray"}>
          {mockFY.status}
        </Badge>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex justify-between font-ui text-[13px]">
          <span className="text-light">Total Entries</span>
          <span className="font-medium text-dark">{mockFY.entryCount}</span>
        </div>
        <div className="flex justify-between font-ui text-[13px]">
          <span className="text-light">Draft Entries</span>
          <span className="font-medium text-dark">{mockFY.draftCount}</span>
        </div>
        <div className="flex justify-between font-ui text-[13px]">
          <span className="text-light">Days Remaining</span>
          <span className="font-medium text-dark">~275 days</span>
        </div>
      </div>

      {mockFY.draftCount > 0 && (
        <div className="card p-4 bg-amber/5 border-l-4 border-l-amber">
          <p className="font-ui text-[12px] text-amber">
            <strong>Action Required:</strong> {mockFY.draftCount} draft entries exist in this FY. Post or delete all drafts before closing.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {mockFY.status === "open" && mockFY.draftCount === 0 && (
          <button
            onClick={() => setShowCloseDialog(true)}
            className="filter-tab active"
          >
            Close Fiscal Year
          </button>
        )}
        {mockFY.status === "open" && mockFY.draftCount > 0 && (
          <button disabled className="filter-tab opacity-50 cursor-not-allowed">
            Close Fiscal Year
          </button>
        )}
      </div>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close FY {mockFY.year}?</DialogTitle></DialogHeader>
          <p className="font-ui text-[13px] text-light py-4">
            This action is irreversible. All entries will be locked and cannot be modified. Are you sure?
          </p>
          <DialogFooter>
            <button onClick={() => setShowCloseDialog(false)} className="filter-tab">Cancel</button>
            <button onClick={() => setShowCloseDialog(false)} className="filter-tab active">Confirm Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
