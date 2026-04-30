"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge, BalanceBar } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

export default function JournalEntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const { data: entry, isLoading }: any = api.journalEntries.get.useQuery({ id: entryId });

  if (isLoading) return <div className="p-12 text-center text-light">Loading entry details...</div>;
  if (!entry) return <div className="p-12 text-center text-light">Entry not found.</div>;

// @ts-ignore
  const totalDebit = entry.lines?.reduce((sum, line) => sum + parseFloat(line.debit || "0"), 0) || 0;
// @ts-ignore
  const totalCredit = entry.lines?.reduce((sum, line) => sum + parseFloat(line.credit || "0"), 0) || 0;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/journal">General Ledger</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface">Voucher Detail</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight">{entry.entryNumber}</h1>
            <Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'draft' ? 'amber' : 'gray'}>
              {entry.status === 'posted' ? 'Cleared' : entry.status}
            </Badge>
          </div>
          <p className="font-ui-md text-ui-md text-text-mid">Voucher Date: {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} · FY {entry.fiscalYear}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="print" className="text-[18px]" /> Print Voucher
          </button>
          {entry.status === 'draft' && (
            <button className="px-5 py-2 bg-primary-container text-white font-ui-sm text-xs rounded-sm hover:bg-primary transition-colors flex items-center gap-2 border-none shadow-sm cursor-pointer">
              Post to Ledger
            </button>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-2">Voucher Type</p>
            <p className="font-ui-sm font-bold text-on-surface capitalize">{entry.type || "Journal Entry"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-2">Narration</p>
            <p className="font-ui-sm text-on-surface leading-relaxed">{entry.narration}</p>
          </div>
        </div>
      </div>

      {/* Lines Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="h-[2px] w-full bg-primary-container"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Account / Ledger</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right w-48">Debit (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right w-48">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {(entry as any).lines?.map((line: any, i: number) => (
                <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="font-ui-sm font-bold text-on-surface">{line.accountName || line.accountId}</div>
                    <div className="text-[11px] text-text-light">{line.accountCode}</div>
                  </td>
                  <td className="py-5 px-6 text-right text-on-surface">{line.debit > 0 ? formatIndianNumber(line.debit) : "—"}</td>
                  <td className="py-5 px-6 text-right text-on-surface">{line.credit > 0 ? formatIndianNumber(line.credit) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 font-bold border-t-2 border-on-surface">
                <td className="py-4 px-6 font-ui-sm uppercase tracking-widest text-xs">Total</td>
                <td className="py-4 px-6 text-right font-mono text-sm">₹ {formatIndianNumber(totalDebit)}</td>
                <td className="py-4 px-6 text-right font-mono text-sm">₹ {formatIndianNumber(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {!isBalanced && (
        <div className="bg-red-50 border-[0.5px] border-red-200 p-4 flex items-center gap-3 text-red-700 font-bold uppercase text-[10px] tracking-widest">
          <Icon name="warning" className="text-sm" />
          Voucher is out of balance by ₹ {formatIndianNumber(Math.abs(totalDebit - totalCredit))}
        </div>
      )}

      {/* Audit Trail Section */}
      <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
        <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">Indelible Audit Trail</h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5"></div>
            <div>
              <p className="font-ui-sm text-on-surface"><span className="font-bold">Entry created</span> by accountant@firm.in</p>
              <p className="font-mono text-[11px] text-text-light mt-0.5">27 Oct 2023 · 14:32:01 · IP 192.168.1.45</p>
            </div>
          </div>
          <div className="flex gap-4 items-start text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></div>
            <div>
              <p className="font-ui-sm text-on-surface"><span className="font-bold text-green-700">Voucher posted</span> to General Ledger</p>
              <p className="font-mono text-[11px] text-text-light mt-0.5">28 Oct 2023 · 09:15:22 · System Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
