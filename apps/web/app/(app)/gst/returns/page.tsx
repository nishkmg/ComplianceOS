"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const returnTypes = [
  { id: "gstr1", name: "GSTR-1", desc: "Outward Supplies" },
  { id: "gstr2b", name: "GSTR-2B", desc: "ITC Auto-drafted" },
  { id: "gstr3b", name: "GSTR-3B", desc: "Summary Return" },
];

const mockReturns = [
  { id: "1", type: "gstr1", period: "May 2024", status: "filed", amount: "12,45,600", date: "10 Jun 2024" },
  { id: "2", type: "gstr2b", period: "May 2024", status: "completed", amount: "4,12,040", date: "14 Jun 2024" },
  { id: "3", type: "gstr3b", period: "May 2024", status: "generated", amount: "8,33,560", date: "—" },
];

export default function GSTRturnsHubPage() {
  const [period, setPeriod] = useState("May 2024");

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Taxation Hub</p>
          <h1 className="font-display text-2xl font-semibold text-dark">GST Returns</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl">Centralized management for your GST compliance cycle. Generate, reconcile and file returns directly with the GSTN portal.</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-border px-4 py-2 text-ui-sm outline-none bg-surface" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>May 2024</option>
            <option>Apr 2024</option>
          </select>
          <button className="bg-amber text-white px-6 py-2.5 rounded font-ui text-[13px] hover:bg-amber-hover transition-colors cursor-pointer border-none shadow-sm">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Return Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {returnTypes.map((t) => (
          <div key={t.id} className="bg-surface border border-border p-6 shadow-sm relative overflow-hidden group hover:border-primary transition-colors">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-ui text-[11px] text-light uppercase tracking-widest">{t.id}</span>
              <Icon name="article" className="text-amber" />
            </div>
            <h3 className="font-display text-lg text-display-lg text-dark mb-1">{t.name}</h3>
            <p className="font-ui text-[13px] text-mid mb-6">{t.desc}</p>
            <Link href={`/gst/returns/${t.id}`} className="text-ui-xs text-amber-text font-bold uppercase tracking-widest no-underline hover:underline inline-flex items-center gap-2">
              Generate Return <span className="inline-block">→</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-[0.5px] border-border bg-sidebar">
          <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light">Return Filing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b-[0.5px] border-border">
                <th className="py-3 px-6 font-ui text-[11px] text-light uppercase tracking-widest">Period</th>
                <th className="py-3 px-6 font-ui text-[11px] text-light uppercase tracking-widest">Return Type</th>
                <th className="py-3 px-6 font-ui text-[11px] text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui text-[11px] text-light uppercase tracking-widest text-right">Status</th>
                <th className="py-3 px-6 font-ui text-[11px] text-light uppercase tracking-widest text-right">Date Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {mockReturns.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-dark">{r.period}</td>
                  <td className="py-4 px-6 font-ui text-[13px] font-bold uppercase text-dark">{r.type}</td>
                  <td className="py-4 px-6 font-mono text-right">₹{r.amount}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                      r.status === 'filed' ? 'bg-success-bg text-success border-green-200' :
                      r.status === 'generated' ? 'bg-amber-50 text-amber-text border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-right text-mid">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
