"use client";

import { formatIndianNumber } from "@/lib/format";
import { Icon } from '@/components/ui/icon';

export default function TeamSalaryPreviewPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-end gap-4 border-b border-border pb-6 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Payroll Management</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Salary Preview</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Review individual employee compensation details for October 2023 before final authorization.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          Authorize Payroll <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 border border-border bg-surface rounded-md overflow-hidden shadow-sm mb-8">
        <div className="p-6 border-r border-border"><div className="font-ui text-[10px] text-light mb-1 font-bold uppercase">Total Employees</div><div className="font-mono text-xl font-bold text-dark">142</div></div>
        <div className="p-6 border-r border-border bg-amber-50"><div className="font-ui text-[10px] text-light mb-1 font-bold uppercase">Total Gross</div><div className="font-mono text-xl font-bold text-dark">₹ 42,50,000.00</div></div>
        <div className="p-6 border-r border-border"><div className="font-ui text-[10px] text-light mb-1 font-bold uppercase">Total Deductions</div><div className="font-mono text-xl font-bold text-mid">₹ 4,85,200.00</div></div>
        <div className="p-6 bg-surface-muted border-t-2 border-t-amber"><div className="font-ui text-[10px] text-light mb-1 font-bold uppercase">Net Payable</div><div className="font-mono text-xl font-bold text-primary">₹ 37,64,800.00</div></div>
      </div>
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-muted border-b border-border text-xs uppercase tracking-widest text-light font-bold">
            <th className="px-6 py-4">Employee</th><th className="px-4 py-4 text-right">Gross</th><th className="px-4 py-4 text-right">PF</th><th className="px-4 py-4 text-right">ESI</th><th className="px-4 py-4 text-right">TDS</th><th className="px-4 py-4 text-right font-bold text-primary">Net</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            <tr className="hover:bg-surface-muted"><td className="px-6 py-4"><span className="font-ui text-[13px] font-bold">Rahul Sharma</span><span className="text-xs text-light ml-2">EMP-001</span></td>
              <td className="px-4 py-4 text-right">80,000</td><td className="px-4 py-4 text-right text-danger">-1,800</td><td className="px-4 py-4 text-right text-danger">-338</td><td className="px-4 py-4 text-right text-danger">-4,500</td>
              <td className="px-4 py-4 text-right font-bold text-primary">73,362</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
