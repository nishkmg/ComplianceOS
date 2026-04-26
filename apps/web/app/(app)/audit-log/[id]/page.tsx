// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AuditEntryDetail {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  performedAt: string;
  details: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

async function fetchAuditEntry(id: string): Promise<AuditEntryDetail | null> {
  const response = await fetch(`/api/trpc/auditLog.get?id=${encodeURIComponent(id)}`);
  if (!response.ok) return null;
  const json = await response.json();
  return json.result?.data ?? null;
}

export default function AuditEntryDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [entry, setEntry] = useState<AuditEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrevious, setShowPrevious] = useState(false);
  const [params, setParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;
    fetchAuditEntry(params.id)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return <div className="text-center py-12 font-ui text-light">Loading...</div>;
  }

  if (!entry) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="font-ui text-[16px] text-light">Audit entry not found</p>
        <Link href="/audit-log" className="filter-tab active">← Back to Audit Log</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/audit-log" className="font-ui text-[12px] text-amber hover:underline">← Back to Audit Log</Link>
        <h1 className="font-display text-[26px] font-normal text-dark mt-1">Audit Entry Detail</h1>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Action</p>
            <p className="font-ui text-[14px] text-dark capitalize mt-1">{entry.action}</p>
          </div>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Entity Type</p>
            <p className="font-ui text-[14px] text-dark capitalize mt-1">{entry.entityType}</p>
          </div>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Entity ID</p>
            <p className="font-mono text-[14px] text-mid mt-1">{entry.entityId}</p>
          </div>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Performed By</p>
            <p className="font-ui text-[14px] text-dark mt-1">{entry.performedBy}</p>
          </div>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Date/Time</p>
            <p className="font-mono text-[14px] text-mid mt-1">{new Date(entry.performedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">IP Address</p>
            <p className="font-mono text-[14px] text-mid mt-1">{entry.ipAddress || "-"}</p>
          </div>
        </div>

        {entry.details && (
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">Details</p>
            <p className="font-ui text-[14px] text-dark mt-1">{entry.details}</p>
          </div>
        )}

        {entry.userAgent && (
          <div>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">User Agent</p>
            <p className="font-ui text-[12px] text-mid mt-1 break-all">{entry.userAgent}</p>
          </div>
        )}
      </div>

      {(entry.previousState || entry.newState) && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[16px] font-normal text-dark">State Changes</h2>
            <button onClick={() => setShowPrevious(!showPrevious)} className="font-ui text-[12px] text-amber hover:underline">
              {showPrevious ? "Show New State" : "Show Previous State"}
            </button>
          </div>
          <pre className="font-mono text-[12px] text-mid bg-surface-muted p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(showPrevious ? entry.previousState : entry.newState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
