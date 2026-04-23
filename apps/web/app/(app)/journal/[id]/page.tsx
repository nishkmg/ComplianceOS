"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Badge, BalanceBar } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusColors: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  posted: "bg-green-100 text-green-800",
  voided: "bg-gray-100 text-gray-800",
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
          <p className="mt-4 text-gray-600">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Journal entry not found</p>
        <Button className="mt-4" onClick={() => router.push("/journal")}>
          Back to Journal
        </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">{entry.entryNumber}</h1>
          <p className="text-sm text-gray-500">{entry.date} · FY {entry.fiscalYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={entry.status === "posted" ? "success" : entry.status === "voided" ? "secondary" : "warning"}>
            {entry.status}
          </Badge>
        </div>
      </div>

      {/* Narration */}
      <div className="rounded-lg border border-gray-200 p-6">
        {isCorrectingNarration ? (
          <div className="space-y-4">
            <div>
              <Label>Old Narration</Label>
              <p className="mt-1 text-sm text-gray-500">{entry.narration}</p>
            </div>
            <div>
              <Label htmlFor="newNarration">New Narration</Label>
              <Input
                id="newNarration"
                value={newNarration}
                onChange={(e) => setNewNarration(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCorrectNarration} disabled={correctNarration.isPending}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsCorrectingNarration(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{entry.narration}</h2>
              <p className="mt-1 text-sm text-gray-500">Reference: {entry.referenceType}</p>
            </div>
            {entry.status === "draft" && (
              <Button size="sm" variant="outline" onClick={() => {
                setNewNarration(entry.narration);
                setIsCorrectingNarration(true);
              }}>
                Correct Narration
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lines */}
      <div className="rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-gray-500 font-medium">Account</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Debit (₹)</th>
              <th className="px-6 py-3 text-right text-gray-500 font-medium">Credit (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {entry.lines?.map((line: any, i: number) => (
              <tr key={i}>
                <td className="px-6 py-3 text-gray-900">{line.accountName || line.accountId}</td>
                <td className="px-6 py-3 text-right text-gray-600">
                  {line.debit && line.debit !== "0" ? formatIndianNumber(line.debit) : "-"}
                </td>
                <td className="px-6 py-3 text-right text-gray-600">
                  {line.credit && line.credit !== "0" ? formatIndianNumber(line.credit) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td className="px-6 py-3 font-semibold text-gray-900">Total</td>
              <td className={`px-6 py-3 text-right font-semibold ${isBalanced ? "text-gray-900" : "text-red-600"}`}>
                ₹{formatIndianNumber(totalDebit)}
              </td>
              <td className={`px-6 py-3 text-right font-semibold ${isBalanced ? "text-gray-900" : "text-red-600"}`}>
                ₹{formatIndianNumber(totalCredit)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isBalanced && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">Entry is not balanced. Difference: ₹{formatIndianNumber(Math.abs(totalDebit - totalCredit))}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {entry.status === "draft" && (
          <>
            <Button
              onClick={() => postEntry.mutate({ id: entryId })}
              disabled={postEntry.isPending || !isBalanced}
            >
              Post Entry
            </Button>
            <Button variant="outline" onClick={() => router.push(`/journal/${entryId}/edit`)}>
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Delete this draft entry?")) {
                  router.push("/journal");
                }
              }}
            >
              Delete
            </Button>
          </>
        )}
        {entry.status === "posted" && (
          <>
            <Button
              variant="outline"
              onClick={() => setShowVoidModal(true)}
              disabled={voidEntry.isPending}
            >
              Void Entry
            </Button>
            <Button variant="outline" onClick={() => {
              setNewNarration(entry.narration);
              setIsCorrectingNarration(true);
            }}>
              Correct Narration
            </Button>
          </>
        )}
        {entry.status === "voided" && (
          <p className="text-sm text-gray-500">Voided entries cannot be modified</p>
        )}
      </div>

      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Void Journal Entry</h3>
            <p className="mt-2 text-sm text-gray-600">
              This will create a reversing entry. The original entry cannot be modified after voiding.
            </p>
            <div className="mt-4">
              <Label htmlFor="voidReason">Reason for voiding *</Label>
              <Input
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="mt-1"
                placeholder="e.g., Duplicate entry, incorrect amount"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVoidModal(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleVoid}
                disabled={voidEntry.isPending || !voidReason.trim()}
              >
                Void Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
