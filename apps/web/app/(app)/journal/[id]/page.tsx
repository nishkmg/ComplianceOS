"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatIndianNumber } from "@/lib/format";
import { showToast } from "@/lib/toast";

// ─── Mock detail (until tRPC is wired with real data) ─────────────────────────

const mockEntry = {
  id: "1",
  entryNumber: "JE-2026-27-001",
  date: "2026-04-01",
  narration: "Opening balance entry for the financial year 2026-27",
  fiscalYear: "2026-27",
  type: "Journal Entry",
  status: "draft" as "posted" | "draft" | "voided",
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

  const [narration, setNarration] = useState(entry.narration);
  const [isEditingNarration, setIsEditingNarration] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Icon name="search_off" size={48} className="text-lighter mb-4" />
        <p className="font-ui text-[13px] text-mid">Entry not found.</p>
        <Link href="/journal" className="mt-4 text-amber text-[12px] font-bold uppercase tracking-wider hover:underline no-underline">
          Back to Journal
        </Link>
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const statusConfig = {
    posted: { bannerBg: "bg-success-bg", bannerText: "text-success", icon: "check_circle" as const, bannerMsg: "This voucher has been posted to the General Ledger", badgeVariant: "success" as const, badgeLabel: "Cleared" },
    draft: { bannerBg: "bg-amber-50", bannerText: "text-amber", icon: "clock" as const, bannerMsg: "This voucher is in draft state", badgeVariant: "amber" as const, badgeLabel: "Draft" },
    voided: { bannerBg: "bg-surface-muted", bannerText: "text-mid", icon: "cancel" as const, bannerMsg: "This voucher has been voided", badgeVariant: "gray" as const, badgeLabel: "Voided" },
  };
  const cfg = statusConfig[entry.status];

  function handleVoidConfirm() {
    if (!voidReason.trim()) {
      showToast.error("Please provide a reason for voiding.");
      return;
    }
    setIsVoidModalOpen(false);
    setVoidReason("");
    showToast.success("Voucher voided successfully.");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Status banner */}
      <div className={`-mx-6 -mt-6 px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 ${cfg.bannerBg} ${cfg.bannerText}`}>
        <Icon name={cfg.icon} size={16} />
        {cfg.bannerMsg}
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] text-light uppercase tracking-widest" aria-label="Breadcrumb">
        <Link href="/journal" className="hover:text-dark transition-colors no-underline font-ui">Journal</Link>
        <Icon name="chevron_right" size={14} className="text-lighter" />
        <span className="text-mid font-medium font-ui">{entry.entryNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-mono text-display-lg font-semibold text-amber tracking-tight">{entry.entryNumber}</h1>
            <Badge variant={cfg.badgeVariant}>
              {cfg.badgeLabel}
            </Badge>
          </div>
          <p className="text-[13px] text-secondary font-ui">
            {new Date(entry.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
            <span className="mx-2 text-lighter">·</span>
            FY {entry.fiscalYear}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="text-[10px] font-bold uppercase tracking-widest">
            <Icon name="print" size={14} className="mr-1.5" /> Print
          </Button>
          {entry.status === "draft" && (
            <Button size="sm" className="text-[10px] font-bold uppercase tracking-widest">
              <Icon name="check" size={14} className="mr-1.5" /> Post to Ledger
            </Button>
          )}
        </div>
      </div>

      {/* Metadata card */}
      <div className="bg-surface border border-border p-7 shadow-sm rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-ui text-[10px] text-light uppercase tracking-widest mb-2 font-bold">Voucher Type</p>
            <p className="font-ui text-[13px] text-dark font-medium">{entry.type}</p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Narration</p>
              <button
                onClick={() => setIsEditingNarration(!isEditingNarration)}
                className="text-amber hover:text-amber-hover text-[10px] font-bold uppercase tracking-widest transition-colors border-none bg-transparent cursor-pointer"
              >
                {isEditingNarration ? "Cancel" : "Edit"}
              </button>
            </div>
            {isEditingNarration ? (
              <div className="space-y-2">
                <textarea
                  className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors resize-none"
                  rows={3}
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setIsEditingNarration(false); showToast.success("Narration updated."); }}>Save</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setNarration(entry.narration); setIsEditingNarration(false); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="font-ui text-[13px] text-dark leading-relaxed">{narration}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lines table */}
      <div className="bg-surface border border-border shadow-sm overflow-hidden rounded-md">
        <div className="h-[2px] w-full bg-amber" />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border">
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest">Account / Ledger</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-48">Debit (₹)</th>
                <th className="py-3 px-6 font-ui text-[10px] text-light uppercase tracking-widest text-right w-48">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {entry.lines.map((line, i) => (
                <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-5 px-6">
                    <div className="font-ui text-[13px] font-semibold text-dark">{line.accountName}</div>
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
              <tr className="bg-surface-muted border-t-2 border-border">
                <td className="py-4 px-6 font-ui text-[10px] uppercase tracking-widest font-bold text-mid">Total</td>
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

      {/* Balance bar */}
      <div className={`px-5 py-3.5 border rounded-md flex items-center justify-between transition-colors duration-300 ${isBalanced ? "bg-success-bg border-green-200" : "bg-danger-bg border-red-200"}`}>
        <div className="flex items-center gap-2.5">
          <Icon name={isBalanced ? "check_circle" : "warning"} size={18} className={isBalanced ? "text-success" : "text-danger"} />
          <span className={`font-ui text-[12px] font-bold uppercase tracking-widest ${isBalanced ? "text-success" : "text-danger"}`}>
            {isBalanced ? "Voucher is balanced" : `Out of Balance: ${formatIndianNumber(Math.abs(totalDebit - totalCredit), { currency: true, decimals: 2 })}`}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Total Debit</p>
            <p className="font-mono text-[13px] text-dark tabular-nums font-semibold">{formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}</p>
          </div>
          <div className="text-right">
            <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Total Credit</p>
            <p className="font-mono text-[13px] text-dark tabular-nums font-semibold">{formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Audit trail */}
      <div className="bg-surface border border-border p-7 shadow-sm rounded-md">
        <h3 className="font-ui text-[10px] text-light uppercase tracking-widest mb-6 font-bold">Audit Trail</h3>
        <div className="space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-2 h-2 rounded-full bg-lighter mt-1.5 shrink-0" />
            <div>
              <p className="font-ui text-[13px] text-dark">
                <span className="font-semibold">Entry created</span> by accountant@firm.in
              </p>
              <p className="font-mono text-[11px] text-mid mt-0.5">
                01 Apr 2026 · 09:00:00 · IP 192.168.1.10
              </p>
            </div>
          </div>
          {entry.status === "posted" && (
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
              <div>
                <p className="font-ui text-[13px] text-dark">
                  <span className="font-semibold text-success">Voucher posted</span> to General Ledger
                </p>
                <p className="font-mono text-[11px] text-mid mt-0.5">
                  01 Apr 2026 · 09:00:05 · System Verified
                </p>
              </div>
            </div>
          )}
          {entry.status === "voided" && (
            <div className="flex gap-4 items-start">
              <div className="w-2 h-2 rounded-full bg-danger mt-1.5 shrink-0" />
              <div>
                <p className="font-ui text-[13px] text-dark">
                  <span className="font-semibold text-danger">Voucher voided</span> by accountant@firm.in
                </p>
                <p className="font-mono text-[11px] text-mid mt-0.5">
                  01 Apr 2026 · 09:00:05 · Reason: Duplicate entry
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="text-[10px] font-bold uppercase tracking-widest">
          ← Back
        </Button>
        {entry.status === "draft" && (
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] font-bold uppercase tracking-widest border-danger text-danger hover:bg-danger-bg hover:text-danger"
            onClick={() => setIsVoidModalOpen(true)}
          >
            Void Entry
          </Button>
        )}
        <Link href={`/audit-log?entryId=${entryId}`} className="inline-flex items-center justify-center rounded-sm text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 disabled:pointer-events-none disabled:opacity-50 border border-border bg-surface text-dark shadow-sm hover:bg-surface-muted hover:text-amber hover:border-amber h-9 px-3 text-[10px] font-bold uppercase tracking-widest no-underline">
          View Audit Log
        </Link>
      </div>

      {/* Void Modal */}
      <Dialog open={isVoidModalOpen} onOpenChange={setIsVoidModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-amber-50 -mx-6 -mt-6 px-6 py-4 border-b border-amber-100 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-amber">
              <Icon name="warning" size={18} />
              Void Journal Entry
            </DialogTitle>
            <DialogDescription className="text-amber-700">
              This action cannot be undone. The entry will be permanently voided.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-surface-muted p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="font-ui text-[11px] text-light uppercase tracking-widest font-bold">Entry</span>
                <span className="font-mono text-[13px] text-dark">{entry.entryNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-ui text-[11px] text-light uppercase tracking-widest font-bold">Total Debit</span>
                <span className="font-mono text-[13px] text-dark">{formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-ui text-[11px] text-light uppercase tracking-widest font-bold">Total Credit</span>
                <span className="font-mono text-[13px] text-dark">{formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block font-ui text-[10px] text-light uppercase tracking-widest font-bold">Reason for Voiding</label>
              <textarea
                className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors resize-none"
                placeholder="Enter reason…"
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setIsVoidModalOpen(false); setVoidReason(""); }} className="text-[10px] font-bold uppercase tracking-widest">
              Cancel
            </Button>
            <Button size="sm" onClick={handleVoidConfirm} className="text-[10px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700">
              Confirm Void
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
