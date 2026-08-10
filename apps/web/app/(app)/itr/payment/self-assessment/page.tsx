"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { assessmentYearFromFinancialYear } from "@/lib/assessment-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function ITRSelfAssessmentPage() {
  const { activeFy } = useFiscalYear();
  const assessmentYear = assessmentYearFromFinancialYear(activeFy);
  const utils = api.useUtils();

  const details = api.itrPayment.getSelfAssessmentDetails.useQuery({ assessmentYear }, { staleTime: 15_000 });

  const [form, setForm] = useState({ amount: "", challanNumber: "", date: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const paySelfAssessmentTax = api.itrPayment.paySelfAssessmentTax.useMutation({
    onSuccess: (d) => {
      showToast.success(`Self-assessment tax of ₹${formatIndianNumber(d.paidAmount)} recorded (challan ${d.challanNumber}).`);
      setForm({ amount: "", challanNumber: "", date: "" });
      setErrors({});
      void utils.itrPayment.getSelfAssessmentDetails.invalidate();
      void utils.itrPayment.getPaymentHistory.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const d = details.data;
  const taxPayable = Number(d?.taxPayable ?? "0");
  const advanceTaxPaid = Number(d?.advanceTaxPaid ?? "0");
  const tdsTcsCredit = Number(d?.tdsTcsCredit ?? "0");
  const paidAmount = Number(d?.paidAmount ?? "0");
  const balancePayable = Number(d?.balancePayable ?? "0");

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.amount || Number(form.amount) <= 0) errs.amount = "Enter a valid amount";
    if (!form.challanNumber.trim()) errs.challanNumber = "Enter the challan / reference number";
    if (!form.date) errs.date = "Select the payment date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePayNow = () => {
    if (!validateForm()) return;
    paySelfAssessmentTax.mutate({
      assessmentYear,
      amount: Number(form.amount),
      challanNumber: form.challanNumber.trim(),
      challanDate: form.date,
    });
  };

  const rows = [
    { label: "Tax Payable (computed on return)", value: taxPayable },
    { label: "Advance Tax Paid", value: advanceTaxPaid },
    { label: "TDS / TCS Credit", value: tdsTcsCredit },
    { label: "Self-Assessment Paid", value: paidAmount },
  ];

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12">
        <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">AY {assessmentYear} · FY {activeFy}</p>
        <h1 className="font-ui text-2xl font-semibold text-dark mb-2">Self-Assessment Tax</h1>
        <p className="font-ui text-ui-sm text-secondary max-w-2xl leading-relaxed">Review your total tax liability, apply available credits, and record the final self-assessment tax payment before filing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Computation Table */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden border-t-2 border-t-amber">
            <div className="p-6 border-b border-border bg-surface-muted">
              <h3 className="font-ui text-lg font-bold text-dark">Tax Computation Summary</h3>
            </div>
            {details.isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
              </div>
            ) : (
              <div className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                {rows.map((row) => (
                  <div key={row.label} className="flex justify-between items-center px-6 py-4">
                    <span className="font-ui text-ui-xs uppercase tracking-wider text-mid">{row.label}</span>
                    <span className="text-dark tabular-nums">₹ {formatIndianNumber(row.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-6 py-5 bg-surface-muted font-bold">
                  <span className="font-ui text-ui-xs uppercase tracking-widest text-dark">Balance Payable</span>
                  <span className="text-danger tabular-nums">₹ {formatIndianNumber(balancePayable)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Record Payment */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-dark text-white p-8 rounded-md shadow-xl border focus:border-focus">
            <h3 className="font-ui text-lg font-bold text-amber-bright mb-6">Record Self-Assessment Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-white font-bold block mb-1.5" htmlFor="sa-amount">Amount (₹)</label>
                <input
                  id="sa-amount"
                  type="number"
                  min={1}
                  className={`w-full bg-surface border ${errors.amount ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  placeholder={balancePayable > 0 ? `Balance due: ${formatIndianNumber(balancePayable)}` : "Enter amount"}
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
                {errors.amount && <p className="font-ui text-ui-xs text-danger mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-white font-bold block mb-1.5" htmlFor="sa-challan">Challan / Reference Number</label>
                <input
                  id="sa-challan"
                  type="text"
                  className={`w-full bg-surface border ${errors.challanNumber ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  placeholder="e.g. 021045209876"
                  value={form.challanNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, challanNumber: e.target.value }))}
                />
                {errors.challanNumber && <p className="font-ui text-ui-xs text-danger mt-1">{errors.challanNumber}</p>}
              </div>
              <div>
                <label className="font-ui text-ui-2xs uppercase tracking-widest text-white font-bold block mb-1.5" htmlFor="sa-date">Payment Date</label>
                <input
                  id="sa-date"
                  type="date"
                  className={`w-full bg-surface border ${errors.date ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-ui-sm text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`}
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                {errors.date && <p className="font-ui text-ui-xs text-danger mt-1">{errors.date}</p>}
              </div>
              <Button
                className="w-full gap-2"
                onClick={handlePayNow}
                disabled={paySelfAssessmentTax.isPending}
              >
                {paySelfAssessmentTax.isPending ? "Recording…" : "Record Payment"} <Icon name="arrow_forward" className="text-sm" />
              </Button>
            </div>
          </div>

          {!details.isLoading && d?.challanNumber && (
            <div className="bg-surface border border-border p-6 shadow-sm text-left">
              <div className="flex items-start gap-3">
                <Icon name="receipt" className="text-amber" />
                <div>
                  <h4 className="font-ui text-ui-sm font-bold text-dark text-xs uppercase tracking-widest mb-1">Latest Payment</h4>
                  <p className="font-ui text-ui-sm text-mid leading-relaxed">
                    Challan {d.challanNumber} · ₹{formatIndianNumber(paidAmount)} on {d.paidDate ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
