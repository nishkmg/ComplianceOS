"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { formatIndianNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS = [
  { id: "1", name: "Cash Account", code: "10101", type: "asset" },
  { id: "2", name: "Bank Account", code: "10200", type: "asset" },
  { id: "3", name: "Trade Receivables", code: "10300", type: "asset" },
  { id: "4", name: "Sales Revenue", code: "40100", type: "income" },
  { id: "5", name: "Operating Expenses", code: "50200", type: "expense" },
  { id: "6", name: "Trade Payables", code: "20101", type: "liability" },
  { id: "7", name: "Capital Account", code: "30100", type: "equity" },
  { id: "8", name: "GST Output", code: "20200", type: "liability" },
  { id: "9", name: "GST Input", code: "10400", type: "asset" },
  { id: "10", name: "Equipment", code: "10500", type: "asset" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Line {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  description: string;
}

function newLine(): Line {
  return { id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), accountId: "", debit: "", credit: "", description: "" };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<Line[]>([newLine(), newLine()]);
  const [saving, setSaving] = useState(false);

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  const addLine = useCallback(() => setLines(prev => [...prev, newLine()]), []);
  const removeLine = useCallback((index: number) => {
    if (lines.length > 2) setLines(prev => prev.filter((_, i) => i !== index));
  }, [lines.length]);
  const updateLine = useCallback((index: number, field: keyof Line, value: string) => {
    setLines(prev => { const next = [...prev]; next[index] = { ...next[index], [field]: value }; return next; });
  }, []);

  const handleSubmit = useCallback(async (status: 'draft' | 'posted' = 'posted') => {
    if (!isBalanced && status === 'posted') {
      showToast.error('Voucher must be balanced (Debits = Credits) to post.');
      return;
    }
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast.success(status === 'draft' ? 'Voucher draft saved' : 'Journal entry posted to ledger');
      router.push("/journal");
    } catch {
      showToast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }, [isBalanced, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        handleSubmit('draft');
      }
      if (e.metaKey && e.key === "Enter") {
        e.preventDefault();
        if (isBalanced) handleSubmit('posted');
      }
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        addLine();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isBalanced, addLine, handleSubmit]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-40">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-mid hover:text-dark transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Go back"
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div>
            <h1 className="font-display text-display-lg font-semibold text-dark">New Journal Entry</h1>
            <p className="text-[13px] text-secondary font-ui mt-1">
              Record a new transaction in the general ledger
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-ui text-[10px] text-amber uppercase tracking-widest font-bold">Entry #</p>
          <p className="font-mono text-[13px] text-dark tabular-nums">JE-2026-0042</p>
        </div>
      </div>

      {/* Form grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-light uppercase tracking-widest font-bold">Posting Date</label>
            <input
              type="date"
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-mono text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-light uppercase tracking-widest font-bold">Voucher Type</label>
            <div className="relative">
              <select className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors">
                <option>Journal Entry</option>
                <option>Receipt Voucher</option>
                <option>Payment Voucher</option>
                <option>Contra Voucher</option>
              </select>
              <Icon name="expand_more" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block font-ui text-[10px] text-light uppercase tracking-widest font-bold">Reference</label>
            <input
              type="text"
              className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              placeholder="Invoice #, Bill ref, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-8 space-y-1.5">
          <label className="block font-ui text-[10px] text-light uppercase tracking-widest font-bold">Narration / Description</label>
          <textarea
            className="w-full bg-surface border border-border rounded-md px-4 py-2.5 font-ui text-[13px] text-dark focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors resize-none"
            placeholder="Enter detailed accounting narration for this entry…"
            rows={5}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>
      </section>

      {/* Line items table */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold">Ledger Distribution</p>
            <h2 className="font-ui text-[13px] font-bold text-dark uppercase tracking-widest mt-0.5">Line Items</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addLine}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            <Icon name="add_circle" size={14} className="mr-1.5" /> Add Line
          </Button>
        </div>

        <div className="bg-surface border border-border shadow-sm overflow-hidden flex flex-col rounded-md">
          <div className="h-[2px] w-full bg-amber" />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest w-[28%]">Account / Ledger</th>
                  <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest">Description</th>
                  <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right w-[130px]">Debit (₹)</th>
                  <th className="py-3 px-5 font-ui text-[10px] text-light uppercase tracking-widest text-right w-[130px]">Credit (₹)</th>
                  <th className="py-3 px-5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {lines.map((line, index) => (
                  <tr key={line.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-0">
                      <select
                        className="w-full h-full border-none bg-transparent px-5 py-3.5 font-ui text-[13px] text-dark focus:ring-1 focus:ring-amber outline-none appearance-none"
                        value={line.accountId}
                        onChange={(e) => updateLine(index, "accountId", e.target.value)}
                      >
                        <option value="">Select account…</option>
                        {MOCK_ACCOUNTS.map(a => (
                          <option key={a.id} value={a.id}>{a.code} · {a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-0">
                      <input
                        className="w-full h-full border-none bg-transparent px-5 py-3.5 font-ui text-[13px] text-dark focus:ring-1 focus:ring-amber outline-none"
                        placeholder="Line description…"
                        value={line.description}
                        onChange={(e) => updateLine(index, "description", e.target.value)}
                      />
                    </td>
                    <td className="p-0">
                      <input
                        inputMode="decimal"
                        className="w-full h-full border-none bg-transparent px-5 py-3.5 font-mono text-[13px] text-right text-dark focus:ring-1 focus:ring-amber outline-none"
                        placeholder="0.00"
                        value={line.debit}
                        onChange={(e) => updateLine(index, "debit", e.target.value)}
                        aria-label="Debit amount"
                      />
                    </td>
                    <td className="p-0">
                      <input
                        inputMode="decimal"
                        className="w-full h-full border-none bg-transparent px-5 py-3.5 font-mono text-[13px] text-right text-dark focus:ring-1 focus:ring-amber outline-none"
                        placeholder="0.00"
                        value={line.credit}
                        onChange={(e) => updateLine(index, "credit", e.target.value)}
                        aria-label="Credit amount"
                      />
                    </td>
                    <td className="p-0 text-center">
                      <button
                        onClick={() => removeLine(index)}
                        className="text-lighter hover:text-danger transition-colors border-none bg-transparent cursor-pointer p-2"
                        aria-label="Remove line"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted border-t-2 border-border">
                  <td colSpan={2} className="py-3 px-5 font-ui text-[10px] uppercase tracking-widest font-bold text-mid">
                    Total Distribution
                  </td>
                  <td className={`py-3 px-5 text-right font-mono text-[13px] tabular-nums font-semibold ${isBalanced ? 'text-success' : 'text-dark'}`}>
                    {formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}
                  </td>
                  <td className={`py-3 px-5 text-right font-mono text-[13px] tabular-nums font-semibold ${isBalanced ? 'text-success' : 'text-dark'}`}>
                    {formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BalanceBar */}
        <div
          className={`px-5 py-3.5 border rounded-md flex items-center justify-between transition-colors duration-300 ${
            isBalanced
              ? "bg-success-bg border-green-200"
              : totalDebit > 0
                ? "bg-danger-bg border-red-200"
                : "bg-surface-muted border-border"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Icon
              name={isBalanced ? "check_circle" : totalDebit > 0 ? "warning" : "info"}
              size={18}
              className={isBalanced ? "text-success" : totalDebit > 0 ? "text-danger" : "text-mid"}
            />
            <span className={`font-ui text-[12px] font-bold uppercase tracking-widest ${isBalanced ? "text-success" : totalDebit > 0 ? "text-danger" : "text-mid"}`}>
              {isBalanced
                ? "Voucher is balanced"
                : totalDebit > 0
                  ? `Out of Balance: ${formatIndianNumber(diff, { currency: true, decimals: 2 })}`
                  : "Entry Required — add debit and credit amounts"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Debit</p>
              <p className="font-mono text-[13px] text-dark tabular-nums font-semibold">{formatIndianNumber(totalDebit, { currency: true, decimals: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="font-ui text-[10px] text-light uppercase tracking-widest font-bold">Credit</p>
              <p className="font-mono text-[13px] text-dark tabular-nums font-semibold">{formatIndianNumber(totalCredit, { currency: true, decimals: 2 })}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-surface border-t border-border px-6 py-4 flex justify-between items-center shadow-lg no-print">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-light tracking-widest mr-1">Shortcuts</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted border border-border rounded-md text-[9px] font-mono text-mid">⌘S</kbd>
          <span className="text-[10px] text-lighter">Save</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted border border-border rounded-md text-[9px] font-mono text-mid">⌘↵</kbd>
          <span className="text-[10px] text-lighter">Post</span>
          <kbd className="px-1.5 py-0.5 bg-surface-muted border border-border rounded-md text-[9px] font-mono text-mid">N</kbd>
          <span className="text-[10px] text-lighter">New Line</span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            Discard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit('posted')}
            disabled={!isBalanced || saving}
            className="text-[10px] font-bold uppercase tracking-widest"
          >
            {saving ? "Posting…" : "Post Entry →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
