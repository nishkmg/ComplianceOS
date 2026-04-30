"use client";

import { useParams, useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { data: runData, isLoading, refetch }: any = api.payroll.get.useQuery(runId);

  if (isLoading) return <div className="p-12 text-center text-light">Loading payroll details...</div>;
  if (!runData?.run) return <div className="p-12 text-center text-light">Payroll run not found.</div>;

  const run = runData.run;
  const lines = runData.lines ?? [];
// @ts-ignore
  const totalGross = lines.reduce((sum, line) => sum + parseFloat(line.grossSalary || "0"), 0);
// @ts-ignore
  const totalNet = lines.reduce((sum, line) => sum + parseFloat(line.netSalary || "0"), 0);
  const totalDeductions = totalGross - totalNet;

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-8">
        <Link className="hover:text-primary transition-colors no-underline" href="/payroll">Payroll Ledger</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface">Payroll Detail</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b-[0.5px] border-border-subtle pb-8">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-4 font-bold">Payroll Detail</h1>
          <div className="flex items-center gap-6 font-ui-sm text-sm text-text-mid">
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
          <button className="px-6 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm shadow-sm">
            <Icon name="print" className="text-[18px]" /> Print Statement
          </button>
          <button className="px-6 py-2 bg-primary-container text-white font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer rounded-sm">
            Finalize & Disburse
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-stone-300 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Gross Earnings</p>
          <p className="font-mono text-3xl font-bold text-on-surface">₹ {formatIndianNumber(totalGross)}</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-red-600 shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Total Deductions</p>
          <p className="font-mono text-3xl font-bold text-red-600">₹ {formatIndianNumber(totalDeductions)}</p>
        </div>
        <div className="bg-white border-[0.5px] border-border-subtle p-8 border-t-2 border-t-primary-container shadow-sm">
          <p className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-4 font-bold">Net Take-Home</p>
          <p className="font-mono text-3xl font-bold text-primary">₹ {formatIndianNumber(totalNet)}</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Employee Payroll Breakdown</h3>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${run.status === 'finalized' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {run.status}
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6 text-right">Gross (₹)</th>
                <th className="py-4 px-6 text-right">EPF/ESI (₹)</th>
                <th className="py-4 px-6 text-right">TDS (₹)</th>
                <th className="py-4 px-6 text-right">Net Salary (₹)</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
              {(lines as any[]).map((line: any) => (
                <tr key={line.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-5 px-6 text-left">
                    <div className="font-ui-sm font-bold text-on-surface text-sm">{line.employeeName}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{line.employeeCode}</div>
                  </td>
                  <td className="py-5 px-6 text-right text-stone-600">{formatIndianNumber(line.grossSalary)}</td>
                  <td className="py-5 px-6 text-right text-red-600">-{formatIndianNumber(parseFloat(line.pfContribution || 0) + parseFloat(line.esiContribution || 0))}</td>
                  <td className="py-5 px-6 text-right text-red-600">-{formatIndianNumber(line.tdsDeduction || 0)}</td>
                  <td className="py-5 px-6 text-right font-bold text-on-surface">₹ {formatIndianNumber(line.netSalary)}</td>
                  <td className="py-5 px-6 text-right">
                    <button className="text-primary-container hover:text-primary font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Payslip</button>
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
