"use client";
import { Icon } from '@/components/ui/icon';

const employees = [
  { id: "EMP-001", name: "Rahul Sharma", days: 28, gross: 45000, empESI: 338, emprESI: 1463, totalESI: 1801 },
  { id: "EMP-002", name: "Priya Singh", days: 28, gross: 35000, empESI: 263, emprESI: 1138, totalESI: 1401 },
];

export default function ESIChallanPage() {
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Statutory Filings</p>
          <h1 className="font-display text-2xl font-semibold text-dark">ESI Challan Report</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Generate data for Employee State Insurance filings.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Icon name="download" className="text-[18px]" /> Export
        </button>
      </header>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface p-5 border border-border shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Total Employees</p><p className="text-2xl font-mono font-bold text-dark">142</p></div>
        <div className="bg-surface p-5 border border-border shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Gross Wages</p><p className="text-2xl font-mono font-bold text-dark">₹42,50,000</p></div>
        <div className="bg-surface p-5 border border-border shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Employee Contrib</p><p className="text-2xl font-mono font-bold text-dark">₹31,875</p></div>
        <div className="bg-surface p-5 border border-border border-l-4 border-l-amber shadow-sm"><p className="text-xs font-bold text-amber uppercase mb-1">Total Payable</p><p className="text-2xl font-mono font-bold text-dark">₹1,70,000</p></div>
      </div>
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-muted border-b border-border text-xs font-bold text-light uppercase tracking-widest">
            <th className="px-4 py-3">Employee</th><th className="px-4 py-3 text-right">Days</th><th className="px-4 py-3 text-right">Gross Wages</th><th className="px-4 py-3 text-right">Emp. (0.75%)</th><th className="px-4 py-3 text-right">Empr. (3.25%)</th><th className="px-4 py-3 text-right font-bold">Total ESI</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-surface-muted"><td className="px-4 py-3"><span className="font-ui text-[13px] font-bold">{e.name}</span><span className="text-xs text-light ml-2">{e.id}</span></td>
                <td className="px-4 py-3 text-right">{e.days}</td><td className="px-4 py-3 text-right">{e.gross.toLocaleString()}</td><td className="px-4 py-3 text-right text-mid">{e.empESI}</td><td className="px-4 py-3 text-right text-mid">{e.emprESI}</td><td className="px-4 py-3 text-right font-bold">{e.totalESI}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
