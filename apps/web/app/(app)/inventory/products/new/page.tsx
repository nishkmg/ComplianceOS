"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [sku, setSku] = useState(""); const [name, setName] = useState(""); const [hsnCode, setHsnCode] = useState(""); const [purchaseRate, setPurchaseRate] = useState(""); const [salesRate, setSalesRate] = useState(""); const [saving, setSaving] = useState(false);
  const createProduct = api.products.create.useMutation();

  const handleSubmit = async () => {
    if (!sku || !name || !hsnCode) { showToast.error("SKU, name, and HSN code are required."); return; }
    setSaving(true);
    const prodListInput = { page: 1, pageSize: 100 };
    const previousProdList = utils.products.list.getData(prodListInput);
    const tempProdId = `temp-${Date.now()}`;
    await utils.products.list.cancel(prodListInput);
    const prodApply = (old: unknown) => {
      const cur = (old as { products?: Array<Record<string, unknown>> } | undefined);
      const products = cur?.products ?? [];
      const tempRow: Record<string, unknown> = {
        id: tempProdId,
        sku, name, hsnCode,
        purchaseRate: purchaseRate ? Number(purchaseRate) : null,
        salesRate: salesRate ? Number(salesRate) : null,
        isActive: true,
      };
      return { ...(cur ?? {}), products: [tempRow, ...products] };
    };
    utils.products.list.setData(prodListInput, prodApply as never);
    try {
      await createProduct.mutateAsync({
        sku, name, hsnCode,
        purchaseRate: purchaseRate ? Number(purchaseRate) : undefined,
        salesRate: salesRate ? Number(salesRate) : undefined,
      });
      showToast.success("Product created");
      await utils.products.list.invalidate(prodListInput);
      router.refresh();
      router.push("/inventory/products");
    } catch (err: any) {
      utils.products.list.setData(prodListInput, (() => previousProdList) as never);
      showToast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} aria-label="Go back" className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" ><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-ui text-display-lg font-semibold text-dark">New Product</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5"><label htmlFor="product-sku" className="font-ui text-ui-2xs text-light uppercase font-bold">SKU</label><input id="product-sku" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={sku} onChange={e => setSku(e.target.value)} /></div>
          <div className="space-y-1.5"><label htmlFor="product-name" className="font-ui text-ui-2xs text-light uppercase font-bold">Name</label><input id="product-name" className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={name} onChange={e => setName(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><label htmlFor="product-hsn" className="font-ui text-ui-2xs text-light uppercase font-bold">HSN Code</label><input id="product-hsn" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={hsnCode} onChange={e => setHsnCode(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5"><label htmlFor="product-purchase-rate" className="font-ui text-ui-2xs text-light uppercase font-bold">Purchase Rate (₹)</label><input id="product-purchase-rate" type="number" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={purchaseRate} onChange={e => setPurchaseRate(e.target.value)} /></div>
          <div className="space-y-1.5"><label htmlFor="product-sales-rate" className="font-ui text-ui-2xs text-light uppercase font-bold">Sales Rate (₹)</label><input id="product-sales-rate" type="number" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={salesRate} onChange={e => setSalesRate(e.target.value)} /></div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="w-full py-3 bg-amber text-white dark:text-amber-ink text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">{saving ? "Creating…" : "Create Product"}</button>
      </div>
    </div>
  );
}
