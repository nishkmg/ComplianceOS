"use client";

import { Icon } from '@/components/ui/icon';
import { useParams } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function Gstr1Page() {
  const params = useParams();
  const period = params.period as string;
  const [fy, month] = period?.split("-") || ["", ""];

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href={`/gst/returns/${period}`} className="text-mid hover:text-dark"><Icon name="arrow_back" size={20} /></Link>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">GSTR-1</h1><p className="font-ui text-ui-sm text-text-mid mt-1">Outward Supply Details — {month}/{fy}</p></div>
      </div>
      <EmptyState icon="receipt_long" title="No invoices filed yet" description="GSTR-1 data will populate from your invoices once they are posted." />
    </div>
  );
}
