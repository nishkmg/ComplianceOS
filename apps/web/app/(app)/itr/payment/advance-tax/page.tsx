"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { assessmentYearFromFinancialYear } from "@/lib/assessment-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const installmentLabels: Record<number, string> = {
  1: "1st Instalment",
  2: "2nd Instalment",
  3: "3rd Instalment",
  4: "4th Instalment",
};

export default function ITRAdvanceTaxPage() {
  const { activeFy } = useFiscalYear();
  const assessmentYear = assessmentYearFromFinancialYear(activeFy);
  const utils = api.useUtils();

  const ledger = api.itrPayment.getAdvanceTaxLedger.useQuery({ assessmentYear }, { staleTime: 15_000 });

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({ installmentNumber: 1, amount: "", challanNumber: "", date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payAdvanceTax = api.itrPayment.payAdvanceTax.useMutation({
    onSuccess: (d) => {
      showToast.success(`Payment of {formatIndianNumber(d.paidAmount)} recorded for instalment ${d.installmentId.slice(0, 8)}.`);
      setShowRecordModal(false);
      setRecordForm({ installmentNumber: 1, amount: "", challanNumber: "", date: "" });
      setErrors({});
      void utils.itrPayment.getAdvanceTaxLedger.invalidate();
      void utils.itrPayment.getPaymentHistory.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const installments = ledger.data?.installments ?? [];
  const totalPayable = Number(ledger.data?.totalPayable ?? "0");
  const totalPaid = Number(ledger.data?.totalPaid ?? "0");
  const totalBalance = Number(ledger.data?.totalBalance ?? "0");
  const completionPercent = totalPayable > 0 ? Math.round((totalPaid / totalPayable) * 100) : 0;

  const handleExportLedger = () => {
    const rows = [["Instalment", "Due Date", "Payable", "Paid", "Balance", "Challan", "Paid Date"]];
    installments.forEach((i) => {
      rows.push([String(i.installmentNumber), i.dueDate ?? "", i.payableAmount, i.paidAmount, i.balance, i.challanNumber ?? "", i.paidDate ?? ""]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `advance-tax-ledger-${activeFy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recordForm.amount || Number(recordForm.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!recordForm.challanNumber.trim()) errs.challanNumber = "Enter the challan / reference number";
    if (!recordForm.date) errs.date = "Select the payment date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecordPayment = () => {
    if (!validateForm()) return;
    payAdvanceTax.mutate({
      assessmentYear,
      installmentNumber: recordForm.installmentNumber,
      amount: Number(recordForm.amount),
      challanNumber: recordForm.challanNumber.trim(),
      challanDate: recordForm.date,
    });
  };

  return (
    <div className="space-y-0 text-left">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Tax Compliance Calendar · AY {assessmentYear}</p>
          <PageHeader title="Advance Tax Tracking" />
          <p className="font-ui text-ui-sm text-secondary max-w-2xl leading-relaxed">Ensure timely payment of advance tax instalments to avoid penal interest under Section 234B and 234C.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportLedger} disabled={installments.length === 0} className="gap-2">
            <Icon name="download" className="text-ui-xl" /> Export Ledger
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { setRecordForm({ installmentNumber: 1, amount: "", challanNumber: "", date: "" }); setErrors({}); setShowRecordModal(true); }}>
            Record Payment
          </Button>
        </div>
      </div>

      {ledger.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : installments.length === 0 ? (
        <EmptyState
          icon="account_balance"
          title="No advance tax instalments yet"
          description="The instalment schedule is built from the ITR return's computed tax. Record the first payment to start the ledger."
        action={{ label: "Record First Payment", onClick: () => setShowRecordModal(true) }}
        />
      ) : (
        <>
          {/* Progress Bar */}
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-surface border border-border p-4 rounded-md flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">Payment Progress</span>
                  <span className="font-mono text-ui-xs font-bold text-dark">{completionPercent}%</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-2.5">
                  <div className="bg-amber h-2.5 rounded-full transition-[width]" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <div className="text-right flex gap-6">
                <div>
                  <span className="font-ui text-ui-2xs uppercase text-light block">Paid</span>
                  <span className="font-mono text-ui-md font-bold text-success">{formatIndianNumber(totalPaid)}</span>
                </div>
                <div>
                  <span className="font-ui text-ui-2xs uppercase text-light block">Balance</span>
                  <span className="font-mono text-ui-md font-bold text-danger">{formatIndianNumber(totalBalance)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto space-y-10">
            {/* Liability Summary */}
            <section className="bg-sidebar text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl border focus:border-focus">
              <div className="text-left flex-1">
                <h3 className="text-amber font-ui text-lg font-bold mb-2">Projected Annual Liability</h3>
                <p className="text-light font-ui text-ui-sm leading-relaxed">Total advance tax payable across instalments for AY {assessmentYear}.</p>
              </div>
              <div className="text-right">
                <p className="text-light font-ui text-ui-2xs uppercase tracking-[0.2em] mb-2">Estimated Net Tax</p>
                <p className="font-mono text-4xl font-bold text-white">{formatIndianNumber(totalPayable)}</p>
              </div>
            </section>

            {/* Instalment Table */}
            <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-surface-muted border-b border-border">
                <h3 className="font-ui text-sm font-bold text-dark uppercase tracking-wider text-ui-xs">Instalment Schedule</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-muted border-b-[0.5px] border-border">
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Instalment</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Due Date</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Payable (₹)</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Paid (₹)</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Balance (₹)</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Challan</th>
                      <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                    {installments.map((i) => {
                      const paid = Number(i.paidAmount) > 0;
                      return (
                        <tr key={i.id} className="hover:bg-surface-muted/30 transition-colors">
                          <td className="py-5 px-6 font-ui text-ui-sm font-bold text-dark">{installmentLabels[Number(i.installmentNumber)] ?? `Instalment ${i.installmentNumber}`}</td>
                          <td className="py-5 px-6 text-mid">{i.dueDate ?? "—"}</td>
                          <td className="py-5 px-6 text-right font-bold text-dark">{formatIndianNumber(i.payableAmount)}</td>
                          <td className="py-5 px-6 text-right text-success">{formatIndianNumber(i.paidAmount)}</td>
                          <td className="py-5 px-6 text-right text-danger">{formatIndianNumber(i.balance)}</td>
                          <td className="py-5 px-6 text-mid">{i.challanNumber ?? "—"}</td>
                          <td className="py-5 px-6">
                            <span className={`inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-wider border rounded-md ${paid ? "bg-success-bg text-success-deep border-success/20" : "bg-amber-soft text-amber border-amber-bright/30"}`}>
                              {paid ? "paid" : "pending"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowRecordModal(false)}>
          <div className="bg-surface rounded-xl shadow-2xl border border-border w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-ui text-lg font-semibold text-dark">Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} className="border-none bg-transparent cursor-pointer text-mid hover:text-dark"><Icon name="close" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold block mb-1.5" htmlFor="instalment">Instalment</label>
                <select
                  id="instalment"
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  value={recordForm.installmentNumber}
                  onChange={(e) => setRecordForm((prev) => ({ ...prev, installmentNumber: Number(e.target.value) }))}
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{installmentLabels[n]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold block mb-1.5" htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  type="number"
                  min={1}
                  className={`w-full bg-surface border ${errors.amount ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  placeholder="Enter amount"
                  value={recordForm.amount}
                  onChange={(e) => setRecordForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
                {errors.amount && <p className="font-ui text-ui-xs text-danger mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold block mb-1.5" htmlFor="challan">Challan / Reference Number</label>
                <input
                  id="challan"
                  type="text"
                  className={`w-full bg-surface border ${errors.challanNumber ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  placeholder="e.g. 021045209876"
                  value={recordForm.challanNumber}
                  onChange={(e) => setRecordForm((prev) => ({ ...prev, challanNumber: e.target.value }))}
                />
                {errors.challanNumber && <p className="font-ui text-ui-xs text-danger mt-1">{errors.challanNumber}</p>}
              </div>
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold block mb-1.5" htmlFor="date">Payment Date</label>
                <input
                  id="date"
                  type="date"
                  className={`w-full bg-surface border ${errors.date ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  value={recordForm.date}
                  onChange={(e) => setRecordForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                {errors.date && <p className="font-ui text-ui-xs text-danger mt-1">{errors.date}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowRecordModal(false)} className="flex-1 px-4 py-2.5 border border-border text-dark font-ui text-ui-sm font-bold uppercase tracking-widest rounded-md bg-transparent cursor-pointer hover:bg-surface-muted transition-colors">Cancel</button>
                <button onClick={handleRecordPayment} disabled={payAdvanceTax.isPending} className="flex-1 px-4 py-2.5 bg-amber text-white dark:text-amber-ink font-ui text-ui-sm font-bold uppercase tracking-widest rounded-md border-none cursor-pointer hover:bg-amber-hover transition-colors shadow-sm disabled:opacity-50">
                  {payAdvanceTax.isPending ? "Recording…" : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
