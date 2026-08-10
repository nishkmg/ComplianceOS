"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { assessmentYearFromFinancialYear } from "@/lib/assessment-year";
import { api } from "@/lib/api";

const PAYMENT_TYPES = [
  { id: "100", name: "Advance Tax", code: "100" },
  { id: "300", name: "Self Assessment", code: "300" },
  { id: "400", name: "Tax on Regular Assessment", code: "400" },
];

export default function ITRRecordPaymentPage() {
  const { activeFy } = useFiscalYear();
  const assessmentYear = assessmentYearFromFinancialYear(activeFy);
  const utils = api.useUtils();

  const [type, setType] = useState("100");
  const [bsr, setBsr] = useState("");
  const [serial, setSerial] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const commit = api.itrPayment.paySelfAssessmentTax.useMutation({
    onSuccess: (d) => {
      showToast.success(`Payment of ₹${Number(d.paidAmount).toLocaleString("en-IN")} committed (challan ${d.challanNumber}).`);
      setBsr(""); setSerial(""); setDate(""); setAmount(""); setErrors({});
      void utils.itrPayment.getPaymentHistory.invalidate();
      void utils.itrPayment.getSelfAssessmentDetails.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const handleCommit = () => {
    const errs: Record<string, string> = {};
    if (bsr.length !== 7) errs.bsr = "BSR code must be 7 digits";
    if (serial.length === 0) errs.serial = "Enter the challan serial number";
    if (!date) errs.date = "Select the deposit date";
    if (!amount || Number(amount) <= 0) errs.amount = "Enter a valid amount";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    commit.mutate({
      assessmentYear,
      amount: Number(amount),
      challanNumber: `${bsr}${serial}`,
      challanDate: date,
    });
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="bg-surface border-b-[0.5px] border-border px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-8 -mt-8 mb-8 sticky top-0 z-20 backdrop-blur-sm bg-surface/50">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2 flex items-center gap-2">
            <span>Ledger</span>
            <Icon name="chevron_right" className="text-ui-md" />
            <span>Tax Payments</span>
          </p>
          <h1 className="font-ui text-display-lg font-semibold text-dark">Record ITR Payment</h1>
          <p className="font-ui text-ui-sm text-text-mid mt-1">AY {assessmentYear} — enter the challan details from your bank payment.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCommit}
            disabled={commit.isPending}
            className="bg-amber text-white px-6 py-2.5 rounded-md font-ui text-ui-sm font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors border-none cursor-pointer shadow-sm disabled:opacity-50"
          >
            {commit.isPending ? "Committing…" : "Commit to Ledger"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10 pb-12">
        {/* Section 1: Payment Type */}
        <div className="bg-surface border border-border p-8 shadow-sm">
          <h3 className="font-ui text-lg font-bold text-dark mb-6">Payment Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAYMENT_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                aria-pressed={type === item.id}
                className={`relative p-4 border rounded-md transition-colors cursor-pointer text-left ${type === item.id ? "border-amber bg-amber-50 ring-1 ring-amber" : "border-border bg-surface hover:bg-surface-muted"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-ui text-ui-sm font-bold text-dark">{item.name}</span>
                  <Icon name={type === item.id ? "radio_button_checked" : "radio_button_unchecked"} className={`text-ui-xl ${type === item.id ? "text-amber" : "text-lighter"}`} />
                </div>
                <p className="font-mono text-ui-xs text-mid uppercase">Code: {item.code}</p>
              </button>
            ))}
          </div>
          <p className="font-ui text-ui-2xs text-light mt-3">
            {type === "100" ? "Advance tax is recorded against the advance tax ledger's payable balance." : "Self-assessment and regular-assessment payments settle the return's balance payable."}
          </p>
        </div>

        {/* Section 2: Details */}
        <div className="bg-surface border border-border p-8 shadow-sm">
          <h3 className="font-ui text-lg font-bold text-dark mb-6">Challan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="challan-bsr" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">BSR Code (7 Digits)</label>
              <input id="challan-bsr" className={`w-full bg-surface-muted border ${errors.bsr ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`} placeholder="0000000" maxLength={7} value={bsr} onChange={(e) => setBsr(e.target.value.replace(/\D/g, ""))} />
              {errors.bsr && <p className="font-ui text-ui-xs text-danger mt-1">{errors.bsr}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="challan-serial" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Challan Serial Number</label>
              <input id="challan-serial" className={`w-full bg-surface-muted border ${errors.serial ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`} placeholder="00000" maxLength={5} value={serial} onChange={(e) => setSerial(e.target.value.replace(/\D/g, ""))} />
              {errors.serial && <p className="font-ui text-ui-xs text-danger mt-1">{errors.serial}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="challan-date" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Date of Deposit</label>
              <input id="challan-date" className={`w-full bg-surface-muted border ${errors.date ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-ui text-ui-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              {errors.date && <p className="font-ui text-ui-xs text-danger mt-1">{errors.date}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="challan-amount" className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Total Amount Paid (₹)</label>
              <input id="challan-amount" className={`w-full bg-surface border ${errors.amount ? "border-danger" : "border-border"} rounded-md px-4 py-3 font-mono text-lg font-bold text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`} placeholder="0.00" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              {errors.amount && <p className="font-ui text-ui-xs text-danger mt-1">{errors.amount}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/itr/payment/history" className="font-ui text-ui-xs text-amber uppercase tracking-widest font-bold hover:underline no-underline">
            View payment history →
          </Link>
        </div>
      </div>
    </div>
  );
}
