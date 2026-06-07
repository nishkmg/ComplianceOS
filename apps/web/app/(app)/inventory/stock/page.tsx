"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";

interface StockItem { id: string; product_id: string; quantity: string; remaining_quantity: string; unit_cost: string; total_value: string; receipt_date: string; }

export default function StockPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [stock, setStock] = useState<StockItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tenantId) return; (async () => { try { const r = await fetch(`/api/inventory/stock?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setStock((await r.json()).stock || []); } catch {} finally { setLoading(false); } })(); }, [tenantId]);
  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-display text-display-lg font-semibold text-dark">Stock</h1>
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
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{s.product_id?.substring(0, 8)}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{Number(s.quantity || 0).toLocaleString("en-IN")}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{Number(s.remaining_quantity || 0).toLocaleString("en-IN")}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{formatIndianNumber(Number(s.unit_cost || 0), { currency: true })}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{formatIndianNumber(Number(s.total_value || 0), { currency: true })}</td>
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{s.receipt_date ? new Date(s.receipt_date).toLocaleDateString("en-IN") : "—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
