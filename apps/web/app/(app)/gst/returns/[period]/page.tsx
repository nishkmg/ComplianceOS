"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";

type FormType = "gstr1" | "gstr2b" | "gstr3b" | "gstr9";

interface LiveSummary {
  gstr1: { count: number; taxableValue: number; igst: number; cgst: number; sgst: number; cess: number };
  gstr2b: { count: number; taxableValue: number; igst: number; cgst: number; sgst: number };
  gstr3b: { outwardTaxable: number; outwardIgst: number; outwardCgst: number; outwardSgst: number; itcAvailable: number; netPayable: number };
}

interface FormDef {
  id: FormType;
  name: string;
  desc: string;
}

const forms: FormDef[] = [
  { id: "gstr1", name: "GSTR-1", desc: "Outward supply details — computed from posted invoices" },
  { id: "gstr2b", name: "GSTR-2B", desc: "Inward supplies — purchase bills + receipts in the period" },
  { id: "gstr3b", name: "GSTR-3B", desc: "Monthly summary — liability vs ITC, net payable" },
  { id: "gstr9", name: "GSTR-9", desc: "Annual return — generated from filed GSTR-3B returns" },
];

function liveTiles(form: FormType, s: LiveSummary): Array<{ label: string; value: number; isCount?: boolean }> {
  switch (form) {
    case "gstr1":
      return [
        { label: "Invoices", value: s.gstr1.count, isCount: true },
        { label: "Taxable value", value: s.gstr1.taxableValue },
        { label: "IGST", value: s.gstr1.igst },
        { label: "CGST", value: s.gstr1.cgst },
        { label: "SGST", value: s.gstr1.sgst },
        { label: "Cess", value: s.gstr1.cess },
      ];
    case "gstr2b":
      return [
        { label: "Documents", value: s.gstr2b.count, isCount: true },
        { label: "Taxable value", value: s.gstr2b.taxableValue },
        { label: "IGST", value: s.gstr2b.igst },
        { label: "CGST", value: s.gstr2b.cgst },
        { label: "SGST", value: s.gstr2b.sgst },
      ];
    case "gstr3b":
      return [
        { label: "Outward taxable", value: s.gstr3b.outwardTaxable },
        { label: "Outward IGST", value: s.gstr3b.outwardIgst },
        { label: "Outward CGST", value: s.gstr3b.outwardCgst },
        { label: "Outward SGST", value: s.gstr3b.outwardSgst },
        { label: "ITC available", value: s.gstr3b.itcAvailable },
        { label: "Net payable", value: s.gstr3b.netPayable },
      ];
    case "gstr9":
      return [];
  }
}

function FormCard({
  form,
  period,
  live,
  ret,
  generating,
  onGenerate,
}: {
  form: FormDef;
  period: string;
  live: LiveSummary | undefined;
  ret: { id: string; status: string; totalTaxPayable: string | null } | undefined;
  generating: boolean;
  onGenerate: () => void;
}) {
  const tiles = live ? liveTiles(form.id, live) : [];

  return (
    <div className="flex flex-col gap-4 bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <Link href={`/gst/returns/${period}/${form.id}`} className="no-underline hover:underline">
          <h3 className="font-ui text-lg font-bold text-dark">{form.name}</h3>
        </Link>
        {ret ? (
          <Badge variant={ret.status === "filed" ? "success" : ret.status === "draft" ? "amber" : "gray"}>{ret.status}</Badge>
        ) : (
          <Badge variant="neutral">not generated</Badge>
        )}
      </div>
      <p className="font-ui text-ui-sm text-mid">{form.desc}</p>

      {tiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {tiles.map(t => (
            <div key={t.label} className="bg-surface-muted border border-border-subtle rounded-md px-3 py-2">
              <p className="font-ui text-ui-2xs uppercase tracking-widest text-light font-bold">{t.label}</p>
              <p className="font-mono text-ui-sm font-bold text-dark tabular-nums mt-0.5">
                {t.isCount ? String(t.value) : formatIndianNumber(t.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto">
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate"} <Icon name="refresh" size={14} />
        </Button>
        {ret && (ret.status === "generated" || ret.status === "filed") && (
          <Link href={`/api/gst/returns/${ret.id}/pdf?type=${form.id}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Icon name="download" size={14} /> PDF
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PeriodPage() {
  const params = useParams();
  const period = params.period as string;
  const [fy, month] = period?.split("-") || ["", ""];
  const periodMonth = Number(month);
  const periodYear = Number(fy);
  const validPeriod = Number.isInteger(periodMonth) && periodMonth >= 1 && periodMonth <= 12 &&
    Number.isInteger(periodYear) && periodYear >= 2000;

  const utils = api.useUtils();
  const invalidate = () => {
    void utils.gstReturns.list.invalidate();
    void utils.gstReturns.liveSummary.invalidate();
  };

  const live = api.gstReturns.liveSummary.useQuery(
    { periodMonth, periodYear },
    { enabled: validPeriod, staleTime: 15_000 },
  );
  const returns = api.gstReturns.list.useQuery(
    { periodMonth, periodYear },
    { enabled: validPeriod, staleTime: 15_000 },
  );

  const gstr1Gen = api.gstReturns.generateGSTR1.useMutation({ onSuccess: () => { showToast.success("GSTR-1 generated."); invalidate(); }, onError: e => showToast.error(e.message) });
  const gstr2bGen = api.gstReturns.generateGSTR2B.useMutation({ onSuccess: () => { showToast.success("GSTR-2B generated."); invalidate(); }, onError: e => showToast.error(e.message) });
  const gstr3bGen = api.gstReturns.generateGSTR3B.useMutation({ onSuccess: () => { showToast.success("GSTR-3B generated."); invalidate(); }, onError: e => showToast.error(e.message) });
  const gstr9Gen = api.gstReturns.generateGSTR9.useMutation({ onSuccess: () => { showToast.success("GSTR-9 generated."); invalidate(); }, onError: e => showToast.error(e.message) });

  const generators: Record<FormType, () => void> = {
    gstr1: () => gstr1Gen.mutate({ periodMonth, periodYear }),
    gstr2b: () => gstr2bGen.mutate({ periodMonth, periodYear }),
    gstr3b: () => gstr3bGen.mutate({ periodMonth, periodYear }),
    gstr9: () => gstr9Gen.mutate({ periodMonth, periodYear }),
  };
  const pending: Record<FormType, boolean> = {
    gstr1: gstr1Gen.isPending,
    gstr2b: gstr2bGen.isPending,
    gstr3b: gstr3bGen.isPending,
    gstr9: gstr9Gen.isPending,
  };

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href="/gst/returns" className="text-mid hover:text-dark" aria-label="Go back"><Icon name="arrow_back" size={20} /></Link>
        <PageHeader
          title={`GST Returns — ${month}/${fy}`}
          description="Live amounts are computed from your posted transactions; Generate persists the return."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forms.map(f => (
          <FormCard
            key={f.id}
            form={f}
            period={period}
            live={live.data}
            ret={returns.data?.find(r => r.returnType === f.id)}
            generating={pending[f.id]}
            onGenerate={generators[f.id]}
          />
        ))}
      </div>
    </div>
  );
}
