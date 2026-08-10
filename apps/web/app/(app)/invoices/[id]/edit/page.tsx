"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

export default function EditInvoicePage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const utils = api.useUtils();
  const [customerName, setCustomerName] = useState("");

  const { data: invoiceData, isLoading } = api.invoices.get.useQuery({ id }, { enabled: !!id });
  const modify = api.invoices.modify.useMutation();

  useEffect(() => {
    if (invoiceData) {
      const inv = invoiceData as { customerName?: string };
      if (inv.customerName) setCustomerName(inv.customerName);
    }
  }, [invoiceData]);

  const handleSave = async () => {
    if (!customerName.trim()) { showToast.error("Customer name is required."); return; }
    const previousGet = utils.invoices.get.getData({ id });
    const previousList = utils.invoices.list.getData({ page: 1, pageSize: 50 });
    utils.invoices.get.setData({ id }, (old) => old ? { ...old, customerName } : old);
    const listUpdater = (old: { invoices: Array<{ id: string } & Record<string, unknown>> } | undefined) => {
      if (!old) return old;
      return { ...old, invoices: old.invoices.map((r) => (r.id === id ? { ...r, customerName } : r)) };
    };
    utils.invoices.list.setData({ page: 1, pageSize: 50 }, listUpdater as never);
    try {
      await modify.mutateAsync({ id, data: { customerName } });
      showToast.success("Invoice updated");
      router.refresh();
      router.push(`/invoices/${id}`);
    } catch (err: unknown) {
      utils.invoices.get.setData({ id }, previousGet);
      utils.invoices.list.setData({ page: 1, pageSize: 50 }, previousList);
      showToast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <h1 className="font-ui text-display-lg font-semibold text-dark">Edit Invoice</h1>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="space-y-1.5"><label className="font-ui text-ui-2xs text-light uppercase font-bold">Customer Name</label><input className="w-full border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
        <button onClick={handleSave} disabled={modify.isPending} className="w-full py-3 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">
          {modify.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
