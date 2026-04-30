"use client";
import { Icon } from '@/components/ui/icon';

export default function Form16Page() {
  return (
    <div className="space-y-8 text-left">
      <header className="flex justify-between items-center px-8 py-6 border-b border-border-subtle bg-white/80 -mx-8 -mt-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">
            <Icon name="description" className="text-sm" /> Form 16 Data Export
          </div>
          <h1 className="font-display-lg text-lg font-bold text-on-surface">Employee Tax Report</h1>
          <p className="text-xs text-text-mid">Under Section 203 of the Income-tax Act, 1961</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-border-subtle rounded-sm py-2 px-3 text-sm bg-stone-50">
            <option>2023 - 2024</option><option>2022 - 2023</option>
          </select>
          <button className="bg-primary-container text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-primary cursor-pointer border-none shadow-sm text-xs font-bold uppercase tracking-widest">
            <Icon name="download" className="text-[18px]" /> Export
          </button>
        </div>
      </header>

      {/* Employer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-border-subtle p-6 bg-white shadow-sm">
        <div><span className="block text-[10px] uppercase text-text-light font-bold mb-1">Name of the Employer</span><p className="font-bold text-on-surface text-lg">ComplianceOS Solutions Pvt Ltd</p></div>
        <div className="text-right"><span className="block text-[10px] uppercase text-text-light font-bold mb-1">PAN of Employer</span><span className="font-mono text-sm font-bold">AAACC1234E</span></div>
      </div>

      {/* Employee */}
      <div className="border border-border-subtle p-6 bg-white shadow-sm">
        <h4 className="text-xs uppercase text-text-light font-bold mb-3">Name and Address of the Employee</h4>
        <p className="font-bold text-lg text-primary-container">Rohan Sharma</p>
        <p className="text-sm text-text-mid leading-relaxed">Apt 405, Sunrise Towers, Sector 45, Gurugram 122003</p>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
          <div><span className="block text-[10px] uppercase text-text-light font-bold mb-1">PAN</span><span className="font-mono text-sm">ABCDE1234F</span></div>
          <div><span className="block text-[10px] uppercase text-text-light font-bold mb-1">Employee Ref</span><span className="font-mono text-sm">EMP-2021-042</span></div>
        </div>
      </div>

      {/* Part A */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
          <h3 className="font-ui-md font-bold text-on-surface">Part A — TDS Deducted</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="border-b border-border-subtle bg-stone-50 text-xs uppercase tracking-widest text-text-light font-bold">
            <th className="px-6 py-3">Quarter</th><th className="px-6 py-3 text-right">Amount Paid</th><th className="px-6 py-3 text-right">Tax Deducted</th><th className="px-6 py-3 text-right">Deposited</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono">
            <tr className="hover:bg-stone-50"><td className="px-6 py-4 font-ui-sm font-bold">Q1 (Apr-Jun)</td><td className="px-6 py-4 text-right">₹2,40,000</td><td className="px-6 py-4 text-right">₹18,000</td><td className="px-6 py-4 text-right text-green-700">✓</td></tr>
            <tr className="hover:bg-stone-50"><td className="px-6 py-4 font-ui-sm font-bold">Q2 (Jul-Sep)</td><td className="px-6 py-4 text-right">₹2,40,000</td><td className="px-6 py-4 text-right">₹18,000</td><td className="px-6 py-4 text-right text-green-700">✓</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
