"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const expectedTypes = ["gstr1", "gstr2b", "gstr3b", "gstr9"];
const pad = (n: number) => String(n).padStart(2, "0");

function dueDateClass(due: string | null): string {
  if (!due) return "text-mid";
  const [y, m, d] = due.split("-").map(Number);
  const dueDt = new Date(y, (m || 1) - 1, d || 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((dueDt.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "text-danger";
  if (days <= 7) return "text-amber";
  return "text-mid";
}

export default function GstReturnsPage() {
  const { data, isLoading } = api.gstReturns.list.useQuery(undefined, { staleTime: 15_000 });
  const returns = data ?? [];

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthStatus = (month: number): "filed" | "generated" | "draft" | "none" => {
    const rows = returns.filter(r => r.taxPeriodYear === String(currentYear) && Number(r.taxPeriodMonth) === month);
    if (rows.length === 0) return "none";
    const active = rows.filter(r => r.status === "generated" || r.status === "filed");
    if (active.length === 0) return "draft";
    const allFiled = expectedTypes.every(t => rows.some(r => r.returnType === t && r.status === "filed"));
    return allFiled ? "filed" : "generated";
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-light animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader title="GST Returns" />

      <div className="space-y-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {monthNames.slice(1).map((name, i) => {
            const month = i + 1;
            const status = monthStatus(month);
            return (
              <Link
                key={month}
                href={`/gst/returns/${currentYear}-${pad(month)}`}
                className={`bg-surface border border-border rounded-md p-3 shadow-sm hover:border-amber transition-colors no-underline ${month === currentMonth ? "ring-1 ring-amber" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-ui text-ui-sm font-bold text-dark">{name}</span>
                  {status === "filed" && <span className="inline-block h-2 w-2 rounded-full bg-success-deep" />}
                  {status === "generated" && <span className="inline-block h-2 w-2 rounded-full bg-amber" />}
                </div>
                <p className="font-mono text-ui-2xs text-light mt-0.5">
                  {status === "filed" ? "filed" : status === "generated" ? "generated" : status === "draft" ? "draft" : "—"}
                </p>
              </Link>
            );
          })}
        </div>
        <p className="font-mono text-ui-2xs text-mid">
          <span className="text-success-deep">●</span> filed · <span className="text-amber">○</span> generated
        </p>
      </div>

      {returns.length === 0 ? <EmptyState icon="gavel" title="No returns yet" description="GST returns will appear here once created." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Return</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Period</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Due Date</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Payable</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Status</th>
              <th className="py-3 px-6" aria-label="Open" />
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {returns.map(r => {
                const href = `/gst/returns/${r.taxPeriodYear}-${r.taxPeriodMonth}`;
                return (
                  <tr key={r.id} className="hover:bg-surface-muted transition-colors">
                    <td className="py-3 px-6 font-mono text-ui-xs text-amber"><Link href={href} className="hover:underline no-underline text-inherit">{r.returnNumber}</Link></td>
                    <td className="py-3 px-6 font-ui text-ui-sm text-dark"><Link href={href} className="no-underline text-inherit">{monthNames[parseInt(r.taxPeriodMonth)] || r.taxPeriodMonth} {r.taxPeriodYear}</Link></td>
                    <td className={`py-3 px-6 font-mono text-ui-xs ${dueDateClass(r.dueDate)}`}><Link href={href} className="no-underline text-inherit">{r.dueDate ? new Date(r.dueDate).toLocaleDateString("en-IN") : "—"}</Link></td>
                    <td className="py-3 px-6 font-mono text-ui-sm tabular-nums text-right"><Link href={href} className="no-underline text-inherit">₹{Number(r.totalTaxPayable || 0).toLocaleString("en-IN")}</Link></td>
                    <td className="py-3 px-6"><Link href={href} className="no-underline"><Badge variant={r.status === "filed" ? "success" : r.status === "draft" ? "amber" : "gray"}>{r.status}</Badge></Link></td>
                    <td className="py-3 px-6 text-right">
                      <Link href={href} aria-label="Open return" className="text-light hover:text-amber inline-flex"><Icon name="chevron_right" size={16} /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
