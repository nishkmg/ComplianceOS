// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: employees, isLoading } = api.employees.list.useQuery({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Employees</h1>
          <p className="font-ui text-[12px] text-light mt-1">Manage employee records and payroll</p>
        </div>
        <Link href="/employees/new" className="filter-tab active">
          + Add Employee
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="filter-tabs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-tab font-ui"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="exited">Exited</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by name, code, PAN... (/)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field font-ui flex-1 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 font-ui text-light">Loading employees...</div>
        ) : (
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Code</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Name</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">PAN</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">DOJ</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Designation</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Department</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
                <th className="font-ui text-[10px] uppercase tracking-wide text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees?.map((emp: any) => (
                <tr key={emp.id} className="border-b border-hairline hover:bg-surface-muted transition-colors">
                  <td className="font-mono text-[13px] text-amber px-4 py-3">{emp.employeeCode}</td>
                  <td className="font-ui text-[13px] text-dark px-4 py-3">{emp.firstName} {emp.lastName}</td>
                  <td className="font-mono text-[13px] text-mid px-4 py-3">{emp.pan}</td>
                  <td className="font-mono text-[13px] text-light px-4 py-3">{emp.dateOfJoining}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3">{emp.designation ?? "-"}</td>
                  <td className="font-ui text-[13px] text-mid px-4 py-3">{emp.department ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={emp.status === "active" ? "success" : emp.status === "inactive" ? "amber" : "gray"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/employees/${emp.id}`} className="font-ui text-[12px] text-amber hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {employees?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center font-ui text-light">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
