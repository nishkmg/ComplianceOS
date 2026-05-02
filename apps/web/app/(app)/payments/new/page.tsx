"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";

// ─── Page Component ───────────────────────────────────────────────────────────

export default function NewPaymentPage() {
  const router = useRouter();
  const [type, setType] = useState<"receipt" | "payment">("receipt");
  const [customerName, setCustomerName] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const handleRecord = async () => {
    if (!customerName || !paymentAmount) {
      showToast.error("Please fill in required fields");
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showToast.success("Payment recorded successfully");
      router.push("/payments");
    } catch {
      showToast.error("Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div>
            <h1 className="font-display-lg text-display-lg text-dark">Record Transaction</h1>
            <p className="font-ui-xs text-[11px] text-mid mt-0.5">Record incoming or outgoing payments</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm"
          >
            Discard
          </button>
          <button
            onClick={handleRecord}
            disabled={saving || !paymentAmount}
            className="px-5 py-2 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all border-none rounded-sm shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Commit to Ledger"}
          </button>
        </div>
      </div>

      {/* Classification */}
      <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
        <div className="h-[2px] w-full bg-primary-container -mt-6 mb-6" />
        <h3 className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest mb-5 border-b border-border-subtle pb-2 font-bold">Classification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { value: "receipt" as const, title: "Payment Receipt", desc: "Recording funds received from a customer or client against invoices." },
            { value: "payment" as const, title: "Vendor Payment", desc: "Recording outward payments to suppliers or statutory bodies." },
          ].map(opt => (
            <div
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`relative p-5 border rounded-sm cursor-pointer transition-all ${
                type === opt.value
                  ? "border-primary-container bg-section-amber ring-1 ring-primary-container"
                  : "border-border-subtle bg-white hover:bg-section-muted"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-ui-sm text-[13px] font-bold text-dark">{opt.title}</span>
                <Icon
                  name={type === opt.value ? "radio_button_checked" : "radio_button_unchecked"}
                  size={18}
                  className={type === opt.value ? "text-primary-container shrink-0" : "text-lighter shrink-0"}
                />
              </div>
              <p className="font-ui-xs text-[11px] text-mid leading-relaxed">{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voucher details */}
      <div className="bg-white border border-border-subtle p-6 rounded-sm shadow-sm">
        <h3 className="font-ui-xs text-[10px] text-mid uppercase tracking-widest mb-5 border-b border-border-subtle pb-2 font-bold">Voucher Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Entity / Party Name</label>
            <input
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-2.5 text-[13px] font-ui-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              placeholder="Search customer or vendor..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Payment Date</label>
            <input
              type="date"
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-2.5 font-mono text-[13px] focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Payment Mode</label>
            <select
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-2.5 text-[13px] font-ui-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="online">Online Transfer / NEFT</option>
              <option value="bank">Cheque Deposit</option>
              <option value="cash">Cash in Hand</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block font-ui-xs text-[10px] text-mid uppercase tracking-widest font-bold">Reference / UTR</label>
            <input
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-2.5 font-mono text-[13px] uppercase focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors"
              placeholder="T241024…"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="block font-ui-xs text-[10px] text-primary-container uppercase tracking-widest font-bold">Amount Transacted (₹)</label>
            <input
              type="number"
              className="w-full bg-white border border-primary-container rounded-sm px-4 py-3.5 font-mono text-xl font-bold text-dark focus:ring-1 focus:ring-primary-container outline-none"
              placeholder="0.00"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Allocation hint */}
      {parseFloat(paymentAmount || "0") > 0 && (
        <div className="bg-amber-50 border border-amber/30 p-6 flex flex-col md:flex-row justify-between items-center gap-4 rounded-sm shadow-sm">
          <div>
            <h4 className="font-ui-xs text-[10px] font-bold text-amber-text uppercase tracking-widest mb-1">Allocation Required</h4>
            <p className="font-ui-sm text-[12px] text-amber-800 leading-relaxed">
              This {type} will be recorded as an unallocated credit/debit on the party ledger until matched against specific invoices.
            </p>
          </div>
          <button className="px-6 py-2.5 border border-amber-600 text-amber-700 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer bg-transparent rounded-sm whitespace-nowrap shrink-0">
            Open Allocation Wizard
          </button>
        </div>
      )}
    </div>
  );
}
