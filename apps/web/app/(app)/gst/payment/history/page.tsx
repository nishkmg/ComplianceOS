"use client";

import { useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

const mockPayments = [
  { id: "1", date: "24 Oct 2024", cpin: "CPIN-880120421", head: "IGST", amount: 425000, status: "paid" },
  { id: "2", date: "24 Oct 2024", cpin: "CPIN-880120422", head: "CGST", amount: 120000, status: "paid" },
  { id: "3", date: "12 Sep 2024", cpin: "CPIN-874512309", head: "SGST", amount: 120000, status: "paid" },
  { id: "4", date: "12 Sep 2024", cpin: "CPIN-874512310", head: "IGST", amount: 380000, status: "paid" },
];

export default function GSTPaymentHistoryPage() {
  const { activeFy } = useFiscalYear();
  const totalPaid = useMemo(() => mockPayments.reduce((s, p) => s + p.amount, 0), []);

  const handleExportCSV = () => {
    if (mockPayments.length === 0) { showToast.error("No payments to export."); return; }
    const header = "Date,CPIN,Tax Head,Amount,Status";
    const rows = mockPayments.map(p => `${p.date},${p.cpin},${p.head},${p.amount},${p.status}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `gst-payments-${activeFy}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast.success(`Exported ${mockPayments.length} payments.`);
  };

  return (
    <div className="space-y-0 text-left">
      {/* Header */}
      <header className="px-gutter-desktop pt-10 pb-8 flex justify-between items-end mt-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Electronic Cash Ledger</p>
          <h1 className="font-display text-display-lg text-dark">GST Payment History</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => showToast.info("Filter by period: FY " + activeFy)} className="flex items-center gap-2 px-5 py-2 border border-border bg-surface font-ui text-[13px] font-bold uppercase tracking-widest text-mid rounded-md hover:shadow-sm transition-shadow cursor-pointer">
            <Icon name="filter_list" className="text-[18px]" /> FY {activeFy}
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2 border border-border bg-surface font-ui text-[13px] font-bold uppercase tracking-widest text-mid rounded-md hover:shadow-sm transition-shadow cursor-pointer">
            <Icon name="download" className="text-[18px]" /> Export CSV
          </button>
        </div>
      </header>

      <div className="overflow-y-auto pb-12">
        {/* Summary Bar */}
        <div className="bg-surface border border-border p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2 font-bold">Total Paid (FY {activeFy})</p>
            <p className="font-mono text-3xl font-bold text-dark">₹ {formatIndianNumber(totalPaid)}</p>
          </div>
          <div className="w-[1px] h-12 bg-border-subtle hidden md:block"></div>
          <div className="text-left md:text-right">
            <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2 font-bold">Last Update</p>
            <p className="font-mono text-sm text-mid">12 Nov 2024, 14:32 IST</p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="h-[2px] w-full bg-amber"></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-muted border-b-[0.5px] border-border">
                <tr>
                  <th className="py-4 px-6 font-ui text-[10px] text-light font-bold uppercase tracking-widest">Payment Date</th>
                  <th className="py-4 px-6 font-ui text-[10px] text-light font-bold uppercase tracking-widest">Challan ID (CPIN)</th>
                  <th className="py-4 px-6 font-ui text-[10px] text-light font-bold uppercase tracking-widest">Tax Head</th>
                  <th className="py-4 px-6 font-ui text-[10px] text-light font-bold uppercase tracking-widest text-right">Amount (₹)</th>
                  <th className="py-4 px-6 font-ui text-[10px] text-light font-bold uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {mockPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-5 px-6 text-mid">{p.date}</td>
                    <td className="py-5 px-6 font-mono text-sm text-dark">{p.cpin}</td>
                    <td className="py-5 px-6 font-ui text-[13px] font-bold uppercase">{p.head}</td>
                    <td className="py-5 px-6 text-right font-bold text-dark">₹ {formatIndianNumber(p.amount)}</td>
                    <td className="py-5 px-6 text-center">
                      <span className="inline-block px-2 py-0.5 bg-success-bg text-success border border-green-200 text-[9px] font-bold uppercase rounded-md">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
