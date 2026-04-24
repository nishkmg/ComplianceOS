// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Badge, BalanceBar } from "@/components/ui";
import { formatIndianNumber, formatDateShort } from "@/lib/format";

const statusColors: Record<string, string> = {
  draft: "bg-amber text-white",
  posted: "bg-success text-white",
  voided: "bg-gray text-mid",
};

export default function JournalEntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [isCorrectingNarration, setIsCorrectingNarration] = useState(false);
  const [newNarration, setNewNarration] = useState("");
  const [voidReason, setVoidReason] = useState("");
  const [showVoidModal, setShowVoidModal] = useState(false);

  const { data: entry, isLoading, refetch } = api.journalEntries.get.useQuery({ id: entryId });
  
  const correctNarration = api.journalEntries.correctNarration.useMutation({
    onSuccess: () => {
      setIsCorrectingNarration(false);
      refetch();
    },
  });

  const voidEntry = api.journalEntries.void.useMutation({
    onSuccess: () => {
      setShowVoidModal(false);
      refetch();
    },
  });

  const postEntry = api.journalEntries.post.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCorrectNarration = async () => {
    if (newNarration.trim()) {
      await correctNarration.mutateAsync({ id: entryId, newNarration: newNarration.trim() });
    }
  };

  const handleVoid = async () => {
    if (voidReason.trim()) {
      await voidEntry.mutateAsync({ id: entryId, reason: voidReason.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 font-ui text-mid">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="card p-12 text-center">
        <p className="font-ui text-light">Journal entry not found</p>
        <button onClick={() => router.push("/journal")} className="filter-tab active mt-4">
          Back to Journal
        </button>
      </div>
    );
  }

  const totalDebit = entry.lines?.reduce((sum: number, line: any) => sum + parseFloat(line.debit || "0"), 0) || 0;
  const totalCredit = entry.lines?.reduce((sum: number, line: any) => sum + parseFloat(line.credit || "0"), 0) || 0;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">{entry.entryNumber}</h1>
          <p className="font-ui text-[12px] text-light mt-1">
            {formatDateShort(entry.date)} · FY {entry.fiscalYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={entry.status === "posted" ? "success" : entry.status === "voided" ? "gray" : "amber"}>
            {entry.status}
          </Badge>
        </div>
      </div>

      {/* Narration */}
      <div className="card">
        <div className="p-6">
          {isCorrectingNarration ? (
            <div className="space-y-4">
              <div>
                <label className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
                  Old Narration
                </label>
                <p className="font-ui text-[13px] text-light line-through">{entry.narration}</p>
              </div>
              <div>
                <label htmlFor="newNarration" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
                  New Narration
                </label>
                <input
                  id="newNarration"
                  type="text"
                  value={newNarration}
                  onChange={(e) => setNewNarration(e.target.value)}
                  className="input-field w-full font-ui"
                  autoFocus
                  placeholder="Enter corrected narration"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCorrectNarration}
                  disabled={correctNarration.isPending || !newNarration.trim()}
                  className="filter-tab active disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsCorrectingNarration(false)}
                  className="filter-tab"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-ui text-[15px] font-medium text-dark">{entry.narration}</h2>
                <p className="font-ui text-[12px] text-light mt-1">
                  Reference: <span className="font-mono text-amber">{entry.referenceType || "Manual"}</span>
                </p>
              </div>
              {entry.status === "draft" && (
                <button
                  onClick={() => {
                    setNewNarration(entry.narration);
                    setIsCorrectingNarration(true);
                  }}
                  className="filter-tab"
                >
                  Correct Narration
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lines */}
      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Account</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right w-40">Debit (₹)</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right w-40">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {entry.lines?.map((line: any, i: number) => (
              <tr key={i} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                <td className="font-ui text-[13px] text-dark px-4 py-3">
                  {line.accountName || line.accountId}
                </td>
                <td className="font-mono text-[13px] text-right text-success px-4 py-3">
                  {line.debit && line.debit !== "0" ? formatIndianNumber(line.debit) : "—"}
                </td>
                <td className="font-mono text-[13px] text-right text-danger px-4 py-3">
                  {line.credit && line.credit !== "0" ? formatIndianNumber(line.credit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-dark font-semibold">
              <td className="font-ui text-[13px] text-dark px-6 py-4">Total</td>
              <td className={`font-mono text-[14px] text-right px-6 py-4 ${isBalanced ? "text-success" : "text-danger"}`}>
                {formatIndianNumber(totalDebit)}
              </td>
              <td className={`font-mono text-[14px] text-right px-6 py-4 ${isBalanced ? "text-success" : "text-danger"}`}>
                {formatIndianNumber(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isBalanced && (
        <div className="bg-danger-bg p-4 rounded-md">
          <p className="font-ui text-[13px] text-danger font-medium">
            Entry is not balanced. Difference: {formatIndianNumber(Math.abs(totalDebit - totalCredit))}
          </p>
        </div>
      )}

      {/* Balance Bar */}
      <BalanceBar debit={totalDebit} credit={totalCredit} />

      {/* Actions */}
      <div className="flex gap-3 pt-6 border-t border-hairline">
        {entry.status === "draft" && (
          <>
            <button
              onClick={() => postEntry.mutate({ id: entryId })}
              disabled={postEntry.isPending || !isBalanced}
              className="filter-tab active disabled:opacity-50"
            >
              Post Entry
            </button>
            <button
              onClick={() => router.push(`/journal/${entryId}/edit`)}
              className="filter-tab"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm("Delete this draft entry?")) {
                  router.push("/journal");
                }
              }}
              className="filter-tab"
            >
              Delete
            </button>
          </>
        )}
        {entry.status === "posted" && (
          <>
            <button
              onClick={() => setShowVoidModal(true)}
              disabled={voidEntry.isPending}
              className="filter-tab"
            >
              Void Entry
            </button>
            <button
              onClick={() => {
                setNewNarration(entry.narration);
                setIsCorrectingNarration(true);
              }}
              className="filter-tab"
            >
              Correct Narration
            </button>
          </>
        )}
        {entry.status === "voided" && (
          <p className="font-ui text-light">Voided entries cannot be modified</p>
        )}
      </div>

      {/* Void Modal */}
      {showVoidModal && (
        <div className="command-palette-overlay" onClick={() => setShowVoidModal(false)}>
          <div className="command-palette max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="font-display text-[20px] font-normal text-dark mb-2">
                Void Journal Entry
              </h3>
              <div className="void-modal-warning mb-4">
                <p className="font-ui text-[13px]">
                  This will create a reversing entry. The original entry cannot be modified after voiding.
                </p>
              </div>
              <div>
                <label htmlFor="voidReason" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
                  Reason for voiding *
                </label>
                <input
                  id="voidReason"
                  type="text"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="input-field w-full font-ui"
                  placeholder="e.g., Duplicate entry, incorrect amount"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowVoidModal(false)} className="filter-tab">
                  Cancel
                </button>
                <button
                  onClick={handleVoid}
                  disabled={voidEntry.isPending || !voidReason.trim()}
                  className="filter-tab bg-danger-bg text-danger border-danger hover:bg-danger-bg"
                >
                  Void Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
