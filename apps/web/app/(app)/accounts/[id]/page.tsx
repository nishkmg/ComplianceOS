// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const fiscalYear = "2026-27";

  const { data: accounts } = api.accounts.list.useQuery();
  const { data: ledgerData, isLoading } = api.balances.ledger.useQuery(
    { accountId: id, fiscalYear },
    { enabled: !!id }
  );

  const account = accounts?.find((a: any) => a.id === id);
  const transactions = ledgerData?.transactions || [];
  const openingBalance = ledgerData?.openingBalance || 0;
  const closingBalance = ledgerData?.closingBalance || 0;

  let runningBalance = openingBalance;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/coa">Chart of Accounts</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface">{account?.name || "Account Detail"}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="font-ui-xs text-ui-xs text-amber-text tracking-[0.15em] uppercase mb-2 block">{account?.kind} Ledger</span>
          <h1 className="font-display-xl text-display-xl text-on-surface leading-none">{account?.name}</h1>
          <p className="font-mono-md text-text-mid mt-3">{account?.code} · {fiscalYear}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </button>
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit Details
          </button>
        </div>
      </div>

      {/* Opening Balance Card */}
      <div className="bg-white border-[0.5px] border-border-subtle p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-stone-300"></div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-ui-xs text-text-mid uppercase tracking-wider">Opening Balance</p>
          </div>
          <div className="text-right">
            <p className="font-mono-lg text-lg text-on-surface font-bold">₹ {formatIndianNumber(openingBalance)} <span className="text-text-light text-sm font-normal">{openingBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b-[0.5px] border-border-subtle bg-[#FBF9F6]">
          <h2 className="font-ui-lg text-lg font-medium text-on-surface">Transactions</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-[18px]">search</span>
            <input className="pl-9 pr-4 py-1.5 border-[0.5px] border-border-subtle rounded-sm text-xs w-64 outline-none focus:border-primary" placeholder="Search entries..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest">Date</th>
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest">Voucher</th>
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest w-full">Narration</th>
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest text-right">Debit (₹)</th>
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest text-right">Credit (₹)</th>
                <th className="py-3 px-4 font-ui-xs text-text-light uppercase tracking-widest text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-text-mid font-ui-sm">Loading transactions...</td></tr>
              ) : transactions.length > 0 ? (
                transactions.map((txn: any, i: number) => {
                  runningBalance += txn.debit - txn.credit;
                  return (
                    <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-4 text-text-mid">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                      <td className="py-4 px-4 text-primary font-medium hover:underline cursor-pointer">
                        <Link href={`/journal/${txn.id}`} className="no-underline text-inherit">{txn.voucherNumber}</Link>
                      </td>
                      <td className="py-4 px-4 font-ui-sm text-on-surface">{txn.narration}</td>
                      <td className="py-4 px-4 text-right text-on-surface">{txn.debit > 0 ? formatIndianNumber(txn.debit) : "—"}</td>
                      <td className="py-4 px-4 text-right text-on-surface">{txn.credit > 0 ? formatIndianNumber(txn.credit) : "—"}</td>
                      <td className={`py-4 px-4 text-right font-medium ${runningBalance >= 0 ? 'text-on-surface' : 'text-red-600'}`}>
                        {formatIndianNumber(Math.abs(runningBalance))} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-12 text-center text-text-mid font-ui-sm">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closing Balance Card */}
      <div className="bg-white border-[0.5px] border-border-subtle p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C8860A]"></div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-ui-xs text-text-mid uppercase tracking-wider">Closing Balance</p>
          </div>
          <div className="text-right">
            <p className="font-mono-lg text-xl text-on-surface font-bold">₹ {formatIndianNumber(closingBalance)} <span className="text-text-light text-sm font-normal">{closingBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
