"use client";
import { Icon } from '@/components/ui/icon';

const products = [
  { sku: "RM-045", name: "Polyester Resin", batch: "BATCH-2401", qty: 500, unit: "kg", expiry: "15 Jun 2025", days: 48, status: "expiring" },
  { sku: "RM-078", name: "Adhesive Solvent", batch: "BATCH-2389", qty: 200, unit: "ltr", expiry: "10 May 2025", days: 12, status: "critical" },
];

export default function InventoryExpiryPage() {
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Inventory Reports</p>
          <h1 className="font-display text-2xl font-semibold text-dark">Inventory Expiry Report</h1>
        </div>
        <div className="flex items-center gap-4">
          <select className="border border-border rounded-md py-1.5 px-3 text-xs bg-surface-muted"><option>30 Days</option><option>60 Days</option></select>
          <button className="btn btn-primary flex items-center gap-2">
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
            {products.map((p) => (
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
