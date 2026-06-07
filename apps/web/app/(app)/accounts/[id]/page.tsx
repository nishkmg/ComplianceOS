"use client";

import { useState, useEffect } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { useSession } from "next-auth/react";

export default function AccountDetailPage() {
  const params = useParams(); const router = useRouter();
  const { data: session } = useSession();
  const tenantId = (session?.user as Record<string, unknown> | undefined)?.tenantId as string | null;
  const [account, setAccount] = useState<any>(null); const [transactions, setTransactions] = useState<any[]>([]); const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id || !tenantId) return;
    (async () => {
      try {
        const res = await fetch(`/api/accounts/${params.id}?tenantId=${encodeURIComponent(tenantId)}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAccount(data.account); setTransactions(data.transactions || []);
      } catch { setAccount(null); } finally { setLoading(false); }
    })();
  }, [params.id, tenantId]);

  if (loading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!account) return <div className="text-center py-20 text-mid font-ui">Account not found.</div>;

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-display text-display-lg font-semibold text-dark">{account.name}</h1><p className="font-mono text-[12px] text-mid mt-0.5">{account.code} · {account.kind}</p></div>
      </div>
      <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
        <div className="h-[2px] w-full bg-amber" />
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Date</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Entry</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Description</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-40">Debit</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-40">Credit</th>
          </tr></thead>
          <tbody className="divide-y divide-border-subtle">
            {transactions.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-mid font-ui text-sm">No transactions yet</td></tr>
            ) : transactions.map((t: any, i: number) => (
              <tr key={t.id || i} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{t.date || "—"}</td>
                <td className="py-3 px-6 font-mono text-[12px] text-amber-text">{t.entry_number || (t.journal_entry_id ? t.journal_entry_id.substring(0,8) : "—")}</td>
                <td className="py-3 px-6 font-ui text-[13px] text-dark">{t.description || "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(t.debit || "0") > 0 ? formatIndianNumber(parseFloat(t.debit), { currency: true }) : "—"}</td>
                <td className="py-3 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(t.credit || "0") > 0 ? formatIndianNumber(parseFloat(t.credit), { currency: true }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
