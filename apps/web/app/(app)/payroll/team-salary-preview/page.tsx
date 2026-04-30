"use client";

import { formatIndianNumber } from "@/lib/format";
import { Icon } from '@/components/ui/icon';

export default function TeamSalaryPreviewPage() {
  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-end gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="font-ui-xs text-xs text-amber-text mb-2 font-bold uppercase">PAYROLL - STEP 3 OF 4</div>
          <h1 className="font-display-lg text-lg font-bold text-on-surface">Salary Preview</h1>
          <p className="font-ui-sm text-sm text-text-mid mt-2">Review individual employee compensation details for October 2023 before final authorization.</p>
        </div>
        <button className="bg-primary-container text-white px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-primary cursor-pointer border-none shadow-sm text-xs font-bold uppercase tracking-widest">
          Authorize Payroll <Icon name="arrow_forward" className="text-sm" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 border border-border-subtle bg-white rounded-sm overflow-hidden shadow-sm mb-8">
        <div className="p-6 border-r border-border-subtle"><div className="font-ui-xs text-[10px] text-text-light mb-1 font-bold uppercase">Total Employees</div><div className="font-mono text-xl font-bold text-on-surface">142</div></div>
        <div className="p-6 border-r border-border-subtle bg-amber-50"><div className="font-ui-xs text-[10px] text-text-light mb-1 font-bold uppercase">Total Gross</div><div className="font-mono text-xl font-bold text-on-surface">₹ 42,50,000.00</div></div>
        <div className="p-6 border-r border-border-subtle"><div className="font-ui-xs text-[10px] text-text-light mb-1 font-bold uppercase">Total Deductions</div><div className="font-mono text-xl font-bold text-text-mid">₹ 4,85,200.00</div></div>
        <div className="p-6 bg-stone-50 border-t-2 border-t-primary-container"><div className="font-ui-xs text-[10px] text-text-light mb-1 font-bold uppercase">Net Payable</div><div className="font-mono text-xl font-bold text-primary">₹ 37,64,800.00</div></div>
      </div>
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-stone-50 border-b border-border-subtle text-xs uppercase tracking-widest text-text-light font-bold">
            <th className="px-6 py-4">Employee</th><th className="px-4 py-4 text-right">Gross</th><th className="px-4 py-4 text-right">PF</th><th className="px-4 py-4 text-right">ESI</th><th className="px-4 py-4 text-right">TDS</th><th className="px-4 py-4 text-right font-bold text-primary">Net</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            <tr className="hover:bg-stone-50"><td className="px-6 py-4"><span className="font-ui-sm font-bold">Rahul Sharma</span><span className="text-xs text-text-light ml-2">EMP-001</span></td>
              <td className="px-4 py-4 text-right">80,000</td><td className="px-4 py-4 text-right text-red-600">-1,800</td><td className="px-4 py-4 text-right text-red-600">-338</td><td className="px-4 py-4 text-right text-red-600">-4,500</td>
              <td className="px-4 py-4 text-right font-bold text-primary">73,362</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
