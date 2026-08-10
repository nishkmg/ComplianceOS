"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

export default function AuditLogPage() {
  const { data, isLoading } = api.auditLog.list.useQuery({ limit: 100 }, { staleTime: 15_000 });
  const entries = data ?? [];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader title="Audit Log" />
      {entries.length === 0 ? <EmptyState icon="history" title="No entries" description="Audit entries will appear here as events are recorded." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Event Type</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Aggregate</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">ID</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Created</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-amber">
                    <Link href={`/audit-log/${e.id}`} className="hover:underline no-underline text-inherit">{e.eventType?.replace(/_/g, " ")}</Link>
                  </td>
                  <td className="py-3 px-6 font-ui text-ui-xs text-dark">{e.aggregateType}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.aggregateId?.substring(0, 8)}…</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.createdAt ? new Date(e.createdAt).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
