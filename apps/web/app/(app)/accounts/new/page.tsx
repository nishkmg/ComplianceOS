"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

// ─── Sub-type options per account kind ────────────────────────────────────────

const subTypes: Record<string, string[]> = {
  Asset:     ["Current Asset", "Fixed Asset", "Bank Account", "Cash", "Inventory"],
  Liability: ["Current Liability", "Long Term Liability"],
  Equity:    ["Capital Account", "Drawings", "Reserves & Surplus"],
  Revenue:   ["Operating Revenue", "Other Revenue"],
  Expense:   ["Direct Expense", "Indirect Expense", "Depreciation"],
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function NewAccountPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    name: "",
    kind: "Asset",
    subType: "Current Asset",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast.success("Ledger account created successfully");
    router.push("/coa");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div>
            <h1 className="font-display text-display-lg font-semibold text-dark">New Ledger Account</h1>
            <p className="text-[13px] text-secondary font-ui mt-1">
              Define a new account for the Chart of Accounts.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-1.5"
          >
            Create Account <Icon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-surface border border-border rounded-md shadow-sm">
        <div className="h-[2px] w-full bg-amber" />
        <form onSubmit={handleSubmit} className="p-7 space-y-7">
          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account Name *</label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light"
              placeholder="e.g. Accounts Receivable — Domestic"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          {/* Code + Kind */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account Code *</label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-mono text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light"
                placeholder="10100"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Account Kind</label>
              <div className="relative">
                <select
                  className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                  value={form.kind}
                  onChange={e => setForm(f => ({ ...f, kind: e.target.value, subType: subTypes[e.target.value][0] }))}
                >
                  {Object.keys(subTypes).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <Icon name="expand_more" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sub-type cards */}
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Detailed Classification</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subTypes[form.kind].map(st => (
                <div
                  key={st}
                  onClick={() => setForm(f => ({ ...f, subType: st }))}
                  className={`p-3 border rounded-md transition-all cursor-pointer text-center ${
                    form.subType === st
                      ? "border-amber bg-amber-50 ring-1 ring-amber"
                      : "border-border bg-surface hover:bg-surface-muted"
                  }`}
                >
                  <span className="font-ui text-[10px] font-bold uppercase tracking-wider">{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-mid uppercase tracking-widest font-bold">Description (Optional)</label>
            <textarea
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors resize-none placeholder:text-light"
              rows={3}
              placeholder="Enter context or specific use-case for this ledger…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
