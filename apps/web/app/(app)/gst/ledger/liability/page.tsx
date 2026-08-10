"use client";

import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";

interface LiabilityEntry {
  id: string; ledgerType: "liability"; taxType: string | null; liabilityType: string | null;
  openingBalance: number; taxPayable: number; taxPaid: number; closingBalance: number;
  taxPeriodMonth: string | null; taxPeriodYear: string | null;
}

export default function LiabilityLedgerPage() {
  const { data, isLoading } = api.gstLedger.ledgerTransactions.useQuery({ type: "liability" }, { staleTime: 15_000 });
  const entries = (data ?? []) as LiabilityEntry[];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">Liability Ledger</h1>
      {entries.length === 0 ? <EmptyState icon="receipt" title="No entries" description="Output GST liability and set-off entries appear here." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Period</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Type</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Liability</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Payable</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Paid</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Closing</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.taxPeriodMonth}/{e.taxPeriodYear}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid uppercase">{e.taxType || "—"}</td>
                  <td className="py-3 px-6 font-ui text-ui-sm text-dark capitalize">{e.liabilityType?.replace(/_/g, " ") || "—"}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.taxPayable || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.taxPaid || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.closingBalance || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
