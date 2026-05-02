"use client";
import { Icon } from '@/components/ui/icon';

const employees = [
  { id: "EMP-001", name: "Rahul Sharma", days: 28, gross: 45000, empESI: 338, emprESI: 1463, totalESI: 1801 },
  { id: "EMP-002", name: "Priya Singh", days: 28, gross: 35000, empESI: 263, emprESI: 1138, totalESI: 1401 },
];

export default function ESIChallanPage() {
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-center px-8 h-20 border-b border-border-subtle bg-white/80 backdrop-blur-sm -mx-8 -mt-8 mb-8">
        <div>
          <h1 className="font-display-lg text-lg font-bold text-dark">ESI Challan Report</h1>
          <p className="text-sm text-mid">Generate data for Employee State Insurance filings.</p>
        </div>
        <button className="bg-primary-container text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-primary cursor-pointer border-none shadow-sm text-xs font-bold uppercase tracking-widest">
          <Icon name="download" className="text-[18px]" /> Export
        </button>
      </header>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-border-subtle shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Total Employees</p><p className="text-2xl font-mono font-bold text-dark">142</p></div>
        <div className="bg-white p-5 border border-border-subtle shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Gross Wages</p><p className="text-2xl font-mono font-bold text-dark">₹42,50,000</p></div>
        <div className="bg-white p-5 border border-border-subtle shadow-sm"><p className="text-xs font-bold text-mid uppercase mb-1">Employee Contrib</p><p className="text-2xl font-mono font-bold text-dark">₹31,875</p></div>
        <div className="bg-white p-5 border border-border-subtle border-l-4 border-l-primary-container shadow-sm"><p className="text-xs font-bold text-primary-container uppercase mb-1">Total Payable</p><p className="text-2xl font-mono font-bold text-dark">₹1,70,000</p></div>
      </div>
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-section-muted border-b border-border-subtle text-xs font-bold text-light uppercase tracking-widest">
            <th className="px-4 py-3">Employee</th><th className="px-4 py-3 text-right">Days</th><th className="px-4 py-3 text-right">Gross Wages</th><th className="px-4 py-3 text-right">Emp. (0.75%)</th><th className="px-4 py-3 text-right">Empr. (3.25%)</th><th className="px-4 py-3 text-right font-bold">Total ESI</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            {employees.map((e) => (
              <tr key={e.id} className="hover:bg-section-muted"><td className="px-4 py-3"><span className="font-ui-sm font-bold">{e.name}</span><span className="text-xs text-light ml-2">{e.id}</span></td>
                <td className="px-4 py-3 text-right">{e.days}</td><td className="px-4 py-3 text-right">{e.gross.toLocaleString()}</td><td className="px-4 py-3 text-right text-mid">{e.empESI}</td><td className="px-4 py-3 text-right text-mid">{e.emprESI}</td><td className="px-4 py-3 text-right font-bold">{e.totalESI}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
