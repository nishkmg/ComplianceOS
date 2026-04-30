"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/lib/toast";

const subTypes: Record<string, string[]> = {
  Asset: ["Current Asset", "Fixed Asset", "Bank", "Cash", "Inventory"],
  Liability: ["Current Liability", "Long Term Liability"],
  Equity: ["Capital Account", "Drawings", "Reserves & Surplus"],
  Revenue: ["Operating Revenue", "Other Revenue"],
  Expense: ["Direct Expense", "Indirect Expense", "Depreciation"],
};

export default function NewAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    kind: "Asset",
    subType: "Current Asset",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast.success("Ledger account created successfully");
    router.push("/coa");
  };

  return (
    <div className="bg-page-bg min-h-screen flex flex-col antialiased text-left">
      {/* Page Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[0.5px] border-border-subtle flex justify-between items-center w-full px-12 py-4 -mx-8 -mt-8 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-text-mid hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            <Icon name="arrow_back" />
          </button>
          <h2 className="font-display-lg text-lg font-bold uppercase tracking-widest text-on-surface">Compliance Settings</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="px-6 py-2 border border-on-surface text-on-surface font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="bg-primary-container text-white px-8 py-2 rounded-sm font-ui-sm text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all border-none cursor-pointer shadow-sm flex items-center gap-2"
          >
            Create Account <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl bg-white border-[0.5px] border-border-subtle rounded-sm shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="px-8 pt-10 pb-6 border-b-[0.5px] border-border-subtle relative text-left">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary-container"></div>
            <h1 className="font-display-xl text-3xl text-on-surface font-bold">New Ledger</h1>
            <p className="font-ui-sm text-sm text-text-mid mt-2 max-w-lg">Define the structural details for this ledger entry. Accuracy here ensures compliance continuity across fiscal reporting.</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
              <label className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Account Name *</label>
              <input 
                className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-sm text-on-surface focus:border-primary outline-none transition-all" 
                placeholder="e.g. Accounts Receivable - Domestic"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Account Code *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-text-light">#</span>
                  <input 
                    className="w-full bg-stone-50 border border-border-subtle rounded-sm py-3 pl-8 pr-4 font-mono text-sm focus:border-primary outline-none" 
                    placeholder="1000"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Account Kind</label>
                <div className="relative">
                  <select 
                    className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm appearance-none focus:border-primary outline-none"
                    value={formData.kind}
                    onChange={e => setFormData({ ...formData, kind: e.target.value, subType: subTypes[e.target.value][0] })}
                  >
                    {Object.keys(subTypes).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Detailed Classification</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subTypes[formData.kind].map((st) => (
                  <div 
                    key={st}
                    onClick={() => setFormData({ ...formData, subType: st })}
                    className={`p-4 border rounded-sm transition-all cursor-pointer text-center ${formData.subType === st ? 'border-primary-container bg-[#fff8f4] ring-1 ring-primary-container' : 'border-border-subtle bg-white hover:bg-stone-50'}`}
                  >
                    <span className="font-ui-xs text-[10px] font-bold uppercase tracking-wider">{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block font-ui-xs text-[10px] text-text-mid uppercase tracking-widest font-bold">Description (Optional)</label>
              <textarea 
                className="w-full bg-stone-50 border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-sm focus:border-primary outline-none resize-none" 
                rows={3}
                placeholder="Enter context or specific use-case for this ledger..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
