"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function GstReconciliationPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">GST Reconciliation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/gst/reconciliation/mismatches" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="compare_arrows" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark mb-2">2B Mismatches</h3>
          <p className="font-ui text-[13px] text-text-mid">Compare booked purchases with GSTR-2B auto-drafted data.</p>
        </Link>
      </div>
    </div>
  );
}
