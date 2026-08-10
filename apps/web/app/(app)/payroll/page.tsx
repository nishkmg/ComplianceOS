"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

interface PayrollRun { id: string; payrollNumber: string; month: string; year: string; status: string; netPay: string | null; }

const columns: ColumnDef<PayrollRun>[] = [
  { key: "payrollNumber", header: "Run #", width: "150px", render: (r) => <Link href={`/payroll/${r.id}`} className="font-mono text-ui-xs text-amber hover:underline no-underline">{r.payrollNumber}</Link> },
  { key: "month", header: "Period", sortable: true, render: (r) => <span className="font-ui text-ui-sm text-dark">{r.month} {r.year}</span> },
  { key: "netPay", header: "Net Pay", align: "right", render: (r) => <span className="font-mono text-ui-sm tabular-nums">₹{Number(r.netPay || 0).toLocaleString("en-IN")}</span> },
  { key: "status", header: "Status", align: "center", width: "100px", render: (r) => <Badge variant={r.status === "finalized" ? "success" : r.status === "draft" ? "amber" : "gray"}>{r.status}</Badge> },
];

export default function PayrollPage() {
  const { data, isLoading } = api.payroll.list.useQuery(undefined, { staleTime: 15_000 });
  const runs = data ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader title="Payroll" />
        <Link href="/payroll/process" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> Process Payroll</Link>
      </div>
      {isLoading ? <TableSkeleton rows={6} /> : runs.length === 0 ? (
        <EmptyState icon="payments" title="No payroll runs" description="Process payroll to create runs." />
      ) : (
        <DataTable columns={columns} data={runs} keyExtractor={(r) => r.id} />
      )}
    </div>
  );
}
