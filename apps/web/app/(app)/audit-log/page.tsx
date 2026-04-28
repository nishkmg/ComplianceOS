// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AuditEntry {
  id: string;
  action: string;
  module: string;
  performedBy: string;
  role: string;
  performedAt: string;
  details: string;
  ip: string;
}

const mockEntries: AuditEntry[] = [
  { id: "1", action: "Update", module: "General Ledger", performedBy: "A. Sharma", role: "Senior Partner", performedAt: "2023-10-27 14:32:01", details: "Modified journal entry #JV-2023-1045 - Changed credit account from 4010 to 4015", ip: "192.168.1.45" },
  { id: "2", action: "Generate", module: "TDS Compliance", performedBy: "System", role: "Automated Task", performedAt: "2023-10-27 13:15:22", details: "Auto-generated Form 16A batch for Q2 FY23-24 (Vendors)", ip: "Localhost" },
  { id: "3", action: "Delete", module: "Vouchers", performedBy: "R. Desai", role: "Audit Clerk", performedAt: "2023-10-27 11:05:40", details: "Deleted draft payment voucher #PV-8892 (Duplicate entry)", ip: "10.0.0.12" },
  { id: "4", action: "Login", module: "User Access", performedBy: "K. Mehta", role: "Admin", performedAt: "2023-10-27 09:30:11", details: "Successful authentication via 2FA", ip: "115.240.10.22" },
  { id: "5", action: "Post", module: "GST Liability", performedBy: "A. Sharma", role: "Senior Partner", performedAt: "2023-10-26 18:45:00", details: "Finalized GSTR-3B return data for September 2023", ip: "192.168.1.45" },
];

export default function AuditLogPage() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h1 className="font-display-xl text-display-xl text-stone-900">System Audit Log</h1>
          <p className="font-ui-sm text-text-mid mt-1">Immutable record of all postings, modifications, and access events.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-section-muted border border-border-subtle px-4 py-2 flex items-center gap-2 hover:bg-stone-200 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="font-ui-xs uppercase tracking-wider">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-border-subtle p-4 mb-8 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-mid text-sm">search</span>
          <input 
            className="w-full pl-9 pr-3 py-2 bg-transparent border-[0.5px] border-border-subtle rounded text-ui-sm font-mono outline-none focus:border-primary-container" 
            placeholder="Search description or IP..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <select className="py-2 px-3 bg-transparent border-[0.5px] border-border-subtle rounded text-ui-sm text-text-mid focus:border-primary-container outline-none">
            <option>All Modules</option>
            <option>General Ledger</option>
            <option>Vouchers</option>
            <option>User Access</option>
          </select>
          <select className="py-2 px-3 bg-transparent border-[0.5px] border-border-subtle rounded text-ui-sm text-text-mid focus:border-primary-container outline-none">
            <option>All Actions</option>
            <option>CREATE</option>
            <option>UPDATE</option>
            <option>DELETE</option>
            <option>LOGIN</option>
          </select>
          <button className="px-4 py-2 bg-section-muted text-on-surface text-ui-xs uppercase tracking-wider font-bold rounded hover:bg-stone-200 transition-colors flex items-center gap-2 border border-border-subtle cursor-pointer">
            <span className="material-symbols-outlined text-sm">filter_list</span> More Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto border border-border-subtle bg-white shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-section-muted border-b border-border-subtle">
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid">Timestamp (IST)</th>
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid">User / Role</th>
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid">Module</th>
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid">Action</th>
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid w-full">Description</th>
              <th className="py-3 px-6 font-ui-xs uppercase tracking-widest text-text-mid text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {mockEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-stone-50 transition-colors group">
                <td className="py-4 px-6 font-mono text-[12px] text-text-mid">{entry.performedAt}</td>
                <td className="py-4 px-6">
                  <div className="font-ui-sm font-bold text-on-surface">{entry.performedBy}</div>
                  <div className="font-ui-xs text-[10px] text-text-light uppercase">{entry.role}</div>
                </td>
                <td className="py-4 px-6 font-ui-sm text-text-mid">{entry.module}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-border-subtle rounded-sm ${
                    entry.action === 'Delete' ? 'bg-red-50 text-red-800 border-red-100' :
                    entry.action === 'Generate' ? 'bg-green-50 text-green-800 border-green-100' :
                    entry.action === 'Login' ? 'bg-blue-50 text-blue-800 border-blue-100' :
                    'bg-section-muted text-on-surface'
                  }`}>
                    {entry.action}
                  </span>
                </td>
                <td className="py-4 px-6 font-ui-sm text-on-surface max-w-[300px] truncate" title={entry.details}>
                  {entry.details}
                </td>
                <td className="py-4 px-6 font-mono text-[12px] text-text-mid text-right">{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="font-ui-xs text-text-mid">Showing 1 to 5 of 1,248 entries</p>
        <div className="flex gap-1">
          <button className="p-1 border border-border-subtle rounded text-text-mid hover:bg-white disabled:opacity-50 cursor-pointer"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
          <button className="px-3 py-1 bg-white border border-border-subtle rounded font-mono text-sm">1</button>
          <button className="px-3 py-1 border border-transparent hover:border-border-subtle rounded font-mono text-sm text-text-mid cursor-pointer">2</button>
          <button className="px-3 py-1 border border-transparent hover:border-border-subtle rounded font-mono text-sm text-text-mid cursor-pointer">3</button>
          <span className="px-2 py-1 text-text-mid">...</span>
          <button className="p-1 border border-border-subtle rounded text-text-mid hover:bg-white cursor-pointer"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
}
