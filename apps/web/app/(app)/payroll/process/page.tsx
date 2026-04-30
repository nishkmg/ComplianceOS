"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

const mockEmployees = [
  { id: "1", name: "Rahul Sharma", code: "EMP-001", gross: 80000, pf: 1800, esi: 0, tds: 4500, net: 73700 },
  { id: "2", name: "Priya Singh", code: "EMP-002", gross: 65000, pf: 1800, esi: 488, tds: 2000, net: 60712 },
  { id: "3", name: "Vikram Das", code: "EMP-003", gross: 45000, pf: 1800, esi: 338, tds: 0, net: 42862 },
];

export default function ProcessPayrollPage() {
  const [step, setStep] = useState(2); // Mocking middle step

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 className="font-display-xl text-display-xl text-on-surface mb-2">Process Payroll</h2>
          <p className="font-ui-md text-sm text-text-mid">October 2023 · {mockEmployees.length} Employees</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-border-subtle font-ui-sm text-sm rounded-sm hover:bg-stone-50 transition-colors text-on-surface cursor-pointer bg-white">Save Draft</button>
          <button className="px-6 py-2 bg-primary-container text-white font-ui-sm text-sm rounded-sm flex items-center gap-2 hover:bg-primary transition-colors group cursor-pointer border-none shadow-sm">
            Process & Execute
            <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Wizard Steps */}
      <div className="mb-8 border-b border-border-subtle pb-4 overflow-x-auto no-print">
        <div className="flex items-center gap-8 min-w-max">
          {[
            { n: 1, label: "Attendance" },
            { n: 2, label: "Earnings & Deductions" },
            { n: 3, label: "Statutory (PF/ESI)" },
            { n: 4, label: "Review & Post" },
          ].map((s) => (
            <div key={s.n} className={`flex items-center gap-2 ${step === s.n ? 'text-primary' : 'text-text-mid'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === s.n ? 'bg-primary-container text-white' : 
                step > s.n ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-text-light'
              }`}>
                {step > s.n ? '✓' : s.n}
              </span>
              <span className={`font-ui-xs text-[11px] uppercase tracking-widest ${step === s.n ? 'font-bold' : ''}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Panel */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 flex gap-4 text-left">
        <Icon name="warning" className="text-amber-600" />
        <div>
          <h4 className="font-ui-sm text-sm font-bold text-amber-900 mb-1">Compliance Check Required</h4>
          <p className="font-ui-sm text-[13px] text-amber-800 leading-relaxed">System detected missing PAN for 1 employee. TDS will be calculated at 20% (higher rate) unless updated before execution.</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-ui-md font-bold text-on-surface">Employee Earnings Summary</h3>
          <div className="flex gap-4">
            <button className="text-ui-xs text-primary font-bold uppercase tracking-widest border-none bg-transparent cursor-pointer">Bulk Edit</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest">Employee</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">Gross Earnings</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">PF (12%)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">ESI (0.75%)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right">TDS</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-text-light uppercase tracking-widest text-right font-bold">Net Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px]">
              {mockEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-4 px-6 text-left">
                    <div className="font-ui-sm font-bold text-on-surface text-sm">{e.name}</div>
                    <div className="text-[11px] text-text-light mt-0.5">{e.code}</div>
                  </td>
                  <td className="py-4 px-6 text-right text-stone-600">{formatIndianNumber(e.gross)}</td>
                  <td className="py-4 px-6 text-right text-red-600">-{formatIndianNumber(e.pf)}</td>
                  <td className="py-4 px-6 text-right text-red-600">{e.esi > 0 ? `-${formatIndianNumber(e.esi)}` : "—"}</td>
                  <td className="py-4 px-6 text-right text-red-600">{e.tds > 0 ? `-${formatIndianNumber(e.tds)}` : "—"}</td>
                  <td className="py-4 px-6 text-right font-bold text-on-surface">₹ {formatIndianNumber(e.net)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 font-bold border-t-2 border-on-surface">
                <td className="py-4 px-6 font-ui-sm uppercase tracking-widest text-xs">Total Payroll</td>
                <td className="py-4 px-6 text-right font-mono text-sm">₹ {formatIndianNumber(mockEmployees.reduce((s, e) => s + e.gross, 0))}</td>
                <td colSpan={3} className="py-4 px-6 text-right font-ui-xs uppercase tracking-widest text-[10px] text-text-light">Net Liability</td>
                <td className="py-4 px-6 text-right font-mono text-lg text-primary-container">₹ {formatIndianNumber(mockEmployees.reduce((s, e) => s + e.net, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
