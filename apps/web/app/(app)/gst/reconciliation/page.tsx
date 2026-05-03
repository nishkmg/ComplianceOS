"use client";

import { useState, useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

interface ReconItem {
  id: string; gstin: string; name: string; inv: string; date: string; value: string;
  ledgerAmount: string; portalAmount: string; diff: string; status: "mismatch" | "reconciled";
}

function parseAmt(s: string) { return parseFloat(s.replace(/,/g, "")) || 0; }

const initialMismatches: ReconItem[] = [
  { id: "1", gstin: "27AABCU9603R1ZM", name: "Acme Suppliers", inv: "SUP-001", date: "10 Apr 26", value: "1,00,000", ledgerAmount: "1,18,000", portalAmount: "1,00,000", diff: "18,000", status: "mismatch" },
  { id: "2", gstin: "29AABCT1234R1Z5", name: "Tech Components", inv: "SUP-002", date: "12 Apr 26", value: "50,000", ledgerAmount: "59,000", portalAmount: "59,000", diff: "0", status: "reconciled" },
  { id: "3", gstin: "33BABCR8902H1Z3", name: "Global Freight", inv: "SUP-003", date: "15 Apr 26", value: "2,00,000", ledgerAmount: "2,36,000", portalAmount: "2,00,000", diff: "36,000", status: "mismatch" },
  { id: "4", gstin: "09AABCS4567K1Z9", name: "Stationery Mart", inv: "SUP-004", date: "18 Apr 26", value: "12,000", ledgerAmount: "12,000", portalAmount: "14,160", diff: "2,160", status: "mismatch" },
];

export default function ITCResolutionPage() {
  const [items, setItems] = useState<ReconItem[]>(initialMismatches);
  const [filter, setFilter] = useState<"all" | "mismatch" | "reconciled">("all");
  const [syncing, setSyncing] = useState(false);
  const [matching, setMatching] = useState(false);

  const filtered = useMemo(() =>
    filter === "all" ? items : items.filter(i => i.status === filter),
    [items, filter]
  );

  const stats = useMemo(() => {
    const matched = items.filter(i => i.status === "reconciled");
    const mismatched = items.filter(i => i.status === "mismatch");
    const matchedTotal = matched.reduce((s, i) => s + parseAmt(i.ledgerAmount), 0);
    const mismatchedTotal = mismatched.reduce((s, i) => s + parseAmt(i.diff), 0);
    const potentialItc = items.reduce((s, i) => s + parseAmt(i.ledgerAmount), 0);
    return { matchedTotal, mismatchedTotal, supplierMissing: 45120, potentialItc };
  }, [items]);

  const handleFetch2B = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  const handleAutoMatch = () => {
    setMatching(true);
    setTimeout(() => {
      setItems(prev => prev.map(i => i.status === "mismatch" ? { ...i, status: "reconciled", diff: "0" } : i));
      setMatching(false);
    }, 2000);
  };

  const handleMatchManually = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "reconciled" as const, diff: "0" } : i));
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border pb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">GST Reconciliation</p>
          <h1 className="font-display text-2xl font-semibold text-dark">ITC Resolution</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">Cross-reference your internal purchase register with the GSTR-2B statement. Resolve discrepancies to maximize claimable Input Tax Credit.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleFetch2B} disabled={syncing} className="px-5 py-2 border border-border text-dark font-ui text-[13px] rounded-md hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer bg-transparent uppercase tracking-widest font-bold">
            <Icon name={syncing ? "sync" : "cloud_download"} size={16} className={syncing ? "animate-spin" : ""} /> {syncing ? "Fetching..." : "Fetch Latest 2B"}
          </button>
          <button onClick={handleAutoMatch} disabled={matching} className="bg-amber text-white px-8 py-2.5 rounded-md font-ui text-[13px] hover:bg-amber-hover transition-colors cursor-pointer border-none shadow-sm font-bold uppercase tracking-widest">
            {matching ? "Matching..." : "Run Auto-Match"}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-green-600">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4">Total Matched</p>
          <p className="font-mono text-xl font-bold text-success">₹ {formatIndianNumber(stats.matchedTotal, { decimals: 2 })}</p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-red-600">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4">Unresolved Mismatches</p>
          <p className="font-mono text-xl font-bold text-danger">₹ {formatIndianNumber(stats.mismatchedTotal, { decimals: 2 })}</p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-amber-500">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4">Supplier Missing</p>
          <p className="font-mono text-xl font-bold text-amber-text">₹ {formatIndianNumber(stats.supplierMissing, { decimals: 2 })}</p>
        </div>
        <div className="bg-surface border border-border p-6 shadow-sm border-t-2 border-t-stone-800">
          <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-4">Potential ITC Saved</p>
          <p className="font-mono text-xl font-bold text-dark">₹ {formatIndianNumber(stats.potentialItc, { decimals: 2 })}</p>
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <div className="bg-surface-muted border-b-[0.5px] border-border flex p-2 gap-2 no-print">
          <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-md text-[11px] uppercase tracking-widest font-bold cursor-pointer ${filter === "all" ? "bg-surface border border-border text-dark" : "hover:bg-surface-muted transition-colors text-mid border-none bg-transparent"}`}>All Invoices</button>
          <button onClick={() => setFilter("mismatch")} className={`px-4 py-1.5 rounded-md text-[11px] uppercase tracking-widest font-bold cursor-pointer ${filter === "mismatch" ? "bg-surface border border-border text-dark" : "hover:bg-surface-muted text-mid border-none bg-transparent"}`}>Mismatch ({items.filter(i => i.status === "mismatch").length})</button>
          <button onClick={() => setFilter("reconciled")} className={`px-4 py-1.5 rounded-md text-[11px] uppercase tracking-widest font-bold cursor-pointer ${filter === "reconciled" ? "bg-surface border border-border text-dark" : "hover:bg-surface-muted text-mid border-none bg-transparent"}`}>Reconciled ({items.filter(i => i.status === "reconciled").length})</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-surface-muted/50 border-b-[0.5px] border-border text-light font-ui text-[10px] uppercase tracking-widest">
                <th className="py-3 px-6 border-r-[0.5px] border-border">Supplier / GSTIN</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border">Invoice Details</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border text-right">Ledger Amount</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border text-right">Portal (2B) Amount</th>
                <th className="py-3 px-6 border-r-[0.5px] border-border text-right">Difference</th>
                <th className="py-3 px-6">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[13px] text-dark">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-4 px-6 border-r-[0.5px] border-border">
                    <div className="font-ui text-[13px] font-bold text-dark">{m.name}</div>
                    <div className="text-[11px] text-light">{m.gstin}</div>
                  </td>
                  <td className="py-4 px-6 border-r-[0.5px] border-border">
                    <div className="font-ui text-[13px]">{m.inv}</div>
                    <div className="text-[11px] text-light">{m.date}</div>
                  </td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border">₹ {m.ledgerAmount}</td>
                  <td className="py-4 px-6 text-right border-r-[0.5px] border-border">₹ {m.portalAmount}</td>
                  <td className={`py-4 px-6 text-right border-r-[0.5px] border-border font-bold ${m.status === 'mismatch' ? 'text-danger' : 'text-success'}`}>₹ {m.diff}</td>
                  <td className="py-4 px-6">
                    {m.status === 'mismatch' ? (
                      <button onClick={() => handleMatchManually(m.id)} className="text-primary hover:text-amber-stitch font-bold uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-4">Match Manually</button>
                    ) : (
                      <span className="text-success font-bold uppercase text-[10px] tracking-widest flex items-center gap-1">
                        <Icon name="check_circle" className="text-sm" /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
