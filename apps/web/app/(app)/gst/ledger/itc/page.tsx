"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ItcLedgerPage() {
  const { data: session } = useSession(); const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [entries, setEntries] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tenantId) return; (async () => { try { const r = await fetch(`/api/gst/ledger?tenantId=${encodeURIComponent(tenantId)}&type=cash`); if (r.ok) setEntries((await r.json()).entries?.filter((e: any) => e.tax_type === "itc") || []); } catch {} finally { setLoading(false); } })(); }, [tenantId]);
  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">ITC Ledger</h1>
      {entries.length === 0 ? <EmptyState icon="account_balance" title="No ITC entries" description="ITC entries will appear here once returns are filed." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse"><thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Date</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Description</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Amount</th>
          </tr></thead><tbody className="divide-y divide-border-subtle">
            {entries.map((e: any) => (
              <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{e.transaction_date ? new Date(e.transaction_date).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-3 px-6 font-ui text-[13px] text-dark">{e.narration || e.transaction_type}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">₹{Number(e.amount || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
