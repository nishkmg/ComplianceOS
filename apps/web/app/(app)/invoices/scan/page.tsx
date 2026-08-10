"use client";

import { useRef, useState, useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

interface Parsed {
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  subtotal: string | null;
  cgstTotal: string | null;
  sgstTotal: string | null;
  igstTotal: string | null;
  total: string | null;
  confidenceScore: string | null;
  status: string | null;
}

export default function ScanInvoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const accounts = api.accounts.list.useQuery(undefined, { staleTime: 60_000 });
  const revenueAccounts = useMemo(
    () => (accounts.data ?? []).filter((a) => a.kind === "Revenue"),
    [accounts.data],
  );
  const [revenueAccountId, setRevenueAccountId] = useState("");

  const scan = api.ocrScan.get.useQuery(
    { scanId: scanId ?? "" },
    { enabled: !!scanId, refetchInterval: (q) => (q.state.data?.status === "processing" ? 2000 : false) },
  );
  const parsed: Parsed | undefined = scan.data as Parsed | undefined;

  const createInvoice = api.ocrScan.createInvoiceFromScan.useMutation({
    onSuccess: () => {
      showToast.success("Invoice created from scan.");
      setScanId(null); setFile(null); setCustomerName("");
      void utils.ocrScan.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const handleScan = async () => {
    if (!file) { showToast.error("Please select a file."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Upload failed (${res.status})`);
      const created = await utils.client.ocrScan.upload.mutate({
        fileUrl: body.url,
        fileName: file.name,
        fileSize: file.size,
        scanType: "invoice",
      });
      setScanId(created.scanId);
    } catch (e: any) {
      showToast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const total = Number(parsed?.total ?? "0");
  const canCreate = !!scanId && parsed?.status === "completed" && !!customerName.trim() && !!revenueAccountId && total > 0;

  const handleCreate = () => {
    if (!scanId || !parsed) return;
    createInvoice.mutate({
      scanId,
      customerName: customerName.trim(),
      customerState: "TN",
      date: parsed.invoiceDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      dueDate: parsed.dueDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      lines: [{
        accountId: revenueAccountId,
        description: parsed.invoiceNumber ? `Invoice ${parsed.invoiceNumber}` : "Scanned invoice",
        quantity: 1,
        unitPrice: total,
        gstRate: 0,
      }],
    });
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Scan Invoice</h1>

      {!scanId ? (
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
          <div className="border-2 border-dashed border-border rounded-md p-12 text-center cursor-pointer hover:bg-surface-muted transition-colors" onClick={() => inputRef.current?.click()}>
            <Icon name="upload_file" className="text-4xl text-light mb-4" />
            <p className="font-ui text-sm text-mid">{file ? file.name : "Click to upload an invoice or receipt"}</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <button onClick={handleScan} disabled={!file || uploading} className="w-full py-3 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">
            {uploading ? "Uploading…" : "Scan Document"}
          </button>
        </div>
      ) : !parsed || parsed.status === "processing" ? (
        <div className="bg-surface border border-border rounded-md p-12 text-center shadow-sm space-y-4">
          <Icon name="hourglass" className="text-lighter animate-spin text-4xl mx-auto" />
          <p className="font-ui text-ui-sm text-mid">Extracting fields from the document…</p>
        </div>
      ) : parsed.status === "failed" ? (
        <EmptyState icon="error" title="Scan failed" description="The document could not be processed. Try a clearer image or PDF." />
      ) : (
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-ui text-lg font-bold text-dark">Extracted Fields</h2>
            <span className={`px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${Number(parsed.confidenceScore ?? 0) >= 80 ? "bg-success-bg text-success-deep border-success/20" : "bg-amber-soft text-amber border-amber-bright/30"}`}>
              {Math.round(Number(parsed.confidenceScore ?? 0))}% confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold" htmlFor="inv-customer">Customer Name</label>
              <input id="inv-customer" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm mt-1" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Extracted: " />
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Invoice No.</label>
              <p className="font-mono text-ui-sm text-dark mt-1">{parsed.invoiceNumber ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Invoice Date</label>
              <p className="font-mono text-ui-sm text-dark mt-1">{parsed.invoiceDate?.slice(0, 10) ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Due Date</label>
              <p className="font-mono text-ui-sm text-dark mt-1">{parsed.dueDate?.slice(0, 10) ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Subtotal</label>
              <p className="font-mono text-ui-sm text-dark mt-1">₹ {Number(parsed.subtotal ?? "0").toLocaleString("en-IN")}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Total</label>
              <p className="font-mono text-ui-sm font-bold text-dark mt-1">₹ {total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold" htmlFor="inv-account">Revenue Account</label>
            <select id="inv-account" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={revenueAccountId} onChange={(e) => setRevenueAccountId(e.target.value)}>
              <option value="">Select revenue account…</option>
              {revenueAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <Button className="w-full" onClick={handleCreate} disabled={!canCreate || createInvoice.isPending}>
            {createInvoice.isPending ? "Creating…" : "Create Invoice"} <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      )}
    </div>
  );
}
