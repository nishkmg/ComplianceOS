"use client";

import { useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

const payments = [
  { id: "1", date: "12 Jun 2024", type: "Advance Tax", challanNo: "CH-88012", bsr: "0210452", amount: 185175, status: "completed", mode: "Net Banking" },
  { id: "2", date: "14 Sep 2024", type: "Advance Tax", challanNo: "CH-94210", bsr: "0210452", amount: 370350, status: "completed", mode: "Net Banking" },
  { id: "3", date: "15 Dec 2024", type: "Advance Tax", challanNo: "—", bsr: "—", amount: 370350, status: "pending", mode: "—" },
];

export default function ITRPaymentHistoryPage() {
  const { activeFy } = useFiscalYear();
  const totalPaid = useMemo(() => payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0), []);
  const totalPending = useMemo(() => payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0), []);
  const completedCount = useMemo(() => payments.filter(p => p.status === "completed").length, []);

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6 mt-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Statutory Records · FY {activeFy}</p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Income Tax Payments</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">Historical record of all tax payments, challans, and BSR-coded acknowledgements for current and previous assessment years.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-5 py-2.5 border border-border text-dark font-ui text-[13px] rounded-md hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-transparent uppercase font-bold tracking-widest shadow-sm">
            <Icon name="print" className="text-[18px]" /> Print History
          </button>
          <Link href="/itr/payment/recording" className="no-underline">
            <button className="bg-amber text-white px-6 py-2.5 rounded-md font-ui text-[13px] hover:bg-amber-hover transition-colors flex items-center gap-2 border-none shadow-sm font-bold uppercase tracking-widest cursor-pointer">
              <Icon name="add" className="text-[18px]" /> New Challan
            </button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface border border-border p-8 border-t-2 border-t-amber shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Total Paid (FY {activeFy})</p>
          <p className="font-mono text-3xl font-bold text-dark">₹ {formatIndianNumber(totalPaid)}</p>
        </div>
        <div className="bg-surface border border-border p-8 border-t-2 border-t-amber-500 shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Pending Liability</p>
          <p className="font-mono text-3xl font-bold text-amber">₹ {formatIndianNumber(totalPending)}</p>
        </div>
        <div className="bg-surface border border-border p-8 border-t-2 border-t-stone-800 shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Challan Records</p>
          <p className="font-mono text-3xl font-bold text-dark">{String(completedCount).padStart(2, "0")}</p>
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-surface-muted border-b border-border">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Payment & Challan Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-stone-100 text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Payment Date</th>
                <th className="py-4 px-6">Type / Description</th>
                <th className="py-4 px-6">Challan / BSR</th>
                <th className="py-4 px-6 text-right">Amount (₹)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 text-mid">{p.date}</td>
                  <td className="py-5 px-6 font-ui text-[13px] font-bold text-dark">
                    {p.type}
                    <p className="text-[10px] text-light mt-0.5 font-normal">{p.mode}</p>
                  </td>
                  <td className="py-5 px-6 text-mid">
                    <p>{p.challanNo}</p>
                    <p className="text-[10px]">{p.bsr}</p>
                  </td>
                  <td className="py-5 px-6 text-right font-bold text-dark">₹ {formatIndianNumber(p.amount)}</td>
                  <td className="py-5 px-6">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest border rounded-md ${
                      p.status === 'completed' ? 'bg-success-bg text-success-deep border-success/20' : 'bg-amber-soft text-amber border-amber-bright/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    {p.status === 'completed' ? (
                      <button onClick={() => showToast.success("Receipt downloaded.")} className="text-amber hover:text-primary font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Download</button>
                    ) : (
                      <button onClick={() => showToast.info("Record challan info to complete.")} className="text-amber hover:text-amber font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Record Info</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
