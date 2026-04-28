// @ts-nocheck
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { UploadZone } from "@/components/ocr/upload-zone";

export default function ScanReceiptPage() {
  const [scanStatus, setScanStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleUploadComplete = useCallback(() => {
    setScanStatus("processing");
    // Mock processing delay
    setTimeout(() => setScanStatus("completed"), 3000);
  }, []);

  return (
    <div className="bg-page-bg min-h-screen antialiased text-left">
      <main className="max-w-[1200px] mx-auto w-full p-8 lg:p-12 flex flex-col">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <span className="font-ui-xs text-ui-xs text-[#C8860A] uppercase tracking-widest block mb-2">Automated Ledger</span>
            <h1 className="font-display-xl text-display-xl text-on-surface">Receipt Scan (OCR)</h1>
            <p className="font-ui-sm text-ui-sm text-text-mid mt-2 max-w-2xl">Upload payment vouchers and bank receipts for automatic data extraction and ledger reconciliation.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-ui-sm hover:bg-surface-variant transition-colors cursor-pointer bg-transparent">
              Clear Form
            </button>
            <button className="px-6 py-2 bg-[#C8860A] text-white font-ui-sm text-ui-sm flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer border-none shadow-sm">
              Save to Ledger <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* OCR Workspace */}
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Left: Document Viewer */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-[0.5px] border-border-subtle flex-1 flex flex-col relative group rounded-sm overflow-hidden min-h-[600px] shadow-sm">
              {/* Toolbar */}
              <div className="h-12 border-b-[0.5px] border-border-subtle bg-stone-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3 text-text-mid">
                  <button className="hover:text-on-surface cursor-pointer border-none bg-transparent"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
                  <button className="hover:text-on-surface cursor-pointer border-none bg-transparent"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
                  <div className="w-[1px] h-4 bg-border-subtle mx-1"></div>
                  <button className="hover:text-on-surface cursor-pointer border-none bg-transparent"><span className="material-symbols-outlined text-[20px]">rotate_right</span></button>
                </div>
                <span className="font-mono text-[12px] text-text-light">HDFC_TRANSFER_VOUCHER.pdf</span>
              </div>
              
              {/* Image Area */}
              <div className="flex-1 bg-[#F4F2EE] flex items-center justify-center p-8 relative">
                {scanStatus === "idle" ? (
                  <div className="w-full h-full max-w-md">
                    <UploadZone
                      tenantId="00000000-0000-0000-0000-000000000000"
                      onUploadComplete={handleUploadComplete}
                      onError={(msg) => setError(msg)}
                    />
                  </div>
                ) : (
                  <div className="relative max-w-full max-h-full shadow-screenshot bg-white p-4">
                    <img alt="Payment receipt" className="max-w-full h-auto object-contain opacity-90 sepia-[.1]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_-z1xA_jSWfC0icM1u3GBFq6GMgC35jYumiSRCMSvawozqQlAZSG4jklpkAC8fozvlDQArtmuq93ezOMM6RwqYYLxnMUkCAQLtXYYuQa5NVfPnD5rIEPcqfovUkRQ9_cDo4AcqMhAzLhkXq1rX0pNbEBj-RXfJQn0WjDQMWLsQ4UFK6D_JcF7s5a921KJxlXG7VeK6Ue-oD65u_NJw3cT-DHeCzlNwWYELe28FYmt01Uzjs4cCgFkITF2kfERB_cL2LJ60uWNE9g" />
                    {/* Bounding Boxes */}
                    <div className="absolute border-[1.5px] border-blue-400 bg-blue-400/10 top-[20%] left-[10%] w-[40%] h-[5%] cursor-pointer hover:bg-blue-400/20 transition-colors"></div>
                    <div className="absolute border-[1.5px] border-[#C8860A] bg-[#C8860A]/10 top-[35%] left-[60%] w-[25%] h-[6%] cursor-pointer hover:bg-[#C8860A]/20 transition-colors"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Data Extraction Panel */}
          <div className="w-full lg:w-[400px] flex flex-col bg-white border-[0.5px] border-border-subtle border-t-[2px] border-t-[#C8860A] shadow-sm text-left">
            <div className="p-6 border-b-[0.5px] border-border-subtle bg-stone-50 flex justify-between items-center">
              <h2 className="font-ui-lg text-lg font-medium text-on-surface">Extracted Data</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">High Confidence</span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Payer Name
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </label>
                <input className="w-full border-[0.5px] border-border-subtle bg-stone-50 px-3 py-2 font-mono text-[13px] text-on-surface outline-none focus:border-primary" type="text" defaultValue="Tech Solutions India Pvt Ltd" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Amount (INR)
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                </label>
                <input className="w-full border-[1px] border-amber-400 bg-stone-50 px-3 py-2 font-mono text-[13px] text-on-surface outline-none focus:ring-1 focus:ring-amber-400" type="text" defaultValue="45,200.00" />
                <span className="font-ui-xs text-[10px] text-[#C8860A] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> Verify amount extracted
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  Transaction Date
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </label>
                <input className="w-full border-[0.5px] border-border-subtle bg-stone-50 px-3 py-2 font-mono text-[13px] text-on-surface outline-none focus:border-primary" type="text" defaultValue="24-Oct-2023" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-ui-xs text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center justify-between">
                  UTR / Ref Number
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </label>
                <input className="w-full border-[0.5px] border-border-subtle bg-stone-50 px-3 py-2 font-mono text-[13px] text-on-surface outline-none focus:border-primary" type="text" defaultValue="HDFCR529482710" />
              </div>
            </div>

            <div className="p-4 border-t-[0.5px] border-border-subtle bg-stone-50">
              <div className="flex items-start gap-3 p-3 bg-white border-[0.5px] border-border-subtle">
                <span className="material-symbols-outlined text-[#C8860A]">lightbulb</span>
                <p className="font-ui-xs text-[11px] text-text-mid leading-relaxed">
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
