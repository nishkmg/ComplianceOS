"use client";

import { useState, useCallback } from "react";
import { Icon } from '@/components/ui/icon';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import { formatIndianNumber } from "@/lib/format";

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

interface Line {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  description: string;
}

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { id: '1', accountId: "", debit: "", credit: "", description: "" },
    { id: '2', accountId: "", debit: "", credit: "", description: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const totalDebit = lines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  function addLine() {
    setLines([...lines, { id: Math.random().toString(), accountId: "", debit: "", credit: "", description: "" }]);
  }

  function removeLine(index: number) {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }

  function updateLine(index: number, field: keyof Line, value: string) {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  }

  async function handleSubmit(status: 'draft' | 'posted' = 'posted') {
    if (!isBalanced && status === 'posted') {
      showToast.error('Voucher must be balanced (Debits = Credits) to post.');
      return;
    }
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast.success(status === 'draft' ? 'Voucher draft saved' : 'Journal entry posted to ledger');
      router.push("/journal");
    } catch (e: unknown) {
      showToast.error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-0 text-left">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-[0.5px] border-border-subtle flex justify-between items-center w-full px-8 py-4 -mx-8 -mt-8 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-stone-400 hover:text-on-surface transition-colors border-none bg-transparent cursor-pointer">
            <Icon name="arrow_back" />
          </button>
          <h2 className="font-display-lg text-2xl text-on-surface font-bold">New Journal Entry</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="font-ui-xs text-[10px] text-amber-text uppercase tracking-widest font-bold">Entry #</span>
            <span className="font-mono text-on-surface font-bold">JE-2024-0042</span>
          </div>
          <div className="h-8 w-[0.5px] bg-border-subtle"></div>
          <div className="flex items-center gap-3">
            <Icon name="notifications" className="text-stone-400" />
            <Icon name="help_outline" className="text-stone-400" />
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto space-y-12 pb-32">
        {/* Metadata Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-2">
              <label className="block font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Posting Date</label>
              <input 
                type="date" 
                className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-sm focus:border-primary outline-none transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Voucher Type</label>
              <div className="relative">
                <select className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-sm text-sm appearance-none focus:border-primary outline-none">
                  <option>Journal Entry</option>
                  <option>Receipt Voucher</option>
                  <option>Payment Voucher</option>
                  <option>Contra Voucher</option>
                </select>
                <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="md:col-span-8 space-y-2">
            <label className="block font-ui-xs text-[10px] text-text-light uppercase tracking-widest font-bold">Narration / Description</label>
            <textarea 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-sm focus:border-primary outline-none resize-none min-h-[124px]"
              placeholder="Enter detailed accounting narration for this entry..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
            />
          </div>
        </section>

        {/* Entry Table */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-ui-lg text-lg font-bold text-on-surface">Ledger Distribution</h3>
            <button 
              onClick={addLine}
              className="text-primary-container hover:text-primary font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 border-none bg-transparent cursor-pointer transition-colors"
            >
              <Icon name="add_circle" className="text-[18px]" /> Add Row
            </button>
          </div>

          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden flex flex-col">
            <div className="h-[2px] w-full bg-[#C8860A]"></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle text-text-light font-ui-xs text-[10px] uppercase tracking-widest font-bold">
                    <th className="py-4 px-6 border-r-[0.5px] border-border-subtle w-1/3">Account / Ledger</th>
                    <th className="py-4 px-6 border-r-[0.5px] border-border-subtle">Description (Optional)</th>
                    <th className="py-4 px-6 border-r-[0.5px] border-border-subtle text-right w-40">Debit (₹)</th>
                    <th className="py-4 px-6 border-r-[0.5px] border-border-subtle text-right w-40">Credit (₹)</th>
                    <th className="py-4 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-border-subtle">
                  {lines.map((line, index) => (
                    <tr key={line.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-0 border-r-[0.5px] border-border-subtle">
                        <select 
                          className="w-full h-full border-none bg-transparent px-6 py-4 font-ui-sm text-sm focus:ring-1 focus:ring-primary outline-none"
                          value={line.accountId}
                          onChange={(e) => updateLine(index, "accountId", e.target.value)}
                        >
                          <option value="">Select account...</option>
                          {MOCK_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}
                        </select>
                      </td>
                      <td className="p-0 border-r-[0.5px] border-border-subtle">
                        <input 
                          className="w-full h-full border-none bg-transparent px-6 py-4 font-ui-sm text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="Line description..."
                          value={line.description}
                          onChange={(e) => updateLine(index, "description", e.target.value)}
                        />
                      </td>
                      <td className="p-0 border-r-[0.5px] border-border-subtle">
                        <input 
                          className="w-full h-full border-none bg-transparent px-6 py-4 font-mono text-right text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="0.00"
                          value={line.debit}
                          onChange={(e) => updateLine(index, "debit", e.target.value)}
                        />
                      </td>
                      <td className="p-0 border-r-[0.5px] border-border-subtle">
                        <input 
                          className="w-full h-full border-none bg-transparent px-6 py-4 font-mono text-right text-sm focus:ring-1 focus:ring-primary outline-none"
                          placeholder="0.00"
                          value={line.credit}
                          onChange={(e) => updateLine(index, "credit", e.target.value)}
                        />
                      </td>
                      <td className="p-0 text-center">
                        <button 
                          onClick={() => removeLine(index)}
                          className="text-stone-300 hover:text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-50 font-bold border-t-2 border-on-surface">
                    <td colSpan={2} className="py-4 px-6 font-ui-sm uppercase tracking-widest text-xs">Total Distribution</td>
                    <td className={`py-4 px-6 text-right font-mono text-sm ${isBalanced ? 'text-green-700' : 'text-on-surface'}`}>₹ {formatIndianNumber(totalDebit)}</td>
                    <td className={`py-4 px-6 text-right font-mono text-sm ${isBalanced ? 'text-green-700' : 'text-on-surface'}`}>₹ {formatIndianNumber(totalCredit)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className={`p-6 border-[0.5px] rounded-sm flex items-center justify-between transition-colors duration-500 ${isBalanced ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <div className="flex items-center gap-3">
              <Icon name={isBalanced ? 'check_circle' : 'warning'} />
              <p className="font-ui-sm font-bold uppercase tracking-widest text-xs">
                {isBalanced ? 'Voucher is balanced' : totalDebit > 0 ? `Out of Balance: ₹ ${formatIndianNumber(diff)}` : 'Entry Required'}
              </p>
            </div>
            {totalDebit > 0 && !isBalanced && (
              <p className="font-ui-xs text-[11px] italic">Ensure total debits exactly match total credits for physical ledger accuracy.</p>
            )}
          </div>
        </section>
      </div>

      {/* Action Bar Footer */}
      <footer className="fixed bottom-0 left-64 right-0 z-40 bg-white border-t-[0.5px] border-border-subtle p-6 flex justify-between items-center shadow-lg no-print">
        <div className="flex items-center gap-4">
           <span className="text-[10px] uppercase font-bold text-text-light tracking-widest">Keyboard Tips:</span>
           <div className="flex gap-2">
             <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] font-mono">TAB</span>
             <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] font-mono">⌘ S</span>
             <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] font-mono">⌘ ↵</span>
           </div>
        </div>
        <div className="flex gap-4">
           <button onClick={() => router.back()} className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm">Discard</button>
           <button onClick={() => handleSubmit('draft')} className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors cursor-pointer bg-transparent rounded-sm">Save Draft</button>
           <button 
             onClick={() => handleSubmit('posted')}
             disabled={!isBalanced || saving}
             className="px-10 py-3 bg-primary-container text-white font-ui-sm font-bold uppercase tracking-widest hover:bg-primary transition-all rounded-sm border-none shadow-sm cursor-pointer disabled:opacity-30"
           >
             {saving ? "Posting..." : "Post Entry →"}
           </button>
        </div>
      </footer>
    </div>
  );
}
