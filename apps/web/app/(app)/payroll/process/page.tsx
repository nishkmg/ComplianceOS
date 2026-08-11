"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const now = new Date();
const DEFAULT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function ProcessPayrollPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const [period, setPeriod] = useState(DEFAULT_MONTH);
  const [month, year] = period.split("-");

  const pending = api.payroll.pending.useQuery(undefined, { staleTime: 15_000 });
  const runs = api.payroll.list.useQuery({ month, year }, { staleTime: 15_000 });

  const processRun = api.payroll.process.useMutation({
    onSuccess: (d) => {
      showToast.success(`Payroll run ${d.payrollNumber} processed.`);
      void utils.payroll.pending.invalidate();
      void utils.payroll.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });
  const finalizeRun = api.payroll.finalize.useMutation({
    onSuccess: () => {
      showToast.success("Payroll run finalized — journal entry created.");
      void utils.payroll.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const employees = pending.data ?? [];
  const monthRuns = runs.data ?? [];

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
        <div className="flex-1">
          <PageHeader title="Process Payroll" />
          <p className="font-ui text-ui-sm text-mid mt-1">Run payroll per employee for the selected period, then finalize to post the salary journal.</p>
        </div>
        <div className="flex items-center bg-surface-muted border border-border rounded-md h-9 px-3">
          <Icon name="calendar_month" className="text-light text-ui-xl mr-2" />
          <input
            aria-label="Payroll period"
            type="month"
            className="bg-transparent border-none text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
        </div>
      </div>

      {pending.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending employees */}
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-muted border-b border-border">
              <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Not Yet Processed ({employees.length})</h3>
            </div>
            {employees.length === 0 ? (
              <div className="p-6">
                <EmptyState icon="check_circle" title="All employees processed" description="No active employees are pending payroll for the current month." />
              </div>
            ) : (
              <div className="divide-y-[0.5px] divide-border-subtle">
                {employees.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-ui text-ui-sm font-bold text-dark">{e.firstName} {e.lastName ?? ""}</p>
                      <p className="font-mono text-ui-2xs text-mid">{e.employeeCode} · {e.designation ?? "—"}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => processRun.mutate({ employeeId: e.id, month, year })}
                      disabled={processRun.isPending}
                    >
                      Process
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Runs for the period */}
          <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-muted border-b border-border">
              <h3 className="font-ui text-ui-xs font-bold text-dark uppercase tracking-widest">Runs for {month}/{year}</h3>
            </div>
            {monthRuns.length === 0 ? (
              <div className="p-6">
                <EmptyState icon="receipt_long" title="No runs yet" description="Process employees on the left to create runs for this period." />
              </div>
            ) : (
              <div className="divide-y-[0.5px] divide-border-subtle">
                {monthRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-mono text-ui-xs text-amber">{run.payrollNumber}</p>
                      <p className="font-ui text-ui-sm text-dark mt-0.5">{run.employeeName} · Net {formatIndianNumber(run.netPay)}</p>
                      <p className="font-ui text-ui-2xs text-mid capitalize">{run.status}</p>
                    </div>
                    {run.status === "calculated" && (
                      <Button size="sm" variant="outline" onClick={() => finalizeRun.mutate(run.id)} disabled={finalizeRun.isPending}>
                        Finalize
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
