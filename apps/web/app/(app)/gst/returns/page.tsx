"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";

interface GstReturn {
  id: string; return_number: string; return_type: string; tax_period_month: string;
  tax_period_year: string; status: string; due_date: string; total_tax_payable: string;
}

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function GstReturnsPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [returns, setReturns] = useState<GstReturn[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try { const r = await fetch(`/api/gst/returns?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setReturns((await r.json()).returns || []); } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">GST Returns</h1>
      {returns.length === 0 ? <EmptyState icon="gavel" title="No returns yet" description="GST returns will appear here once created." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Return</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Period</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Due Date</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Tax Payable</th>
              <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {returns.map(r => (
                <tr key={r.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-[12px] text-amber-text"><Link href={`/gst/returns/${r.tax_period_year}/${r.return_type}`} className="hover:underline no-underline text-inherit">{r.return_number}</Link></td>
                  <td className="py-3 px-6 font-ui text-[13px] text-dark">{monthNames[parseInt(r.tax_period_month)] || r.tax_period_month} {r.tax_period_year}</td>
                  <td className="py-3 px-6 font-mono text-[12px] text-mid">{r.due_date ? new Date(r.due_date).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="py-3 px-6 font-mono text-[13px] tabular-nums text-right">₹{Number(r.total_tax_payable || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6"><Badge variant={r.status === "filed" ? "success" : r.status === "draft" ? "amber" : "gray"}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
