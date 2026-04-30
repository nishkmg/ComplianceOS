"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";

export default function EmployeesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: employees, isLoading }: any = api.employees.list.useQuery({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    search: search || undefined,
  });

  const filteredEmployees = employees ?? [];

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="px-8 pt-10 pb-6 border-b-[0.5px] border-border-subtle bg-surface-container-lowest sticky top-0 z-30 -mx-8 -mt-8 mb-6" style={{ width: 'calc(100% + 64px)' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1400px] mx-auto text-left">
          <div>
            <h1 className="font-display-lg text-on-surface mb-1">Employee Directory</h1>
            <p className="font-ui-sm text-text-mid">Centralized register for payroll compliance, KYC verification, and statutory records.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2.5 border-[0.5px] border-on-surface text-on-surface bg-white hover:bg-stone-50 rounded font-ui-sm text-xs transition-colors flex items-center gap-2 cursor-pointer">
              <Icon name="download" className="text-lg" />
              Export PDF/Excel
            </button>
            <Link href="/employees/new" className="px-5 py-2.5 bg-primary-container text-white rounded font-ui-sm text-xs hover:bg-primary transition-colors flex items-center gap-2 no-underline shadow-sm">
              <Icon name="person_add" className="text-lg" />
              Add New Employee
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-[0.5px] border-border-subtle p-5 flex flex-col lg:flex-row gap-5 justify-between items-center rounded-t-lg text-left">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 text-xs font-ui-sm rounded transition-colors cursor-pointer border-none ${
                statusFilter === f ? "bg-primary-container text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {f === "all" ? "All Employees" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border-[0.5px] border-border-subtle rounded font-ui-sm text-xs focus:ring-1 focus:ring-amber-600/20 outline-none"
              placeholder="Filter by Name, ID or PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-2 border-[0.5px] border-border-subtle rounded text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer bg-white">
            <Icon name="filter_list" className="text-lg" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-x-[0.5px] border-b-[0.5px] border-border-subtle rounded-b-lg overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-stone-50/80 text-stone-500 border-b-[0.5px] border-border-subtle">
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Emp Code</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Name</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Entity</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Department</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Joining Date</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold">Compliance Status</th>
              <th className="py-4 px-6 font-ui-sm text-[10px] uppercase tracking-widest font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-[0.5px] divide-stone-100">
            {isLoading ? (
              <tr><td colSpan={7} className="py-12 text-center text-stone-400 text-sm">Loading...</td></tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="py-4 px-6 font-mono-md text-sm text-amber-text">{emp.employeeCode}</td>
                  <td className="py-4 px-6">
                    <Link href={`/employees/${emp.id}`} className="font-ui-sm font-bold text-stone-900 hover:text-amber-700 transition-colors no-underline">{emp.name}</Link>
                  </td>
                  <td className="py-4 px-6 font-ui-sm text-stone-600">{emp.entityName}</td>
                  <td className="py-4 px-6 font-ui-sm text-stone-600">{emp.department}</td>
                  <td className="py-4 px-6 font-mono-md text-sm text-stone-500">{new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border-[0.5px] rounded-sm ${
                      emp.complianceStatus === 'complete' ? 'bg-green-50 text-green-700 border-green-200' :
                      emp.complianceStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {emp.complianceStatus === 'complete' ? 'Complete' : emp.complianceStatus === 'pending' ? 'UAN Missing' : 'Action Required'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-stone-400 hover:text-stone-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent">
                      <Icon name="more_vert" className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="py-12 text-center text-stone-400 text-sm">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
