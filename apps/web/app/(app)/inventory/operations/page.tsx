"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

interface ProductOption { id: string; name: string; }

export default function InventoryOperationsPage() {
  const { data: products } = api.products.list.useQuery({ pageSize: 200 }, { staleTime: 30_000 });
  const opts: ProductOption[] = ((products as any)?.products ?? []).map((p: any) => ({ id: p.id, name: p.name }));

  const [receive, setReceive] = useState({ productId: "", quantity: "", unitCost: "", batchNumber: "", receiptDate: new Date().toISOString().slice(0, 10), narration: "" });
  const [deliver, setDeliver] = useState({ productId: "", quantity: "", narration: "" });
  const [adjust, setAdjust] = useState({ productId: "", quantity: "", reason: "correction", narration: "" });
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const invalidate = () => { void utils.inventory.summary.invalidate(); void utils.inventory.layers.invalidate(); };

  const receiveMutation = api.inventory.purchaseReceipt.useMutation({
    onSuccess: () => { showToast.success("Stock received."); setReceive({ productId: "", quantity: "", unitCost: "", batchNumber: "", receiptDate: new Date().toISOString().slice(0, 10), narration: "" }); setBusy(false); invalidate(); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });
  const deliverMutation = api.inventory.salesDelivery.useMutation({
    onSuccess: () => { showToast.success("Stock delivered."); setDeliver({ productId: "", quantity: "", narration: "" }); setBusy(false); invalidate(); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });
  const adjustMutation = api.inventory.adjustStock.useMutation({
    onSuccess: () => { showToast.success("Stock adjusted."); setAdjust({ productId: "", quantity: "", reason: "correction", narration: "" }); setBusy(false); invalidate(); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  const productSelect = (label: string, value: string, onChange: (v: string) => void) => (
    <div>
      <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <option value="">Select product…</option>
        {opts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  );

  const inputCls = "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8">
        <PageHeader
          eyebrow="Inventory · Operations"
          title="Stock Operations"
          description="Receive purchase stock, deliver sales stock, and record adjustments — each posts the FIFO layer movement."
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receive */}
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
          <div className="p-5 border-b border-border-subtle bg-surface-muted/50">
            <h3 className="font-ui text-base font-bold text-dark">Receive (Purchase)</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Adds stock at unit cost</p>
          </div>
          <div className="p-5 space-y-4">
            {productSelect("Product", receive.productId, (v) => setReceive({ ...receive, productId: v }))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Quantity</label>
                <input type="number" value={receive.quantity} onChange={(e) => setReceive({ ...receive, quantity: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Unit cost ₹</label>
                <input type="number" value={receive.unitCost} onChange={(e) => setReceive({ ...receive, unitCost: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Batch / narration</label>
              <input value={receive.batchNumber} onChange={(e) => setReceive({ ...receive, batchNumber: e.target.value })} placeholder="Batch no." className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Date</label>
              <input type="date" value={receive.receiptDate} onChange={(e) => setReceive({ ...receive, receiptDate: e.target.value })} className={inputCls} />
            </div>
            <button
              onClick={() => { if (!receive.productId || !receive.quantity || !receive.unitCost) { showToast.error("Product, quantity and unit cost required."); return; } setBusy(true); receiveMutation.mutate({ productId: receive.productId, quantity: Number(receive.quantity), unitCost: Number(receive.unitCost), batchNumber: receive.batchNumber || undefined, receiptDate: receive.receiptDate, narration: receive.narration || undefined }); }}
              disabled={busy}
              className="btn btn-primary w-full"
            >Receive Stock</button>
          </div>
        </div>

        {/* Deliver */}
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
          <div className="p-5 border-b border-border-subtle bg-surface-muted/50">
            <h3 className="font-ui text-base font-bold text-dark">Deliver (Sales)</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Consumes FIFO layers</p>
          </div>
          <div className="p-5 space-y-4">
            {productSelect("Product", deliver.productId, (v) => setDeliver({ ...deliver, productId: v }))}
            <div>
              <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Quantity</label>
              <input type="number" value={deliver.quantity} onChange={(e) => setDeliver({ ...deliver, quantity: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Narration</label>
              <input value={deliver.narration} onChange={(e) => setDeliver({ ...deliver, narration: e.target.value })} placeholder="e.g. Invoice INV-0001" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
            </div>
            <button
              onClick={() => { if (!deliver.productId || !deliver.quantity) { showToast.error("Product and quantity required."); return; } setBusy(true); deliverMutation.mutate({ productId: deliver.productId, quantity: Number(deliver.quantity), narration: deliver.narration || undefined }); }}
              disabled={busy}
              className="btn btn-primary w-full"
            >Deliver Stock</button>
          </div>
        </div>

        {/* Adjust */}
        <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
          <div className="p-5 border-b border-border-subtle bg-surface-muted/50">
            <h3 className="font-ui text-base font-bold text-dark">Adjust</h3>
            <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Damage, loss, gain, correction</p>
          </div>
          <div className="p-5 space-y-4">
            {productSelect("Product", adjust.productId, (v) => setAdjust({ ...adjust, productId: v }))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Qty change (±)</label>
                <input type="number" value={adjust.quantity} onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })} placeholder="−2 or +3" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Reason</label>
                <select value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  {["damage", "loss", "gain", "correction"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Narration</label>
              <input value={adjust.narration} onChange={(e) => setAdjust({ ...adjust, narration: e.target.value })} placeholder="Optional" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
            </div>
            <button
              onClick={() => { if (!adjust.productId || !adjust.quantity || Number(adjust.quantity) === 0) { showToast.error("Product and a non-zero quantity required."); return; } setBusy(true); adjustMutation.mutate({ productId: adjust.productId, quantity: Number(adjust.quantity), reason: adjust.reason as any, narration: adjust.narration || undefined }); }}
              disabled={busy}
              className="btn btn-primary w-full"
            >Apply Adjustment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
