// @ts-nocheck
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProcessPayrollPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const { data: pendingEmployees } = api.payroll.pending.useQuery();
  const processPayroll = api.payroll.process.useMutation({
    onSuccess: (data: any) => {
      router.push(`/payroll/${data.payrollRunId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processPayroll.mutate({ employeeId, month, year });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Process Payroll</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Employee *</label>
          <select
            required
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Employee</option>
            {pendingEmployees?.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.employeeCode} - {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month *</label>
            <select
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {new Date(2026, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <input
              required
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={processPayroll.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processPayroll.isPending ? "Processing..." : "Process Payroll"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {pendingEmployees && pendingEmployees.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Pending for {month}/{year}</h2>
          <ul className="space-y-2">
            {pendingEmployees.map((emp: any) => (
              <li key={emp.id} className="flex justify-between items-center border p-2 rounded">
                <span>{emp.employeeCode} - {emp.firstName} {emp.lastName}</span>
                <button
                  onClick={() => setEmployeeId(emp.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
