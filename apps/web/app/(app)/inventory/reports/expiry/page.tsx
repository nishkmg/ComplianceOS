"use client";
import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";

const products = [
  { sku: "RM-045", name: "Polyester Resin", batch: "BATCH-2401", qty: 500, unit: "kg", expiry: "15 Jun 2025", days: 48, status: "expiring" },
  { sku: "RM-078", name: "Adhesive Solvent", batch: "BATCH-2389", qty: 200, unit: "ltr", expiry: "10 May 2025", days: 12, status: "critical" },
];

export default function InventoryExpiryPage() {
  const [dayFilter, setDayFilter] = useState("30");
  const filtered = products.filter((p) => {
    if (dayFilter === "30") return p.days <= 30;
    if (dayFilter === "60") return p.days <= 60;
    return true;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast.error("No data to export.");
      return;
    }
    const header = "SKU,Product,Batch/Lot,Qty,Unit,Expiry Date,Days Left,Status";
    const rows = filtered.map((p) =>
      `${p.sku},"${p.name}","${p.batch}",${p.qty},${p.unit},${p.expiry},${p.days},${p.status}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expiry-report-${dayFilter}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success(`Exported ${filtered.length} items.`);
  };
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Inventory Reports</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Inventory Expiry Report</h1>
        </div>
        <div className="flex items-center gap-4">
          <select className="border border-border rounded-md py-1.5 px-3 text-xs bg-surface-muted" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}><option value="30">30 Days</option><option value="60">60 Days</option></select>
          <button onClick={handleExportCSV} className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-[18px]" /> Export CSV
          </button>
        </div>
      </header>
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead><tr className="bg-surface-muted border-b border-border text-xs uppercase tracking-widest text-light font-bold">
            <th className="px-6 py-4">SKU</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Batch/Lot</th><th className="px-6 py-4 text-right">Qty</th><th className="px-6 py-4">Expiry Date</th><th className="px-6 py-4 text-right">Days Left</th><th className="px-6 py-4">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="font-ui text-sm text-mid">No products expiring within {dayFilter} days.</p>
                  </td>
                </tr>
              ) : filtered.map((p) => (
              <tr key={p.sku} className="hover:bg-surface-muted">
                <td className="px-6 py-4 text-primary font-medium">{p.sku}</td>
                <td className="px-6 py-4 font-ui text-[13px] font-bold text-dark">{p.name}</td>
                <td className="px-6 py-4 text-mid">{p.batch}</td>
                <td className="px-6 py-4 text-right">{p.qty} {p.unit}</td>
                <td className="px-6 py-4 text-mid">{p.expiry}</td>
                <td className={`px-6 py-4 text-right font-bold ${p.days < 30 ? 'text-danger' : 'text-amber-text'}`}>{p.days}d</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${p.status === 'critical' ? 'bg-danger-bg text-danger border-red-200' : 'bg-amber-50 text-amber-text border-amber-200'}`}>
                    {p.status === 'critical' ? 'Critical' : 'Expiring'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
