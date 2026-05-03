"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

interface Instalment {
  id: number;
  label: string;
  dueDate: string;
  percentage: string;
  amount: number;
  status: "paid" | "pending";
  datePaid: string;
}

const initialInstalments: Instalment[] = [
  { id: 1, label: "1st Instalment", dueDate: "15 Jun 2024", percentage: "15%", amount: 185175, status: "paid", datePaid: "12 Jun 2024" },
  { id: 2, label: "2nd Instalment", dueDate: "15 Sep 2024", percentage: "30%", amount: 370350, status: "paid", datePaid: "14 Sep 2024" },
  { id: 3, label: "3rd Instalment", dueDate: "15 Dec 2024", percentage: "30%", amount: 370350, status: "pending", datePaid: "—" },
  { id: 4, label: "4th Instalment", dueDate: "15 Mar 2025", percentage: "25%", amount: 308625, status: "pending", datePaid: "—" },
];

export default function ITRAdvanceTaxPage() {
  const { activeFy } = useFiscalYear();
  const router = useRouter();
  const [instalments, setInstalments] = useState<Instalment[]>(initialInstalments);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({ installmentId: 3, amount: "", date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalPaid = useMemo(() => instalments.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0), [instalments]);
  const totalPending = useMemo(() => instalments.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0), [instalments]);
  const completionPercent = useMemo(() => Math.round((totalPaid / (totalPaid + totalPending)) * 100), [totalPaid, totalPending]);
  const grandTotal = useMemo(() => instalments.reduce((s, i) => s + i.amount, 0), [instalments]);

  const handleExportLedger = () => {
    const rows = [["Instalment", "Due Date", "Target", "Amount", "Status", "Date Paid"]];
    instalments.forEach(i => {
      rows.push([i.label, i.dueDate, i.percentage, String(i.amount), i.status, i.datePaid]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `advance-tax-ledger-${activeFy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success("Ledger exported successfully");
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recordForm.amount || isNaN(Number(recordForm.amount)) || Number(recordForm.amount) <= 0) {
      errs.amount = "Enter a valid amount";
    }
    if (!recordForm.date) {
      errs.date = "Select a date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecordPayment = () => {
    if (!validateForm()) return;
    const inst = instalments.find(i => i.id === recordForm.installmentId);
    if (!inst) return;
    const amount = Number(recordForm.amount);
    if (amount > inst.amount) {
      showToast.error(`Amount exceeds instalment due of ₹${formatIndianNumber(inst.amount)}`);
      return;
    }
    setInstalments(prev => prev.map(i =>
      i.id === recordForm.installmentId
        ? { ...i, status: "paid" as const, datePaid: recordForm.date }
        : i
    ));
    setShowRecordModal(false);
    setRecordForm({ installmentId: 3, amount: "", date: "" });
    setErrors({});
    const ref = "CH-" + Date.now().toString(36).toUpperCase();
    showToast.success(`Payment of ₹${formatIndianNumber(amount)} recorded for ${inst.label}. Ref: ${ref}`);
  };

  const pendingInstalments = instalments.filter(i => i.status === "pending");

  return (
    <div className="space-y-0 text-left">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
        <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Tax Compliance Calendar</p>
        <h1 className="font-display text-2xl font-semibold text-dark mb-2">Advance Tax Tracking</h1>
        <p className="font-ui text-[13px] text-secondary max-w-2xl leading-relaxed">Ensure timely payment of advance tax instalments to avoid penal interest under Section 234B and 234C.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportLedger} className="px-5 py-2 border border-border text-dark font-ui text-[13px] rounded-md hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-surface shadow-sm uppercase font-bold tracking-widest">
            <Icon name="download" className="text-[18px]" /> Export Ledger
          </button>
          <button onClick={() => { setRecordForm({ installmentId: pendingInstalments[0]?.id ?? 3, amount: "", date: "" }); setErrors({}); setShowRecordModal(true); }} className="bg-amber text-white px-8 py-2.5 rounded-md font-ui text-[13px] hover:bg-amber-hover transition-colors cursor-pointer border-none shadow-sm uppercase font-bold tracking-widest">
            Record Payment
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-surface border border-border p-4 rounded-md flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="font-ui text-[10px] uppercase tracking-widest text-light font-bold">Payment Progress</span>
              <span className="font-mono text-[12px] font-bold text-dark">{completionPercent}%</span>
            </div>
            <div className="w-full bg-surface-muted rounded-full h-2.5">
              <div className="bg-amber h-2.5 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
          <div className="text-right flex gap-6">
            <div>
              <span className="font-ui text-[10px] uppercase text-light block">Paid</span>
              <span className="font-mono text-[14px] font-bold text-success">₹ {formatIndianNumber(totalPaid)}</span>
            </div>
            <div>
              <span className="font-ui text-[10px] uppercase text-light block">Pending</span>
              <span className="font-mono text-[14px] font-bold text-danger">₹ {formatIndianNumber(totalPending)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Liability Summary */}
        <section className="bg-dark text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border border-stone-950">
          <div className="text-left flex-1">
            <h3 className="text-amber-text font-ui text-lg font-bold mb-2">Projected Annual Liability</h3>
            <p className="text-light font-ui text-[13px] leading-relaxed">Based on your current fiscal P&L data and estimated non-business income for FY {activeFy}.</p>
          </div>
          <div className="text-right">
            <p className="text-light font-ui text-[10px] uppercase tracking-[0.2em] mb-2">Estimated Net Tax</p>
            <p className="font-mono text-4xl font-bold text-white">₹ {formatIndianNumber(grandTotal)}.00</p>
          </div>
        </section>

        {/* Instalment Table */}
        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-muted border-b border-border">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Instalment Schedule</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b-[0.5px] border-border">
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Instalment</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Due Date</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Target</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Amount (₹)</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Status</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
                {instalments.map((i) => (
                  <tr key={i.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-5 px-6 font-ui text-[13px] font-bold text-dark">{i.label}</td>
                    <td className="py-5 px-6 text-mid">{i.dueDate}</td>
                    <td className="py-5 px-6 text-mid">{i.percentage}</td>
                    <td className="py-5 px-6 text-right font-bold text-dark">{formatIndianNumber(i.amount)}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                        i.status === 'paid' ? 'bg-success-bg text-success border-green-200' : 'bg-amber-50 text-amber-text border-amber-200'
                      }`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right text-light">{i.datePaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowRecordModal(false)}>
          <div className="bg-surface rounded-xl shadow-2xl border border-border w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-semibold text-dark">Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} className="border-none bg-transparent cursor-pointer text-mid hover:text-dark"><Icon name="close" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="font-ui text-[10px] uppercase tracking-widest text-light font-bold block mb-1.5">Instalment</label>
                <select
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-[13px] text-dark outline-none"
                  value={recordForm.installmentId}
                  onChange={e => setRecordForm(prev => ({ ...prev, installmentId: Number(e.target.value) }))}
                >
                  {pendingInstalments.map(i => (
                    <option key={i.id} value={i.id}>{i.label} — ₹{formatIndianNumber(i.amount)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-ui text-[10px] uppercase tracking-widest text-light font-bold block mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  className={`w-full bg-surface border ${errors.amount ? 'border-danger' : 'border-border'} rounded-md px-4 py-3 font-mono text-[13px] text-dark outline-none`}
                  placeholder="Enter amount"
                  value={recordForm.amount}
                  onChange={e => setRecordForm(prev => ({ ...prev, amount: e.target.value }))}
                />
                {errors.amount && <p className="font-ui text-[11px] text-danger mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="font-ui text-[10px] uppercase tracking-widest text-light font-bold block mb-1.5">Payment Date</label>
                <input
                  type="date"
                  className={`w-full bg-surface border ${errors.date ? 'border-danger' : 'border-border'} rounded-md px-4 py-3 font-mono text-[13px] text-dark outline-none`}
                  value={recordForm.date}
                  onChange={e => setRecordForm(prev => ({ ...prev, date: e.target.value }))}
                />
                {errors.date && <p className="font-ui text-[11px] text-danger mt-1">{errors.date}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRecordModal(false)} className="flex-1 px-4 py-2.5 border border-border text-dark font-ui text-[13px] font-bold uppercase tracking-widest rounded-md bg-transparent cursor-pointer hover:bg-surface-muted transition-colors">Cancel</button>
                <button onClick={handleRecordPayment} className="flex-1 px-4 py-2.5 bg-amber text-white font-ui text-[13px] font-bold uppercase tracking-widest rounded-md border-none cursor-pointer hover:bg-amber-hover transition-colors shadow-sm">Record Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
