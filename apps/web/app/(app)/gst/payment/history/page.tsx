"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

export default function PaymentHistoryPage() {
  const { data, isLoading } = api.gstPayment.paymentHistory.useQuery(undefined, { staleTime: 15_000 });
  const payments = data ?? [];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <div className="flex items-center justify-between">
        <h1 className="font-ui text-display-lg font-semibold text-dark">Payment History</h1>
        <Link href="/gst/payment" className="flex items-center gap-1.5 px-4 py-2 bg-amber text-white dark:text-amber-ink text-ui-2xs font-bold uppercase tracking-widest hover:bg-amber-hover rounded-md shadow-sm no-underline"><Icon name="add" size={14} /> New Payment</Link>
      </div>
      {payments.length === 0 ? <EmptyState icon="payments" title="No payments yet" description="GST challan payments will appear here." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse"><thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Challan</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Date</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Type</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Bank</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Amount</th>
          </tr></thead><tbody className="divide-y divide-border-subtle">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-ui-xs text-amber">{p.challanNumber || "—"}</td>
                <td className="py-3 px-6 font-mono text-ui-xs text-mid">{p.challanDate || p.transactionDate ? new Date(p.challanDate ?? p.transactionDate).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-3 px-6 font-ui text-ui-sm text-dark uppercase">{p.taxType || "—"}</td>
                <td className="py-3 px-6 font-ui text-ui-sm text-dark">{p.bankName || "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(p.amount || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
