"use client";

import { useState, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import "next/link";
import { UploadZone } from "@/components/ocr/upload-zone";

export default function ScanReceiptPage() {
  const [scanStatus, setScanStatus] = useState("idle");
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = useCallback(() => {
    setScanStatus("processing");
    // Mock processing delay
    setTimeout(() => setScanStatus("completed"), 3000);
  }, []);

  return (
    <div className="bg-page-bg min-h-screen antialiased text-left">
      <main className="max-w-page mx-auto w-full p-8 lg:p-12 flex flex-col">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Automated Ledger</p>
            <h1 className="font-ui text-2xl font-semibold text-dark">Receipt Scan (OCR)</h1>
            <p className="text-ui-sm text-secondary font-ui mt-1 max-w-2xl">Upload payment vouchers and bank receipts for automatic data extraction and ledger reconciliation.</p>
          </div>
          <div className="flex gap-4">
            <button className="btn btn-secondary">
              Clear Form
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              Save to Ledger <Icon name="arrow_forward" className="text-ui-xl" />
            </button>
          </div>
        </div>

        {/* OCR Workspace */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Left: Document Viewer */}
          <div className="flex-1 flex flex-col">
            <div className="bg-surface border-[0.5px] border-border flex-1 flex flex-col relative group rounded-md overflow-hidden min-h-[600px] shadow-sm">
              {/* Toolbar */}
              <div className="h-12 border-b-[0.5px] border-border bg-surface-muted flex items-center justify-between px-4">
                <div className="flex items-center gap-3 text-text-mid">
                  <button aria-label="Zoom in" className="hover:text-on-surface cursor-pointer border-none bg-transparent"><Icon name="zoom_in" className="text-[20px]" /></button>
                  <button aria-label="Zoom out" className="hover:text-on-surface cursor-pointer border-none bg-transparent"><Icon name="zoom_out" className="text-[20px]" /></button>
                  <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                  <button aria-label="Rotate document" className="hover:text-on-surface cursor-pointer border-none bg-transparent"><Icon name="rotate_right" className="text-[20px]" /></button>
                </div>
                <span className="font-mono text-ui-xs text-text-light">HDFC_TRANSFER_VOUCHER.pdf</span>
              </div>
              
              {/* Image Area */}
              <div className="flex-1 bg-surface-muted flex items-center justify-center p-8 relative">
                {scanStatus === "idle" ? (
                  <div className="w-full h-full max-w-md">
                    <UploadZone
                      tenantId="00000000-0000-0000-0000-000000000000"
                      onUploadComplete={handleUploadComplete}
                      onError={(msg) => setError(msg)}
                    />
                  </div>
                ) : (
                  <div className="relative max-w-full max-h-full shadow-screenshot bg-surface p-4">
                    <img alt="Payment receipt" className="max-w-full h-auto object-contain opacity-90 sepia-[.1]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_-z1xA_jSWfC0icM1u3GBFq6GMgC35jYumiSRCMSvawozqQlAZSG4jklpkAC8fozvlDQArtmuq93ezOMM6RwqYYLxnMUkCAQLtXYYuQa5NVfPnD5rIEPcqfovUkRQ9_cDo4AcqMhAzLhkXq1rX0pNbEBj-RXfJQn0WjDQMWLsQ4UFK6D_JcF7s5a921KJxlXG7VeK6Ue-oD65u_NJw3cT-DHeCzlNwWYELe28FYmt01Uzjs4cCgFkITF2kfERB_cL2LJ60uWNE9g" />
                    {/* Bounding Boxes */}
                    <div className="absolute border-[1.5px] border-amber-bright bg-amber-bright/10 top-[20%] left-[10%] w-[40%] h-[5%] cursor-pointer hover:bg-amber-bright/20 transition-colors"></div>
                    <div className="absolute border-[1.5px] border-amber bg-amber/10 top-[35%] left-[60%] w-[25%] h-[6%] cursor-pointer hover:bg-amber/20 transition-colors"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Data Extraction Panel */}
          <div className="w-full lg:w-[400px] flex flex-col bg-surface border-[0.5px] border-border border-t-[2px] border-t-amber shadow-sm text-left">
            <div className="p-6 border-b-[0.5px] border-border bg-surface-muted flex justify-between items-center">
              <h2 className="font-ui text-lg font-medium text-on-surface">Extracted Data</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span className="font-ui text-ui-2xs text-text-mid uppercase tracking-widest font-bold">High Confidence</span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label htmlFor="scan-payer" className="font-ui text-ui-2xs text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Payer Name
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                </label>
                <input id="scan-payer" aria-label="Payer name" className="w-full border-[0.5px] border-border bg-surface-muted px-3 py-2 font-mono text-ui-sm text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="text" defaultValue="Tech Solutions India Pvt Ltd" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-ui text-ui-2xs text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Amount (INR)
                  <span className="w-2 h-2 rounded-full bg-amber-bright"></span>
                </label>
                <input id="scan-amount" aria-label="Amount" className="w-full border-[1px] border-amber-bright bg-surface-muted px-3 py-2 font-mono text-ui-sm text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-focus focus:ring-1 focus:ring-amber-bright" type="text" defaultValue="45,200.00" />
                <span className="font-ui text-ui-2xs text-amber flex items-center gap-1">
                  <Icon name="warning" className="text-ui-md" /> Verify amount extracted
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="scan-date" className="font-ui text-ui-2xs text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Transaction Date
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                </label>
                <input id="scan-date" aria-label="Transaction date" className="w-full border-[0.5px] border-border bg-surface-muted px-3 py-2 font-mono text-ui-sm text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="text" defaultValue="24-Oct-2023" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="scan-ref" className="font-ui text-ui-2xs text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  UTR / Ref Number
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                </label>
                <input id="scan-ref" aria-label="UTR / reference number" className="w-full border-[0.5px] border-border bg-surface-muted px-3 py-2 font-mono text-ui-sm text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-primary" type="text" defaultValue="HDFCR529482710" />
              </div>
            </div>

            <div className="p-4 border-t-[0.5px] border-border bg-surface-muted">
              <div className="flex items-start gap-3 p-3 bg-surface border-[0.5px] border-border">
                <Icon name="lightbulb" className="text-amber" />
                <p className="font-ui text-ui-xs text-ui-xs text-text-mid leading-relaxed">
                  Click on any highlighted region in the document to automatically map it to the active field.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
