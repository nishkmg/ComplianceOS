"use client";

import { useMemo } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

interface Line { id: string; accountId: string; debit: string; credit: string; description: string | null; }
interface Entry { id: string; entryNumber: string; date: string; narration: string; fiscalYear: string; status: "draft" | "posted" | "voided"; lines: Line[]; }

interface Account { id: string; code: string; name: string; }

const statusConfig: Record<string, { bannerBg: string; bannerText: string; icon: "check_circle" | "clock" | "cancel"; bannerMsg: string; badgeVariant: "success" | "amber" | "gray"; badgeLabel: string }> = {
  posted: { bannerBg: "bg-success-bg", bannerText: "text-success", icon: "check_circle", bannerMsg: "This voucher has been posted to the General Ledger", badgeVariant: "success", badgeLabel: "Cleared" },
  draft: { bannerBg: "bg-amber-50", bannerText: "text-amber", icon: "clock", bannerMsg: "This voucher is in draft state", badgeVariant: "amber", badgeLabel: "Draft" },
  voided: { bannerBg: "bg-surface-muted", bannerText: "text-mid", icon: "cancel", bannerMsg: "This voucher has been voided", badgeVariant: "gray", badgeLabel: "Voided" },
};

export default function JournalEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data: entryData, isLoading } = api.journalEntries.get.useQuery({ id }, { enabled: !!id });
  const { data: accountsData } = api.accounts.list.useQuery();
  const accountMap = useMemo(() => {
    const m: Record<string, Account> = {};
    for (const a of ((accountsData as Account[] | undefined) ?? [])) m[a.id] = a;
    return m;
  }, [accountsData]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Icon name="hourglass" size={32} className="text-lighter animate-spin" /></div>;
  if (!entryData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui text-[13px] text-mid">Entry not found.</p>
        <Link href="/journal" className="mt-4 text-amber text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">Back to Journal</Link>
      </div>
    );
  }

  const entry = entryData as Entry;
  const totalDebit = entry.lines.reduce((s, l) => s + parseFloat(l.debit || "0"), 0);
  const totalCredit = entry.lines.reduce((s, l) => s + parseFloat(l.credit || "0"), 0);
  const cfg = statusConfig[entry.status] || statusConfig.draft;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer" aria-label="Go back"><Icon name="arrow_back" size={20} /></button>
          <div>
            <h1 className="font-ui text-display-lg font-semibold text-dark">{entry.entryNumber}</h1>
            <p className="text-[13px] text-secondary font-ui mt-1">{entry.fiscalYear}</p>
          </div>
        </div>
        <Badge variant={cfg.badgeVariant}>{cfg.badgeLabel}</Badge>
      </div>

      <div className={`${cfg.bannerBg} border border-border rounded-md px-5 py-3 flex items-center gap-3`}>
        <Icon name={cfg.icon} size={18} className={cfg.bannerText} />
        <span className={`font-ui text-[12px] font-medium ${cfg.bannerText}`}>{cfg.bannerMsg}</span>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-surface border border-border rounded-md p-6 shadow-sm">
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Date</span><p className="font-mono text-[13px] text-dark mt-1">{new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p></div>
        <div><span className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Narration</span><p className="font-ui text-[13px] text-dark mt-1">{entry.narration}</p></div>
      </div>

      <div className="bg-surface border border-border rounded-md shadow-sm overflow-hidden">
        <div className="h-[2px] w-full bg-amber" />
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-muted border-b border-border">
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Account</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Description</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-40">Debit (₹)</th>
            <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-40">Credit (₹)</th>
          </tr></thead>
          <tbody className="divide-y divide-border-subtle">
            {entry.lines.map((l, i) => {
              const acct = accountMap[l.accountId];
              return (
                <tr key={l.id || i} className="hover:bg-surface-muted transition-colors">
                  <td className="py-4 px-6 font-ui text-[13px] font-medium text-dark">{acct ? `${acct.code} · ${acct.name}` : l.accountId}</td>
                  <td className="py-4 px-6 font-ui text-[13px] text-text-mid">{l.description || "—"}</td>
                  <td className="py-4 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(l.debit || "0") > 0 ? formatIndianNumber(parseFloat(l.debit), { currency: true, decimals: 2 }) : "—"}</td>
                  <td className="py-4 px-6 text-right font-mono text-[13px] tabular-nums">{parseFloat(l.credit || "0") > 0 ? formatIndianNumber(parseFloat(l.credit), { currency: true, decimals: 2 }) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr className="bg-surface-muted font-bold border-t-2 border-dark">
            <td colSpan={2} className="py-4 px-6 font-ui text-[13px] uppercase tracking-widest">Totals</td>
            <td className="py-4 px-6 text-right font-mono text-sm">{formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}</td>
            <td className="py-4 px-6 text-right font-mono text-sm">{formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}</td>
          </tr></tfoot>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/journal")}>Back to Journal</Button>
      </div>
    </div>
  );
}
