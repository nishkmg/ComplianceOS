"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function AuditEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showPayload, setShowPayload] = useState(false);

  const entry = api.auditLog.get.useQuery(id, { staleTime: 15_000 });

  if (entry.isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (entry.error || !entry.data) {
    return (
      <div className="max-w-[800px] mx-auto py-20">
        <EmptyState icon="error" title="Audit entry not found" description={entry.error?.message ?? "This entry does not exist for your tenant."} />
      </div>
    );
  }

  const e = entry.data;
  const payload = typeof e.payload === "string" ? JSON.parse(e.payload || "{}") : e.payload;

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <div>
          <h1 className="font-ui text-display-lg font-semibold text-dark">{e.eventType?.replace(/_/g, " ")}</h1>
          <p className="font-mono text-ui-xs text-mid mt-0.5">{e.id}</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-muted border-b border-border grid grid-cols-2 gap-6">
          <div>
            <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Aggregate</p>
            <p className="font-ui text-ui-sm text-dark mt-1">{e.aggregateType}</p>
          </div>
          <div>
            <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Aggregate ID</p>
            <p className="font-mono text-ui-xs text-mid mt-1 break-all">{e.aggregateId}</p>
          </div>
          <div>
            <p className="font-ui text-ui-2xs text-mid uppercase tracking-widest font-bold">Created</p>
            <p className="font-mono text-ui-sm text-dark mt-1">{e.createdAt ? new Date(e.createdAt).toLocaleString("en-IN") : "—"}</p>
          </div>
        </div>
        <div className="p-6">
          <button onClick={() => setShowPayload(!showPayload)} className="border-none bg-transparent cursor-pointer font-ui text-ui-2xs text-amber uppercase tracking-widest font-bold hover:underline">
            {showPayload ? "Hide payload" : "Show payload"}
          </button>
          {showPayload && (
            <pre className="mt-4 p-4 bg-surface-muted border border-border rounded-md overflow-x-auto font-mono text-ui-xs text-dark whitespace-pre-wrap">
              {JSON.stringify(payload ?? {}, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <Link href="/audit-log" className="text-amber text-ui-xs font-bold uppercase tracking-wider hover:underline no-underline">← Back to Audit Log</Link>
    </div>
  );
}
