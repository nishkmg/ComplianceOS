"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const typeLabels: Record<string, string> = {
  itr3: "ITR-3",
  itr1: "ITR-1",
  itr4: "ITR-4",
};

const createOptions: Array<{ value: "itr3" | "itr4"; label: string }> = [
  { value: "itr3", label: "ITR-3 — Business & Profession" },
  { value: "itr4", label: "ITR-4 — Presumptive Income (44AD/44ADA/44AE)" },
];

export default function ItrReturnsPage() {
  const params = useParams();
  const financialYear = params.financialYear as string;
  const utils = api.useUtils();

  const [createOpen, setCreateOpen] = useState(false);
  const [returnType, setReturnType] = useState<"itr3" | "itr4">("itr3");

  const returns = api.itrReturns.list.useQuery({ financialYear }, { staleTime: 15_000 });
  const rows = returns.data ?? [];

  const computeFromBooks = api.itrComputation.computeIncomeFromBooks.useMutation({
    onSuccess: (data) => {
      void utils.itrReturns.list.invalidate();
      if (data.itrReturnId) {
        computeTax.mutate({ itrReturnId: data.itrReturnId, taxRegime: "new" });
      }
    },
    onError: (e) => showToast.error(e.message),
  });

  const computeTax = api.itrComputation.computeTax.useMutation({
    onSuccess: (data) => {
      void utils.itrReturns.list.invalidate();
      if (data.itrReturnId) {
        generateReturn.mutate({ itrReturnId: data.itrReturnId, returnType });
      }
    },
    onError: (e) => showToast.error(e.message),
  });

  const createReturn = api.itrReturns.create.useMutation({
    onSuccess: (data) => {
      showToast.success("Return created — computing now.");
      setCreateOpen(false);
      void utils.itrReturns.list.invalidate();
      if (data.itrReturnId) {
        computeFromBooks.mutate({ itrReturnId: data.itrReturnId });
      }
    },
    onError: (e) => showToast.error(e.message),
  });

  const generateReturn = api.itrReturns.generate.useMutation({
    onSuccess: () => {
      showToast.success("Return generated.");
      void utils.itrReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const totals = useMemo(() => {
    let income = 0, tax = 0;
    for (const r of rows) {
      income += Number(r.totalIncome ?? "0");
      tax += Number(r.taxPayable ?? "0");
    }
    return { income, tax };
  }, [rows]);

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href="/itr/returns" aria-label="Go back" className="text-mid hover:text-dark"><Icon name="arrow_back" size={20} /></Link>
        <PageHeader
          title={`ITR Returns — ${financialYear}`}
          actions={
            <Button onClick={() => setCreateOpen(true)}>
              Create Return <Icon name="add" />
            </Button>
          }
        />
      </div>

      {returns.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="description" title="No returns yet" description="ITR returns for this year will appear once they are created." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Total Income</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(totals.income)}</p>
            </div>
            <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Total Tax Payable</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(totals.tax)}</p>
            </div>
          </div>

          <div className="bg-surface border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Regime</th>
                    <th className="py-4 px-6 text-right">Total Income (₹)</th>
                    <th className="py-4 px-6 text-right">Tax Payable (₹)</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-ui-sm">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <Link href={`/itr/returns/${financialYear}/${r.id}`} className="font-ui text-ui-sm font-bold text-amber hover:underline no-underline">
                          {typeLabels[r.returnType] ?? r.returnType}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-mid uppercase">{r.taxRegime ?? "—"}</td>
                      <td className="py-4 px-6 text-right text-dark tabular-nums">{formatIndianNumber(r.totalIncome ?? "0")}</td>
                      <td className="py-4 px-6 text-right text-dark tabular-nums">{formatIndianNumber(r.taxPayable ?? "0")}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 text-ui-2xs font-bold uppercase tracking-wider border rounded-md ${r.status === "filed" ? "bg-success-bg text-success-deep border-success/20" : r.status === "computed" ? "bg-amber-soft text-amber border-amber-bright/30" : "bg-surface-muted text-mid border-border"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/api/itr/returns/${r.id}/pdf?format=summary`}
                            target="_blank"
                            className="inline-flex items-center gap-1 font-ui text-ui-xs font-bold uppercase tracking-widest text-amber hover:underline no-underline"
                          >
                            <Icon name="download" className="text-ui-md" /> Summary PDF
                          </Link>
                          {(r.returnType === "itr3" || r.returnType === "itr4") && r.status !== "filed" && r.status !== "voided" && (
                            <button
                              onClick={() => computeFromBooks.mutate({ itrReturnId: r.id })}
                              disabled={generateReturn.isPending}
                              className="font-ui text-ui-xs font-bold uppercase tracking-widest text-mid hover:text-dark border-none bg-transparent cursor-pointer disabled:opacity-50"
                            >
                              Regenerate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <h3 className="font-ui text-base font-semibold text-dark">Create ITR Return</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="itr-type" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Return type</label>
              <select
                id="itr-type"
                value={returnType}
                onChange={(e) => setReturnType(e.target.value as "itr3" | "itr4")}
                className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {createOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <p className="font-ui text-ui-xs text-mid">
              Financial Year {financialYear} · The return will be computed immediately after creation.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <button className="btn btn-secondary">Cancel</button>
            </DialogClose>
            <button
              onClick={() => createReturn.mutate({ financialYear, returnType })}
              disabled={createReturn.isPending}
              className="btn btn-primary"
            >
              {createReturn.isPending ? "Creating…" : "Create & Compute"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
