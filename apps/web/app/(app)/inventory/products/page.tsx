"use client";

import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

interface Product { id: string; sku: string; name: string; hsnCode: string; purchaseRate: string | null; salesRate: string | null; isActive: boolean; }

export default function ProductsPage() {
  const { data, isLoading } = api.products.list.useQuery({ page: 1, pageSize: 100 });
  const products = ((data?.products ?? []) as Product[]).filter(p => p.isActive !== false);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">Products</h1>
        <Link href="/inventory/products/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white dark:text-amber-ink text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> New Product</Link>
      </div>
      {products.length === 0 ? <EmptyState icon="inventory_2" title="No products" description="Add your first product." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">SKU</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Name</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">HSN</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Purchase Rate</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Sales Rate</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{p.sku}</td>
                  <td className="py-3 px-6 font-ui text-ui-sm text-dark">{p.name}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{p.hsnCode}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">{p.purchaseRate ? `₹${Number(p.purchaseRate).toLocaleString("en-IN")}` : "—"}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">{p.salesRate ? `₹${Number(p.salesRate).toLocaleString("en-IN")}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
