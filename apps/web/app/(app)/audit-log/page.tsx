// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedAt: string;
  details: string;
}

async function fetchAuditLog(page = 1, pageSize = 50): Promise<{ entries: AuditEntry[]; total: number }> {
  const response = await fetch(`/api/trpc/auditLog.list?input=${encodeURIComponent(JSON.stringify({ page, pageSize }))}`);
  if (!response.ok) return { entries: [], total: 0 };
  const json = await response.json();
  return json.result?.data ?? { entries: [], total: 0 };
}

const actionColors: Record<string, string> = {
  create: "text-success",
  update: "text-amber",
  delete: "text-error",
  post: "text-blue-600",
  void: "text-error",
  export: "text-mid",
  login: "text-mid",
  logout: "text-mid",
};

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    fetchAuditLog(page)
      .then((data) => setEntries(data.entries))
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = filterAction === "all" && filterEntity === "all"
    ? entries
    : entries.filter(e =>
        (filterAction === "all" || e.action === filterAction) &&
        (filterEntity === "all" || e.entityType === filterEntity)
      );

  const uniqueActions = [...new Set(entries.map(e => e.action))].sort();
  const uniqueEntities = [...new Set(entries.map(e => e.entityType))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Audit Log</h1>
          <p className="font-ui text-[12px] text-light mt-1">Track all changes and actions across the system</p>
        </div>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="input-field font-ui">
            <option value="all">All Actions</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] uppercase tracking-wide text-light">Entity</label>
          <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)} className="input-field font-ui">
            <option value="all">All Entities</option>
            {uniqueEntities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 font-ui text-light">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Date/Time</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Action</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Entity</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Performed By</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-ui text-[13px] text-light">No audit entries found</td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-hairline hover:bg-surface-muted">
                    <td className="font-mono text-[13px] text-light px-4 py-3 whitespace-nowrap">{new Date(entry.performedAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-ui text-[11px] px-2 py-0.5 rounded bg-surface-muted ${actionColors[entry.action] || "text-mid"} capitalize`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="font-ui text-[13px] text-mid px-4 py-3 capitalize">{entry.entityType}</td>
                    <td className="font-ui text-[13px] text-dark px-4 py-3">{entry.performedBy}</td>
                    <td className="font-ui text-[13px] text-mid px-4 py-3 max-w-xs truncate">{entry.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="filter-tab">Previous</button>
        <span className="font-ui text-[13px] text-light self-center">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} className="filter-tab">Next</button>
      </div>
    </div>
  );
}
