"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Line {
  accountId: string;
  accountName: string;
  debit: string;
  credit: string;
  description: string;
}

export default function NewJournalEntryPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { accountId: "", accountName: "", debit: "", credit: "", description: "" },
    { accountId: "", accountName: "", debit: "", credit: "", description: "" },
  ]);
  const [error, setError] = useState("");
  const router = useRouter();

  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit || "0"), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit || "0"), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  function addLine() {
    setLines([...lines, { accountId: "", accountName: "", debit: "", credit: "", description: "" }]);
  }

  function updateLine(index: number, field: keyof Line, value: string) {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) { setError("Debits must equal credits"); return; }
    router.push("/journal");
  }

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">New Journal Entry</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <select className="w-full px-3 py-2 border rounded">
              <option value="manual">Manual</option>
              <option value="opening_balance">Opening Balance</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Narration</label>
          <input type="text" value={narration} onChange={(e) => setNarration(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Enter narration" required />
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500">
            <div className="col-span-5">Account</div>
            <div className="col-span-3">Debit (₹)</div>
            <div className="col-span-3">Credit (₹)</div>
            <div className="col-span-1"></div>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input type="text" value={line.accountName} onChange={(e) => updateLine(i, "accountName", e.target.value)} placeholder="Search account..." className="col-span-5 px-3 py-2 border rounded" />
              <input type="number" value={line.debit} onChange={(e) => updateLine(i, "debit", e.target.value)} placeholder="0.00" className="col-span-3 px-3 py-2 border rounded text-right" />
              <input type="number" value={line.credit} onChange={(e) => updateLine(i, "credit", e.target.value)} placeholder="0.00" className="col-span-3 px-3 py-2 border rounded text-right" />
              <button type="button" onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="col-span-1 text-red-500 text-sm">✕</button>
            </div>
          ))}
          <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:underline">+ Add Line</button>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className={`text-sm font-medium ${isBalanced ? "text-green-600" : "text-red-600"}`}>
            Total Debit: ₹{totalDebit.toFixed(2)} | Total Credit: ₹{totalCredit.toFixed(2)}
            {!isBalanced && <span className="ml-2">(Out of balance)</span>}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded text-sm">Cancel</button>
            <button type="submit" disabled={!isBalanced} className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50">Save as Draft</button>
          </div>
        </div>
      </form>
    </div>
  );
}
