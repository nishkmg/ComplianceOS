// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/lib/toast";

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    hsn: "",
    category: "",
    unit: "pcs",
    openingStock: 0,
    unitPrice: 0,
    gstRate: 18,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast.success("SKU created successfully");
    router.push("/inventory/products");
  };

  return (
    <div className="bg-page-bg text-on-surface page-bg min-h-screen flex text-left">
      <main className="flex-1 ml-0 pb-16">
        {/* Page Header */}
        <div className="flex justify-between items-end border-b-[0.5px] border-border-subtle px-8 py-6 mb-10 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-mid mb-2 uppercase tracking-widest">
              <Link className="hover:text-on-surface transition-colors flex items-center gap-1 no-underline" href="/inventory/products">
                <span className="material-symbols-outlined text-xs">arrow_back</span> Inventory
              </Link>
              <span className="text-border-subtle">/</span>
              <span className="text-on-surface font-bold">New Entry</span>
            </div>
            <h2 className="font-display-xl text-3xl text-on-surface font-bold">Add New Product</h2>
            <p className="font-ui-md text-sm text-text-mid mt-2 max-w-2xl">Enter product details for compliance tracking and inventory valuation.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="font-ui-sm text-xs text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer font-bold uppercase tracking-widest">Cancel</button>
            <button onClick={handleSubmit} className="bg-primary-container text-white px-8 py-3 font-ui-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors border-none cursor-pointer shadow-sm rounded-sm">
              Save Product
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8">
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
                <div className="h-[2px] w-full bg-primary-container mb-6 -mx-8 -mt-8" style={{ width: 'calc(100% + 64px)' }}></div>
                <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6 uppercase tracking-wider text-[11px] text-text-light">Product Information</h3>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">SKU Code</label>
                      <input className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-mono text-sm outline-none focus:border-primary" placeholder="RM-SKU-001" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">HSN / SAC Code</label>
                      <input className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-mono text-sm outline-none focus:border-primary" placeholder="8471" value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Product Name</label>
                    <input className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-ui-md text-sm outline-none focus:border-primary" placeholder="Enter product name for ledgers..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Category</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-ui-sm text-sm outline-none focus:border-primary appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Select...</option>
                        <option>Raw Material</option>
                        <option>Finished Good</option>
                        <option>Service</option>
                      </select>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-light pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
                <h3 className="font-ui-lg text-lg font-bold text-on-surface mb-6 uppercase tracking-wider text-[11px] text-text-light">Valuation & Tax Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Unit</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-ui-sm text-sm outline-none focus:border-primary appearance-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                        <option>pcs</option>
                        <option>kg</option>
                        <option>box</option>
                        <option>ltr</option>
                      </select>
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-light pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Opening Stock</label>
                    <input className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-mono text-sm outline-none focus:border-primary" type="number" value={formData.openingStock || ''} onChange={e => setFormData({...formData, openingStock: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Unit Price (₹)</label>
                    <input className="w-full bg-transparent border-b border-border-subtle py-2 pl-0 font-mono text-sm outline-none focus:border-primary" type="number" value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm border-t-2 border-t-primary-container">
                <h3 className="font-ui-sm text-xs font-bold uppercase tracking-widest text-text-light mb-6">Tax Defaults</h3>
                <div className="flex flex-col gap-2">
                  <label className="font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Default GST Rate</label>
                  <div className="relative">
                    <select className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm outline-none focus:border-primary appearance-none" value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: parseInt(e.target.value)})}>
                      <option value={0}>GST 0%</option>
                      <option value={5}>GST 5%</option>
                      <option value={12}>GST 12%</option>
                      <option value={18}>GST 18%</option>
                      <option value={28}>GST 28%</option>
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-light pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="bg-stone-900 text-white p-8 shadow-sm border-t-2 border-t-primary-container">
                <h3 className="font-ui-sm text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">Compliance Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-ui-xs text-sm">HSN Code Enabled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-ui-xs text-sm">GST Rate Mapped</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
