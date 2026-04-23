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

export default function PaymentHistoryPage() {
  const [filterPeriod, setFilterPeriod] = useState<number | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);

  const { data: payments } = api.gstPayment.paymentHistory.useQuery();

  const filteredPayments = payments?.filter((p) => {
    if (filterPeriod === undefined && filterYear === undefined) return true;
    const challanMonth = p.challanDate ? new Date(p.challanDate).getMonth() + 1 : null;
    const challanYear = p.challanDate ? new Date(p.challanDate).getFullYear() : null;
    if (filterPeriod !== undefined && challanMonth !== filterPeriod) return false;
    if (filterYear !== undefined && challanYear !== filterYear) return false;
    return true;
  });

  const handleDownloadChallan = (challan: any) => {
    const content = `CHALLAN DETAILS\n===============\n\nChallan Number: ${challan.challanNumber}\nChallan Date: ${challan.challanDate}\nPayment Date: ${challan.paymentDate}\nBank: ${challan.bankName}\n\nTax Breakdown:\n${challan.taxBreakdown.map((b: any) => `  ${b.taxType.toUpperCase()}: ₹${b.amount.toLocaleString("en-IN")}`).join("\n")}\n\nTotal Amount: ₹${challan.totalAmount.toLocaleString("en-IN")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${challan.challanNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="font-ui text-[12px] text-amber hover:underline">← Back to GST Ledger</Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">Payment History</h1>
        </div>
        <Link href="/gst/payment" className="filter-tab active">Make Payment</Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
          <select value={filterPeriod ?? ""} onChange={(e) => setFilterPeriod(e.target.value ? Number(e.target.value) : undefined)} className="input-field font-ui">
            <option value="">All Months</option>
            {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
          <input type="number" placeholder="Year" value={filterYear ?? ""} onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)} className="input-field font-ui w-28" min={2000} max={2100} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Challan No.</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Bank</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Amount</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Mode</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments && filteredPayments.length > 0 ? (
              filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-hairline">
                  <td className="font-mono text-[13px] text-amber px-4 py-3">{p.challanNumber}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{p.challanDate}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3">{p.bankName}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(p.totalAmount)}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3 capitalize">{p.mode}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDownloadChallan(p)} className="font-ui text-[12px] text-amber hover:underline">Download</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center font-ui text-light">No payment history found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
