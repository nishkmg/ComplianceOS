"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "next-auth/react";

interface PayrollRun { id: string; payroll_number: string; month: string; year: string; status: string; net_pay: string; }

const columns: ColumnDef<PayrollRun>[] = [
  { key: "payroll_number", header: "Run #", width: "150px", render: (r) => <Link href={`/payroll/${r.id}`} className="font-mono text-[12px] text-amber-text hover:underline no-underline">{r.payroll_number}</Link> },
  { key: "month", header: "Period", sortable: true, render: (r) => <span className="font-ui text-[13px] text-dark">{r.month} {r.year}</span> },
  { key: "net_pay", header: "Net Pay", align: "right", render: (r) => <span className="font-mono text-[13px] tabular-nums">₹{Number(r.net_pay || 0).toLocaleString("en-IN")}</span> },
  { key: "status", header: "Status", align: "center", width: "100px", render: (r) => <Badge variant={r.status === "finalized" ? "success" : r.status === "draft" ? "amber" : "gray"}>{r.status}</Badge> },
];

export default function PayrollPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [runs, setRuns] = useState<PayrollRun[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tenantId) return; (async () => { try { const r = await fetch(`/api/payroll/runs?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setRuns((await r.json()).runs || []); } catch {} finally { setLoading(false); } })(); }, [tenantId]);
  if (loading) return <TableSkeleton rows={5} columns={4} />;
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">Payroll</h1>
        <Link href="/payroll/process" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> Process Payroll</Link>
      </div>
      {runs.length > 0 ? <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden"><DataTable columns={columns} data={runs} keyExtractor={(r) => r.id} /></div> : <EmptyState icon="payments" title="No payroll runs" description="Process your first payroll run." />}
    </div>
  );
}
