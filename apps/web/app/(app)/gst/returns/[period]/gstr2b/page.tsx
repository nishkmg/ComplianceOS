"use client";

import { Icon } from '@/components/ui/icon';
import { useParams } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default function Gstr2bPage() {
  const params = useParams();
  const [fy, month] = (params.period as string)?.split("-") || ["", ""];
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <Link href={`/gst/returns/${params.period}`} className="text-mid hover:text-dark"><Icon name="arrow_back" size={20} /></Link>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">GSTR-2B</h1><p className="font-ui text-[13px] text-text-mid mt-1">Inward Supply Details — {month}/{fy}</p></div>
      </div>
      <EmptyState icon="download" title="No 2B data yet" description="GSTR-2B data is auto-drafted from supplier filings. Data will appear once the period ends." />
    </div>
  );
}
