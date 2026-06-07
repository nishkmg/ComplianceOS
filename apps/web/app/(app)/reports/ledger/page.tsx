"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";

export default function LedgerReportPage() {
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [accounts, setAccounts] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try { const r = await fetch(`/api/accounts?tenantId=${encodeURIComponent(tenantId)}`); if (r.ok) setAccounts((await r.json()).accounts || []); } catch {} finally { setLoading(false); }
    })();
  }, [tenantId]);

  useEffect(() => {
    if (!selectedAccount) return;
    (async () => {
      try { const r = await fetch(`/api/accounts/${selectedAccount}?tenantId=${encodeURIComponent(tenantId || "")}`); if (r.ok) { const d = await r.json(); setTransactions(d.transactions || []); } } catch {}
    })();
  }, [selectedAccount, tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-display text-display-lg font-semibold text-dark">Ledger Report</h1>
      <div className="space-y-1.5">
        <label className="font-ui text-[10px] text-light uppercase font-bold">Account</label>
        <select className="w-full max-w-md border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus:border-amber" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
          <option value="">Select an account…</option>
          {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </div>
      {!selectedAccount ? (
        <EmptyState icon="account_balance" title="Select an account" description="Choose an account to view its ledger." />
      ) : transactions.length === 0 ? (
        <EmptyState icon="account_balance" title="No transactions" description="This account has no transactions yet." />
      ) : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse"><thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Date</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Description</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Debit</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right">Credit</th>
          </tr></thead><tbody className="divide-y divide-border-subtle">
            {transactions.map((t: any) => (
              <tr key={t.id} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-[12px] text-mid">—</td>
                <td className="py-3 px-6 font-ui text-[13px] text-dark">{t.description || "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(t.debit || "0") > 0 ? formatIndianNumber(parseFloat(t.debit), { currency: true }) : "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(t.credit || "0") > 0 ? formatIndianNumber(parseFloat(t.credit), { currency: true }) : "—"}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}
