"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function ItrPaymentPage() {
  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">ITR Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/itr/payment/advance-tax" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="account_balance" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark">Advance Tax</h3>
          <p className="font-ui text-ui-sm text-mid mt-1">Quarterly advance tax payment tracking.</p>
        </Link>
        <Link href="/itr/payment/self-assessment" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="receipt" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark">Self Assessment Tax</h3>
          <p className="font-ui text-ui-sm text-mid mt-1">Self assessment tax payment for filed returns.</p>
        </Link>
        <Link href="/itr/payment/history" className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
          <Icon name="history" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark">Payment History</h3>
          <p className="font-ui text-ui-sm text-mid mt-1">All advance and self-assessment payments recorded.</p>
        </Link>
      </div>
    </div>
  );
}
