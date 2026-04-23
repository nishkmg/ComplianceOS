// @ts-nocheck
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";

export default function ProcessPayrollPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const { data: pendingEmployees } = api.payroll.pending.useQuery();
  const processPayroll = api.payroll.process.useMutation({ onSuccess: (data: any) => router.push(`/payroll/${data.payrollRunId}`) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processPayroll.mutate({ employeeId, month, year });
  };

  const monthLabels = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-normal text-dark">Process Payroll</h1>
        <p className="font-ui text-[12px] text-light mt-1">Calculate and finalize employee payroll</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div className="card p-5 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Employee <span className="text-danger">*</span></label>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="input-field font-ui">
              <option value="">Select Employee</option>
              {pendingEmployees?.map((emp: any) => (<option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.firstName} {emp.lastName}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Month <span className="text-danger">*</span></label>
              <select required value={month} onChange={(e) => setMonth(e.target.value)} className="input-field font-ui">
                {monthLabels.map((m, i) => (<option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] uppercase tracking-wide text-light">Year <span className="text-danger">*</span></label>
              <input required type="number" value={year} onChange={(e) => setYear(e.target.value)} className="input-field font-ui" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={processPayroll.isPending} className="filter-tab active disabled:opacity-50">
            {processPayroll.isPending ? "Processing..." : "Process Payroll"}
          </button>
          <button type="button" onClick={() => router.back()} className="filter-tab">Cancel</button>
        </div>
      </form>

      {pendingEmployees && pendingEmployees.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-[16px] font-normal text-dark mb-4">Pending for {month}/{year}</h2>
          <div className="space-y-2">
            {pendingEmployees.map((emp: any) => (
              <div key={emp.id} className="flex justify-between items-center p-3 bg-surface-muted rounded">
                <span className="font-ui text-[13px] text-dark">{emp.employeeCode} - {emp.firstName} {emp.lastName}</span>
                <Badge variant="amber">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
