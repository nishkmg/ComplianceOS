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
          <Link href="/payments" className="text-sm text-gray-500 hover:underline">
            ← Back to Payments
          </Link>
          <h1 className="text-2xl font-bold mt-1">Record Payment</h1>
        </div>
        <Link 
          href="/payments" 
          className="px-4 py-2 bg-white border text-sm rounded hover:bg-gray-50"
        >
          Payment History
        </Link>
      </div>

      <PaymentAllocation onSuccess={handleSuccess} />
    </div>
  );
}
