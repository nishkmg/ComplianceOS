"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
  pending_close: "bg-orange-100 text-orange-800",
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

  const openFYs = fiscalYears?.filter((fy: any) => fy.status === "open") || [];
  const hasDrafts = (fy: any) => fy.draftCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fiscal Years</h1>
          <p className="text-sm text-gray-600">Manage your financial year periods</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          + New FY
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
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
            {fiscalYears?.map((fy: any) => (
              <tr key={fy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{fy.year}</td>
                <td className="px-6 py-4 text-gray-600">{fy.startDate}</td>
                <td className="px-6 py-4 text-gray-600">{fy.endDate}</td>
                <td className="px-6 py-4">
                  <Badge variant={fy.status === "open" ? "success" : "secondary"}>
                    {fy.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-gray-600">{fy.entryCount || 0}</td>
                <td className="px-6 py-4 text-right">
                  {hasDrafts(fy) ? (
                    <span className="text-orange-600 font-medium">{fy.draftCount}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {fy.status === "open" && (
                    <>
                      {hasDrafts(fy) ? (
                        <span className="text-xs text-gray-400">Has drafts</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFyToClose({ id: fy.id, year: fy.year });
                            setShowCloseModal(true);
                          }}
                        >
                          Close FY
                        </Button>
                      )}
                    </>
                  )}
                  {fy.status === "closed" && (
                    <span className="text-xs text-gray-400">Closed</span>
                  )}
                </td>
              </tr>
            ))}
            {!fiscalYears || fiscalYears.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No fiscal years found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openFYs.length >= 2 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You have {openFYs.length} open fiscal years. Maximum 2 open FYs allowed.
            Close older FYs to maintain compliance.
          </p>
        </div>
      )}

      {/* Create FY Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Create Fiscal Year</h3>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="year">FY Label</Label>
                <Input
                  id="year"
                  placeholder="2027-28"
                  value={newFY.year}
                  onChange={(e) => setNewFY({ ...newFY, year: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newFY.startDate}
                  onChange={(e) => setNewFY({ ...newFY, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newFY.endDate}
                  onChange={(e) => setNewFY({ ...newFY, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createFY.isPending}>
                Create FY
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Close FY Modal */}
      {showCloseModal && fyToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Close Fiscal Year</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to close FY <strong>{fyToClose.year}</strong>?
            </p>
            <div className="mt-4 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. No new entries can be posted to a closed fiscal year.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCloseModal(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleClose}
                disabled={closeFY.isPending}
              >
                Close FY
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
