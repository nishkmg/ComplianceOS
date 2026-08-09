"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { KPISkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { KpiTile } from "@/components/ui/kpi-tile";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

interface StockLayer {
  id: string;
  product_id: string;
  quantity: string;
  remaining_quantity: string;
  unit_cost: string;
  total_value: string;
  receipt_date: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  unit_of_measure: string | null;
}

export default function InventoryDashboardPage() {
  const { activeFy } = useFiscalYear();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const { data, isLoading } = api.inventory.summary.useQuery(undefined, {
    staleTime: 0,
    refetchInterval: 30_000,
  });
  const [layers, setLayers] = useState<StockLayer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const [stockRes, productRes] = await Promise.all([
          fetch(`/api/inventory/stock?tenantId=${encodeURIComponent(tenantId)}`),
          fetch(`/api/inventory/products?tenantId=${encodeURIComponent(tenantId)}`),
        ]);
        if (stockRes.ok) setLayers(((await stockRes.json()).stock || []) as StockLayer[]);
        if (productRes.ok) setProducts(((await productRes.json()).products || []) as Product[]);
      } catch {
      } finally {
        setStockLoading(false);
      }
    })();
  }, [tenantId]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // Reorder list: layers sorted by remaining quantity ascending, top 6
  const reorderList = useMemo(
    () =>
      [...layers]
        .sort((a, b) => parseFloat(a.remaining_quantity) - parseFloat(b.remaining_quantity))
        .slice(0, 6)
        .map((l) => {
          const product = productById.get(l.product_id);
          const qty = parseFloat(l.remaining_quantity);
          return {
            sku: product?.sku ?? "—",
            name: product?.name ?? "Unknown product",
            available: qty,
            unit: product?.unit_of_measure ?? "nos",
            value: parseFloat(l.total_value),
            status: qty <= 0 ? ("critical" as const) : qty < 10 ? ("low" as const) : ("ok" as const),
          };
        }),
    [layers, productById]
  );

  // Valuation bars: per-product summed layer value
  const valuationBars = useMemo(() => {
    const byProduct = new Map<string, { name: string; value: number }>();
    for (const l of layers) {
      const product = productById.get(l.product_id);
      const key = l.product_id;
      const cur = byProduct.get(key) ?? { name: product?.name ?? "Unknown", value: 0 };
      cur.value += parseFloat(l.total_value);
      byProduct.set(key, cur);
    }
    const total = [...byProduct.values()].reduce((s, b) => s + b.value, 0);
    return [...byProduct.values()]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((b) => ({ ...b, pct: total > 0 ? Math.round((b.value / total) * 100) : 0 }));
  }, [layers, productById]);

  const kpiTiles = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Inventory Value",
        value: formatIndianNumber(parseFloat(data.totalValue), { currency: true }),
        delta: { value: data.productCount, label: "products tracked" },
        variant: "neutral" as const,
        icon: "account_balance_wallet" as const,
      },
      {
        label: "Low Stock Alerts",
        value: String(data.lowStock),
        delta: { value: 0, label: "below reorder threshold" },
        variant: "amber" as const,
        icon: "warning" as const,
      },
      {
        label: "Out of Stock",
        value: String(data.outOfStock),
        delta: { value: 0, label: "procurement pending" },
        variant: "danger" as const,
        icon: "error" as const,
      },
      {
        label: "HSN Compliance",
        value: `${data.hsnCompliance}%`,
        delta: { value: 0, label: "SKUs with HSN codes" },
        variant: "success" as const,
        icon: "verified" as const,
      },
    ];
  }, [data]);

  return (
    <div className="space-y-8 text-left">
      <PageHeader
        eyebrow={`Operations Control · FY ${activeFy}`}
        title="Inventory Overview"
        description="Stock position and valuation across products and warehouses (FIFO)."
        actions={
          <>
            <Link href="/inventory/products" className="no-underline">
              <button className="inline-flex h-10 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-dark shadow-sm transition-all duration-150 ease-smooth hover:border-amber hover:text-amber active:scale-[0.98]">
                Manage Products
              </button>
            </Link>
            <Link href="/inventory/stock" className="no-underline">
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-amber px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-smooth hover:bg-amber-hover active:scale-[0.98]">
                Stock Ledger
                <Icon name="arrow_forward" className="text-[16px]" />
              </button>
            </Link>
          </>
        }
      />

      {/* KPI Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
          <KPISkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiTiles.map((tile) => (
            <KpiTile key={tile.label} {...tile} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reorder list */}
        <div className="lg:col-span-8 bg-surface border border-border shadow-sm overflow-hidden rounded-md">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface-muted">
            <h3 className="font-ui text-sm font-semibold text-dark">Reorder List</h3>
            <Link href="/inventory/stock" className="text-ui-xs text-amber font-bold uppercase tracking-widest no-underline hover:underline">
              View Full Ledger
            </Link>
          </div>
          {stockLoading ? (
            <TableSkeleton rows={5} columns={4} />
          ) : reorderList.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="inventory" className="text-3xl text-lighter mx-auto mb-3" />
              <p className="font-ui text-[13px] text-mid">No stock layers yet — they appear after the first purchase receipt.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted/50 border-b border-border">
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">SKU / Item</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Balance</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Value</th>
                  <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[13px]">
                {reorderList.map((item) => (
                  <tr key={item.sku} className="hover:bg-surface-muted transition-colors">
                    <td className="py-4 px-6 text-left">
                      <p className="font-ui text-[13px] font-medium text-dark">{item.name}</p>
                      <p className="font-ui text-[11px] text-light mt-0.5">{item.sku}</p>
                    </td>
                    <td className="py-4 px-6 text-right text-dark tabular-nums">
                      {item.available} <span className="text-light">{item.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-right text-dark tabular-nums">
                      {formatIndianNumber(item.value, { currency: true })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                        item.status === "critical"
                          ? "bg-danger-bg text-danger-deep border-danger/20"
                          : item.status === "low"
                            ? "bg-amber-soft text-amber-hover border-amber-bright/30"
                            : "bg-surface-muted text-mid border-border"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Valuation by product — real bars (replaced the placeholder donut) */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-md shadow-sm p-6">
          <h3 className="font-ui text-sm font-semibold text-dark mb-6">Stock Valuation</h3>
          {valuationBars.length === 0 ? (
            <p className="font-ui text-[13px] text-mid leading-relaxed">
              Valuation builds from purchase receipts. Record your first inward stock to see FIFO values here.
            </p>
          ) : (
            <div className="space-y-4">
              {valuationBars.map((bar) => (
                <div key={bar.name}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-ui text-[13px] font-medium text-dark truncate pr-3">{bar.name}</span>
                    <span className="font-mono text-[12px] text-mid tabular-nums shrink-0">
                      {formatIndianNumber(bar.value, { currency: true })}
                    </span>
                  </div>
                  <div className="w-full bg-lighter/60 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-bright rounded-full" style={{ width: `${bar.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
