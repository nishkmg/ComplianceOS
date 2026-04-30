"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

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
          <span className="text-amber-text font-ui-xs uppercase tracking-[0.2em] mb-2 block">Taxation Hub</span>
          <h1 className="font-display-xl text-display-xl text-on-surface leading-tight">GST Returns</h1>
          <p className="font-ui-sm text-text-mid mt-2 max-w-2xl">Centralized management for your GST compliance cycle. Generate, reconcile and file returns directly with the GSTN portal.</p>
        </div>
        <div className="flex gap-3">
          <select className="border-[0.5px] border-border-subtle px-4 py-2 text-ui-sm outline-none bg-white" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>May 2024</option>
            <option>Apr 2024</option>
          </select>
          <button className="bg-primary-container text-white px-6 py-2.5 rounded font-ui-sm text-sm hover:bg-amber-700 transition-colors cursor-pointer border-none shadow-sm">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Return Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {returnTypes.map((t) => (
          <div key={t.id} className="bg-white border-[0.5px] border-border-subtle p-6 shadow-sm relative overflow-hidden group hover:border-primary transition-colors">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary-container opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <span className="font-ui-xs text-text-light uppercase tracking-widest">{t.id}</span>
              <Icon name="article" className="text-primary-container" />
            </div>
            <h3 className="font-display-lg text-display-lg text-on-surface mb-1">{t.name}</h3>
            <p className="font-ui-sm text-text-mid mb-6">{t.desc}</p>
            <Link href={`/gst/returns/${t.id}`} className="text-ui-xs text-amber-text font-bold uppercase tracking-widest no-underline hover:underline inline-flex items-center gap-2">
              Generate Return <span className="inline-block">→</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b-[0.5px] border-border-subtle bg-sidebar">
          <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Return Filing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Period</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest">Return Type</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Amount (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Status</th>
                <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Date Filed</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {mockReturns.map((r) => (
                <tr key={r.id} className="hover:bg-section-muted/30 transition-colors">
                  <td className="py-4 px-6 font-mono-md text-on-surface">{r.period}</td>
                  <td className="py-4 px-6 font-ui-sm font-bold uppercase text-stone-700">{r.type}</td>
                  <td className="py-4 px-6 font-mono-md text-right">₹{r.amount}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                      r.status === 'filed' ? 'bg-green-50 text-green-700 border-green-200' :
                      r.status === 'generated' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono-md text-right text-text-mid">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
