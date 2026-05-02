"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
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
    <div className="bg-page-bg text-dark page-bg min-h-screen flex text-left">
      <main className="flex-1 ml-0 pb-16">
        {/* Page Header */}
        <div className="flex justify-between items-end border-b-[0.5px] border-border px-8 py-6 mb-10 sticky top-0 z-20 bg-surface/80 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 font-ui text-[10px] text-mid mb-2 uppercase tracking-widest">
              <Link className="hover:text-dark transition-colors flex items-center gap-1 no-underline" href="/inventory/products">
                <Icon name="arrow_back" className="text-xs" /> Inventory
              </Link>
              <span className="text-border-subtle">/</span>
              <span className="text-dark font-bold">New Entry</span>
            </div>
            <h1 className="font-display text-display-lg font-semibold text-dark">Add New Product</h1>
            <p className="text-[13px] text-secondary font-ui mt-1 max-w-2xl">Enter product details for compliance tracking and inventory valuation.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="font-ui text-[13px] text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer font-bold uppercase tracking-widest">Cancel</button>
            <button onClick={handleSubmit} className="bg-amber text-white px-8 py-3 font-ui text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-amber-hover transition-colors border-none cursor-pointer shadow-sm rounded-md">
              Save Product
              <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-8">
          <form className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Details */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-surface border border-border p-8 shadow-sm">
                <div className="h-[2px] w-[calc(100%+64px)] bg-amber mb-6 -mx-8 -mt-8"></div>
                <h3 className="font-ui text-lg font-bold text-dark mb-6 uppercase tracking-wider text-[11px] text-light">Product Information</h3>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">SKU Code</label>
                      <input className="w-full bg-transparent border-b border-border py-2 pl-0 font-mono text-sm outline-none focus:border-primary" placeholder="RM-SKU-001" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">HSN / SAC Code</label>
                      <input className="w-full bg-transparent border-b border-border py-2 pl-0 font-mono text-sm outline-none focus:border-primary" placeholder="8471" value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Product Name</label>
                    <input className="w-full bg-transparent border-b border-border py-2 pl-0 font-ui text-sm font-medium text-sm outline-none focus:border-primary" placeholder="Enter product name for ledgers..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Category</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-border py-2 pl-0 font-ui text-[13px] outline-none focus:border-primary appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="">Select...</option>
                        <option>Raw Material</option>
                        <option>Finished Good</option>
                        <option>Service</option>
                      </select>
                      <Icon name="expand_more" className="absolute right-0 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border p-8 shadow-sm">
                <h3 className="font-ui text-lg font-bold text-dark mb-6 uppercase tracking-wider text-[11px] text-light">Valuation & Tax Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Unit</label>
                    <div className="relative">
                      <select className="w-full bg-transparent border-b border-border py-2 pl-0 font-ui text-[13px] outline-none focus:border-primary appearance-none" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                        <option>pcs</option>
                        <option>kg</option>
                        <option>box</option>
                        <option>ltr</option>
                      </select>
                      <Icon name="expand_more" className="absolute right-0 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Opening Stock</label>
                    <input className="w-full bg-transparent border-b border-border py-2 pl-0 font-mono text-sm outline-none focus:border-primary" type="number" value={formData.openingStock || ''} onChange={e => setFormData({...formData, openingStock: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Unit Price (₹)</label>
                    <input className="w-full bg-transparent border-b border-border py-2 pl-0 font-mono text-sm outline-none focus:border-primary" type="number" value={formData.unitPrice || ''} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface border border-border p-8 shadow-sm border-t-2 border-t-amber">
                <h3 className="font-ui text-[13px] font-bold uppercase tracking-widest text-light mb-6">Tax Defaults</h3>
                <div className="flex flex-col gap-2">
                  <label className="font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Default GST Rate</label>
                  <div className="relative">
                    <select className="w-full bg-surface-muted border border-border rounded-md px-4 py-3 font-ui text-[13px] outline-none focus:border-primary appearance-none" value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: parseInt(e.target.value)})}>
                      <option value={0}>GST 0%</option>
                      <option value={5}>GST 5%</option>
                      <option value={12}>GST 12%</option>
                      <option value={18}>GST 18%</option>
                      <option value={28}>GST 28%</option>
                    </select>
                    <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-light pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="bg-dark text-white p-8 shadow-sm border-t-2 border-t-amber">
                <h3 className="font-ui text-[13px] font-bold uppercase tracking-widest text-light mb-6">Compliance Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-success-bg0 rounded-full"></span>
                    <span className="font-ui text-[11px] text-sm">HSN Code Enabled</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-success-bg0 rounded-full"></span>
                    <span className="font-ui text-[11px] text-sm">GST Rate Mapped</span>
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
