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

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
const taxTypes = ["igst", "cgst", "sgst", "cess"] as const;

export default function GSTPaymentPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [isGenerating, setIsGenerating] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<"online" | "offline">("online");
  const [bankName, setBankName] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const { data: liabilityBalance } = api.gstLedger.liabilityBalance.useQuery({ periodMonth, periodYear });
  const { data: itcBalance } = api.gstLedger.itcBalance.useQuery({ periodMonth, periodYear });

  const calculateUtilization = () => {
    const liability = liabilityBalance;
    const itc = itcBalance;
    if (!liability || !itc) return null;

    const breakdown = taxTypes.map((type) => {
      const output = liability[type]?.output ?? 0;
      const itcAvailable = itc[type]?.closingBalance ?? 0;
      const utilized = Math.min(output, itcAvailable);
      const cashRequired = output - utilized;
      return { taxType: type, output, itcAvailable, utilized, cashRequired };
    });

    const totalOutput = breakdown.reduce((sum, b) => sum + b.output, 0);
    const totalITCUtilized = breakdown.reduce((sum, b) => sum + b.utilized, 0);
    const totalCashRequired = breakdown.reduce((sum, b) => sum + b.cashRequired, 0);
    return { breakdown, totalOutput, totalITCUtilized, totalCashRequired };
  };

  const utilization = calculateUtilization();
  const createChallan = api.gstPayment.createChallan.useMutation();
  const payGst = api.gstPayment.payGst.useMutation();

  const handleGenerateChallan = async () => {
    setIsGenerating(true);
    try {
      const result = await createChallan.mutateAsync({ periodMonth, periodYear });
      setChallanData(result);
    } catch (error) {
      console.error("Failed to generate challan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePay = async () => {
    if (!challanData) return;
    setIsPaying(true);
    try {
      const challanId = btoa(JSON.stringify(challanData));
      await payGst.mutateAsync({ challanId, mode: paymentMode, bankName: bankName || undefined });
      setChallanData(null);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="font-ui text-[12px] text-amber hover:underline">← Back to GST Ledger</Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">GST Payment</h1>
        </div>
        <Link href="/gst/payment/history" className="filter-tab">Payment History</Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month</label>
          <select value={periodMonth} onChange={(e) => setPeriodMonth(Number(e.target.value))} className="input-field font-ui">
            {months.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year</label>
          <input type="number" value={periodYear} onChange={(e) => setPeriodYear(Number(e.target.value))} className="input-field font-ui w-24" min={2000} max={2100} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Tax Payable Breakdown</h2>
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Tax Type</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Output Tax</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">ITC Available</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">ITC Utilized</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Cash Required</th>
            </tr>
          </thead>
          <tbody>
            {utilization?.breakdown.map((b) => (
              <tr key={b.taxType} className="border-b border-hairline">
                <td className="px-4 py-3"><span className="font-ui text-[11px] px-2 py-0.5 rounded bg-surface-muted text-mid uppercase">{b.taxType}</span></td>
                <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(b.output)}</td>
                <td className="font-mono text-[13px] text-right text-success px-4 py-3">{formatIndianNumber(b.itcAvailable)}</td>
                <td className="font-mono text-[13px] text-right text-amber px-4 py-3">{formatIndianNumber(b.utilized)}</td>
                <td className="font-mono text-[13px] text-right font-medium text-dark px-4 py-3">{formatIndianNumber(b.cashRequired)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-dark font-medium">
              <td className="px-4 py-3 font-ui text-[13px] text-dark">Total</td>
              <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(utilization?.totalOutput ?? 0)}</td>
              <td className="font-mono text-[13px] text-right text-mid px-4 py-3">—</td>
              <td className="font-mono text-[13px] text-right text-amber px-4 py-3">{formatIndianNumber(utilization?.totalITCUtilized ?? 0)}</td>
              <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(utilization?.totalCashRequired ?? 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {challanData ? (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Challan Details</h2>
          <div className="space-y-3 mb-6 font-ui text-[13px]">
            <div className="flex justify-between"><span className="text-light">Challan Number:</span><span className="font-mono text-dark">{challanData.challanNumber}</span></div>
            <div className="flex justify-between"><span className="text-light">Challan Date:</span><span className="font-mono text-dark">{challanData.challanDate}</span></div>
            <div className="flex justify-between"><span className="text-light">Total Amount:</span><span className="font-mono text-[16px] font-bold text-dark">{formatIndianNumber(challanData.totalAmount)}</span></div>
          </div>

          <div className="border-t border-hairline pt-4">
            <h3 className="font-display text-[14px] font-normal text-dark mb-3">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="font-ui text-[10px] uppercase tracking-wide text-light">Payment Mode</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as "online" | "offline")} className="input-field font-ui w-48">
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              {paymentMode === "offline" && (
                <div className="flex flex-col gap-1">
                  <label className="font-ui text-[10px] uppercase tracking-wide text-light">Bank Name</label>
                  <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Enter bank name" className="input-field font-ui w-48" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handlePay} disabled={isPaying} className="filter-tab active disabled:opacity-50">{isPaying ? "Processing..." : "Confirm Payment"}</button>
            <button onClick={() => setChallanData(null)} className="filter-tab">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[16px] font-normal text-dark">Ready to Generate Challan</h2>
              <p className="font-ui text-[12px] text-light mt-1">Total cash required: {formatIndianNumber(utilization?.totalCashRequired ?? 0)}</p>
            </div>
            <button onClick={handleGenerateChallan} disabled={isGenerating || (utilization?.totalCashRequired ?? 0) === 0} className="filter-tab active disabled:opacity-50">
              {isGenerating ? "Generating..." : "Generate Challan"}
            </button>
          </div>
          {(utilization?.totalCashRequired ?? 0) === 0 && (
            <p className="font-ui text-[12px] text-light mt-3">No cash payment required. ITC is sufficient to cover the tax liability.</p>
          )}
        </div>
      )}
    </div>
  );
}
