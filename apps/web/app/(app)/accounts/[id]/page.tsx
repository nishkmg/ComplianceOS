"use client";

import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

interface Account { id: string; name: string; code: string; kind: string; }
interface Transaction { id: string; date: string; entryNumber: string; description: string | null; debit: string; credit: string; }

export default function AccountDetailPage() {
  const params = useParams(); const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: account, isLoading } = api.accounts.get.useQuery({ id }, { enabled: !!id });
  const { data: txData } = api.accounts.transactions.useQuery({ id }, { enabled: !!id });
  const transactions = (txData ?? []) as Transaction[];

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" className="text-lighter animate-spin text-3xl" /></div>;
  if (!account) return <div className="text-center py-20 text-mid font-ui">Account not found.</div>;

  const acc = account as Account;
  return (
    <div className="max-w-[1000px] mx-auto space-y-8 pb-40">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-mid hover:text-dark border-none bg-transparent cursor-pointer"><Icon name="arrow_back" size={20} /></button>
        <div><h1 className="font-ui text-display-lg font-semibold text-dark">{acc.name}</h1><p className="font-mono text-[12px] text-mid mt-0.5">{acc.code} · {acc.kind}</p></div>
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
            ) : transactions.map((t, i) => (
              <tr key={t.id || i} className="hover:bg-surface-muted transition-colors">
                <td className="py-3 px-6 font-mono text-[12px] text-mid">{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                <td className="py-3 px-6 font-mono text-[12px] text-amber-text">{t.entryNumber || "—"}</td>
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
