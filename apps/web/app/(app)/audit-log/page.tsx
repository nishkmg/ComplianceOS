"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";

interface AuditEntry { id: string; event_type: string; aggregate_type: string; aggregate_id: string; payload: any; created_at: string; }

export default function AuditLogPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [entries, setEntries] = useState<AuditEntry[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try { const r = await fetch(`/api/audit-log?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setEntries((await r.json()).entries || []); } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Audit Log</h1>
      {entries.length === 0 ? <EmptyState icon="history" title="No entries" description="Audit entries will appear here as events are recorded." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Event Type</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Aggregate</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">ID</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Created</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-[11px] text-amber">{e.event_type?.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-6 font-ui text-[12px] text-dark">{e.aggregate_type}</td>
                  <td className="py-3 px-6 font-mono text-[11px] text-mid">{e.aggregate_id?.substring(0, 8)}…</td>
                  <td className="py-3 px-6 font-mono text-[11px] text-mid">{e.created_at ? new Date(e.created_at).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
