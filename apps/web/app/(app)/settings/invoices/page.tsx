"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";

export default function InvoiceConfigPage() {
  return (
    <div className="space-y-0 text-left">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-page-bg/90 backdrop-blur-md border-b-[0.5px] border-border-subtle px-8 py-8 flex justify-between items-end -mx-8 -mt-8 mb-8">
        <div>
          <p className="font-ui-xs text-xs text-amber-text uppercase tracking-widest mb-2 font-bold">Workspace Configuration</p>
          <h1 className="font-display-xl text-3xl text-on-surface leading-tight font-bold">Invoice Settings</h1>
          <p className="font-ui-sm text-sm text-text-mid mt-1">Define document prefixes, statutory disclosures, and bank account mappings.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-primary-container text-white font-ui-sm text-sm font-bold uppercase tracking-widest shadow-sm hover:bg-primary transition-all border-none cursor-pointer">
            Save Changes
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 pb-12">
        {/* Section 1: Naming & Sequence */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
          <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6">Naming & Sequence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Invoice Prefix</label>
              <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:border-primary outline-none" defaultValue="INV-2024-" />
              <p className="text-[10px] text-text-light italic">Example: INV-2024-0001</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Starting Number</label>
              <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:border-primary outline-none" type="number" defaultValue="1" />
            </div>
          </div>
        </section>

        {/* Section 2: Statutory & Branding */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
          <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6">Statutory & Branding</h3>
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Invoice Header Address</label>
              <textarea className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm text-on-surface focus:border-primary outline-none resize-none" rows={3} defaultValue="14th Floor, Maker Chambers VI, Nariman Point, Mumbai - 400021"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Logo (B&W Recommended)</label>
                  <div className="border-2 border-dashed border-border-subtle p-8 flex flex-col items-center justify-center bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
                    <Icon name="upload_file" className="text-text-light text-3xl mb-2" />
                    <span className="font-ui-xs text-[10px] uppercase font-bold text-text-mid">Upload PNG/JPG</span>
                  </div>
               </div>
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-2 border-b border-stone-50">
                    <span className="font-ui-sm text-sm text-on-surface">Show Authorized Signatory</span>
                    <button className="w-10 h-6 rounded-full bg-primary-container relative border-none">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-stone-50">
                    <span className="font-ui-sm text-sm text-on-surface">Include QR Code (e-Invoice)</span>
                    <button className="w-10 h-6 rounded-full bg-primary-container relative border-none">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 3: Bank Details */}
        <section className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
          <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6">Payment & Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Bank Name</label>
              <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm text-on-surface focus:border-primary outline-none" defaultValue="HDFC Bank" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">IFSC Code</label>
              <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:border-primary outline-none" defaultValue="HDFC0000060" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Account Number</label>
              <input className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:border-primary outline-none" defaultValue="50200012345678" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
