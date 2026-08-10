"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

interface Employee { id: string; employeeCode: string; firstName: string; lastName: string | null; email: string | null; designation: string | null; department: string | null; status: string; }

const columns: ColumnDef<Employee>[] = [
  { key: "employeeCode", header: "Code", width: "120px", render: (r) => <Link href={`/employees/${r.id}`} className="font-mono text-ui-xs text-amber hover:underline no-underline">{r.employeeCode}</Link> },
  { key: "firstName", header: "Name", sortable: true, render: (r) => <span className="font-ui text-ui-sm text-dark">{r.firstName} {r.lastName || ""}</span> },
  { key: "email", header: "Email", render: (r) => <span className="font-ui text-ui-xs text-mid">{r.email || "—"}</span> },
  { key: "designation", header: "Designation", render: (r) => <span className="font-ui text-ui-xs text-mid">{r.designation || "—"}</span> },
  { key: "status", header: "Status", align: "center", width: "100px", render: (r) => <Badge variant={r.status === "active" ? "success" : "gray"}>{r.status}</Badge> },
];

export default function EmployeesPage() {
  const { data, isLoading } = api.employees.list.useQuery(undefined, { staleTime: 15_000 });
  const employees = data ?? [];

  if (isLoading) return <TableSkeleton rows={6} />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">Employees</h1>
        <Link href="/employees/new" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> New Employee</Link>
      </div>
      {employees.length === 0 ? (
        <EmptyState icon="group" title="No employees" description="Add your first employee to start payroll." />
      ) : (
        <DataTable columns={columns} data={employees} keyExtractor={(r) => r.id} />
      )}
    </div>
  );
}
