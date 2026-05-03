"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

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

// Mock transactions by quarter: Q1 (months 1-3: Apr-Jun), Q2 (4-6: Jul-Sep), Q3 (7-9: Oct-Dec), Q4 (10-12: Jan-Mar)
const mockDataByQuarter: Record<string, Array<{ id: string; date: string; type: string; taxType: string; amount: number; balance: number; ref: string }>> = {
  Q1: [
    { id: "1", date: "15 Jun 24", type: "ITC Claim", taxType: "IGST", amount: 98000, balance: 1205000, ref: "GSTR-2B" },
    { id: "2", date: "20 May 24", type: "Tax Offset", taxType: "CGST", amount: -32000, balance: 1107000, ref: "GSTR-3B" },
    { id: "3", date: "05 Apr 24", type: "Opening Balance", taxType: "IGST", amount: 124500, balance: 1139500, ref: "Ledger B/F" },
  ],
  Q2: [
    { id: "4", date: "15 Sep 24", type: "ITC Claim", taxType: "IGST", amount: 156000, balance: 2120400, ref: "GSTR-2B" },
    { id: "5", date: "10 Aug 24", type: "Tax Offset", taxType: "SGST", amount: -28000, balance: 1964400, ref: "GSTR-3B" },
    { id: "6", date: "25 Jul 24", type: "Cash Deposit", taxType: "Cess", amount: 45000, balance: 1992400, ref: "CH-44102" },
  ],
  Q3: [
    { id: "7", date: "15 Oct 24", type: "ITC Claim", taxType: "IGST", amount: 124500, balance: 4520500, ref: "GSTR-2B" },
    { id: "8", date: "10 Oct 24", type: "Tax Offset", taxType: "CGST", amount: -45000, balance: 4396000, ref: "GSTR-3B" },
    { id: "9", date: "05 Oct 24", type: "Cash Deposit", taxType: "Cess", amount: 25000, balance: 4421000, ref: "CH-88012" },
  ],
  Q4: [
    { id: "10", date: "15 Mar 25", type: "ITC Claim", taxType: "IGST", amount: 210000, balance: 6850000, ref: "GSTR-2B" },
    { id: "11", date: "28 Feb 25", type: "Tax Offset", taxType: "CGST", amount: -52000, balance: 6640000, ref: "GSTR-3B" },
    { id: "12", date: "10 Jan 25", type: "Cash Deposit", taxType: "IGST", amount: 75000, balance: 6692000, ref: "CH-99123" },
    { id: "13", date: "05 Jan 25", type: "ITC Claim", taxType: "SGST", amount: 98500, balance: 6617000, ref: "GSTR-2B" },
  ],
};

function getQuarter(month: number): string {
  if (month >= 1 && month <= 3) return "Q1";
  if (month >= 4 && month <= 6) return "Q2";
  if (month >= 7 && month <= 9) return "Q3";
  return "Q4";
}

export default function GSTLedgerPage() {
  const { activeFy } = useFiscalYear();
  const [month, setMonth] = useState(7);
  const [year, setYear] = useState(2024);

  const transactions = useMemo(() => {
    const quarter = getQuarter(month);
    return mockDataByQuarter[quarter] ?? mockDataByQuarter.Q3;
  }, [month]);

  const handleExportCSV = () => {
    const rows = [["Date", "Description", "Type", "Tax Type", "Amount", "Running Balance"]];
    transactions.forEach(t => {
      rows.push([t.date, `${t.type} (${t.ref})`, "Credit", t.taxType, String(t.amount), String(t.balance)]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-ledger-${month}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("CSV exported successfully");
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-ledger-${month}-${year}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("JSON downloaded successfully");
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border pb-8 mt-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-dark mb-2">Electronic Credit Ledger</h1>
          <p className="font-ui text-[13px] text-secondary">Statement of Input Tax Credit for <span className="font-mono text-dark font-bold text-[13px]">GSTIN: 27AACPB1234F1Z5</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] uppercase text-mid font-bold tracking-widest">Tax Period</label>
            <div className="flex gap-2">
              <select className="bg-surface-muted border border-border rounded-md py-2 px-3 text-xs outline-none focus:border-primary" value={month} onChange={e => setMonth(Number(e.target.value))}>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select className="bg-surface-muted border border-border rounded-md py-2 px-3 text-xs outline-none focus:border-primary" value={year} onChange={e => setYear(Number(e.target.value))}>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Balances Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border border-t-2 border-t-amber p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-light uppercase font-bold tracking-widest mb-4">Integrated Tax (IGST)</h3>
          <p className="font-mono text-2xl font-bold text-dark">₹ 2,45,600.00</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-light">Electronic Cash</span>
             <span className="text-dark">₹ 45,000.00</span>
          </div>
        </div>
        <div className="bg-surface border border-border border-t-2 border-t-amber p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-light uppercase font-bold tracking-widest mb-4">Central Tax (CGST)</h3>
          <p className="font-mono text-2xl font-bold text-dark">₹ 1,12,040.50</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-light">Electronic Cash</span>
             <span className="text-dark">₹ 12,000.00</span>
          </div>
        </div>
        <div className="bg-surface border border-border border-t-2 border-t-amber p-6 shadow-sm hover:shadow-md transition-shadow text-left">
          <h3 className="text-[10px] text-light uppercase font-bold tracking-widest mb-4">State Tax (SGST)</h3>
          <p className="font-mono text-2xl font-bold text-dark">₹ 1,12,040.50</p>
          <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between text-[11px] font-bold uppercase tracking-widest">
             <span className="text-light">Electronic Cash</span>
             <span className="text-dark">₹ 12,000.00</span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Ledger Transaction History</h3>
            <div className="flex gap-3">
              <button onClick={handleDownloadJSON} className="text-mid hover:text-dark font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Download JSON</button>
              <button onClick={handleExportCSV} className="text-primary hover:text-amber-stitch font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer">Export CSV</button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-stone-100 text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description / Ref</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Tax Type</th>
                <th className="py-4 px-6 text-right">Amount (₹)</th>
                <th className="py-4 px-6 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 text-mid">{t.date}</td>
                  <td className="py-5 px-6 text-left">
                    <div className="font-ui text-[13px] font-bold text-dark text-sm">{t.type}</div>
                    <div className="text-[11px] text-light mt-0.5">{t.ref}</div>
                  </td>
                  <td className="py-5 px-6 font-ui text-[10px] uppercase font-bold text-mid">Credit</td>
                  <td className="py-5 px-6 font-ui text-[13px] font-bold text-dark">{t.taxType}</td>
                  <td className={`py-5 px-6 text-right font-bold ${t.amount < 0 ? 'text-danger' : 'text-success'}`}>
                    {t.amount < 0 ? `(${formatIndianNumber(Math.abs(t.amount))})` : formatIndianNumber(t.amount)}
                  </td>
                  <td className="py-5 px-6 text-right text-dark">₹ {formatIndianNumber(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
