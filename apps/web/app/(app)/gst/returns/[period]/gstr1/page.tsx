"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";

export default function Gstr1Page() {
  const params = useParams();
  const period = params.period as string;
  const [fy, month] = period?.split("-") || ["", ""];
  const periodMonth = Number(month);
  const periodYear = Number(fy);
  const utils = api.useUtils();

  const returns = api.gstReturns.list.useQuery(
    { periodMonth, periodYear, returnType: "gstr1" },
    { enabled: !!fy && !!month, staleTime: 15_000 },
  );
  const ret = returns.data?.[0] ?? null;

  const generate = api.gstReturns.generateGSTR1.useMutation({
    onSuccess: () => {
      showToast.success("GSTR-1 generated.");
      void utils.gstReturns.list.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const summary = ret?.summary;
  const totals: Array<[string, number]> = [
    ["Liability", Number(summary?.liability ?? "0")],
    ["ITC Available", Number(summary?.itc ?? "0")],
    ["Payable", Number(summary?.payable ?? "0")],
  ];

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href={`/gst/returns/${period}`} className="text-mid hover:text-dark" aria-label="Go back"><Icon name="arrow_back" size={20} /></Link>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">GSTR-1</h1><p className="font-ui text-ui-sm text-text-mid mt-1">Outward Supply Details — {month}/{fy}</p></div>
      </div>

      {returns.isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Icon name="hourglass" className="text-lighter animate-spin text-3xl" />
        </div>
      ) : !ret ? (
        <EmptyState
          icon="receipt_long"
          title="No GSTR-1 generated for this period"
          description="Generate GSTR-1 from posted invoices for this period."
          action={{ label: "Generate GSTR-1", onClick: () => generate.mutate({ periodMonth, periodYear }) }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-surface border border-border rounded-md px-6 py-4 shadow-sm">
            <div>
              <p className="font-mono text-ui-xs text-amber">{ret.returnNumber}</p>
              <p className="font-ui text-ui-sm text-text-mid mt-1">Status: <span className="font-bold text-dark">{ret.status}</span> · Due {ret.dueDate}</p>
            </div>
            <div className="flex items-center gap-3">
              {(ret.status === "generated" || ret.status === "filed") && (
                <Link href={`/api/gst/returns/${ret.id}/pdf`} target="_blank" className="btn btn-secondary flex items-center gap-2">
                  <Icon name="download" className="text-ui-xl" /> PDF
                </Link>
              )}
              <button
                onClick={() => generate.mutate({ periodMonth, periodYear })}
                disabled={generate.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {generate.isPending ? "Generating…" : "Regenerate"} <Icon name="refresh" className="text-ui-xl" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {totals.map(([label, value]) => (
              <div key={label} className="bg-surface border border-border rounded-md p-6 shadow-sm">
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-text-mid font-bold mb-2">{label}</p>
                <p className="font-mono text-2xl font-bold text-dark tabular-nums">₹ {formatIndianNumber(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
