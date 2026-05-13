"use client";

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { showToast } from "@/lib/toast";

interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  isLeaf: boolean;
}

interface LedgerTxn {
  id: string;
  date: string;
  narration: string;
  voucherNumber: string;
  debit: number;
  credit: number;
}

const mockAccounts: LedgerAccount[] = [
  { id: "a1", code: "10101", name: "Cash Account", isLeaf: true },
  { id: "a2", code: "10200", name: "Bank Account", isLeaf: true },
  { id: "a3", code: "10300", name: "Trade Receivables", isLeaf: true },
  { id: "a4", code: "40100", name: "Sales Revenue", isLeaf: true },
  { id: "a5", code: "50100", name: "Purchase Expenses", isLeaf: true },
];

const mockTxnsByAccount: Record<string, { openingBalance: number; closingBalance: number; transactions: LedgerTxn[] }> = {
  a1: {
    openingBalance: 500000,
    closingBalance: 425000,
    transactions: [
      { id: "t1", date: "2026-04-15", narration: "Office supplies purchase", voucherNumber: "JE-2026-001", debit: 45000, credit: 0 },
      { id: "t2", date: "2026-05-01", narration: "Rent payment", voucherNumber: "JE-2026-002", debit: 75000, credit: 0 },
      { id: "t3", date: "2026-05-15", narration: "Client payment received", voucherNumber: "JE-2026-003", debit: 0, credit: 195000 },
    ],
  },
  a2: {
    openingBalance: 1200000,
    closingBalance: 1250000,
    transactions: [
      { id: "t4", date: "2026-04-20", narration: "Deposit received", voucherNumber: "JE-2026-004", debit: 100000, credit: 0 },
      { id: "t5", date: "2026-05-10", narration: "Supplier payment", voucherNumber: "JE-2026-005", debit: 0, credit: 50000 },
    ],
  },
  a3: {
    openingBalance: 280000,
    closingBalance: 350000,
    transactions: [
      { id: "t6", date: "2026-04-28", narration: "Invoice raised", voucherNumber: "INV-2026-001", debit: 70000, credit: 0 },
    ],
  },
  a4: {
    openingBalance: 2400000,
    closingBalance: 2800000,
    transactions: [
      { id: "t7", date: "2026-04-30", narration: "Monthly sales", voucherNumber: "INV-2026-002", debit: 0, credit: 400000 },
    ],
  },
  a5: {
    openingBalance: 800000,
    closingBalance: 1200000,
    transactions: [
      { id: "t8", date: "2026-04-10", narration: "Raw material purchase", voucherNumber: "PO-2026-001", debit: 400000, credit: 0 },
    ],
  },
};

export default function LedgerReportPage() {
  const { activeFy: fiscalYear, setActiveFy: setFiscalYear } = useFiscalYear();
  const [selectedAccount, setSelectedAccount] = useState("");

  const leafAccounts = mockAccounts.filter((a) => a.isLeaf);
  const ledgerData = selectedAccount ? mockTxnsByAccount[selectedAccount] : null;
  const transactions = ledgerData?.transactions || [];
  const openingBalance = ledgerData?.openingBalance || 0;
  const closingBalance = ledgerData?.closingBalance || 0;

  let runningBalance = openingBalance;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Report · FY {fiscalYear}</p>
          <h1 className="font-display text-2xl font-semibold text-dark mb-2">General Ledger</h1>
          <p className="font-mono text-secondary flex items-center gap-2">
            <Icon name="calendar_month" className="text-[16px]" />
            01 Apr {fiscalYear.split("-")[0]} — 31 Mar {parseInt(fiscalYear.split('-')[1]) + 2000}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="border-[0.5px] border-border px-4 py-2 text-ui-sm outline-none bg-surface" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
            <option value="">Select an account...</option>
            {leafAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.code} · {a.name}</option>
            ))}
          </select>
          <select className="border-[0.5px] border-border px-4 py-2 text-ui-sm outline-none bg-surface" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
            <option>2026-27</option>
            <option>2025-26</option>
          </select>
          <button onClick={() => showToast.info("Filters opened.")} className="btn-secondary flex items-center gap-2">
            <Icon name="filter_list" className="text-[18px]" />
            Filters
          </button>
          <button onClick={() => {
            if (!selectedAccount) { showToast.error("Select an account first."); return; }
            if (transactions.length === 0) { showToast.error("No transactions to export."); return; }
            const header = "Date,Narration,Voucher,Debit,Credit,Balance";
            const rows = transactions.map((t, i) => `${t.date},"${t.narration}",${t.voucherNumber},${t.debit},${t.credit},${openingBalance + transactions.slice(0, i + 1).reduce((s, x) => s + x.debit - x.credit, 0)}`);
            const csv = [header, ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ledger-${selectedAccount}-${fiscalYear}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast.success(`Ledger exported for ${transactions.length} transactions.`);
          }} className="btn-primary flex items-center gap-2 group">
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
                <h3 className="font-display text-lg text-display-lg text-on-surface">{leafAccounts.find((a) => a.id === selectedAccount)?.name}</h3>
                <p className="font-ui text-[11px] text-text-mid uppercase tracking-wider mt-1">{leafAccounts.find((a) => a.id === selectedAccount)?.code}</p>
              </div>
              <div className="text-right">
                <p className="font-ui text-[11px] text-text-mid uppercase tracking-wider mb-1">Opening Balance</p>
                <p className="font-mono-lg text-on-surface">₹ {formatIndianNumber(openingBalance, { currency: false })} <span className="text-text-light text-sm">{openingBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
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
                  transactions.map((txn, i) => {
                    runningBalance += txn.debit - txn.credit;
                    return (
                      <tr key={txn.id || i} className="hover:bg-surface-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm text-text-mid">{new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td className="py-3 px-4 font-ui text-[13px] text-on-surface">{txn.narration}</td>
                        <td className="py-3 px-4 font-mono text-sm text-amber-text">{txn.voucherNumber}</td>
                        <td className="py-3 px-4 font-mono text-sm text-right">{txn.debit > 0 ? `₹ ${formatIndianNumber(txn.debit, { currency: false })}` : ''}</td>
                        <td className="py-3 px-4 font-mono text-sm text-right">{txn.credit > 0 ? `₹ ${formatIndianNumber(txn.credit, { currency: false })}` : ''}</td>
                        <td className={`py-3 px-4 font-mono text-sm text-right ${runningBalance >= 0 ? '' : 'text-red-600'}`}>
                          ₹ {formatIndianNumber(Math.abs(runningBalance), { currency: false })} {runningBalance >= 0 ? 'Dr' : 'Cr'}
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
                <p className="font-mono-lg font-bold text-on-surface">₹ {formatIndianNumber(runningBalance, { currency: false })} <span className="text-text-light text-sm">{runningBalance >= 0 ? 'Dr' : 'Cr'}</span></p>
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
