"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { formatIndianNumber } from "@/lib/format";
import { useFiscalYear } from "@/hooks/use-fiscal-year";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export default function LedgerReportPage() {
  const { activeFy } = useFiscalYear();
  const [selectedAccount, setSelectedAccount] = useState("");

  const accounts = api.accounts.list.useQuery(undefined, { staleTime: 60_000 });
  const ledger = api.balances.ledger.useQuery(
    { accountId: selectedAccount, fiscalYear: activeFy },
    { enabled: !!selectedAccount, staleTime: 15_000 },
  );
  const transactions = ledger.data?.entries ?? [];
  const opening = ledger.data?.openingBalance ?? 0;
  const net = transactions.reduce((s, t) => s + (parseFloat(t.debit || "0") - parseFloat(t.credit || "0")), 0);
  const closing = opening + net;

  return (
    <div className="max-w-page mx-auto space-y-8 pb-40">
      <PageHeader
        title="Ledger Report"
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print
          </Button>
        }
      />
      <div className="space-y-1.5">
        <label className="font-ui text-ui-2xs text-light uppercase font-bold" htmlFor="ledger-account">Account</label>
        <select id="ledger-account" aria-label="Account" className="w-full max-w-md border border-border rounded-md px-4 py-3 font-ui text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus:border-amber" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
          <option value="">Select an account…</option>
          {(accounts.data ?? []).map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
        </select>
      </div>
      {!selectedAccount ? (
        <EmptyState icon="account_balance" title="Select an account" description="Choose an account to view its ledger." />
      ) : ledger.isLoading ? (
        <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>
      ) : transactions.length === 0 ? (
        <EmptyState icon="account_balance" title="No transactions" description="This account has no transactions yet." />
      ) : (
        <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse"><thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Date</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest">Description</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Debit</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Credit</th>
            <th className="py-3 px-6 font-ui text-ui-2xs text-light uppercase tracking-widest text-right">Balance</th>
          </tr></thead><tbody className="divide-y divide-border-subtle">
            <tr className="bg-surface-muted/50">
              <td className="py-3 px-6 font-ui text-ui-xs text-mid uppercase tracking-widest font-bold" colSpan={2}>Opening Balance</td>
              <td className="py-3 px-6" />
              <td className="py-3 px-6" />
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark">{formatIndianNumber(opening, { currency: true })}</td>
            </tr>
            {transactions.map((t) => (
              <tr key={t.entryNumber} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-ui-xs text-mid">{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-3 px-6 font-ui text-ui-sm text-dark">{t.narration || "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">{parseFloat(t.debit || "0") > 0 ? formatIndianNumber(parseFloat(t.debit), { currency: true }) : "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums">{parseFloat(t.credit || "0") > 0 ? formatIndianNumber(parseFloat(t.credit), { currency: true }) : "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark">{formatIndianNumber(t.balance, { currency: true })}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-border">
              <td className="py-3 px-6 font-ui text-ui-xs text-dark uppercase tracking-widest font-bold" colSpan={2}>Closing Balance</td>
              <td className="py-3 px-6" />
              <td className="py-3 px-6" />
              <td className="py-3 px-6 text-right font-mono text-ui-sm tabular-nums text-dark font-bold">{formatIndianNumber(closing, { currency: true })}</td>
            </tr>
          </tbody></table>
        </div>
      )}
    </div>
  );
}
