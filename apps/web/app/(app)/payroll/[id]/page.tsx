"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;

  const { data: runData, isLoading, refetch } = api.payroll.get.useQuery(runId);
  const finalize = api.payroll.finalize.useMutation({
    onSuccess: () => {
      refetch();
      alert("Payroll finalized successfully");
    },
  });
  const voidPayroll = api.payroll.void.useMutation({
    onSuccess: () => {
      refetch();
      alert("Payroll voided successfully");
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!runData?.run) return <div className="p-8">Payroll run not found</div>;

  const run = runData.run;
  const lines = runData.lines ?? [];

  const handleFinalize = () => {
    if (confirm("Finalize this payroll run? This will lock all entries and generate journal entries.")) {
      finalize.mutate(runId);
    }
  };

  const handleVoid = () => {
    if (confirm("Void this payroll run? This will reverse all journal entries and allow re-processing.")) {
      voidPayroll.mutate({ payrollRunId: runId, reason: "Manual void" });
    }
  };

  const totalGross = lines.reduce((sum: number, line: any) => sum + parseFloat(line.grossSalary || "0"), 0);
  const totalNet = lines.reduce((sum: number, line: any) => sum + parseFloat(line.netSalary || "0"), 0);
  const totalDeductions = totalGross - totalNet;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Run - {run.month}/{run.year}</h1>
          <p className="text-gray-600 text-sm">Created: {new Date(run.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {run.status === "draft" && (
            <>
              <button
                onClick={handleFinalize}
                disabled={finalize.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {finalize.isPending ? "Finalizing..." : "Finalize"}
              </button>
              <button
                onClick={handleVoid}
                disabled={voidPayroll.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {voidPayroll.isPending ? "Voiding..." : "Void"}
              </button>
            </>
          )}
          {run.status === "finalized" && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">Finalized</span>
          )}
          {run.status === "voided" && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">Voided</span>
          )}
          <button onClick={() => router.back()} className="px-4 py-2 border rounded hover:bg-gray-50">
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">Employees</div>
          <div className="text-2xl font-bold">{lines.length}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">Gross Salary</div>
          <div className="text-2xl font-bold">₹{totalGross.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">Total Deductions</div>
          <div className="text-2xl font-bold">₹{totalDeductions.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-sm text-gray-600">Net Payable</div>
          <div className="text-2xl font-bold">₹{totalNet.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      <div className="border rounded">
        <div className="bg-gray-50 px-4 py-2 border-b font-medium">Payroll Lines</div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-4 py-2 text-left">Employee</th>
              <th className="border px-4 py-2 text-right">Gross</th>
              <th className="border px-4 py-2 text-right">Deductions</th>
              <th className="border px-4 py-2 text-right">Net Salary</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line: any) => (
              <tr key={line.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <div className="font-medium">{line.employeeName}</div>
                  <div className="text-xs text-gray-600">{line.employeeCode}</div>
                </td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(line.grossSalary || "0").toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right">₹{parseFloat(line.totalDeductions || "0").toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2 text-right font-medium">₹{parseFloat(line.netSalary || "0").toLocaleString("en-IN")}</td>
                <td className="border px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    line.paid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {line.paid ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
