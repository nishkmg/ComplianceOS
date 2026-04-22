"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ADVANCE_TAX_DUE_DATES } from "@complianceos/shared";

const currentAY = `${new Date().getFullYear() + 1}-${(new Date().getFullYear() + 2).toString().slice(-2)}`;

const installmentPercentages = [
  { installment: 1, percentage: 15, dueDate: "15 Jun" },
  { installment: 2, percentage: 45, dueDate: "15 Sep" },
  { installment: 3, percentage: 75, dueDate: "15 Dec" },
  { installment: 4, percentage: 100, dueDate: "15 Mar" },
];

export default function AdvanceTaxPage() {
  const [assessmentYear, setAssessmentYear] = useState<string>(currentAY);
  const [selectedInstallment, setSelectedInstallment] = useState<number>(1);
  const [amount, setAmount] = useState<string>("");
  const [challanNumber, setChallanNumber] = useState("");
  const [challanDate, setChallanDate] = useState("");

  const { data: advanceTaxLedger } = api.itrPayment.getAdvanceTaxLedger.useQuery({
    assessmentYear,
  });

  const payAdvanceTax = api.itrPayment.payAdvanceTax.useMutation();

  const installments = advanceTaxLedger?.installments ?? [];
  const totalTaxLiability = Number(advanceTaxLedger?.totalPayable ?? "0");

  const handlePay = async () => {
    if (!amount || !challanNumber || !challanDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await payAdvanceTax.mutateAsync({
        assessmentYear,
        installmentNumber: selectedInstallment,
        amount: Number(amount),
        challanNumber,
        challanDate,
      });
      alert("Advance tax payment recorded successfully!");
      setAmount("");
      setChallanNumber("");
      setChallanDate("");
    } catch (error) {
      console.error("Failed to pay advance tax:", error);
      alert("Failed to record payment. Please try again.");
    }
  };

  const calculateCumulativeAmount = (percentage: number) => {
    return (totalTaxLiability * percentage) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/payment" className="text-sm text-gray-500 hover:underline">
            ← Back to Payment
          </Link>
          <h1 className="text-2xl font-bold mt-1">Advance Tax Payment</h1>
          <p className="text-sm text-gray-500">Assessment Year: {assessmentYear}</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          value={assessmentYear}
          onChange={(e) => setAssessmentYear(e.target.value)}
          placeholder="AY (e.g., 2027-28)"
          className="px-3 py-2 border rounded text-sm w-32"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Advance Tax Installments</h2>
        <p className="text-sm text-gray-500 mb-4">
          Total Tax Liability: <strong>₹{totalTaxLiability.toLocaleString("en-IN")}</strong>
        </p>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Installment</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Cumulative %</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Cumulative Amount</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Paid</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {installmentPercentages.map((inst) => {
              const installmentData = installments.find((i) => i.installmentNumber === `INSTALLMENT_${inst.installment}`);
              const paidAmount = installmentData ? Number(installmentData.paidAmount) : 0;
              const isPaid = !!installmentData?.paidDate;

              return (
                <tr key={inst.installment} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium">Installment {inst.installment}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inst.dueDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{inst.percentage}%</td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    ₹{calculateCumulativeAmount(inst.percentage).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    ₹{paidAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    {isPaid ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Due</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Record Advance Tax Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Installment</label>
            <select
              value={selectedInstallment}
              onChange={(e) => setSelectedInstallment(Number(e.target.value))}
              className="px-3 py-2 border rounded text-sm w-full"
            >
              <option value={1}>Installment 1 (15 Jun)</option>
              <option value={2}>Installment 2 (15 Sep)</option>
              <option value={3}>Installment 3 (15 Dec)</option>
              <option value={4}>Installment 4 (15 Mar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Challan Number (BSR Code + Serial)</label>
            <input
              type="text"
              value={challanNumber}
              onChange={(e) => setChallanNumber(e.target.value)}
              placeholder="e.g., 0000001234567"
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Challan Date</label>
            <input
              type="date"
              value={challanDate}
              onChange={(e) => setChallanDate(e.target.value)}
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handlePay}
            className="px-6 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Record Payment
          </button>
          <Link
            href="https://onlineservices.tin.egov-nsdl.com/etaxnew/tdsnontds.jsp"
            target="_blank"
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Pay Online (NSDL)
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Note: After making payment on NSDL/TIN website, record the challan details here for tracking.
        </p>
      </div>

      {advanceTaxLedger && (advanceTaxLedger.totalInterest234b !== "0" || advanceTaxLedger.totalInterest234c !== "0") && (
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <h3 className="font-semibold mb-2">Interest Payable</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Interest u/s 234B (Default in payment)</span>
              <span className="font-medium text-red-600">₹{Number(advanceTaxLedger.totalInterest234b).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Interest u/s 234C (Deferment of advance tax)</span>
              <span className="font-medium text-red-600">₹{Number(advanceTaxLedger.totalInterest234c).toLocaleString("en-IN")}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Interest is auto-calculated based on payment dates and installment due dates.
          </p>
        </div>
      )}
    </div>
  );
}
