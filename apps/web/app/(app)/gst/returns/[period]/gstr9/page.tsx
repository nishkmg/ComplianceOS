"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { EmptyState } from "@/components/ui/empty-state";

export default function Gstr9Page() {
  const params = useParams();
  const period = params.period as string;
  const [fy, month] = period?.split("-") || ["", ""];
  const periodMonth = Number(month);
  const periodYear = Number(fy);

  const returns = api.gstReturns.list.useQuery(
    { periodMonth, periodYear, returnType: "gstr9" },
    { enabled: !!fy && !!month, staleTime: 15_000 },
  );
  const ret = returns.data?.[0] ?? null;

  const utils = api.useUtils();
  const generate = api.gstReturns.generateGSTR9.useMutation({
    onSuccess: () => {
      showToast.success("GSTR-9 generated from filed GSTR-3B returns.");
      void utils.gstReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const schedules = api.gstReturns.gstr9Schedules.useQuery(
    { returnId: ret?.id ?? "" },
    { enabled: !!ret?.id, staleTime: 15_000 },
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-ui text-lg font-bold text-dark">GSTR-9 · Annual Return</h2>
        <div className="flex gap-2">
          {!ret && (
            <button
              onClick={() => generate.mutate({ periodMonth, periodYear })}
              disabled={generate.isPending}
              className="btn btn-primary"
            >
              Generate from GSTR-3B
            </button>
          )}
          {ret && (
            <Link href={`/api/gst/returns/${ret.id}/pdf?type=gstr9`} target="_blank" className="btn btn-secondary flex items-center gap-2 no-underline">
              <Icon name="download" className="text-ui-xl" /> PDF
            </Link>
          )}
        </div>
      </div>

      {!ret ? (
        <EmptyState
          title="No GSTR-9 for this period"
          description="Generate the annual return from the GST returns page, then its schedules and PDF appear here."
        />
      ) : (
        <>
          <div className="bg-surface border border-border rounded-md p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Status</span><p className="font-ui text-ui-sm text-dark mt-1">{ret.status}</p></div>
            <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Period</span><p className="font-mono text-ui-sm text-dark mt-1">{ret.taxPeriodMonth}/{ret.taxPeriodYear}</p></div>
            <div><span className="font-ui text-ui-2xs text-light uppercase tracking-widest font-bold">Return id</span><p className="font-mono text-ui-2xs text-mid mt-1 break-all">{ret.id}</p></div>
          </div>

          <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
            <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
              <h3 className="font-ui text-lg font-bold text-dark">Schedules</h3>
              <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">
                {schedules.isLoading ? "Loading…" : `${schedules.data?.length ?? 0} schedule rows`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-muted border-b border-border-subtle text-light font-ui text-ui-2xs uppercase tracking-widest">
                    <th className="py-4 px-6">Schedule</th>
                    <th className="py-4 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
                  {(schedules.data ?? []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-5 px-6 font-medium text-dark">{s.scheduleKey ?? s.schedule ?? "Schedule"}</td>
                      <td className="py-5 px-6 text-right font-mono text-mid">{s.amount ?? s.turnover ?? "—"}</td>
                    </tr>
                  ))}
                  {!schedules.isLoading && (schedules.data ?? []).length === 0 && (
                    <tr><td colSpan={2} className="py-10 text-center text-mid font-ui text-ui-sm">Schedules not generated yet — run the return first.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
