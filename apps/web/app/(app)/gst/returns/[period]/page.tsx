"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const forms = [
  { id: "gstr1", name: "GSTR-1", desc: "Outward supply details — auto-filed from invoices", status: "draft" as const },
  { id: "gstr2b", name: "GSTR-2B", desc: "Inward supply auto-drafted from counterparty filings", status: "ready" as const },
  { id: "gstr3b", name: "GSTR-3B", desc: "Monthly summary return — payment computation", status: "pending" as const },
];

export default function PeriodPage() {
  const params = useParams();
  const period = params.period as string;
  const [fy, month] = period?.split("-") || ["", ""];

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href="/gst/returns" className="text-mid hover:text-dark"><Icon name="arrow_back" size={20} /></Link>
        <h1 className="font-ui text-display-lg font-semibold text-dark">Period: {month}/{fy}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map(f => (
          <Link key={f.id} href={`/gst/returns/${period}/${f.id}`} className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline" aria-label="Go back">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-ui text-lg font-bold text-dark">{f.name}</h3>
              <Badge variant={f.status === "draft" ? "amber" : f.status === "ready" ? "success" : "gray"}>{f.status}</Badge>
            </div>
            <p className="font-ui text-ui-sm text-text-mid">{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
