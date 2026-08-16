"use client";

import { Fragment, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonVariants } from "@/components/ui/button";

interface GstLine {
  id: string;
  tableNumber: string;
  tableDescription: string;
  transactionType: string;
  sourceDocumentNumber: string | null;
  partyName: string | null;
  taxableValue: string | null;
  igstAmount: string | null;
  cgstAmount: string | null;
  sgstAmount: string | null;
  cessAmount: string | null;
  totalTaxAmount: string | null;
}

const num = (v: string | null | undefined) => Number(v ?? "0");

function statusPill(status: string): string {
  const base = "inline-block px-2 py-0.5 rounded-sm text-ui-2xs font-bold uppercase tracking-wider border";
  if (status === "filed") return `${base} bg-success-bg text-success-deep border-transparent`;
  if (status === "generated") return `${base} bg-amber-soft text-amber border-amber-bright/30`;
  return `${base} bg-surface-muted text-mid border-border`;
}

function ReturnLinesTable({ lines }: { lines: GstLine[] }) {
  const sections: Array<{ title: string; rows: GstLine[] }> = [];
  const seen = new Set<string>();
  for (const l of lines) {
    const key = l.tableDescription || l.tableNumber;
    if (!seen.has(key)) {
      seen.add(key);
      sections.push({ title: key, rows: [] });
    }
    sections.find(s => s.title === key)!.rows.push(l);
  }

  const sum = (f: (l: GstLine) => number) => lines.reduce((acc, l) => acc + f(l), 0);

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-muted border-b border-border text-light font-ui text-ui-2xs uppercase tracking-widest">
              <th className="py-3 px-6">Document</th>
              <th className="py-3 px-6 text-right">Taxable</th>
              <th className="py-3 px-6 text-right">IGST</th>
              <th className="py-3 px-6 text-right">CGST</th>
              <th className="py-3 px-6 text-right">SGST</th>
              <th className="py-3 px-6 text-right">Cess</th>
              <th className="py-3 px-6 text-right">Total tax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-ui text-ui-sm">
            {sections.map(s => (
              <Fragment key={s.title}>
                <tr className="bg-surface-muted/50">
                  <td colSpan={7} className="py-2 px-6 font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">
                    {s.title} · {s.rows.length} {s.rows.length === 1 ? "line" : "lines"}
                  </td>
                </tr>
                {s.rows.map(l => (
                  <tr key={l.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="py-3 px-6">
                      <p className="font-mono text-ui-xs text-dark">{l.sourceDocumentNumber || "—"}</p>
                      {l.partyName && <p className="font-ui text-ui-2xs text-mid mt-0.5">{l.partyName}</p>}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(num(l.taxableValue))}</td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(num(l.igstAmount))}</td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(num(l.cgstAmount))}</td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(num(l.sgstAmount))}</td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(num(l.cessAmount))}</td>
                    <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(num(l.totalTaxAmount))}</td>
                  </tr>
                ))}
                <tr className="bg-surface-muted/40">
                  <td className="py-2 px-6 font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold">Subtotal · {s.title}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.taxableValue), 0))}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.igstAmount), 0))}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.cgstAmount), 0))}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.sgstAmount), 0))}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.cessAmount), 0))}</td>
                  <td className="py-2 px-6 text-right font-mono text-ui-sm tabular-nums text-mid">{formatIndianNumber(s.rows.reduce((a, l) => a + num(l.totalTaxAmount), 0))}</td>
                </tr>
              </Fragment>
            ))}
            <tr className="bg-surface-muted border-t border-border">
              <td className="py-3 px-6 font-ui text-ui-2xs uppercase tracking-widest text-dark font-bold">Total</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.taxableValue)))}</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.igstAmount)))}</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.cgstAmount)))}</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.sgstAmount)))}</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.cessAmount)))}</td>
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(sum(l => num(l.totalTaxAmount)))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

  const details = api.gstReturns.get.useQuery(
    { returnId: ret?.id ?? "" },
    { enabled: !!ret?.id, staleTime: 15_000 },
  );

  const live = api.gstReturns.liveSummary.useQuery(
    { periodMonth, periodYear },
    { enabled: !!fy && !!month, staleTime: 15_000 },
  );

  const generate = api.gstReturns.generateGSTR1.useMutation({
    onSuccess: () => {
      showToast.success("GSTR-1 generated.");
      void utils.gstReturns.list.invalidate();
      void utils.gstReturns.liveSummary.invalidate();
    },
    onError: (e) => showToast.error(e.message),
  });

  const summary = ret?.summary;
  const totals: Array<[string, number]> = [
    ["Liability", Number(summary?.liability ?? "0")],
    ["ITC Available", Number(summary?.itc ?? "0")],
    ["Payable", Number(summary?.payable ?? "0")],
  ];
  const lines = details.data?.lines ?? [];

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href={`/gst/returns/${period}`} className="text-mid hover:text-dark" aria-label="Go back"><Icon name="arrow_back" size={20} /></Link>
        <div><PageHeader title="GSTR-1" /><p className="font-ui text-ui-sm text-mid mt-1">Outward Supply Details — {month}/{fy}</p></div>
      </div>

      {!returns.isLoading && (!ret || ret.status === "draft") && live.data && (
        <div className="bg-surface border border-dashed border-amber rounded-md p-6 shadow-sm">
          <p className="font-ui text-ui-2xs uppercase tracking-widest text-amber font-bold mb-1">Live draft</p>
          <p className="font-ui text-ui-sm text-mid mb-4">Computed from your posted transactions — not yet generated.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              ["Invoices", String(live.data.gstr1.count)],
              ["Taxable value", formatIndianNumber(live.data.gstr1.taxableValue)],
              ["IGST", formatIndianNumber(live.data.gstr1.igst)],
              ["CGST", formatIndianNumber(live.data.gstr1.cgst)],
              ["SGST", formatIndianNumber(live.data.gstr1.sgst)],
              ["Cess", formatIndianNumber(live.data.gstr1.cess)],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface-muted border border-border-subtle rounded-md px-3 py-2">
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">{label}</p>
                <p className="font-mono text-ui-sm font-bold text-dark tabular-nums mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3">
              <p className="font-mono text-ui-xs text-amber">{ret.returnNumber}</p>
              <span className={statusPill(ret.status)}>{ret.status}</span>
              <p className="font-ui text-ui-sm text-mid">Due {ret.dueDate ? new Date(ret.dueDate).toLocaleDateString("en-IN") : "—"}</p>
            </div>
            <div className="flex items-center gap-3">
              {(ret.status === "generated" || ret.status === "filed") && (
                <>
                  <Link href={`/api/gst/returns/${ret.id}/csv?type=gstr1`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <Icon name="download" size={14} /> CSV
                  </Link>
                  <Link href={`/api/gst/returns/${ret.id}/pdf?type=gstr1`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    <Icon name="download" size={14} /> PDF
                  </Link>
                </>
              )}
              <Button
                size="sm"
                onClick={() => generate.mutate({ periodMonth, periodYear })}
                disabled={generate.isPending}
              >
                {generate.isPending ? "Generating…" : "Regenerate"} <Icon name="refresh" size={14} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {totals.map(([label, value]) => (
              <div key={label} className="bg-surface border border-border rounded-md p-6 shadow-sm">
                <p className="font-ui text-ui-2xs uppercase tracking-widest text-mid font-bold mb-2">{label}</p>
                <p className="font-mono text-2xl font-bold text-dark tabular-nums">{formatIndianNumber(value)}</p>
              </div>
            ))}
          </div>

          {lines.length > 0 ? (
            <ReturnLinesTable lines={lines} />
          ) : (
            <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold mb-1">Line details</p>
              <p className="font-ui text-ui-sm text-mid">No line-level data for this return.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
