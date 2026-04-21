"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: employees, isLoading } = api.employees.list.useQuery({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Link
          href="/employees/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          + Add Employee
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="exited">Exited</option>
        </select>

        <input
          type="text"
          placeholder="Search by name, code, PAN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm flex-1 max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Code</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">PAN</th>
              <th className="border px-4 py-2 text-left">DOJ</th>
              <th className="border px-4 py-2 text-left">Designation</th>
              <th className="border px-4 py-2 text-left">Department</th>
              <th className="border px-4 py-2 text-left">Status</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees?.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{emp.employeeCode}</td>
                <td className="border px-4 py-2">{emp.firstName} {emp.lastName}</td>
                <td className="border px-4 py-2">{emp.pan}</td>
                <td className="border px-4 py-2">{emp.dateOfJoining}</td>
                <td className="border px-4 py-2">{emp.designation ?? "-"}</td>
                <td className="border px-4 py-2">{emp.department ?? "-"}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    emp.status === "active" ? "bg-green-100 text-green-800" :
                    emp.status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  <Link href={`/employees/${emp.id}`} className="text-blue-600 hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {employees?.length === 0 && (
              <tr>
                <td colSpan={8} className="border px-4 py-8 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
