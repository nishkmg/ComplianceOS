"use client";
import { Icon } from '@/components/ui/icon';

export default function Form16Page() {
  return (
    <div className="space-y-8 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber uppercase tracking-widest mb-2">
            <Icon name="description" className="text-sm" /> Form 16 Data Export
          </div>
          <h1 className="font-display text-2xl font-semibold text-dark">Employee Tax Report</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Under Section 203 of the Income-tax Act, 1961</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-border rounded-md py-2 px-3 text-sm bg-surface-muted">
            <option>2023 - 2024</option><option>2022 - 2023</option>
          </select>
          <button className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-[18px]" /> Export
          </button>
        </div>
      </header>

      {/* Employer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border p-6 bg-surface shadow-sm">
        <div><span className="block text-[10px] uppercase text-light font-bold mb-1">Name of the Employer</span><p className="font-bold text-dark text-lg">ComplianceOS Solutions Pvt Ltd</p></div>
        <div className="text-right"><span className="block text-[10px] uppercase text-light font-bold mb-1">PAN of Employer</span><span className="font-mono text-sm font-bold">AAACC1234E</span></div>
      </div>

      {/* Employee */}
      <div className="border border-border p-6 bg-surface shadow-sm">
        <h4 className="text-xs uppercase text-light font-bold mb-3">Name and Address of the Employee</h4>
        <p className="font-bold text-lg text-amber">Rohan Sharma</p>
        <p className="text-sm text-mid leading-relaxed">Apt 405, Sunrise Towers, Sector 45, Gurugram 122003</p>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div><span className="block text-[10px] uppercase text-light font-bold mb-1">PAN</span><span className="font-mono text-sm">ABCDE1234F</span></div>
          <div><span className="block text-[10px] uppercase text-light font-bold mb-1">Employee Ref</span><span className="font-mono text-sm">EMP-2021-042</span></div>
        </div>
      </div>

      {/* Part A */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-muted border-b border-border">
          <h3 className="font-ui text-sm font-medium font-bold text-dark">Part A — TDS Deducted</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="border-b border-border bg-surface-muted text-xs uppercase tracking-widest text-light font-bold">
            <th className="px-6 py-3">Quarter</th><th className="px-6 py-3 text-right">Amount Paid</th><th className="px-6 py-3 text-right">Tax Deducted</th><th className="px-6 py-3 text-right">Deposited</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono">
            <tr className="hover:bg-surface-muted"><td className="px-6 py-4 font-ui text-[13px] font-bold">Q1 (Apr-Jun)</td><td className="px-6 py-4 text-right">₹2,40,000</td><td className="px-6 py-4 text-right">₹18,000</td><td className="px-6 py-4 text-right text-success">✓</td></tr>
            <tr className="hover:bg-surface-muted"><td className="px-6 py-4 font-ui text-[13px] font-bold">Q2 (Jul-Sep)</td><td className="px-6 py-4 text-right">₹2,40,000</td><td className="px-6 py-4 text-right">₹18,000</td><td className="px-6 py-4 text-right text-success">✓</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
