"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  grandTotal: string | number;
  status: string;
  irn?: string | null;
  irnGeneratedAt?: string | null;
  irnCancelled?: boolean | null;
  ewbNo?: string | null;
  ewbValidTill?: string | null;
}

export default function InvoiceDetailPage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [ewbOpen, setEwbOpen] = useState(false);
  const [ewbForm, setEwbForm] = useState({ distance: "", vehicleNo: "" });
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const { data: invoice, isLoading } = api.invoices.get.useQuery({ id }, { enabled: !!id });

  const irnMutation = api.einvoice.generateIrn.useMutation({
    onSuccess: () => { showToast.success("IRN generated (sandbox)."); void utils.invoices.get.invalidate(); setBusy(false); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  const postMutation = api.invoices.post.useMutation({
    onSuccess: () => { showToast.success("Invoice posted to ledger."); void utils.invoices.get.invalidate(); void utils.invoices.list.invalidate(); setBusy(false); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  const voidMutation = api.invoices.void.useMutation({
    onSuccess: () => { showToast.success("Invoice voided."); void utils.invoices.get.invalidate(); void utils.invoices.list.invalidate(); setBusy(false); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  const ewbMutation = api.einvoice.generateEwb.useMutation({
    onSuccess: () => { showToast.success("E-way bill generated (sandbox)."); setEwbOpen(false); void utils.invoices.get.invalidate(); setBusy(false); },
    onError: (e) => { showToast.error(e.message); setBusy(false); },
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!invoice) return <div className="text-center py-20 text-mid font-ui">Invoice not found.</div>;

  const inv = invoice as Invoice;

  const confirmEwb = () => {
    const distance = Number(ewbForm.distance);
    if (!distance || distance <= 0) { showToast.error("Enter the transport distance in km."); return; }
    setBusy(true);
    ewbMutation.mutate({ invoiceId: inv.id, distance, vehicleNo: ewbForm.vehicleNo || undefined });
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
          <div><PageHeader title={inv.invoiceNumber} /></div>
        </div>
        <Badge variant={inv.status === "posted" ? "success" : "amber"}>{inv.status}</Badge>
      </div>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm grid grid-cols-2 gap-6">
        <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Customer</span><p className="font-ui text-ui-sm text-dark mt-1">{inv.customerName}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Date</span><p className="font-mono text-ui-sm text-dark mt-1">{new Date(inv.date).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Due Date</span><p className="font-mono text-ui-sm text-dark mt-1">{new Date(inv.dueDate).toLocaleDateString("en-IN")}</p></div>
        <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Total</span><p className="font-mono text-lg font-bold text-dark mt-1">{formatIndianNumber(Number(inv.grandTotal), { currency: true })}</p></div>
      </div>

      {/* Statutory: e-invoice IRN + e-way bill (sandbox adapters) */}
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-ui text-ui-sm font-bold text-dark uppercase tracking-widest">Statutory</h2>
          <span className="inline-block px-2 py-0.5 text-ui-2xs uppercase font-bold tracking-widest border rounded-md bg-amber-soft text-amber border-amber/30">Sandbox</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="border border-border-subtle rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">E-invoice IRN</span>
              <button
                onClick={() => { setBusy(true); irnMutation.mutate({ invoiceId: inv.id }); }}
                disabled={busy || !!inv.irn}
                className="text-amber font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer disabled:opacity-40"
              >
                {inv.irn ? "Generated" : "Generate"}
              </button>
            </div>
            {inv.irn ? (
              <div className="mt-3 space-y-1">
                <p className="font-mono text-ui-xs text-mid break-all">{inv.irn}</p>
                {inv.irnGeneratedAt && <p className="font-ui text-ui-2xs text-light">{new Date(inv.irnGeneratedAt).toLocaleString("en-IN")}</p>}
                {inv.irnCancelled && <Badge variant="amber">Cancelled</Badge>}
              </div>
            ) : (
              <p className="mt-3 font-ui text-ui-2xs text-light">IRN not yet generated for this invoice.</p>
            )}
          </div>
          <div className="border border-border-subtle rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">E-way bill</span>
              <button
                onClick={() => setEwbOpen(true)}
                disabled={busy || !!inv.ewbNo}
                className="text-amber font-bold uppercase text-ui-2xs tracking-widest border-none bg-transparent cursor-pointer disabled:opacity-40"
              >
                {inv.ewbNo ? "Generated" : "Generate"}
              </button>
            </div>
            {inv.ewbNo ? (
              <div className="mt-3 space-y-1">
                <p className="font-mono text-ui-xs text-mid">EWB {inv.ewbNo}</p>
                {inv.ewbValidTill && <p className="font-ui text-ui-2xs text-light">Valid till {new Date(inv.ewbValidTill).toLocaleString("en-IN")}</p>}
              </div>
            ) : (
              <p className="mt-3 font-ui text-ui-2xs text-light">No e-way bill for this invoice.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {inv.status === "draft" && (
          <>
            <button
              onClick={() => { setBusy(true); postMutation.mutate({ id: inv.id }); }}
              disabled={busy}
              className="btn btn-primary"
            >
              Post to Ledger
            </button>
            <Link href={`/invoices/${inv.id}/edit`} className="btn btn-secondary no-underline">Edit</Link>
          </>
        )}
        {inv.status !== "draft" && inv.status !== "voided" && (
          <button
            onClick={() => {
              const reason = window.prompt("Reason for voiding this invoice?");
              if (reason === null) return;
              setBusy(true);
              voidMutation.mutate({ id: inv.id, reason: reason || "Voided by user" });
            }}
            disabled={busy}
            className="btn btn-ghost text-danger"
          >
            Void Invoice
          </button>
        )}
        <Link href={`/invoices/${inv.id}/pdf`} className="btn btn-secondary no-underline">View PDF</Link>
      </div>

      {/* EWB dialog */}
      {ewbOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEwbOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-ui text-base font-semibold text-dark">Generate e-way bill</h3>
            <p className="mt-1 font-ui text-ui-sm text-mid">NIC sandbox adapter — distance in km, vehicle number optional.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="ewb-distance" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Distance (km)</label>
                <input id="ewb-distance" type="number" value={ewbForm.distance} onChange={(e) => setEwbForm({ ...ewbForm, distance: e.target.value })} className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
              <div>
                <label htmlFor="ewb-vehicle" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Vehicle number</label>
                <input id="ewb-vehicle" value={ewbForm.vehicleNo} onChange={(e) => setEwbForm({ ...ewbForm, vehicleNo: e.target.value })} placeholder="KA01AB1234" className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEwbOpen(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={confirmEwb} disabled={busy} className="btn btn-primary">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
