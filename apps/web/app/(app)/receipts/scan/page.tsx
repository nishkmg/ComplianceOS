"use client";

import { useRef, useState, useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

interface ParsedReceipt {
  vendorName: string | null;
  vendorAddress: string | null;
  vendorGstin: string | null;
  parsedInvoiceDate: string | null;
  parsedTotal: string | null;
  parsedExpenseCategory: string | null;
  confidenceScore: string | null;
  status: string | null;
}

export default function ReceiptScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const accounts = api.accounts.list.useQuery(undefined, { staleTime: 60_000 });
  const expenseAccounts = useMemo(() => (accounts.data ?? []).filter((a) => a.kind === "Expense"), [accounts.data]);
  const payableAccounts = useMemo(() => (accounts.data ?? []).filter((a) => a.kind === "Liability"), [accounts.data]);
  const [expenseAccountId, setExpenseAccountId] = useState("");
  const [payableAccountId, setPayableAccountId] = useState("");

  const scan = api.ocrScan.get.useQuery(
    { scanId: scanId ?? "" },
    { enabled: !!scanId, refetchInterval: (q) => (q.state.data?.status === "processing" ? 2000 : false) },
  );
  const parsed = scan.data as ParsedReceipt | undefined;

  const createExpense = api.ocrScan.createExpenseFromScan.useMutation({
    onSuccess: () => {
      showToast.success("Expense entry created from receipt.");
      setScanId(null); setFile(null);
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
        scanType: "receipt",
      });
      setScanId(created.scanId);
    } catch (e: any) {
      showToast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const total = Number(parsed?.parsedTotal ?? "0");
  const canCreate = !!scanId && parsed?.status === "completed" && !!expenseAccountId && !!payableAccountId && total > 0;

  const handleCreate = () => {
    if (!scanId || !parsed) return;
    createExpense.mutate({
      scanId,
      vendorName: parsed.vendorName || "Unknown vendor",
      vendorGstin: parsed.vendorGstin || undefined,
      date: parsed.parsedInvoiceDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      total,
      expenseAccountId,
      payableAccountId,
    });
  };

  return (
    <div className="space-y-6 text-left">
      <header className="flex justify-between items-start px-8 py-6 border-b border-border bg-surface/80 -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Receipts</p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Scan Receipt</h1>
          <p className="text-ui-sm text-secondary font-ui mt-1">Upload a payment receipt; the extracted fields create an expense entry.</p>
        </div>
      </header>

      {!scanId ? (
        <div className="max-w-[600px] mx-auto bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
          <div className="border-2 border-dashed border-border rounded-md p-12 text-center cursor-pointer hover:bg-surface-muted transition-colors" onClick={() => inputRef.current?.click()}>
            <Icon name="upload_file" className="text-4xl text-light mb-4" />
            <p className="font-ui text-sm text-mid">{file ? file.name : "Click to upload a receipt"}</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <button onClick={handleScan} disabled={!file || uploading} className="w-full py-3 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">
            {uploading ? "Uploading…" : "Scan Receipt"}
          </button>
        </div>
      ) : !parsed || parsed.status === "processing" ? (
        <div className="max-w-[600px] mx-auto bg-surface border border-border rounded-md p-12 text-center shadow-sm space-y-4">
          <Icon name="hourglass" className="text-lighter animate-spin text-4xl mx-auto" />
          <p className="font-ui text-ui-sm text-mid">Extracting fields from the receipt…</p>
        </div>
      ) : parsed.status === "failed" ? (
        <div className="max-w-[600px] mx-auto">
          <EmptyState icon="error" title="Scan failed" description="The receipt could not be processed. Try a clearer image or PDF." />
        </div>
      ) : (
        <div className="max-w-[600px] mx-auto bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-ui text-lg font-bold text-dark">Extracted Fields</h2>
            <span className={`px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${Number(parsed.confidenceScore ?? 0) >= 80 ? "bg-success-bg text-success-deep border-success/20" : "bg-amber-soft text-amber border-amber-bright/30"}`}>
              {Math.round(Number(parsed.confidenceScore ?? 0))}% confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Vendor</label>
              <p className="font-ui text-ui-sm text-dark mt-1">{parsed.vendorName ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Vendor GSTIN</label>
              <p className="font-mono text-ui-sm text-dark mt-1">{parsed.vendorGstin ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Date</label>
              <p className="font-mono text-ui-sm text-dark mt-1">{parsed.parsedInvoiceDate?.slice(0, 10) ?? "—"}</p>
            </div>
            <div>
              <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Total</label>
              <p className="font-mono text-ui-sm font-bold text-dark mt-1">₹ {total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold" htmlFor="exp-account">Expense Account</label>
            <select id="exp-account" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={expenseAccountId} onChange={(e) => setExpenseAccountId(e.target.value)}>
              <option value="">Select expense account…</option>
              {expenseAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold" htmlFor="pay-account">Payable Account</label>
            <select id="pay-account" className="w-full bg-surface-muted border border-border rounded-md px-3 py-2 font-ui text-sm" value={payableAccountId} onChange={(e) => setPayableAccountId(e.target.value)}>
              <option value="">Select payable account…</option>
              {payableAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <Button className="w-full" onClick={handleCreate} disabled={!canCreate || createExpense.isPending}>
            {createExpense.isPending ? "Creating…" : "Create Expense Entry"} <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      )}
    </div>
  );
}
