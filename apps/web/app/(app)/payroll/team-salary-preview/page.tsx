"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

const now = new Date();
const DEFAULT_MONTH = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

export default function TeamSalaryPreviewPage() {
  const { activeFy } = useFiscalYear();
  const utils = api.useUtils();
  const [period, setPeriod] = useState(DEFAULT_MONTH);
  const [month, year] = period.split("-");

  const runs = api.payroll.list.useQuery({ month, year }, { staleTime: 15_000 });
  const rows = runs.data ?? [];

  const totals = useMemo(() => {
    let gross = 0, deductions = 0, net = 0;
    for (const r of rows) {
      gross += Number(r.grossEarnings ?? "0");
      net += Number(r.netPay ?? "0");
      deductions += Number(r.grossEarnings ?? "0") - Number(r.netPay ?? "0");
    }
    return { gross, deductions, net };
  }, [rows]);

  const finalizeRun = api.payroll.finalize.useMutation({
    onSuccess: () => {
      showToast.success("Run finalized.");
      void utils.payroll.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const calculated = rows.filter((r) => r.status === "calculated");
  const pendingFinalize = rows.filter((r) => r.status !== "finalized" && r.status !== "voided").length;

  const handleAuthorize = () => {
    if (calculated.length === 0) {
      showToast.error("No calculated runs to finalize for this period.");
      return;
    }
    calculated.forEach((r) => finalizeRun.mutate(r.id));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-end gap-4 border-b border-border pb-6 mb-8">
        <div>
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-2">Payroll Management · FY {activeFy}</p>
          <h1 className="font-ui text-2xl font-semibold text-dark">Salary Preview</h1>
          <p className="text-ui-sm text-secondary font-ui mt-1">Review payroll runs for the selected period before final authorization.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <Button size="sm" className="gap-2" onClick={handleAuthorize} disabled={calculated.length === 0 || finalizeRun.isPending}>
            Finalize {calculated.length > 0 ? `(${calculated.length})` : ""} <Icon name="arrow_forward" className="text-sm" />
          </Button>
        </div>
      </div>

      {runs.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="receipt_long" title={`No payroll runs for ${month}/${year}`} description="Process payroll first — runs appear here for review and finalization." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 border border-border bg-surface rounded-md overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-r border-border"><div className="font-ui text-ui-2xs text-light mb-1 font-bold uppercase">Runs</div><div className="font-mono text-xl font-bold text-dark">{rows.length}</div></div>
            <div className="p-6 border-r border-border bg-amber-soft"><div className="font-ui text-ui-2xs text-light mb-1 font-bold uppercase">Total Gross</div><div className="font-mono text-xl font-bold text-dark">₹ {formatIndianNumber(totals.gross)}</div></div>
            <div className="p-6 border-r border-border"><div className="font-ui text-ui-2xs text-light mb-1 font-bold uppercase">Total Deductions</div><div className="font-mono text-xl font-bold text-mid">₹ {formatIndianNumber(totals.deductions)}</div></div>
            <div className="p-6 bg-surface-muted border-t-2 border-t-amber"><div className="font-ui text-ui-2xs text-light mb-1 font-bold uppercase">Net Payable</div><div className="font-mono text-xl font-bold text-primary">₹ {formatIndianNumber(totals.net)}</div></div>
          </div>

          <div className="bg-surface border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-xs uppercase tracking-widest text-light font-bold">
                    <th className="px-6 py-4">Run</th>
                    <th className="px-4 py-4">Employee</th>
                    <th className="px-4 py-4 text-right">Gross</th>
                    <th className="px-4 py-4 text-right">Net</th>
                    <th className="px-4 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-ui-xs text-amber">{r.payrollNumber}</td>
                      <td className="px-4 py-4 font-ui text-ui-sm font-bold text-dark">{r.employeeName}</td>
                      <td className="px-4 py-4 text-right text-dark tabular-nums">₹ {formatIndianNumber(r.grossEarnings)}</td>
                      <td className="px-4 py-4 text-right font-bold text-dark tabular-nums">₹ {formatIndianNumber(r.netPay)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${r.status === "finalized" ? "bg-success-bg text-success-deep border-success/20" : r.status === "calculated" ? "bg-amber-soft text-amber border-amber-bright/30" : "bg-surface-muted text-mid border-border"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pendingFinalize > 0 && (
            <p className="font-ui text-ui-xs text-mid">{pendingFinalize} run(s) awaiting finalization for this period.</p>
          )}
        </>
      )}
    </div>
  );
}
