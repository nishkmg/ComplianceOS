"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSession } from "next-auth/react";

interface Employee { id: string; employee_code: string; first_name: string; last_name: string; email: string; designation: string; department: string; status: string; }

const columns: ColumnDef<Employee>[] = [
  { key: "employee_code", header: "Code", width: "120px", render: (r) => <Link href={`/employees/${r.id}`} className="font-mono text-ui-xs text-amber hover:underline no-underline">{r.employee_code}</Link> },
  { key: "first_name", header: "Name", sortable: true, render: (r) => <span className="font-ui text-ui-sm text-dark">{r.first_name} {r.last_name || ""}</span> },
  { key: "email", header: "Email", render: (r) => <span className="font-ui text-ui-xs text-mid">{r.email || "—"}</span> },
  { key: "designation", header: "Designation", render: (r) => <span className="font-ui text-ui-xs text-mid">{r.designation || "—"}</span> },
  { key: "status", header: "Status", align: "center", width: "100px", render: (r) => <Badge variant={r.status === "active" ? "success" : "gray"}>{r.status}</Badge> },
];

export default function EmployeesPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [employees, setEmployees] = useState<Employee[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tenantId) return; (async () => { try { const r = await fetch(`/api/employees?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setEmployees((await r.json()).employees || []); } catch {} finally { setLoading(false); } })(); }, [tenantId]);
  if (loading) return <TableSkeleton rows={5} columns={5} />;
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">Employees</h1>
        <Link href="/employees/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> Add Employee</Link>
      </div>
      {employees.length > 0 ? <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden"><DataTable columns={columns} data={employees} keyExtractor={(r) => r.id} /></div> : <EmptyState icon="group" title="No employees" description="Add your first employee to get started." />}
    </div>
  );
}
