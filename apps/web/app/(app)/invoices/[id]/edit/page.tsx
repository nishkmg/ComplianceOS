"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { useSession } from "next-auth/react";

export default function EditInvoicePage() {
  const params = useParams(); const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [customerName, setCustomerName] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/invoices/${params.id}?tenantId=${tenantId || ""}`);
        if (res.ok) {
          const data = await res.json();
          const inv = data.invoice || data;
          if (inv) { setCustomerName(inv.customer_name || ""); setStatus(inv.status || "draft"); }
        }
      } catch {} finally { setLoading(false); }
    })();
  }, [params.id, tenantId]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, id: params.id, customer_name: customerName, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast.success("Invoice updated");
      router.push(`/invoices/${params.id}`);
    } catch (err: any) { showToast.error(err.message); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-display text-display-lg font-semibold text-dark">Edit Invoice</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="space-y-1.5"><label className="font-ui text-[10px] text-light uppercase font-bold">Customer Name</label><input className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
        <div className="space-y-1.5"><label className="font-ui text-[10px] text-light uppercase font-bold">Status</label>
          <select className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="draft">Draft</option><option value="posted">Posted</option><option value="voided">Voided</option>
          </select>
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer">Save</button>
      </div>
    </div>
  );
}
