"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Badge, BalanceBar } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const { data: account, isLoading } = api.accounts.get.useQuery({ id: accountId });
  const { data: ledger } = api.balances.ledger.useQuery(
    { accountId, fiscalYear: "2026-27" },
    { enabled: !!accountId }
  );

  const modifyAccount = api.accounts.modify.useMutation({
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const deactivateAccount = api.accounts.deactivate.useMutation({
    onSuccess: () => {
      router.push("/accounts");
    },
  });

  const handleSave = async () => {
    if (editName.trim()) {
      await modifyAccount.mutateAsync({ id: accountId, name: editName.trim() });
    }
  };

  const handleDeactivate = async () => {
    if (confirm("Are you sure? This account will be hidden from new transactions.")) {
      await deactivateAccount.mutateAsync({ id: accountId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Account not found</p>
        <Button className="mt-4" onClick={() => router.push("/accounts")}>
          Back to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-96"
                autoFocus
              />
              <Button size="sm" onClick={handleSave} disabled={modifyAccount.isPending}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
              <Button size="sm" variant="outline" onClick={() => {
                setEditName(account.name);
                setIsEditing(true);
              }}>
                Edit
              </Button>
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">Code: {account.code}</p>
        </div>

        <div className="flex gap-2">
          {!account.isSystem && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeactivate}
              disabled={deactivateAccount.isPending}
            >
              Deactivate
            </Button>
          )}
          <Button size="sm" onClick={() => router.push("/journal/new")}>
            New Entry
          </Button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Type</p>
          <p className="mt-1 font-medium text-gray-900">{account.kind}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Sub-Type</p>
          <p className="mt-1 font-medium text-gray-900">{account.subType.replace(/([A-Z])/g, " $1").trim()}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Status</p>
          <Badge variant={account.isActive ? "success" : "secondary"} className="mt-1">
            {account.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">System Account</p>
          <p className="mt-1 font-medium text-gray-900">{account.isSystem ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Balance */}
      {ledger && (
        <div className="rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Balance</h2>
          <div className="mt-4">
            <BalanceBar
              value={ledger.closingBalance || 0}
              label="Closing Balance"
              showPercentage={false}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Opening Balance</p>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {formatIndianNumber(ledger.openingBalance || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Debits</p>
              <p className="mt-1 text-lg font-medium text-green-600">
                {formatIndianNumber(
                  ledger.entries?.reduce((sum, e) => sum + parseFloat(e.debit || "0"), 0) || 0
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="mt-1 text-lg font-medium text-red-600">
                {formatIndianNumber(
                  ledger.entries?.reduce((sum, e) => sum + parseFloat(e.credit || "0"), 0) || 0
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {ledger && ledger.entries && ledger.entries.length > 0 && (
        <div className="rounded-lg border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entry #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Narration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Credit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ledger.entries.map((entry: any, idx: number) => (
                  <tr
                    key={idx}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/journal/${entry.journalEntryId}`)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">{entry.date}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{entry.entryNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.narration}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-green-600">
                      {entry.debit && entry.debit !== "0" ? formatIndianNumber(entry.debit) : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-red-600">
                      {entry.credit && entry.credit !== "0" ? formatIndianNumber(entry.credit) : "-"}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                      entry.balance >= 0 ? "text-gray-900" : "text-red-600"
                    }`}>
                      {formatIndianNumber(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ledger && (!ledger.entries || ledger.entries.length === 0) && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No transactions yet</p>
          <Button className="mt-4" onClick={() => router.push("/journal/new")}>
            Create Journal Entry
          </Button>
        </div>
      )}
    </div>
  );
}
