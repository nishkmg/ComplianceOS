"use client";

import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatIndianNumber } from "@/lib/format";

// ─── Mock detail (until tRPC is wired with real data) ─────────────────────────

const mockEntry = {
  id: "1",
  entryNumber: "JE-2026-27-001",
  date: "2026-04-01",
  narration: "Opening balance entry for the financial year 2026-27",
  fiscalYear: "2026-27",
  type: "Journal Entry",
  status: "posted" as "posted" | "draft" | "voided",
  lines: [
    { accountName: "Cash Account", accountCode: "10101", debit: 500000, credit: 0 },
    { accountName: "Capital Account", accountCode: "30100", debit: 0, credit: 500000 },
  ],
};

// ─── Page Component ───────────────────────────────────────────────────────────

export default function JournalEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = params.id as string;

  // TODO: replace with tRPC query once wired
  // const { data: entry, isLoading } = api.journalEntries.get.useQuery({ id: entryId });
  const entry = mockEntry;

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui-sm text-mid">Entry not found.</p>
        <Link href="/journal" className="mt-4 text-primary-container text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">
          Back to Journal
        </Link>
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Status banner */}
      <div
        className={`-mx-6 -mt-6 px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${
          entry.status === "posted"
            ? "bg-success-bg text-success"
            : entry.status === "draft"
              ? "bg-amber-50 text-amber-text"
              : "bg-section-muted text-mid"
        }`}
      >
        <Icon
          name={entry.status === "posted" ? "check_circle" : entry.status === "draft" ? "clock" : "cancel"}
          size={16}
        />
        {entry.status === "posted"
          ? "This voucher has been posted to the General Ledger"
          : entry.status === "draft"
            ? "This voucher is in draft state"
            : "This voucher has been voided"}
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] text-light uppercase tracking-widest" aria-label="Breadcrumb">
        <Link href="/journal" className="hover:text-dark transition-colors no-underline">Journal</Link>
        <Icon name="chevron_right" size={14} className="text-lighter" />
        <span className="text-mid font-medium">{entry.entryNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display-xl text-display-xl text-dark tracking-tight">{entry.entryNumber}</h1>
            <Badge variant={entry.status === 'posted' ? 'success' : entry.status === 'draft' ? 'amber' : 'gray'}>
              {entry.status === 'posted' ? 'Cleared' : entry.status}
            </Badge>
          </div>
          <p className="font-ui-sm text-sm text-mid">
            Date:{" "}
            {new Date(entry.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            · FY {entry.fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm flex items-center gap-1.5">
            <Icon name="print" size={14} /> Print
          </button>
          {entry.status === "draft" && (
            <button className="px-4 py-2 bg-primary-container text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-colors border-none rounded-sm shadow-sm cursor-pointer flex items-center gap-1.5">
              <Icon name="check" size={14} /> Post to Ledger
            </button>
          )}
        </div>
      </div>

      {/* Metadata card */}
      <div className="bg-white border border-border-subtle p-7 shadow-sm rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-2 font-bold">Voucher Type</p>
            <p className="font-ui-sm text-[13px] text-dark font-medium">{entry.type}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-2 font-bold">Narration</p>
            <p className="font-ui-sm text-[13px] text-dark leading-relaxed">{entry.narration}</p>
          </div>
        </div>
      </div>

      {/* Lines table */}
      <div className="bg-white border border-border-subtle shadow-sm overflow-hidden rounded-sm">
        <div className="h-[2px] w-full bg-primary-container" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-border-subtle">
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest">Account / Ledger</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-48">Debit (₹)</th>
                <th className="py-3 px-6 font-ui-xs text-[10px] text-light uppercase tracking-widest text-right w-48">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {entry.lines.map((line, i) => (
                <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="font-ui-sm text-[13px] font-semibold text-dark">{line.accountName}</div>
                    <div className="font-mono text-[11px] text-mid mt-0.5">{line.accountCode}</div>
                  </td>
                  <td className="py-5 px-6 text-right font-mono text-[13px] text-dark tabular-nums">
                    {line.debit > 0 ? formatIndianNumber(line.debit, { currency: true, decimals: 2 }) : "—"}
                  </td>
                  <td className="py-5 px-6 text-right font-mono text-[13px] text-dark tabular-nums">
                    {line.credit > 0 ? formatIndianNumber(line.credit, { currency: true, decimals: 2 }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 border-t-2 border-border-subtle">
                <td className="py-4 px-6 font-ui-xs text-[10px] uppercase tracking-widest font-bold text-mid">Total</td>
                <td className={`py-4 px-6 text-right font-mono text-[13px] tabular-nums font-semibold ${isBalanced ? 'text-success' : 'text-dark'}`}>
                  {formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}
                </td>
                <td className={`py-4 px-6 text-right font-mono text-[13px] tabular-nums font-semibold ${isBalanced ? 'text-success' : 'text-dark'}`}>
                  {formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Out-of-balance warning */}
      {!isBalanced && (
        <div className="bg-danger-bg border border-red-200 p-4 flex items-center gap-3 text-danger font-bold uppercase text-[10px] tracking-widest rounded-sm">
          <Icon name="warning" size={18} />
          Voucher is out of balance by ₹ {formatIndianNumber(Math.abs(totalDebit - totalCredit))}
        </div>
      )}

      {/* Audit trail */}
      <div className="bg-white border border-border-subtle p-7 shadow-sm rounded-sm">
        <h3 className="font-ui-xs text-[10px] text-light uppercase tracking-widest mb-6 font-bold">Audit Trail</h3>
        <div className="space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-2 h-2 rounded-full bg-lighter mt-1.5 shrink-0" />
            <div>
              <p className="font-ui-sm text-[13px] text-dark">
                <span className="font-semibold">Entry created</span> by accountant@firm.in
              </p>
              <p className="font-mono text-[11px] text-mid mt-0.5">
                01 Apr 2026 · 09:00:00 · IP 192.168.1.10
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
            <div>
              <p className="font-ui-sm text-[13px] text-dark">
                <span className="font-semibold text-success">Voucher posted</span> to General Ledger
              </p>
              <p className="font-mono text-[11px] text-mid mt-0.5">
                01 Apr 2026 · 09:00:05 · System Verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border-subtle">
        <button
          onClick={() => router.back()}
          className="px-5 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors cursor-pointer bg-transparent rounded-sm"
        >
          ← Back
        </button>
        {entry.status === "draft" && (
          <button className="px-5 py-2 border border-danger text-danger text-[10px] font-bold uppercase tracking-widest hover:bg-danger-bg transition-colors cursor-pointer bg-transparent rounded-sm">
            Void Entry
          </button>
        )}
        <Link
          href={`/audit-log?entryId=${entryId}`}
          className="px-5 py-2 border border-border-subtle text-mid text-[10px] font-bold uppercase tracking-widest hover:bg-section-muted transition-colors no-underline rounded-sm"
        >
          View Audit Log
        </Link>
      </div>
    </div>
  );
}
