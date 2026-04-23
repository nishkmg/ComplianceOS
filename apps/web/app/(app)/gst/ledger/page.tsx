// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function GSTLedgerPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);

  const { data: cashBalance } = api.gstLedger.cashBalance.useQuery({ periodMonth, periodYear });
  const { data: itcBalance } = api.gstLedger.itcBalance.useQuery({ periodMonth, periodYear });
  const { data: liabilityBalance } = api.gstLedger.liabilityBalance.useQuery({ periodMonth, periodYear });
  const { data: transactions } = api.gstLedger.ledgerTransactions.useQuery({ type: "cash", periodMonth, periodYear });

  const totalCashBalance = cashBalance?.balance ?? { igst: 0, cgst: 0, sgst: 0, cess: 0 };
  const totalITC = (itcBalance?.igst.closingBalance ?? 0) + (itcBalance?.cgst.closingBalance ?? 0) + (itcBalance?.sgst.closingBalance ?? 0) + (itcBalance?.cess.closingBalance ?? 0);
  const totalLiability = (liabilityBalance?.igst.output ?? 0) + (liabilityBalance?.cgst.output ?? 0) + (liabilityBalance?.sgst.output ?? 0) + (liabilityBalance?.cess.output ?? 0);
  const netLiability = Math.max(0, totalLiability - totalITC);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">GST Ledger</h1>
          <p className="font-ui text-[12px] text-light mt-1">Track GST liabilities, ITC, and cash balances</p>
        </div>
        <div className="flex gap-2">
          <Link href="/gst/payment" className="filter-tab active">Make Payment</Link>
          <Link href="/gst/payment/history" className="filter-tab">Payment History</Link>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
          <select value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))} className="input-field font-ui">
            {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
          <input type="number" value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))} className="input-field font-ui w-24" min={2000} max={2100} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Cash Balance</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(Object.values(totalCashBalance).reduce((a, b) => a + b, 0))}</p>
          <div className="mt-3 space-y-1 font-ui text-[11px] text-mid">
            <div className="flex justify-between"><span>IGST:</span><span className="font-mono">{formatIndianNumber(totalCashBalance.igst)}</span></div>
            <div className="flex justify-between"><span>CGST:</span><span className="font-mono">{formatIndianNumber(totalCashBalance.cgst)}</span></div>
            <div className="flex justify-between"><span>SGST:</span><span className="font-mono">{formatIndianNumber(totalCashBalance.sgst)}</span></div>
            <div className="flex justify-between"><span>Cess:</span><span className="font-mono">{formatIndianNumber(totalCashBalance.cess)}</span></div>
          </div>
          <Link href="/gst/ledger/cash" className="font-ui text-[12px] text-amber hover:underline mt-3 inline-block">View Details →</Link>
        </div>

        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">ITC Balance</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(totalITC)}</p>
          <div className="mt-3 space-y-1 font-ui text-[11px] text-mid">
            <div className="flex justify-between"><span>IGST:</span><span className="font-mono">{formatIndianNumber(itcBalance?.igst.closingBalance ?? 0)}</span></div>
            <div className="flex justify-between"><span>CGST:</span><span className="font-mono">{formatIndianNumber(itcBalance?.cgst.closingBalance ?? 0)}</span></div>
            <div className="flex justify-between"><span>SGST:</span><span className="font-mono">{formatIndianNumber(itcBalance?.sgst.closingBalance ?? 0)}</span></div>
            <div className="flex justify-between"><span>Cess:</span><span className="font-mono">{formatIndianNumber(itcBalance?.cess.closingBalance ?? 0)}</span></div>
          </div>
          <Link href="/gst/ledger/itc" className="font-ui text-[12px] text-amber hover:underline mt-3 inline-block">View Details →</Link>
        </div>

        <div className="card p-5">
          <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">Net Liability</p>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(netLiability)}</p>
          <div className="mt-3 space-y-1 font-ui text-[11px] text-mid">
            <div className="flex justify-between"><span>Total Payable:</span><span className="font-mono">{formatIndianNumber(totalLiability)}</span></div>
            <div className="flex justify-between"><span>Less ITC:</span><span className="font-mono">{formatIndianNumber(totalITC)}</span></div>
          </div>
          <Link href="/gst/payment" className="font-ui text-[12px] text-amber hover:underline mt-3 inline-block">Pay Now →</Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
          <h2 className="font-display text-[16px] font-normal text-dark">Recent Transactions</h2>
          <Link href="/gst/ledger/cash" className="font-ui text-[12px] text-amber hover:underline">View All →</Link>
        </div>
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Type</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Tax Type</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Balance</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Reference</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? (
              transactions.filter((t): t is typeof transactions[0] & { ledgerType: "cash" } => t.ledgerType === "cash").slice(0, 10).map((t) => (
                <tr key={t.id} className="border-b border-hairline">
                  <td className="font-mono text-[13px] text-light px-4 py-3">{t.transactionDate || new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><span className="font-ui text-[11px] px-2 py-0.5 rounded bg-surface-muted text-mid capitalize">{t.ledgerType}</span></td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3 uppercase">{t.taxType}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(t.amount)}</td>
                  <td className="font-mono text-[13px] text-right text-mid px-4 py-3">{formatIndianNumber(t.balance)}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{t.referenceNumber || t.challanNumber || "-"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center font-ui text-light">No transactions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
