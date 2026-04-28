// @ts-nocheck
"use client";

const products = [
  { sku: "RM-045", name: "Polyester Resin", batch: "BATCH-2401", qty: 500, unit: "kg", expiry: "15 Jun 2025", days: 48, status: "expiring" },
  { sku: "RM-078", name: "Adhesive Solvent", batch: "BATCH-2389", qty: 200, unit: "ltr", expiry: "10 May 2025", days: 12, status: "critical" },
];

export default function InventoryExpiryPage() {
  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-center px-8 h-16 border-b border-border-subtle bg-white/80 -mx-8 -mt-8 mb-8">
        <h1 className="font-display-lg text-lg font-bold text-on-surface">Inventory Expiry Report</h1>
        <div className="flex items-center gap-4">
          <select className="border border-border-subtle rounded-sm py-1.5 px-3 text-xs bg-stone-50"><option>30 Days</option><option>60 Days</option></select>
          <button className="bg-primary-container text-white px-4 py-1.5 rounded-sm flex items-center gap-2 hover:bg-primary cursor-pointer border-none shadow-sm text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
          </button>
        </div>
      </header>
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead><tr className="bg-stone-50 border-b border-border-subtle text-xs uppercase tracking-widest text-text-light font-bold">
            <th className="px-6 py-4">SKU</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Batch/Lot</th><th className="px-6 py-4 text-right">Qty</th><th className="px-6 py-4">Expiry Date</th><th className="px-6 py-4 text-right">Days Left</th><th className="px-6 py-4">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-50 font-mono text-sm">
            {products.map((p) => (
              <tr key={p.sku} className="hover:bg-stone-50">
                <td className="px-6 py-4 text-primary font-medium">{p.sku}</td>
                <td className="px-6 py-4 font-ui-sm font-bold text-on-surface">{p.name}</td>
                <td className="px-6 py-4 text-text-mid">{p.batch}</td>
                <td className="px-6 py-4 text-right">{p.qty} {p.unit}</td>
                <td className="px-6 py-4 text-text-mid">{p.expiry}</td>
                <td className={`px-6 py-4 text-right font-bold ${p.days < 30 ? 'text-red-600' : 'text-amber-600'}`}>{p.days}d</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${p.status === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
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
