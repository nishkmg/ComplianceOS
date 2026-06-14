"use client";

import { Icon } from '@/components/ui/icon';
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

interface StockItem { id: string; productId: string; quantity: string; remainingQuantity: string; unitCost: string; totalValue: string; receiptDate: string; }

export default function StockPage() {
  const { data, isLoading } = api.inventory.layers.useQuery();
  const stock = (data ?? []) as StockItem[];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Stock</h1>
      {stock.length === 0 ? <EmptyState icon="inventory_2" title="No stock" description="Stock layers will appear here once inventory movements are recorded." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse"><thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Product</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Qty</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Remaining</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Unit Cost</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Total Value</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Receipt Date</th>
          </tr></thead><tbody className="divide-y divide-border-subtle">
            {stock.map(s => (
              <tr key={s.id} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{s.productId?.substring(0, 8)}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{Number(s.quantity || 0).toLocaleString("en-IN")}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{Number(s.remainingQuantity || 0).toLocaleString("en-IN")}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{formatIndianNumber(Number(s.unitCost || 0), { currency: true })}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{formatIndianNumber(Number(s.totalValue || 0), { currency: true })}</td>
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{s.receiptDate ? new Date(s.receiptDate).toLocaleDateString("en-IN") : "—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
