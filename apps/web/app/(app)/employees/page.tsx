"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { showToast } from "@/lib/toast";
import { useFiscalYear } from "@/hooks/use-fiscal-year";

interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  entityName: string;
  department: string;
  joiningDate: string;
  complianceStatus: string;
}

const mockEmployees: Employee[] = [
  { id: "e1", employeeCode: "EMP-2024-001", name: "Rahul Sharma", entityName: "Arthvahi Pvt Ltd", department: "Compliance", joiningDate: "2024-01-15", complianceStatus: "complete" },
  { id: "e2", employeeCode: "EMP-2024-002", name: "Priya Singh", entityName: "Arthvahi Pvt Ltd", department: "Engineering", joiningDate: "2024-03-01", complianceStatus: "pending" },
  { id: "e3", employeeCode: "EMP-2024-003", name: "Vikram Das", entityName: "Arthvahi Pvt Ltd", department: "Finance", joiningDate: "2024-06-10", complianceStatus: "action_required" },
];

export default function EmployeesPage() {
  const router = useRouter();
  const { activeFy } = useFiscalYear();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = mockEmployees.filter((emp) => {
    if (statusFilter === "active" && emp.complianceStatus !== "complete") return false;
    if (statusFilter === "inactive" && emp.complianceStatus === "complete") return false;
    if (search && !emp.name.toLowerCase().includes(search.toLowerCase()) && !emp.employeeCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="px-8 pt-10 pb-6 border-b-[0.5px] border-border bg-surface-container-lowest sticky top-0 z-30 -mx-8 -mt-8 mb-6 w-[calc(100%+64px)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1400px] mx-auto text-left">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">HR Management · FY {activeFy}</p>
            <h1 className="font-display text-2xl font-semibold text-dark">Employee Directory</h1>
            <p className="text-[13px] text-secondary font-ui mt-1">Centralized register for payroll compliance, KYC verification, and statutory records.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => showToast.success("Employee directory exported.")} className="btn btn-secondary flex items-center gap-2">
              <Icon name="download" className="text-lg" />
              Export PDF/Excel
            </button>
            <Link href="/employees/new" className="btn btn-primary no-underline flex items-center gap-2">
              <Icon name="person_add" className="text-lg" />
              Add New Employee
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border p-5 flex flex-col lg:flex-row gap-5 justify-between items-center rounded-t-lg text-left">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 text-xs font-ui text-[13px] rounded transition-colors cursor-pointer border-none ${
                statusFilter === f ? "bg-amber text-white" : "bg-surface-muted text-mid hover:bg-zinc-200"
              }`}
            >
              {f === "all" ? "All Employees" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-light text-lg" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-muted border border-border rounded font-ui text-[13px] focus:ring-1 focus:ring-amber-600/20 outline-none"
              placeholder="Filter by Name, ID or PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => showToast.info("Advanced filters opened.")} className="p-2 border border-border rounded text-mid hover:bg-surface-muted transition-colors cursor-pointer bg-surface">
            <Icon name="filter_list" className="text-lg" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border-x-[0.5px] border-b-[0.5px] border-border rounded-b-lg overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-muted/80 text-mid border-b-[0.5px] border-border">
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Emp Code</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Name</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Entity</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Department</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Joining Date</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold">Compliance Status</th>
                <th className="py-4 px-6 font-ui text-[13px] text-[10px] uppercase tracking-widest font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-stone-100">
              {filtered.length > 0 ? (
                filtered.map((emp: Employee) => (
                  <tr key={emp.id} className="hover:bg-surface-muted/50 transition-colors group">
                    <td className="py-4 px-6 font-mono text-sm text-amber-text">{emp.employeeCode}</td>
                    <td className="py-4 px-6">
                      <Link href={`/employees/${emp.id}`} className="font-ui text-[13px] font-bold text-dark hover:text-amber-text transition-colors no-underline">{emp.name}</Link>
                    </td>
                    <td className="py-4 px-6 font-ui text-[13px] text-mid">{emp.entityName}</td>
                    <td className="py-4 px-6 font-ui text-[13px] text-mid">{emp.department}</td>
                    <td className="py-4 px-6 font-mono text-sm text-mid">{new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider border rounded-md ${
                        emp.complianceStatus === 'complete' ? 'bg-success-bg text-success border-green-200' :
                        emp.complianceStatus === 'pending' ? 'bg-amber-50 text-amber-text border-amber-200' :
                        'bg-danger-bg text-danger border-red-200'
                      }`}>
                        {emp.complianceStatus === 'complete' ? 'Complete' : emp.complianceStatus === 'pending' ? 'UAN Missing' : 'Action Required'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => showToast.info("Employee actions opened.")} className="text-light hover:text-mid transition-colors opacity-0 group-hover:opacity-100 cursor-pointer border-none bg-transparent">
                        <Icon name="more_vert" className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No employees found"
                      description={search || statusFilter !== "all" ? "Try adjusting your search or filter." : "Add your first employee to the directory."}
                      action={{ label: "Add New Employee", onClick: () => router.push("/employees/new") }}
                      icon="group"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </div>
  );
}
