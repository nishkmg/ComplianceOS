// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadZone } from "@/components/ocr/upload-zone";
import { ScanResults } from "@/components/ocr/scan-results";
import type { ScanResult } from "@/components/ocr/types";

type ScanStatus = "idle" | "uploading" | "processing" | "completed" | "failed";

async function fetchScan(scanId: string): Promise<ScanResult | null> {
  const input = JSON.stringify({ scanId });
  const response = await fetch(
    `/api/trpc/ocrScan.get?input=${encodeURIComponent(input)}`
  );
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
    const interval = setInterval(async () => {
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

  const handleUploadComplete = useCallback(async (fileUrl: string, fileName: string, fileSize: number) => {
    setError(null);
    setScanStatus("uploading");
    try {
      const { scanId } = await uploadScan(fileUrl, fileName, fileSize);
      setCurrentScanId(scanId);
      setScanStatus("processing");
    } catch (e: any) {
      setError(e.message);
      setScanStatus("failed");
    }
  }, []);

  const handleInvoiceCreated = useCallback((invoiceId: string) => {
    window.location.href = `/invoices/${invoiceId}`;
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scan Invoice</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload an invoice image or PDF to automatically extract line items and create a draft invoice.
        </p>
      </div>

      <UploadZone
        tenantId={typeof window !== "undefined" ? (sessionStorage.getItem("onboarding_tenant_id") ?? "00000000-0000-0000-0000-000000000000") : "00000000-0000-0000-0000-000000000000"}
        onUploadComplete={handleUploadComplete}
        onError={(msg) => setError(msg)}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {scanStatus === "processing" && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing OCR... (usually 5-15 seconds)
          </div>
        </div>
      )}

      {scanStatus === "completed" && scanResult && (
        <ScanResults
          scan={scanResult}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}
    </div>
  );
}
