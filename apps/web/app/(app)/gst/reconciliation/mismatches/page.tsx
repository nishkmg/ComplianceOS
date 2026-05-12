"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

const YEARS = [2024, 2025, 2026, 2027];

interface Mismatch {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierGstin: string;
  description: string;
  bookValue: number | null;
  returnValue: number | null;
  difference: number;
  status: "pending" | "accepted" | "rejected";
}

const MOCK_MISMATCHES: Mismatch[] = [
  { id: "1", invoiceNumber: "SUP-001", supplierName: "Acme Suppliers", supplierGstin: "27AABCU9603R1ZM", description: "Tax rate mismatch (12% vs 18%)", bookValue: 100000, returnValue: 118000, difference: 18000, status: "pending" },
  { id: "2", invoiceNumber: "SUP-003", supplierName: "Global Freight", supplierGstin: "33BABCR8902H1Z3", description: "ITC mismatch", bookValue: 200000, returnValue: 236000, difference: 36000, status: "pending" },
  { id: "3", invoiceNumber: "SUP-004", supplierName: "Stationery Mart", supplierGstin: "09AABCS4567K1Z9", description: "Supplier not filed return", bookValue: 12000, returnValue: 14160, difference: 2160, status: "pending" },
];

export default function GSTMismatchesPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);
  const [mismatches, setMismatches] = useState<Mismatch[]>(MOCK_MISMATCHES);

  const handleExportCSV = () => {
    if (mismatches.length === 0) { showToast.error("No mismatches to export."); return; }
    const header = "Invoice #,Supplier,GSTIN,Books Value,2B Value,Difference,Reason";
    const rows = mismatches.map(m =>
      `${m.invoiceNumber},"${m.supplierName}","${m.supplierGstin}",${m.bookValue ?? ""},${m.returnValue ?? ""},${m.difference},"${m.description}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `gst-mismatches-${periodYear}-${String(periodMonth).padStart(2, "0")}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast.success(`Exported ${mismatches.length} mismatches.`);
  };

  const handleAccept = (id: string) => {
    setMismatches(prev => prev.map(m => m.id === id ? { ...m, status: "accepted" as const } : m));
    showToast.success("Mismatch accepted. Book will be updated.");
  };

  const handleReject = (id: string) => {
    setMismatches(prev => prev.map(m => m.id === id ? { ...m, status: "rejected" as const } : m));
    showToast.success("Mismatch rejected. Supplier will be notified.");
  };

  const activeCount = mismatches.filter(m => m.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/gst/reconciliation" className="text-mid hover:text-dark transition-colors no-underline">
              <Icon name="arrow_back" size={20} />
            </Link>
            <h1 className="font-display text-display-lg font-semibold text-dark">GST Mismatches</h1>
            {activeCount > 0 && (
              <span className="font-mono text-[11px] bg-danger-bg text-danger px-2 py-0.5 rounded-sm font-bold">{activeCount} active</span>
            )}
          </div>
          <p className="font-ui text-[13px] text-secondary mt-1">
            {MONTHS.find((m) => m.value === periodMonth)?.label} {periodYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))} className="bg-surface border border-border px-3 py-2 text-[12px] font-ui outline-none rounded-md">
            {MONTHS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
          <select value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))} className="bg-surface border border-border px-3 py-2 text-[12px] font-ui outline-none rounded-md">
            {YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
          <button onClick={handleExportCSV} disabled={mismatches.length === 0} className="px-4 py-2 border border-border text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md disabled:opacity-30 flex items-center gap-1.5">
            <Icon name="download" size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Supplier</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">Books Value</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">2B Value</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right">Difference</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Reason</th>
                <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mismatches.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center font-ui text-[13px] text-mid">No mismatches found for this period.</td></tr>
              ) : mismatches.map((m) => (
                <tr key={m.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-[12px] text-dark">{m.invoiceNumber}</td>
                  <td className="py-4 px-5">
                    <div className="font-ui text-[13px] font-medium text-dark">{m.supplierName}</div>
                    <div className="font-mono text-[11px] text-mid">{m.supplierGstin}</div>
                  </td>
                  <td className={`py-4 px-5 font-mono text-[13px] tabular-nums text-right ${m.status === "rejected" ? "text-mid line-through" : "text-dark"}`}>{m.bookValue ? formatIndianNumber(m.bookValue) : "—"}</td>
                  <td className={`py-4 px-5 font-mono text-[13px] tabular-nums text-right ${m.status === "accepted" ? "text-mid line-through" : "text-dark"}`}>{m.returnValue ? formatIndianNumber(m.returnValue) : "—"}</td>
                  <td className={`py-4 px-5 font-mono text-[13px] tabular-nums text-right font-bold ${m.difference > 0 ? "text-danger" : "text-success"}`}>
                    {formatIndianNumber(Math.abs(m.difference))}
                    {m.status !== "pending" && <span className="ml-1 text-[10px] text-mid">({m.status})</span>}
                  </td>
                  <td className="py-4 px-5 font-ui text-[12px] text-mid">{m.description}</td>
                  <td className="py-4 px-5">
                    {m.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAccept(m.id)} className="font-ui text-[11px] font-bold uppercase tracking-widest text-success hover:text-success border-none bg-transparent cursor-pointer">Accept</button>
                        <button onClick={() => handleReject(m.id)} className="font-ui text-[11px] font-bold uppercase tracking-widest text-danger hover:text-danger border-none bg-transparent cursor-pointer">Reject</button>
                      </div>
                    ) : (
                      <span className="font-ui text-[11px] text-mid capitalize">{m.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mismatches.length > 0 && (
        <p className="font-ui text-[12px] text-mid">Showing {mismatches.length} mismatch{mismatches.length !== 1 ? "es" : ""}. {activeCount > 0 ? `${activeCount} pending resolution.` : "All resolved."}</p>
      )}
    </div>
  );
}
