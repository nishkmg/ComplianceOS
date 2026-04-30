"use client";

import { useParams, useRouter } from "next/navigation";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

export default function AuditLogDetailPage() {
  const params = useParams();
  const router = useRouter();

  const mockEntry = {
    id: "0x9f8b2a1c",
    timestamp: "2023-10-27 14:32:01 IST",
    user: "A. Sharma",
    role: "Senior Partner",
    module: "General Ledger",
    action: "UPDATE",
    description: "Modified journal entry #JV-2023-1045 - Changed credit account from 4010 to 4015",
    ip: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    changes: [
      { field: "Credit Account", before: "4010 - Sales", after: "4015 - Service Revenue" },
      { field: "Amount", before: "₹ 1,50,000.00", after: "₹ 1,50,000.00" },
    ]
  };

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/audit-log">System Audit Log</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface">Event Detail</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b-[0.5px] border-border-subtle pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight">Event {mockEntry.id}</h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase rounded-sm">{mockEntry.action}</span>
          </div>
          <p className="font-ui-md text-ui-md text-text-mid">{mockEntry.timestamp}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="print" className="text-[18px]" /> Print Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
            <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6 font-bold">Event Description</h3>
            <p className="font-ui-sm text-lg text-on-surface leading-relaxed">{mockEntry.description}</p>
          </div>

          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle">
                <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light">Field Level Changes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-text-light font-ui-xs text-[10px] uppercase tracking-widest">
                    <th className="py-4 px-6">Field</th>
                    <th className="py-4 px-6">Value Before</th>
                    <th className="py-4 px-6">Value After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 font-mono text-[13px]">
                  {mockEntry.changes.map((c, i) => (
                    <tr key={i} className="hover:bg-section-muted/30 transition-colors">
                      <td className="py-5 px-6 font-ui-sm font-bold text-on-surface uppercase tracking-wider text-[10px]">{c.field}</td>
                      <td className="py-5 px-6 text-red-600 line-through opacity-60">{c.before}</td>
                      <td className="py-5 px-6 text-green-700 font-bold">{c.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
           <div className="bg-white border-[0.5px] border-border-subtle p-6 border-t-2 border-t-primary-container shadow-sm">
              <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6 font-bold">Origin Metadata</h3>
              <div className="space-y-6 text-left">
                 <div>
                    <p className="text-[10px] text-text-light uppercase mb-1">Performed By</p>
                    <p className="font-ui-sm font-bold text-on-surface">{mockEntry.user}</p>
                    <p className="font-ui-xs text-[10px] text-text-mid uppercase">{mockEntry.role}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-text-light uppercase mb-1">Module / Resource</p>
                    <p className="font-ui-sm font-bold text-on-surface">{mockEntry.module}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-text-light uppercase mb-1">IP Address</p>
                    <p className="font-mono text-sm text-on-surface">{mockEntry.ip}</p>
                 </div>
                 <div className="pt-4 border-t border-border-subtle">
                    <p className="text-[10px] text-text-light uppercase mb-2">User Agent</p>
                    <p className="font-mono text-[10px] text-text-mid leading-relaxed break-all">{mockEntry.userAgent}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
