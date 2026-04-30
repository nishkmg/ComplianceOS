"use client";
import { useState, useEffect, useCallback } from "react";

interface Account {
  id: string;
  code: string;
  name: string;
  kind: string;
  subType: string;
  isLeaf: boolean;
}

interface ScanResult {
  id: string;
  status: string;
  fileName: string;
  fileUrl: string;
  rawText: string | null;
  parsedVendorName: string | null;
  parsedVendorAddress: string | null;
  parsedVendorGstin: string | null;
  parsedInvoiceDate: string | null;
  parsedTotal: string | null;
  parsedExpenseCategory: string | null;
  confidenceScore: string | null;
}

interface ReceiptScanResultsProps {
  scan: ScanResult;
  onExpenseCreated: (entryId: string) => void;
}

async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch("/api/trpc/accounts.list");
  if (!response.ok) return [];
  const json = await response.json();
  return json.result?.data ?? [];
}

async function createExpenseFromScan(input: {
  scanId: string;
  vendorName: string;
  vendorGstin?: string;
  date: string;
  total: number;
  expenseAccountId: string;
  payableAccountId: string;
  narration?: string;
}): Promise<{ entryId: string; entryNumber: string }> {
  const response = await fetch("/api/trpc/ocrScan.createExpenseFromScan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) throw new Error("Failed to create expense entry");
  const json = await response.json();
  return json.result?.data ?? { entryId: "", entryNumber: "" };
}

const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Telephone",
  "Internet",
  "Professional_Fees",
  "Insurance",
  "Travel",
  "Printing_Stationery",
  "Office_Supplies",
  "Bank_Charges",
  "Interest",
  "Repairs_Maintenance",
  "Freight",
  "Commission",
  "Advertisements",
  "Miscellaneous",
];

export function ReceiptScanResults({ scan, onExpenseCreated }: ReceiptScanResultsProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vendorName, setVendorName] = useState(scan.parsedVendorName ?? "");
  const [vendorGstin, setVendorGstin] = useState(scan.parsedVendorGstin ?? "");
  const [date, setDate] = useState(
    scan.parsedInvoiceDate ?? new Date().toISOString().split("T")[0]
  );
  const [total, setTotal] = useState(scan.parsedTotal ?? "");
  const [expenseCategory, setExpenseCategory] = useState(scan.parsedExpenseCategory ?? "");
  const [expenseAccountId, setExpenseAccountId] = useState("");
  const [payableAccountId, setPayableAccountId] = useState("");
  const [narration, setNarration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawTextExpanded, setRawTextExpanded] = useState(false);

  useEffect(() => {
    fetchAccounts().then((accs) => {
      setAccounts(accs);
      // Auto-select first expense account and first payable account
      const expense = accs.find((a) => a.kind === "Expense" && a.isLeaf);
      const payable = accs.find((a) => a.kind === "Liability" && a.isLeaf);
      if (expense) setExpenseAccountId(expense.id);
      if (payable) setPayableAccountId(payable.id);
    });
  }, []);

  const expenseAccounts = accounts.filter((a) => a.kind === "Expense" && a.isLeaf);
  const payableAccounts = accounts.filter((a) => a.kind === "Liability" && a.isLeaf);

  const handleSubmit = useCallback(async () => {
    if (!vendorName.trim()) { setError("Vendor name is required"); return; }
    if (!total || parseFloat(total) <= 0) { setError("Total amount is required"); return; }
    if (!expenseAccountId) { setError("Please select an expense account"); return; }
    if (!payableAccountId) { setError("Please select a payable account"); return; }

    setSubmitting(true);
    setError(null);
    try {
      const result = await createExpenseFromScan({
        scanId: scan.id,
        vendorName: vendorName.trim(),
        vendorGstin: vendorGstin.trim() || undefined,
        date,
        total: parseFloat(total),
        expenseAccountId,
        payableAccountId,
        narration: narration.trim() || undefined,
      });
      onExpenseCreated(result.entryId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [scan.id, vendorName, vendorGstin, date, total, expenseAccountId, payableAccountId, narration, onExpenseCreated]);

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Extracted Receipt Data</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and edit the extracted data before creating the expense entry
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="px-6 py-4 space-y-6">
        {scan.confidenceScore && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">OCR Confidence:</span>
            <span className={`text-sm font-medium ${
              parseFloat(scan.confidenceScore) > 70 ? "text-green-600" :
              parseFloat(scan.confidenceScore) > 40 ? "text-yellow-600" : "text-red-600"
            }`}>
              {parseFloat(scan.confidenceScore).toFixed(0)}%
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vendor or business name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor GSTIN
            </label>
            <input
              type="text"
              value={vendorGstin}
              onChange={(e) => setVendorGstin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 27AAAA0000A1ZA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹) *
            </label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Category *
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expense Account *
            </label>
            <select
              value={expenseAccountId}
              onChange={(e) => setExpenseAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select account</option>
              {expenseAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payable / Sundry Creditors Account *
            </label>
            <select
              value={payableAccountId}
              onChange={(e) => setPayableAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select account</option>
              {payableAccounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Narration</label>
          <textarea
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description for the journal entry"
          />
        </div>

        {scan.rawText && (
          <details className="text-sm">
            <summary
              onClick={() => setRawTextExpanded(!rawTextExpanded)}
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            >
              {rawTextExpanded ? "Hide" : "Show"} raw OCR text
            </summary>
            {rawTextExpanded && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                {scan.rawText}
              </pre>
            )}
          </details>
        )}

        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Expense Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
