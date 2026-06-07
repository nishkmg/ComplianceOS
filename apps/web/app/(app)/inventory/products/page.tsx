"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";

interface Product { id: string; sku: string; name: string; hsn_code: string; purchase_rate: string; sales_rate: string; is_active: boolean; }

export default function ProductsPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try { const r = await fetch(`/api/inventory/products?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setProducts((await r.json()).products || []); } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-lg font-semibold text-dark">Products</h1>
        <Link href="/inventory/products/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> New Product</Link>
      </div>
      {products.length === 0 ? <EmptyState icon="inventory_2" title="No products" description="Add your first product." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">SKU</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Name</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">HSN</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Purchase Rate</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Sales Rate</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {products.filter(p => p.is_active !== false).map(p => (
                <tr key={p.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-[12px] text-mid">{p.sku}</td>
                  <td className="py-3 px-6 font-ui text-[13px] text-dark">{p.name}</td>
                  <td className="py-3 px-6 font-mono text-[12px] text-mid">{p.hsn_code}</td>
                  <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{p.purchase_rate ? `₹${Number(p.purchase_rate).toLocaleString("en-IN")}` : "—"}</td>
                  <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{p.sales_rate ? `₹${Number(p.sales_rate).toLocaleString("en-IN")}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
