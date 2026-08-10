"use client";

import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

interface CashEntry {
  id: string; ledgerType: "cash"; transactionType: string | null; taxType: string | null;
  amount: number; balance: number; transactionDate: string | null; challanNumber: string | null; referenceNumber: string | null;
}

export default function CashLedgerPage() {
  const { data, isLoading } = api.gstLedger.ledgerTransactions.useQuery({ type: "cash" }, { staleTime: 15_000 });
  const entries = (data ?? []) as CashEntry[];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Cash Ledger</h1>
      {entries.length === 0 ? <EmptyState icon="account_balance" title="No entries" description="Cash ledger entries appear here once GST payments are made." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Date</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Type</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Type</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Amount</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Balance</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Reference</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.transactionDate ? new Date(e.transactionDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="py-3 px-6 font-ui text-ui-sm text-dark capitalize">{e.transactionType?.replace(/_/g, " ")}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid uppercase">{e.taxType || "—"}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.amount || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.balance || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.challanNumber || e.referenceNumber || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
