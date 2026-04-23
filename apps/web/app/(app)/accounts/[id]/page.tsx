// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Badge, BalanceBar } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const { data: account, isLoading } = api.accounts.get.useQuery({ id: accountId });
  const { data: ledger } = api.balances.ledger.useQuery({ accountId, fiscalYear: "2026-27" }, { enabled: !!accountId });
  const modifyAccount = api.accounts.modify.useMutation({ onSuccess: () => setIsEditing(false) });
  const deactivateAccount = api.accounts.deactivate.useMutation({ onSuccess: () => router.push("/accounts") });

  const handleSave = async () => { if (editName.trim()) { await modifyAccount.mutateAsync({ id: accountId, name: editName.trim() }); } };
  const handleDeactivate = async () => { if (confirm("Are you sure? This account will be hidden from new transactions.")) { await deactivateAccount.mutateAsync({ id: accountId }); } };

  if (isLoading) return <div className="py-12 text-center font-ui text-light">Loading account...</div>;
  if (!account) return <div className="py-12 text-center font-ui text-light">Account not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field font-ui w-96" autoFocus />
              <button onClick={handleSave} disabled={modifyAccount.isPending} className="filter-tab active disabled:opacity-50">Save</button>
              <button onClick={() => setIsEditing(false)} className="filter-tab">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="font-display text-[26px] font-normal text-dark">{account.name}</h1>
              <button onClick={() => { setEditName(account.name); setIsEditing(true); }} className="filter-tab">Edit</button>
            </div>
          )}
          <p className="font-ui text-[12px] text-light mt-1">Code: {account.code}</p>
        </div>
        <div className="flex gap-2">
          {!account.isSystem && (
            <button onClick={handleDeactivate} disabled={deactivateAccount.isPending} className="filter-tab disabled:opacity-50">Deactivate</button>
          )}
          <button onClick={() => router.push("/journal/new")} className="filter-tab active">New Entry</button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light">Type</p>
          <p className="font-ui text-[14px] font-medium text-dark mt-1">{account.kind}</p>
        </div>
        <div className="card p-4">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light">Sub-Type</p>
          <p className="font-ui text-[14px] font-medium text-dark mt-1">{account.subType.replace(/([A-Z])/g, " $1").trim()}</p>
        </div>
        <div className="card p-4">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light">Status</p>
          <div className="mt-1"><Badge variant={account.isActive ? "success" : "gray"}>{account.isActive ? "Active" : "Inactive"}</Badge></div>
        </div>
        <div className="card p-4">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light">System Account</p>
          <p className="font-ui text-[14px] font-medium text-dark mt-1">{account.isSystem ? "Yes" : "No"}</p>
        </div>
      </div>

      {/* Balance */}
      {ledger && (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Current Balance</h2>
          <div className="mb-4"><BalanceBar value={ledger.closingBalance || 0} label="Closing Balance" showPercentage={false} /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="font-ui text-[10px] uppercase tracking-wide text-light">Opening Balance</p>
              <p className="font-mono text-[18px] font-medium text-dark mt-1">{formatIndianNumber(ledger.openingBalance || 0)}</p>
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-wide text-light">Total Debits</p>
              <p className="font-mono text-[18px] font-medium text-success mt-1">{formatIndianNumber(ledger.entries?.reduce((sum, e) => sum + parseFloat(e.debit || "0"), 0) || 0)}</p>
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-wide text-light">Total Credits</p>
              <p className="font-mono text-[18px] font-medium text-danger mt-1">{formatIndianNumber(ledger.entries?.reduce((sum, e) => sum + parseFloat(e.credit || "0"), 0) || 0)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {ledger && ledger.entries && ledger.entries.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline font-display text-[14px] font-normal text-dark">Transactions</div>
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Entry #</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Narration</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Debit</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Credit</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.entries.map((entry: any, idx: number) => (
                <tr key={idx} className="border-b border-hairline cursor-pointer hover:bg-surface-muted" onClick={() => router.push(`/journal/${entry.journalEntryId}`)}>
                  <td className="font-mono text-[13px] text-dark px-4 py-3">{entry.date}</td>
                  <td className="font-mono text-[13px] text-amber px-4 py-3">{entry.entryNumber}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3">{entry.narration}</td>
                  <td className="font-mono text-[13px] text-right text-success px-4 py-3">{entry.debit && entry.debit !== "0" ? formatIndianNumber(entry.debit) : "-"}</td>
                  <td className="font-mono text-[13px] text-right text-danger px-4 py-3">{entry.credit && entry.credit !== "0" ? formatIndianNumber(entry.credit) : "-"}</td>
                  <td className={`font-mono text-[13px] text-right font-medium px-4 py-3 ${entry.balance >= 0 ? "text-dark" : "text-danger"}`}>{formatIndianNumber(entry.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ledger && (!ledger.entries || ledger.entries.length === 0) && (
        <div className="card p-12 text-center border-2 border-dashed">
          <p className="font-ui text-[13px] text-light">No transactions yet</p>
          <button onClick={() => router.push("/journal/new")} className="filter-tab active mt-4">Create Journal Entry</button>
        </div>
      )}
    </div>
  );
}
