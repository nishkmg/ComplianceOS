"use client";

import { Icon } from "@/components/ui/icon";
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function PayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();
  const runId = params.id as string;

  const runQuery = api.payroll.get.useQuery(runId, { staleTime: 15_000 });
  const payslips = api.payslips.list.useQuery({ payrollRunId: runId }, { enabled: !!runId, staleTime: 15_000 });

  const finalizeRun = api.payroll.finalize.useMutation({
    onSuccess: () => {
      showToast.success("Payroll run finalized — journal entry created.");
      void utils.payroll.get.invalidate();
      void utils.payroll.list.invalidate();
      void utils.payslips.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  if (runQuery.isLoading) {
    return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  }
  if (runQuery.error || !runQuery.data) {
    return <div className="max-w-[1000px] mx-auto py-20"><EmptyState icon="error" title="Payroll run not found" description={runQuery.error?.message ?? "This run does not exist for your tenant."} /></div>;
  }

  const { run, lines } = runQuery.data;
  const payslip = payslips.data?.[0] ?? null;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <div className="flex-1">
          <h1 className="font-ui text-display-lg font-semibold text-dark">Payroll Run</h1>
          <p className="font-mono text-ui-xs text-mid mt-0.5">{run.payrollNumber} · {run.month}/{run.year}</p>
        </div>
        {run.status === "calculated" && (
          <Button size="sm" onClick={() => finalizeRun.mutate(run.id)} disabled={finalizeRun.isPending}>
            {finalizeRun.isPending ? "Finalizing…" : "Finalize Run"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Status</p>
          <p className="font-ui text-lg font-bold text-dark capitalize">{run.status}</p>
        </div>
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Gross Earnings</p>
          <p className="font-mono text-lg font-bold text-dark tabular-nums">₹ {formatIndianNumber(run.grossEarnings)}</p>
        </div>
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Gross Deductions</p>
          <p className="font-mono text-lg font-bold text-danger tabular-nums">₹ {formatIndianNumber(run.grossDeductions)}</p>
        </div>
        <div className="bg-dark border focus:border-focus rounded-md p-6 shadow-lg">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold mb-2">Net Pay</p>
          <p className="font-mono text-lg font-bold text-amber tabular-nums">₹ {formatIndianNumber(run.netPay)}</p>
        </div>
      </div>

      <div className="bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-muted border-b border-border">
          <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Component Breakup</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                <th className="py-3 px-6">Component</th>
                <th className="py-3 px-6 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
              {lines.map((l) => (
                <tr key={l.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="py-3.5 px-6 font-ui text-ui-sm text-dark">{l.componentName ?? l.componentCode}</td>
                  <td className="py-3.5 px-6 text-right tabular-nums">{formatIndianNumber(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payslip?.pdfUrl && (
        <a href={payslip.pdfUrl} target="_blank" rel="noreferrer" className="btn btn-secondary inline-flex items-center gap-2">
          <Icon name="download" className="text-ui-xl" /> Download Payslip
        </a>
      )}
    </div>
  );
}
