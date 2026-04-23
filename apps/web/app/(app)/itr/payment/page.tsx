// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const currentAY = `${new Date().getFullYear() + 1}-${(new Date().getFullYear() + 2).toString().slice(-2)}`;

export default function ITRPaymentPage() {
  const [assessmentYear, setAssessmentYear] = useState<string>(currentAY);

  const { data: advanceTaxLedger } = api.itrPayment.getAdvanceTaxLedger.useQuery({
    assessmentYear,
  });

  const { data: selfAssessmentDetails } = api.itrPayment.getSelfAssessmentDetails.useQuery({
    assessmentYear,
  });

  const installments = advanceTaxLedger?.installments ?? [];

  const totalAdvanceTaxPayable = Number(advanceTaxLedger?.totalPayable ?? "0");
  const totalAdvanceTaxPaid = Number(advanceTaxLedger?.totalPaid ?? "0");
  const totalBalance = Number(advanceTaxLedger?.totalBalance ?? "0");

  const selfAssessmentBalance = Number(selfAssessmentDetails?.balancePayable ?? "0");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="text-sm text-gray-500 hover:underline">
            ← Back to ITR Returns
          </Link>
          <h1 className="text-2xl font-bold mt-1">ITR Payment</h1>
          <p className="text-sm text-gray-500">Assessment Year: {assessmentYear}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/itr/payment/history"
            className="px-4 py-2 bg-white border text-sm rounded hover:bg-gray-50"
          >
            Payment History
          </Link>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Advance Tax Payable</h3>
          <p className="text-2xl font-bold text-gray-900">₹{totalAdvanceTaxPayable.toLocaleString("en-IN")}</p>
          <Link href="/itr/payment/advance-tax" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            View Details →
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Advance Tax Paid</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalAdvanceTaxPaid.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-500 mt-1">{installments.filter((i) => i.paidDate).length} installments paid</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Balance Payable</h3>
          <p className="text-2xl font-bold text-red-600">₹{totalBalance.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Advance Tax Installments</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Installment</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Due Date</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Payable</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Paid</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Balance</th>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {installments.length > 0 ? (
              installments.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium">Installment {inst.installmentNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{inst.dueDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inst.payableAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-green-600">₹{Number(inst.paidAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{Number(inst.balance).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    {inst.paidDate ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Pending</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No advance tax installments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selfAssessmentBalance > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
          <h2 className="text-lg font-semibold mb-2">Self-Assessment Tax Due</h2>
          <p className="text-sm text-gray-600 mb-4">
            After accounting for advance tax and TDS/TCS, you have a balance tax payable.
          </p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-red-600">₹{selfAssessmentBalance.toLocaleString("en-IN")}</p>
            <Link
              href="/itr/payment/self-assessment"
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Pay Self-Assessment Tax
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/itr/payment/advance-tax"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="font-semibold mb-2">Advance Tax</h3>
          <p className="text-sm text-gray-500">Pay advance tax installments with due dates</p>
        </Link>
        <Link
          href="/itr/payment/self-assessment"
          className="p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h3 className="font-semibold mb-2">Self-Assessment Tax</h3>
          <p className="text-sm text-gray-500">Pay balance tax after advance tax and TDS</p>
        </Link>
      </div>
    </div>
  );
}
