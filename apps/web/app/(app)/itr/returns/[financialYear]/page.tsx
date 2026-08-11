"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

const typeLabels: Record<string, string> = {
  itr3: "ITR-3",
  itr1: "ITR-1",
  itr4: "ITR-4",
};

export default function ItrReturnsPage() {
  const params = useParams();
  const financialYear = params.financialYear as string;

  const returns = api.itrReturns.list.useQuery({ financialYear }, { staleTime: 15_000 });
  const rows = returns.data ?? [];

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
        <h1 className="font-ui text-display-lg font-semibold text-dark">ITR Returns — {financialYear}</h1>
      </div>

      {returns.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon="description" title="No returns yet" description="ITR returns for this year will appear once they are created from computation." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Total Income</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(totals.income)}</p>
            </div>
            <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">Total Tax Payable</p>
              <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(totals.tax)}</p>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
