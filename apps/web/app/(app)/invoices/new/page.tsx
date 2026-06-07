"use client";

import { useState, useCallback, useRef } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";

export default function NewInvoicePage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const userId = (session?.user as Record<string, unknown> | undefined)?.id as string | null;
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState([{ description: "", quantity: "1", rate: "" }]);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const handleSubmit = async () => {
    if (savingRef.current || !tenantId || !userId) return;
    if (!customerName.trim()) { showToast.error("Customer name is required."); return; }
    setSaving(true); savingRef.current = true;
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, customerName: customerName.trim(), date, lines: lines.filter(l => l.description), createdBy: userId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed (${res.status})`);
      showToast.success("Invoice created");
      router.push("/invoices");
    } catch (err: any) { showToast.error(err.message); }
    finally { setSaving(false); savingRef.current = false; }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
          <h1 className="font-display text-display-lg font-semibold text-dark">New Invoice</h1>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">
          {saving ? "Creating…" : "Create Invoice"}
        </button>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Customer Name</label>
            <input className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</label>
            <input type="date" className="w-full border border-border rounded-md px-4 py-3 font-mono text-sm focus:outline-none focus:border-amber" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-3 gap-4">
            <input className="border border-border rounded-md px-4 py-2 font-ui text-sm focus:outline-none focus:border-amber" placeholder="Description" value={l.description} onChange={e => { const n = [...lines]; n[i].description = e.target.value; setLines(n); }} />
            <input type="number" className="border border-border rounded-md px-4 py-2 font-mono text-sm focus:outline-none focus:border-amber" placeholder="Qty" value={l.quantity} onChange={e => { const n = [...lines]; n[i].quantity = e.target.value; setLines(n); }} />
            <input type="number" className="border border-border rounded-md px-4 py-2 font-mono text-sm focus:outline-none focus:border-amber" placeholder="Rate" value={l.rate} onChange={e => { const n = [...lines]; n[i].rate = e.target.value; setLines(n); }} />
          </div>
        ))}
        <button onClick={() => setLines([...lines, { description: "", quantity: "1", rate: "" }])} className="text-amber text-[11px] font-bold uppercase tracking-widest hover:underline border-none bg-transparent cursor-pointer">+ Add Line</button>
      </div>
    </div>
  );
}
