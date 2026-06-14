"use client";

import { useState, useRef } from "react";
import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";

export default function ScanInvoicePage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!file) { showToast.error("Please select a file."); return; }
    setScanning(true);
    await new Promise(r => setTimeout(r, 1500));
    showToast.success("Document scanned. Data extracted successfully.");
    setScanning(false);
  };

  return (
    <div className="max-w-[600px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Scan Invoice</h1>
      <div className="bg-surface border border-border rounded-md p-6 shadow-sm space-y-6">
        <div className="border-2 border-dashed border-border rounded-md p-12 text-center cursor-pointer hover:bg-surface-muted transition-colors" onClick={() => inputRef.current?.click()}>
          <Icon name="upload_file" className="text-4xl text-light mb-4" />
          <p className="font-ui text-sm text-mid">{file ? file.name : "Click to upload an invoice or receipt"}</p>
          <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        <button onClick={handleScan} disabled={!file || scanning} className="w-full py-3 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md border-none shadow-sm cursor-pointer disabled:opacity-50">{scanning ? "Scanning…" : "Scan Document"}</button>
      </div>
    </div>
  );
}
