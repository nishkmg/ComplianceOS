"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function GstReturnsPage() {
  const { data, isLoading } = api.gstReturns.list.useQuery(undefined, { staleTime: 15_000 });
  const returns = data ?? [];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-light animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader title="GST Returns" />
      {returns.length === 0 ? <EmptyState icon="gavel" title="No returns yet" description="GST returns will appear here once created." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Return</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Period</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Due Date</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Payable</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {returns.map(r => (
                <tr key={r.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-amber"><Link href={`/gst/returns/${r.taxPeriodYear}-${r.taxPeriodMonth}`} className="hover:underline no-underline text-inherit">{r.returnNumber}</Link></td>
                  <td className="py-3 px-6 font-ui text-ui-sm text-dark">{monthNames[parseInt(r.taxPeriodMonth)] || r.taxPeriodMonth} {r.taxPeriodYear}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{r.dueDate ? new Date(r.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="py-3 px-6 font-mono text-ui-sm tabular-nums text-right">₹{Number(r.totalTaxPayable || 0).toLocaleString("en-IN")}</td>
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
