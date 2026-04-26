// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";

const months = [
  { value: 1, label: "April" }, { value: 2, label: "May" }, { value: 3, label: "June" },
  { value: 4, label: "July" }, { value: 5, label: "August" }, { value: 6, label: "September" },
  { value: 7, label: "October" }, { value: 8, label: "November" }, { value: 9, label: "December" },
  { value: 10, label: "January" }, { value: 11, label: "February" }, { value: 12, label: "March" },
];

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function LiabilityLedgerPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [filterTaxType, setFilterTaxType] = useState<string>("all");

  const { data: liabilityBalance } = api.gstLedger.liabilityBalance.useQuery({ periodMonth, periodYear });
  const { data: transactions } = api.gstLedger.ledgerTransactions.useQuery({ type: "liability", periodMonth, periodYear });
  const filteredTransactions = filterTaxType === "all" ? transactions : transactions?.filter(t => t.taxType === filterTaxType);
  const totalLiability = liabilityBalance ?? { igst: 0, cgst: 0, sgst: 0, cess: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="font-ui text-[12px] text-amber hover:underline">← Back to GST Ledger</Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">Liability Ledger</h1>
          <p className="font-ui text-[12px] text-light mt-1">Track GST output tax liability by tax head</p>
        </div>
        <Link href="/gst/payment" className="filter-tab active">Make Payment</Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
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
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Tax Type</label>
          <select value={filterTaxType} onChange={(e) => setFilterTaxType(e.target.value)} className="input-field font-ui">
            <option value="all">All Tax Types</option>
            <option value="igst">IGST</option>
            <option value="cgst">CGST</option>
            <option value="sgst">SGST</option>
            <option value="cess">Cess</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(totalLiability).map(([type, amount]) => (
          <div key={type} className="card p-4">
            <p className="font-ui text-[10px] uppercase tracking-wide text-light mb-1">{type.toUpperCase()} Liability</p>
            <p className="font-mono text-[20px] font-medium text-dark">{formatIndianNumber(amount as number)}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline">
          <h2 className="font-display text-[16px] font-normal text-dark">Liability Transactions</h2>
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
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => (
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
              <tr><td colSpan={6} className="px-4 py-12 text-center font-ui text-light">No liability transactions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
