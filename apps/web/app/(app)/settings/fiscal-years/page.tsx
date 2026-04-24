// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

const statusLabels: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  pending_close: "Pending Close",
};

export default function FiscalYearsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [fyToClose, setFyToClose] = useState<{ id: string; year: string } | null>(null);
  const [newFY, setNewFY] = useState({ year: "", startDate: "", endDate: "" });

  const { data: fiscalYears, refetch } = api.fiscalYears.list.useQuery();
  const createFY = api.fiscalYears.create.useMutation({ onSuccess: () => { setShowCreateModal(false); refetch(); } });
  const closeFY = api.fiscalYears.close.useMutation({ onSuccess: () => { setShowCloseModal(false); refetch(); } });

  const handleCreate = async () => {
    if (newFY.year && newFY.startDate && newFY.endDate) {
      await createFY.mutateAsync(newFY);
    }
  };

  const handleClose = async () => {
    if (fyToClose) {
      try {
        await closeFY.mutateAsync({ id: fyToClose.id });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const hasDrafts = (fy: any) => fy.draftCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Fiscal Years</h1>
          <p className="font-ui text-[12px] text-light mt-1">Manage financial year periods</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="filter-tab active">
          + New FY
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">FY</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Start</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">End</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Entries</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Drafts</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {fiscalYears?.map((fy: any) => (
              <tr key={fy.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                <td className="px-4 py-3 font-display text-[14px] font-medium text-dark">{fy.year}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-light">{fy.startDate}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-light">{fy.endDate}</td>
                <td className="px-4 py-3">
                  <Badge variant={fy.status === "open" ? "success" : fy.status === "pending_close" ? "amber" : "gray"}>
                    {statusLabels[fy.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-right text-dark">{fy.entryCount || 0}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-right">
                  {hasDrafts(fy) ? (
                    <span className="text-amber font-medium">{fy.draftCount}</span>
                  ) : (
                    <span className="text-light">0</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {fy.status === "open" && (
                    <>
                      {hasDrafts(fy) ? (
                        <span className="font-ui text-[11px] text-light">Has drafts</span>
                      ) : (
                        <button onClick={() => { setFyToClose({ id: fy.id, year: fy.year }); setShowCloseModal(true); }} className="font-ui text-[12px] text-amber hover:underline">
                          Close FY
                        </button>
                      )}
                    </>
                  )}
                  {fy.status === "closed" && (
                    <button className="font-ui text-[12px] text-light hover:underline">Reopen</button>
                  )}
                </td>
              </tr>
            ))}
            {(!fiscalYears || fiscalYears.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center font-ui text-light">
                  No fiscal years configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {fiscalYears && fiscalYears.filter((fy: any) => fy.status === "open").length >= 2 && (
        <div className="card p-4 bg-amber/5 border-l-4 border-l-amber">
          <p className="font-ui text-[12px] text-amber">
            <strong>Note:</strong> You have {fiscalYears.filter((fy: any) => fy.status === "open").length} open fiscal years. Maximum 2 open FYs allowed.
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-display text-[18px] font-normal text-dark mb-4">Create Fiscal Year</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">FY Name</label>
                <input
                  type="text"
                  value={newFY.year}
                  onChange={(e) => setNewFY({ ...newFY, year: e.target.value })}
                  className="input-field font-ui"
                  placeholder="2027-28"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Start Date</label>
                <input
                  type="date"
                  value={newFY.startDate}
                  onChange={(e) => setNewFY({ ...newFY, startDate: e.target.value })}
                  className="input-field font-ui"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">End Date</label>
                <input
                  type="date"
                  value={newFY.endDate}
                  onChange={(e) => setNewFY({ ...newFY, endDate: e.target.value })}
                  className="input-field font-ui"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} className="filter-tab active flex-1">Create</button>
              <button onClick={() => setShowCreateModal(false)} className="filter-tab flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && fyToClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md p-6">
            <h2 className="font-display text-[18px] font-normal text-dark mb-2">Close Fiscal Year</h2>
            <p className="font-ui text-[13px] text-light mb-6">
              Are you sure you want to close <span className="font-mono text-dark">{fyToClose.year}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={handleClose} className="filter-tab bg-danger text-white hover:bg-danger/90">Close FY</button>
              <button onClick={() => setShowCloseModal(false)} className="filter-tab">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
