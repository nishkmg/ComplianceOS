"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function GstPaymentPage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-40">
      <h1 className="font-display text-display-lg font-semibold text-dark">GST Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/gst/payment/history" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="history" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark mb-2">Payment History</h3>
          <p className="font-ui text-[13px] text-text-mid">View all challan payments made to the GST portal.</p>
        </Link>
      </div>
    </div>
  );
}
