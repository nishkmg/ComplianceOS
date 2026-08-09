"use client";

import { Icon } from '@/components/ui/icon';
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { useState } from "react";

export default function InvoiceConfigPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("invoice-logo-preview");
  });

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setLogoPreview(dataUrl);
      localStorage.setItem("invoice-logo-preview", dataUrl);
    };
    reader.readAsDataURL(file);
  };
  const { activeFy } = useFiscalYear();
  return (
    <div className="space-y-0 text-left">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-page-bg/90 backdrop-blur-md border-b-[0.5px] border-border px-8 py-8 flex justify-between items-end -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui text-[10px] text-amber uppercase tracking-widest mb-2 font-bold">Workspace Configuration · FY {activeFy}</p>
          <h1 className="font-ui text-2xl font-semibold text-dark leading-tight">Invoice Settings</h1>
          <p className="text-[13px] text-secondary font-ui mt-1">Define document prefixes, statutory disclosures, and bank account mappings.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => showToast.success("Invoice settings saved.")} className="btn-primary">
            Save Changes
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        {/* Section 1: Naming & Sequence */}
        <section className="bg-surface border border-border p-8 shadow-sm">
          <h3 className="font-ui text-lg font-bold text-dark mb-6">Naming & Sequence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Invoice Prefix</label>
              <input aria-label="Invoice number prefix" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" defaultValue="INV-2024-" />
              <p className="text-[10px] text-light italic">Example: INV-2024-0001</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Starting Number</label>
              <input aria-label="Next invoice number" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" type="number" defaultValue="1" />
            </div>
          </div>
        </section>

        {/* Section 2: Statutory & Branding */}
        <section className="bg-surface border border-border p-8 shadow-sm">
          <h3 className="font-ui text-lg font-bold text-dark mb-6">Statutory & Branding</h3>
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Invoice Header Address</label>
              <textarea aria-label="Registered office address" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-[13px] text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface resize-none" rows={3} defaultValue="14th Floor, Maker Chambers VI, Nariman Point, Mumbai - 400021"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Logo (B&W Recommended)</label>
                   <label className="border-2 border-dashed border-border-strong p-6 flex flex-col items-center justify-center bg-surface-muted transition-colors cursor-pointer hover:bg-surface-muted">
                     {logoPreview ? (
                       <img src={logoPreview} alt="Invoice logo preview" className="max-h-20 mb-2 object-contain" />
                     ) : (
                       <Icon name="upload_file" className="text-light text-3xl mb-2" />
                     )}
                     <span className="font-ui text-[10px] uppercase font-bold text-mid">{logoPreview ? "Replace logo" : "Upload PNG/JPG"}</span>
                     <input type="file" accept="image/png,image/jpeg" onChange={onLogoFile} className="sr-only" aria-label="Upload invoice logo" />
                   </label>
               </div>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-2 border-b border-stone-50">
                    <span className="font-ui text-[13px] text-dark">Show Authorized Signatory</span>
                    <button onClick={() => showToast.info("Numbering preferences are saved automatically.")} aria-label="Sequential invoice numbering" aria-pressed="true" className="w-10 h-6 rounded-full bg-amber relative border-none cursor-pointer">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-surface rounded-full"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-stone-50">
                    <span className="font-ui text-[13px] text-dark">Include QR Code (e-Invoice)</span>
                    <button onClick={() => showToast.info("E-invoice QR will appear on GST invoices.")} aria-label="QR code on GST invoices" aria-pressed="true" className="w-10 h-6 rounded-full bg-amber relative border-none cursor-pointer">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-surface rounded-full"></div>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 3: Bank Details */}
        <section className="bg-surface border border-border p-8 shadow-sm">
          <h3 className="font-ui text-lg font-bold text-dark mb-6">Payment & Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Bank Name</label>
              <input aria-label="Bank name" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-[13px] text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" defaultValue="HDFC Bank" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">IFSC Code</label>
              <input aria-label="Bank IFSC code" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" defaultValue="HDFC0000060" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account Number</label>
              <input aria-label="Bank account number" className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-mono text-sm text-dark focus:border-primary outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" defaultValue="50200012345678" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
