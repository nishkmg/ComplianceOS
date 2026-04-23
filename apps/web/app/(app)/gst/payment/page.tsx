// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

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

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function GSTPaymentPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(currentMonth);
  const [periodYear, setPeriodYear] = useState<number>(currentYear);
  const [isGenerating, setIsGenerating] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<"online" | "offline">("online");
  const [bankName, setBankName] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const { data: liabilityBalance } = api.gstLedger.liabilityBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const { data: itcBalance } = api.gstLedger.itcBalance.useQuery({
    periodMonth,
    periodYear,
  });

  const taxTypes = ["igst", "cgst", "sgst", "cess"] as const;

  const calculateUtilization = () => {
    const liability = liabilityBalance;
    const itc = itcBalance;
    
    if (!liability || !itc) return null;

    const breakdown = taxTypes.map((type) => {
      const output = liability[type]?.output ?? 0;
      const itcAvailable = itc[type]?.closingBalance ?? 0;
      const utilized = Math.min(output, itcAvailable);
      const cashRequired = output - utilized;
      
      return {
        taxType: type,
        output,
        itcAvailable,
        utilized,
        cashRequired,
      };
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
      const result = await createChallan.mutateAsync({
        periodMonth,
        periodYear,
      });
      setChallanData(result);
    } catch (error) {
      console.error("Failed to generate challan:", error);
      alert("Failed to generate challan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePay = async () => {
    if (!challanData) return;
    
    setIsPaying(true);
    try {
      const challanId = btoa(JSON.stringify(challanData));
      await payGst.mutateAsync({
        challanId,
        mode: paymentMode,
        bankName: bankName || undefined,
      });
      alert("Payment successful! Challan generated.");
      setChallanData(null);
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/gst/ledger" className="text-sm text-gray-500 hover:underline">
            ← Back to GST Ledger
          </Link>
          <h1 className="text-2xl font-bold mt-1">GST Payment</h1>
        </div>
        <Link 
          href="/gst/payment/history" 
          className="px-4 py-2 bg-white border text-sm rounded hover:bg-gray-50"
        >
          Payment History
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={periodMonth}
          onChange={(e) => setPeriodMonth(Number(e.target.value))}
          className="px-3 py-2 border rounded text-sm"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <input
          type="number"
          value={periodYear}
          onChange={(e) => setPeriodYear(Number(e.target.value))}
          className="px-3 py-2 border rounded text-sm w-24"
          min={2000}
          max={2100}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Tax Payable Breakdown</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Tax Type</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Output Tax</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">ITC Available</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">ITC Utilized</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Cash Required</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {utilization?.breakdown.map((b) => (
              <tr key={b.taxType} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs rounded-full uppercase bg-gray-100 text-gray-800">
                    {b.taxType}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">₹{b.output.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right text-green-600">₹{b.itcAvailable.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right text-blue-600">₹{b.utilized.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">₹{b.cashRequired.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right text-gray-900">₹{utilization?.totalOutput.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right text-gray-600">-</td>
              <td className="px-4 py-3 text-right text-blue-600">₹{utilization?.totalITCUtilized.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right text-gray-900">₹{utilization?.totalCashRequired.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {challanData ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Challan Details</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Challan Number:</span>
              <span className="font-medium">{challanData.challanNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Challan Date:</span>
              <span className="font-medium">{challanData.challanDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg">₹{challanData.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Payment Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as "online" | "offline")}
                  className="px-3 py-2 border rounded text-sm w-full max-w-xs"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              {paymentMode === "offline" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter bank name"
                    className="px-3 py-2 border rounded text-sm w-full max-w-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handlePay}
              disabled={isPaying}
              className="px-6 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isPaying ? "Processing..." : "Confirm Payment"}
            </button>
            <button
              onClick={() => setChallanData(null)}
              className="px-6 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Ready to Generate Challan</h2>
              <p className="text-sm text-gray-500 mt-1">
                Total cash required: ₹{utilization?.totalCashRequired.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              onClick={handleGenerateChallan}
              disabled={isGenerating || (utilization?.totalCashRequired ?? 0) === 0}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Challan"}
            </button>
          </div>
          {(utilization?.totalCashRequired ?? 0) === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No cash payment required. ITC is sufficient to cover the tax liability.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
