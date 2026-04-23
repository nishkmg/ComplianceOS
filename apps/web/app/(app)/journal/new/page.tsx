// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BalanceBar, Badge } from "@/components/ui";
import { formatINR, formatDate, formatIndianNumber } from "@/lib/format";

const MOCK_ACCOUNTS = [
  { id: "1", name: "Cash Account", code: "10100", type: "asset" },
  { id: "2", name: "Bank Account", code: "10200", type: "asset" },
  { id: "3", name: "Sales Revenue", code: "40100", type: "income" },
  { id: "4", name: "Purchase Expenses", code: "50100", type: "expense" },
  { id: "5", name: "Trade Receivables", code: "10300", type: "asset" },
  { id: "6", name: "Trade Payables", code: "20100", type: "liability" },
  { id: "7", name: "Capital Account", code: "30100", type: "equity" },
  { id: "8", name: "GST Output", code: "20200", type: "liability" },
  { id: "9", name: "GST Input", code: "10400", type: "asset" },
  { id: "10", name: "Equipment", code: "10500", type: "asset" },
];

interface Line {
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
    { accountId: "", debit: "", credit: "", description: "" },
    { accountId: "", debit: "", credit: "", description: "" },
  ]);
  const [showAccountDropdown, setShowAccountDropdown] = useState<number | null>(null);
  const [accountSearch, setAccountSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit || "0"), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit || "0"), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  function addLine() {
    setLines([...lines, { accountId: "", debit: "", credit: "", description: "" }]);
  }

  function updateLine(index: number, field: keyof Line, value: string) {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  }

  function selectAccount(lineIndex: number, accountId: string) {
    const newLines = [...lines];
    newLines[lineIndex].accountId = accountId;
    setLines(newLines);
    setShowAccountDropdown(null);
    setAccountSearch("");
  }

  const filteredAccounts = MOCK_ACCOUNTS.filter(
    (a) =>
      a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      a.code.toLowerCase().includes(accountSearch.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    router.push("/journal");
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">New Journal Entry</h1>
          <p className="font-ui text-[12px] text-light mt-1">Create a new double-entry transaction</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()} className="filter-tab">
            Discard (Esc)
          </button>
          <button
            type="button"
            data-save-draft
            onClick={() => handleSubmit(new Event("submit") as any)}
            className="filter-tab"
            disabled={saving}
          >
            Save Draft (⌘S)
          </button>
          <button
            type="button"
            data-post-entry
            onClick={() => isBalanced && handleSubmit(new Event("submit") as any)}
            disabled={!isBalanced || saving}
            className="filter-tab active disabled:opacity-50"
          >
            {saving ? "Posting..." : "Post Entry (⌘↵)"}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-body space-y-6">
          {/* Top Row: Date + Reference */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-light uppercase tracking-wide mb-2 font-ui font-medium">
                Entry Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full font-ui"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-light uppercase tracking-wide mb-2 font-ui font-medium">
                Reference Type
              </label>
              <select className="input-field w-full font-ui">
                <option value="manual">Manual Journal Entry</option>
                <option value="opening_balance">Opening Balance</option>
                <option value="invoice">Sales Invoice</option>
                <option value="purchase">Purchase Invoice</option>
                <option value="payment">Payment Receipt</option>
              </select>
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-[10px] text-light uppercase tracking-wide mb-2 font-ui font-medium">
              Narration *
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="input-field w-full font-ui"
              placeholder="Brief description of this transaction"
              required
            />
          </div>

          {/* Lines Table */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 text-[10px] uppercase tracking-wide text-light font-ui font-medium px-2">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Account Name</div>
              <div className="col-span-2 text-right">Debit (Dr)</div>
              <div className="col-span-2 text-right">Credit (Cr)</div>
              <div className="col-span-2"></div>
            </div>

            {lines.map((line, index) => {
              const selectedAccount = MOCK_ACCOUNTS.find((a) => a.id === line.accountId);
              return (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  {/* Line Number */}
                  <div className="col-span-1 font-mono text-[11px] text-light text-center">
                    {index + 1}
                  </div>

                  {/* Account Select */}
                  <div className="col-span-5 relative">
                    <input
                      type="text"
                      value={selectedAccount ? `${selectedAccount.name} (${selectedAccount.code})` : accountSearch}
                      onChange={(e) => {
                        setAccountSearch(e.target.value);
                        setShowAccountDropdown(index);
                        if (!e.target.value) selectAccount(index, "");
                      }}
                      onFocus={() => setShowAccountDropdown(index)}
                      placeholder="Search account code or name..."
                      className="input-field w-full font-ui"
                    />
                    {showAccountDropdown === index && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-lighter rounded-[6px] shadow-lg max-h-[240px] overflow-y-auto">
                        {filteredAccounts.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => selectAccount(index, account.id)}
                            className="w-full px-4 py-3 text-left hover:bg-surface-muted border-b border-lighter last:border-0"
                          >
                            <div className="text-[13px] text-dark font-ui">{account.name}</div>
                            <div className="text-[10px] text-light font-mono">
                              {account.code} • {account.type.toUpperCase()}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Debit */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={line.debit}
                      onChange={(e) => updateLine(index, "debit", e.target.value)}
                      placeholder="0.00"
                      className="input-field w-full text-right font-mono"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Credit */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={line.credit}
                      onChange={(e) => updateLine(index, "credit", e.target.value)}
                      placeholder="0.00"
                      className="input-field w-full text-right font-mono"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setLines(lines.filter((_, idx) => idx !== index))}
                      className="text-[13px] text-light hover:text-danger font-ui px-3 py-2"
                      disabled={lines.length <= 2}
                    >
                      × Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              data-add-line
              onClick={addLine}
              className="text-[13px] text-amber hover:text-amber-hover font-ui font-medium py-2 px-2"
            >
              + Add line (N)
            </button>
          </div>

          {/* Balance Bar */}
          <BalanceBar debit={totalDebit} credit={totalCredit} />
        </div>
      </div>
    </div>
  );
}
