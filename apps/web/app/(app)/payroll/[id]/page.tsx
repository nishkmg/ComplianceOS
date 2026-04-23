// @ts-nocheck
"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const { data: runData, isLoading, refetch } = api.payroll.get.useQuery(runId);
  const finalize = api.payroll.finalize.useMutation({ onSuccess: () => { refetch(); alert("Payroll finalized successfully"); } });
  const voidPayroll = api.payroll.void.useMutation({ onSuccess: () => { refetch(); alert("Payroll voided successfully"); } });

  if (isLoading) return <div className="py-12 text-center font-ui text-light">Loading...</div>;
  if (!runData?.run) return <div className="py-12 text-center font-ui text-light">Payroll run not found</div>;

  const run = runData.run;
  const lines = runData.lines ?? [];
  const totalGross = lines.reduce((sum: number, line: any) => sum + parseFloat(line.grossSalary || "0"), 0);
  const totalNet = lines.reduce((sum: number, line: any) => sum + parseFloat(line.netSalary || "0"), 0);
  const totalDeductions = totalGross - totalNet;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Payroll Run - {run.month}/{run.year}</h1>
          <p className="font-ui text-[12px] text-light mt-1">Created: {new Date(run.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {run.status === "draft" && (
            <>
              <button onClick={handleFinalize} disabled={finalize.isPending} className="filter-tab bg-success text-white hover:bg-success/90 disabled:opacity-50">{finalize.isPending ? "Finalizing..." : "Finalize"}</button>
              <button onClick={handleVoid} disabled={voidPayroll.isPending} className="filter-tab bg-danger text-white hover:bg-danger/90 disabled:opacity-50">{voidPayroll.isPending ? "Voiding..." : "Void"}</button>
            </>
          )}
          {run.status === "finalized" && <Badge variant="success">Finalized</Badge>}
          {run.status === "voided" && <Badge variant="gray">Voided</Badge>}
          <button onClick={() => router.back()} className="filter-tab">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="font-ui text-[10px] uppercase tracking-wide text-light">Employees</div>
          <div className="font-mono text-[22px] font-medium text-dark">{lines.length}</div>
        </div>
        <div className="card p-4">
          <div className="font-ui text-[10px] uppercase tracking-wide text-light">Gross Salary</div>
          <div className="font-mono text-[20px] font-medium text-dark">{formatIndianNumber(totalGross)}</div>
        </div>
        <div className="card p-4">
          <div className="font-ui text-[10px] uppercase tracking-wide text-light">Total Deductions</div>
          <div className="font-mono text-[20px] font-medium text-danger">{formatIndianNumber(totalDeductions)}</div>
        </div>
        <div className="card p-4">
          <div className="font-ui text-[10px] uppercase tracking-wide text-light">Net Payable</div>
          <div className="font-mono text-[22px] font-medium text-success">{formatIndianNumber(totalNet)}</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-hairline font-display text-[14px] font-normal text-dark">Payroll Lines</div>
        <table className="table table-dense">
          <thead>
            <tr>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Employee</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Gross</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Deductions</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-right">Net Salary</th>
              <th className="font-ui text-[10px] uppercase tracking-wide text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line: any) => (
              <tr key={line.id} className="border-b border-hairline">
                <td className="px-4 py-3">
                  <div className="font-ui text-[13px] text-dark font-medium">{line.employeeName}</div>
                  <div className="font-ui text-[11px] text-light">{line.employeeCode}</div>
                </td>
                <td className="font-mono text-[13px] text-right text-dark px-4 py-3">{formatIndianNumber(parseFloat(line.grossSalary || "0"))}</td>
                <td className="font-mono text-[13px] text-right text-danger px-4 py-3">{formatIndianNumber(parseFloat(line.totalDeductions || "0"))}</td>
                <td className="font-mono text-[13px] text-right font-medium text-success px-4 py-3">{formatIndianNumber(parseFloat(line.netSalary || "0"))}</td>
                <td className="px-4 py-3"><Badge variant={line.paid ? "success" : "amber"}>{line.paid ? "Paid" : "Pending"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
