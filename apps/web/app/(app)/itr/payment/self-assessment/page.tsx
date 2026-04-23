// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const currentAY = `${new Date().getFullYear() + 1}-${(new Date().getFullYear() + 2).toString().slice(-2)}`;

export default function SelfAssessmentTaxPage() {
  const [assessmentYear, setAssessmentYear] = useState<string>(currentAY);
  const [amount, setAmount] = useState<string>("");
  const [challanNumber, setChallanNumber] = useState("");
  const [challanDate, setChallanDate] = useState("");

  const { data: selfAssessmentDetails } = api.itrPayment.getSelfAssessmentDetails.useQuery({
    assessmentYear,
  });

  const paySelfAssessmentTax = api.itrPayment.paySelfAssessmentTax.useMutation();

  const taxPayable = Number(selfAssessmentDetails?.taxPayable ?? "0");
  const advanceTaxPaid = Number(selfAssessmentDetails?.advanceTaxPaid ?? "0");
  const tdsTcsCredit = Number(selfAssessmentDetails?.tdsTcsCredit ?? "0");
  const balancePayable = Number(selfAssessmentDetails?.balancePayable ?? "0");
  const alreadyPaid = Number(selfAssessmentDetails?.paidAmount ?? "0");
  const finalBalance = balancePayable - alreadyPaid;

  const handlePay = async () => {
    if (!amount || !challanNumber || !challanDate) {
      alert("Please fill all fields");
      return;
    }

    try {
      await paySelfAssessmentTax.mutateAsync({
        assessmentYear,
        amount: Number(amount),
        challanNumber,
        challanDate,
      });
      alert("Self-assessment tax payment recorded successfully!");
      setAmount("");
      setChallanNumber("");
      setChallanDate("");
    } catch (error) {
      console.error("Failed to pay self-assessment tax:", error);
      alert("Failed to record payment. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/payment" className="text-sm text-gray-500 hover:underline">
            ← Back to Payment
          </Link>
          <h1 className="text-2xl font-bold mt-1">Self-Assessment Tax Payment</h1>
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
        <h2 className="text-lg font-semibold mb-4">Tax Computation Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Total Tax Payable</span>
            <span className="font-medium">₹{taxPayable.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Less: Advance Tax Paid</span>
            <span className="font-medium text-green-600">-₹{advanceTaxPaid.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Less: TDS/TCS Credit</span>
            <span className="font-medium text-green-600">-₹{tdsTcsCredit.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-2 font-medium bg-gray-50 px-4 py-3 rounded">
            <span className="text-gray-900">Balance Tax Payable</span>
            <span className="text-gray-900">₹{balancePayable.toLocaleString("en-IN")}</span>
          </div>
          {alreadyPaid > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Already Paid</span>
              <span className="font-medium text-green-600">-₹{alreadyPaid.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold bg-red-50 px-4 py-3 rounded">
            <span className="text-gray-900">Final Balance Payable</span>
            <span className="text-red-600">₹{finalBalance.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {finalBalance > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Record Self-Assessment Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Payment Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="px-3 py-2 border rounded text-sm w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: ₹{finalBalance.toLocaleString("en-IN")}</p>
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
            Note: Self-assessment tax must be paid before filing ITR. Payment should be made using Challan No. ITNS 280.
          </p>
        </div>
      ) : finalBalance === 0 ? (
        <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">✓ Full Payment Complete</h3>
          <p className="text-sm text-gray-600">
            Your self-assessment tax liability has been fully paid. You can proceed to file your ITR.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">✓ Excess Payment</h3>
          <p className="text-sm text-gray-600">
            You have paid excess tax of ₹{Math.abs(finalBalance).toLocaleString("en-IN")}. 
            This will be processed as a refund after ITR verification.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Important Information</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Self-assessment tax is the balance tax payable after reducing advance tax and TDS/TCS from total tax liability</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Payment must be made before filing the ITR</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Use Challan No. ITNS 280 for payment on NSDL/TIN website</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Keep the challan counterfoil for your records</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
