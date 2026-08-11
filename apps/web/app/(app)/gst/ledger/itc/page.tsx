"use client";

import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

interface ItcEntry {
  id: string; ledgerType: "itc"; taxType: string | null;
  itcAvailable: number; itcReversed: number; itcUtilized: number; closingBalance: number;
  taxPeriodMonth: string | null; taxPeriodYear: string | null; supplierName: string | null; narration: string | null; createdAt: string | null;
}

export default function ItcLedgerPage() {
  const { data, isLoading } = api.gstLedger.ledgerTransactions.useQuery({ type: "itc" }, { staleTime: 15_000 });
  const entries = (data ?? []) as ItcEntry[];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader title="ITC Ledger" />
      {entries.length === 0 ? <EmptyState icon="assignment" title="No entries" description="Input tax credit entries appear here as returns are processed." /> : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-surface-muted border-b border-border">
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Period</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Tax Type</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Supplier</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Available</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Utilized</th>
              <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Closing</th>
            </tr></thead>
            <tbody className="divide-y divide-border-subtle">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid">{e.taxPeriodMonth}/{e.taxPeriodYear}</td>
                  <td className="py-3 px-6 font-mono text-ui-xs text-mid uppercase">{e.taxType || "—"}</td>
                  <td className="py-3 px-6 font-ui text-ui-sm text-dark">{e.supplierName || "—"}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.itcAvailable || 0).toLocaleString("en-IN")}</td>
                  <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">₹{Number(e.itcUtilized || 0).toLocaleString("en-IN")}</td>
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
