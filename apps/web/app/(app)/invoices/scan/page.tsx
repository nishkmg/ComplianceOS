"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { UploadZone } from "@/components/ocr/upload-zone";
import { ScanResults } from "@/components/ocr/scan-results";
import type { ScanResult } from "@/components/ocr/types";

type ScanStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

async function fetchScan(scanId: string): Promise<ScanResult | null> {
  const input = JSON.stringify({ scanId });
  const response = await fetch(`/api/trpc/ocrScan.get?input=${encodeURIComponent(input)}`);
  if (!response.ok) return null;
  const json = await response.json();
  return json.result?.data ?? null;
}

async function uploadScan(fileUrl: string, fileName: string, fileSize: number): Promise<{ scanId: string }> {
  const input = JSON.stringify({ fileUrl, fileName, fileSize });
  const response = await fetch("/api/trpc/ocrScan.upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { fileUrl, fileName, fileSize } }),
  });
  if (!response.ok) throw new Error("Upload failed");
  const json = await response.json();
  return json.result?.data ?? { scanId: "" };
}

export default function ScanInvoicePage() {
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scanStatus !== "processing" || !currentScanId) return;
    let count = 0;
    const interval = setInterval(async () => {
      count++;
      if (count > 12) { clearInterval(interval); setScanStatus("failed"); setError("OCR timed out. Please try again."); return; }
      const result = await fetchScan(currentScanId);
      if (result) {
        setScanResult(result);
        if (result.status === "completed") {
          setScanStatus("completed");
          clearInterval(interval);
        } else if (result.status === "failed") {
          setScanStatus("failed");
          setError("OCR processing failed. Please try again.");
          clearInterval(interval);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scanStatus, currentScanId]);

  const handleUploadComplete = useCallback(async (_fileUrl: string, _fileName: string, _fileSize: number) => {
    setError(null);
    setScanStatus("uploading");
    // Simulate upload + OCR processing (tRPC not wired)
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockScanId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    setCurrentScanId(mockScanId);
    setScanStatus("processing");
    // After 4 seconds, simulate a completed scan result
    setTimeout(() => {
      setScanResult({
        id: mockScanId,
        status: "completed",
        fileName: _fileName,
        fileUrl: "",
        rawText: "Invoice # INV-2024-0042\nVendor: Acme Corp\nTotal: ₹200,600.00",
        parsedVendorName: "Acme Corp",
        parsedInvoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        parsedInvoiceDate: new Date().toISOString().split("T")[0],
        parsedSubtotal: "170000",
        parsedCgstTotal: "15300",
        parsedSgstTotal: "15300",
        parsedIgstTotal: null,
        parsedTotal: "200600",
        parsedLineItems: JSON.stringify([
          { description: "Professional Services", quantity: 1, rate: 150000, amount: 150000 },
          { description: "Software License", quantity: 2, rate: 25000, amount: 50000 },
        ]),
        confidenceScore: "0.92",
        createdAt: new Date().toISOString(),
      });
      setScanStatus("completed");
    }, 4000);
  }, []);

  const handleInvoiceCreated = useCallback((invoiceId: string) => {
    window.location.href = `/invoices/${invoiceId}`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-1">
            Document Capture
          </p>
          <h1 className="font-display text-display-lg font-semibold text-dark leading-tight">Scan Invoice</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">
            Upload an invoice image or PDF to automatically extract line items and create a draft invoice.
          </p>
        </div>
        <Link
          href="/invoices"
          className="px-4 py-2 border border-border text-mid text-[10px] font-ui text-[11px] uppercase tracking-widest hover:bg-surface-muted transition-colors no-underline rounded-md flex items-center gap-1.5"
        >
          <Icon name="arrow_back" size={14} /> Back to Invoices
        </Link>
      </div>

      <UploadZone
        tenantId={typeof window !== "undefined" ? (sessionStorage.getItem("onboarding_tenant_id") ?? "00000000-0000-0000-0000-000000000000") : "00000000-0000-0000-0000-000000000000"}
        onUploadComplete={handleUploadComplete}
        onError={(msg) => setError(msg)}
      />

      {error && (
        <div className="px-5 py-3 bg-danger-bg border border-red-200 rounded-md flex items-center gap-2">
          <Icon name="warning" size={16} className="text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">{error}</p>
        </div>
      )}

      {scanStatus === "processing" && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-text rounded-md text-sm font-medium">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing OCR… (usually 5–15 seconds)
          </div>
        </div>
      )}

      {scanStatus === "completed" && scanResult && (
        <ScanResults scan={scanResult} onInvoiceCreated={handleInvoiceCreated} />
      )}
    </div>
  );
}
