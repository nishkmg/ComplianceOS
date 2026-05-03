"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";

export default function LedgerReportPage() {
  const [selectedAccount, setSelectedAccount] = useState("");
  const [fiscalYear, setFiscalYear] = useState("2026-27");

  const { data: accounts }: any = api.accounts.list.useQuery();
  const { data: ledgerData }: any = api.balances.ledger.useQuery(
    { accountId: selectedAccount, fiscalYear },
    { enabled: !!selectedAccount }
  );

  const leafAccounts = accounts?.filter((a: any) => a.isLeaf) || [];
  const transactions = ledgerData?.transactions || [];
  const openingBalance = ledgerData?.openingBalance || 0;
  const closingBalance = ledgerData?.closingBalance || 0;

  let runningBalance = openingBalance;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Report</p>
          <h1 className="font-display text-2xl font-semibold text-dark mb-2">General Ledger</h1>
          <p className="font-mono text-secondary flex items-center gap-2">
            <Icon name="calendar_month" className="text-[16px]" />
            01 Apr {fiscalYear.split("-")[0]} — 31 Mar {fiscalYear.split("-")[1]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border-[0.5px] border-border px-4 py-2 text-ui-sm outline-none bg-surface" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
            <option value="">Select an account...</option>
            {leafAccounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.code} · {a.name}</option>
            ))}
          </select>
          <select className="border-[0.5px] border-border px-4 py-2 text-ui-sm outline-none bg-surface" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Icon name="filter_list" className="text-[18px]" />
            Filters
          </button>
          <button className="btn-primary flex items-center gap-2 group">
            <Icon name="download" className="text-[18px]" />
            Export CSV
          </button>
        </div>
      </div>

      {selectedAccount ? (
        <>
          {/* Opening Balance Card */}
          <div className="bg-surface border-[0.5px] border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg text-display-lg text-on-surface">{leafAccounts.find((a: any) => a.id === selectedAccount)?.name}</h3>
                <p className="font-ui text-[11px] text-text-mid uppercase tracking-wider mt-1">{leafAccounts.find((a: any) => a.id === selectedAccount)?.code}</p>
              </div>
              <div className="text-right">
                <p className="font-ui text-[11px] text-text-mid uppercase tracking-wider mb-1">Opening Balance</p>
                <p className="font-mono-lg text-on-surface">₹ {formatIndianNumber(openingBalance)} <span className="text-text-light text-sm">{openingBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-surface border-[0.5px] border-border overflow-x-auto">
            <div className="h-[2px] w-full bg-amber"></div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest">Date</th>
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest">Narration</th>
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest">Voucher</th>
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest text-right">Debit</th>
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest text-right">Credit</th>
                  <th className="py-3 px-4 font-ui text-[11px] text-text-light uppercase tracking-widest text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle">
                {transactions.length > 0 ? (
                  transactions.map((txn: any, i: number) => {
                    runningBalance += txn.debit - txn.credit;
                    return (
                      <tr key={txn.id || i} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-text-mid">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td className="py-3 px-4 font-ui text-[13px] text-on-surface">{txn.narration}</td>
                        <td className="py-3 px-4 font-mono text-sm text-amber-text">{txn.voucherNumber}</td>
                        <td className="py-3 px-4 font-mono text-sm text-right">{txn.debit > 0 ? `₹ ${formatIndianNumber(txn.debit)}` : ''}</td>
                        <td className="py-3 px-4 font-mono text-sm text-right">{txn.credit > 0 ? `₹ ${formatIndianNumber(txn.credit)}` : ''}</td>
                        <td className={`py-3 px-4 font-mono text-sm text-right ${runningBalance >= 0 ? '' : 'text-red-600'}`}>
                          ₹ {formatIndianNumber(Math.abs(runningBalance))} {runningBalance >= 0 ? 'Dr' : 'Cr'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-mid font-ui text-[13px]">No transactions found for this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Closing Balance */}
          <div className="bg-surface border-[0.5px] border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-ui text-[11px] text-text-mid uppercase tracking-wider">Closing Balance</p>
              </div>
              <div className="text-right">
                <p className="font-mono-lg font-bold text-on-surface">₹ {formatIndianNumber(closingBalance)} <span className="text-text-light text-sm">{closingBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="font-ui text-text-mid">Select an account to view ledger transactions.</p>
          <p className="font-ui text-[13px] text-text-light mt-2">Choose from the dropdown above to get started.</p>
        </div>
      )}
    </div>
  );
}
