"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

interface PayrollLine {
  id: string;
  employeeName: string;
  employeeCode: string;
  grossSalary: string;
  pfContribution: string;
  esiContribution: string;
  tdsDeduction: string;
  netSalary: string;
}

interface PayrollRun {
  id: string;
  payrollNumber: string;
  month: string;
  year: string;
  status: string;
}

const mockRun: PayrollRun = { id: "pr1", payrollNumber: "PR-2026-04-001", month: "April", year: "2026", status: "finalized" };

const mockLines: PayrollLine[] = [
  { id: "l1", employeeName: "Rahul Sharma", employeeCode: "EMP-001", grossSalary: "80000", pfContribution: "1800", esiContribution: "0", tdsDeduction: "4500", netSalary: "73700" },
  { id: "l2", employeeName: "Priya Singh", employeeCode: "EMP-002", grossSalary: "65000", pfContribution: "1800", esiContribution: "488", tdsDeduction: "2000", netSalary: "60712" },
  { id: "l3", employeeName: "Vikram Das", employeeCode: "EMP-003", grossSalary: "45000", pfContribution: "1800", esiContribution: "338", tdsDeduction: "0", netSalary: "42862" },
];

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeFy } = useFiscalYear();
  const runId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [runId]);

  if (loading) return <div className="p-12 text-center text-light">Loading payroll details...</div>;

  const run = mockRun;
  const lines = mockLines;
  const totalGross = lines.reduce((sum, line) => sum + parseFloat(line.grossSalary || "0"), 0);
  const totalNet = lines.reduce((sum, line) => sum + parseFloat(line.netSalary || "0"), 0);
  const totalDeductions = totalGross - totalNet;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui text-[10px] text-light uppercase tracking-widest mb-8">
        <Link className="hover:text-primary transition-colors no-underline" href="/payroll">Payroll Ledger</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-dark">Payroll Detail</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b-[0.5px] border-border pb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Payroll Run · FY {activeFy}</p>
          <h1 className="font-display text-display-lg font-semibold text-dark">Payroll Detail</h1>
          <div className="flex items-center gap-6 font-ui text-[13px] text-secondary mt-1">
            <div className="flex items-center gap-2">
              <Icon name="calendar_month" className="text-[16px]" />
              <span>{run.month} {run.year}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="groups" className="text-[16px]" />
              <span>{lines.length} Employees</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.print()} className="btn btn-secondary flex items-center gap-2">
            <Icon name="print" className="text-[18px]" /> Print Statement
          </button>
          <button onClick={() => showToast.success("Payroll finalized and disbursed.")} className="btn btn-primary flex items-center gap-2">
            Finalize & Disburse
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface border border-border p-8 border-t-2 border-t-stone-300 shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Gross Earnings</p>
          <p className="font-mono text-3xl font-bold text-dark">{formatIndianNumber(totalGross, { currency: false })}</p>
        </div>
        <div className="bg-surface border border-border p-8 border-t-2 border-t-red-600 shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Total Deductions</p>
          <p className="font-mono text-3xl font-bold text-danger">{formatIndianNumber(totalDeductions, { currency: false })}</p>
        </div>
        <div className="bg-surface border border-border p-8 border-t-2 border-t-amber shadow-sm">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4 font-bold">Net Take-Home</p>
          <p className="font-mono text-3xl font-bold text-primary">{formatIndianNumber(totalNet, { currency: false })}</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Employee Payroll Breakdown</h3>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-md ${run.status === 'finalized' ? 'bg-success-bg text-success border-green-200' : 'bg-amber-50 text-amber-text border-amber-200'}`}>
              {run.status}
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-stone-100 text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6 text-right">Gross (₹)</th>
                <th className="py-4 px-6 text-right">EPF/ESI (₹)</th>
                <th className="py-4 px-6 text-right">TDS (₹)</th>
                <th className="py-4 px-6 text-right">Net Salary (₹)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {lines.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center font-ui text-sm text-mid">No payroll lines found for this run.</td></tr>
              ) : lines.map((line) => (
                <tr key={line.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-5 px-6 text-left">
                    <div className="font-ui text-[13px] font-bold text-dark text-sm">{line.employeeName}</div>
                    <div className="text-[11px] text-light mt-0.5">{line.employeeCode}</div>
                  </td>
                  <td className="py-5 px-6 text-right text-mid">{formatIndianNumber(line.grossSalary)}</td>
                  <td className="py-5 px-6 text-right text-danger">-{formatIndianNumber(parseFloat(line.pfContribution || "0") + parseFloat(line.esiContribution || "0"))}</td>
                  <td className="py-5 px-6 text-right text-danger">-{formatIndianNumber(line.tdsDeduction || 0)}</td>
                  <td className="py-5 px-6 text-right font-bold text-dark">{formatIndianNumber(line.netSalary, { currency: false })}</td>
                  <td className="py-5 px-6 text-right">
                    <button onClick={() => showToast.success("Payslip downloaded.")} className="text-amber hover:text-primary font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Payslip</button>
                  </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
