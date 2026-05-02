"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

const currentAY = `${new Date().getFullYear() + 1}-${(new Date().getFullYear() + 2).toString().slice(-2)}`;

export default function ITRPaymentPage() {
  const [assessmentYear, setAssessmentYear] = useState<string>(currentAY);
  const { data: advanceTaxLedger }: any = api.itrPayment.getAdvanceTaxLedger.useQuery({ assessmentYear });
  const { data: selfAssessmentDetails }: any = api.itrPayment.getSelfAssessmentDetails.useQuery({ assessmentYear });
  const installments = advanceTaxLedger?.installments ?? [];
  const totalAdvanceTaxPayable = Number(advanceTaxLedger?.totalPayable ?? "0");
  const totalAdvanceTaxPaid = Number(advanceTaxLedger?.totalPaid ?? "0");
  const totalBalance = Number(advanceTaxLedger?.totalBalance ?? "0");
  const selfAssessmentBalance = Number(selfAssessmentDetails?.balancePayable ?? "0");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/itr/returns" className="font-ui text-[12px] text-amber hover:underline">← Back to ITR Returns</Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">ITR Payment</h1>
          <p className="font-ui text-[12px] text-light mt-1">Assessment Year: {assessmentYear}</p>
        </div>
        <Link href="/itr/payment/history" className="filter-tab">Payment History</Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Assessment Year</label>
          <input type="text" value={assessmentYear} onChange={(e) => setAssessmentYear(e.target.value)} placeholder="AY (e.g., 2027-28)" className="input-field font-ui w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-ui text-[10px] uppercase tracking-wide text-light mb-2">Advance Tax Payable</h3>
          <p className="font-mono text-[22px] font-medium text-dark">{formatIndianNumber(totalAdvanceTaxPayable)}</p>
          <Link href="/itr/payment/advance-tax" className="font-ui text-[12px] text-amber hover:underline mt-3 inline-block">View Details →</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-ui text-[10px] uppercase tracking-wide text-light mb-2">Advance Tax Paid</h3>
          <p className="font-mono text-[22px] font-medium text-success">{formatIndianNumber(totalAdvanceTaxPaid)}</p>
          <p className="font-ui text-[11px] text-light mt-1">{installments.filter((i: any) => i.paidDate).length} installments paid</p>
        </div>
        <div className="card p-5">
          <h3 className="font-ui text-[10px] uppercase tracking-wide text-light mb-2">Balance Payable</h3>
          <p className="font-mono text-[22px] font-medium text-danger">{formatIndianNumber(totalBalance)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h2 className="font-display text-[16px] font-normal text-dark px-4 py-3 border-b border-border-subtle">Advance Tax Installments</h2>
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Installment</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Due Date</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Payable</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Paid</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Balance</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {installments.length > 0 ? (
              installments.map((inst: any) => (
                <tr key={inst.id} className="border-b border-border-subtle">
                  <td className="px-4 py-3 font-display text-[13px] font-medium text-dark">Installment {inst.installmentNumber}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{inst.dueDate}</td>
                  <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(Number(inst.payableAmount))}</td>
                  <td className="font-mono text-[13px] text-right text-success px-4 py-3">{formatIndianNumber(Number(inst.paidAmount))}</td>
                  <td className="font-mono text-[13px] text-right text-danger px-4 py-3">{formatIndianNumber(Number(inst.balance))}</td>
                  <td className="px-4 py-3"><Badge variant={inst.paidDate ? "success" : "gray"}>{inst.paidDate ? "Paid" : "Pending"}</Badge></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center font-ui text-light">No advance tax installments yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selfAssessmentBalance > 0 && (
        <div className="card p-5 border-l-4 border-l-amber bg-amber/5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-2">Self-Assessment Tax Due</h2>
          <p className="font-ui text-[12px] text-light mb-4">After accounting for advance tax and TDS/TCS, you have a balance tax payable.</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[20px] font-bold text-danger">{formatIndianNumber(selfAssessmentBalance)}</p>
            <Link href="/itr/payment/self-assessment" className="filter-tab bg-danger text-white hover:bg-danger/90">Pay Self-Assessment Tax</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/itr/payment/advance-tax" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">Advance Tax</h3>
          <p className="font-ui text-[12px] text-light">Pay advance tax installments with due dates</p>
        </Link>
        <Link href="/itr/payment/self-assessment" className="card p-5 hover:shadow-md transition-shadow">
          <h3 className="font-display text-[14px] font-normal text-dark mb-1">Self-Assessment Tax</h3>
          <p className="font-ui text-[12px] text-light">Pay balance tax after advance tax and TDS</p>
        </Link>
      </div>
    </div>
  );
}
