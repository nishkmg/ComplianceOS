// @ts-nocheck
"use client";

import Link from "next/link";
import { PaymentAllocation } from "@/components/payments/payment-allocation";
import { useRouter } from "next/navigation";

export default function NewPaymentPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/payments");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/payments" className="font-ui text-[12px] text-amber hover:underline">
            ← Back to Payments
          </Link>
          <h1 className="font-display text-[26px] font-normal text-dark mt-1">Record Payment</h1>
        </div>
        <Link href="/payments" className="filter-tab">
          Payment History
        </Link>
      </div>

      <PaymentAllocation onSuccess={handleSuccess} />
    </div>
  );
}
