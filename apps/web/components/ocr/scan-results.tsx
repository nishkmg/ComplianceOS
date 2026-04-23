// @ts-nocheck
"use client";
import { useState, useCallback } from "react";

interface ParsedLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

interface ScanResult {
  id: string;
  status: string;
  fileName: string;
  fileUrl: string;
  rawText: string | null;
  parsedVendorName: string | null;
  parsedInvoiceNumber: string | null;
  parsedInvoiceDate: string | null;
  parsedSubtotal: string | null;
  parsedCgstTotal: string | null;
  parsedSgstTotal: string | null;
  parsedIgstTotal: string | null;
  parsedTotal: string | null;
  parsedLineItems: string | null;
  confidenceScore: string | null;
}

interface ScanResultsProps {
  scan: ScanResult;
  onInvoiceCreated: (invoiceId: string) => void;
}

interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate: number;
  discountPercent: number;
}

async function createInvoiceFromScan(input: {
  scanId: string;
  customerName: string;
  customerEmail?: string;
  customerGstin?: string;
  customerState: string;
  date: string;
  dueDate: string;
  lines: LineItemInput[];
  notes?: string;
}): Promise<{ invoiceId: string; invoiceNumber: string }> {
  const accountId = "00000000-0000-0000-0000-000000000000";
  const linesWithAccount = input.lines.map((l) => ({
    accountId,
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    gstRate: l.gstRate,
    discountPercent: l.discountPercent,
  }));

  const body = {
    input: {
      scanId: input.scanId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerGstin: input.customerGstin,
      customerState: input.customerState,
      date: input.date,
      dueDate: input.dueDate,
      lines: linesWithAccount,
      notes: input.notes,
    },
  };

  const response = await fetch("/api/trpc/ocrScan.createInvoiceFromScan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to create invoice");
  const json = await response.json();
  return json.result?.data ?? { invoiceId: "", invoiceNumber: "" };
}

export function ScanResults({ scan, onInvoiceCreated }: ScanResultsProps) {
  const [customerName, setCustomerName] = useState(scan.parsedVendorName ?? "");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [date, setDate] = useState(
    scan.parsedInvoiceDate ?? new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemInput[]>(() => {
    if (scan.parsedLineItems) {
      try {
        const parsed = JSON.parse(scan.parsedLineItems) as ParsedLineItem[];
        return parsed.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          gstRate: item.gstRate,
          discountPercent: 0,
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawTextExpanded, setRawTextExpanded] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (!customerState.trim()) {
      setError("Customer state is required");
      return;
    }
    if (lineItems.length === 0) {
      setError("At least one line item is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await createInvoiceFromScan({
        scanId: scan.id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerGstin: customerGstin.trim() || undefined,
        customerState: customerState.trim(),
        date,
        dueDate: dueDate || date,
        lines: lineItems,
        notes: notes.trim() || undefined,
      });
      onInvoiceCreated(result.invoiceId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [scan.id, customerName, customerEmail, customerGstin, customerState, date, dueDate, lineItems, notes, onInvoiceCreated]);

  const parsedSubtotal = scan.parsedSubtotal ? parseFloat(scan.parsedSubtotal) : 0;
  const parsedTotal = scan.parsedTotal ? parseFloat(scan.parsedTotal) : 0;

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Extracted Invoice Data</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and edit the extracted data before creating the invoice
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
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Customer or company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer GSTIN
            </label>
            <input
              type="text"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 27AAAA0000A1ZA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer State *
            </label>
            <input
              type="text"
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. IN-MH"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="customer@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Date *
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
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {(parsedSubtotal > 0 || parsedTotal > 0) && (
          <div className="flex gap-8 text-sm">
            {parsedSubtotal > 0 && (
              <div>
                <span className="text-gray-500">Subtotal: </span>
                <span className="font-medium">₹{parsedSubtotal.toFixed(2)}</span>
              </div>
            )}
            {parsedTotal > 0 && (
              <div>
                <span className="text-gray-500">Total: </span>
                <span className="font-medium">₹{parsedTotal.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {lineItems.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Line Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600 font-medium">Description</th>
                    <th className="px-3 py-2 text-right text-gray-600 font-medium w-20">Qty</th>
                    <th className="px-3 py-2 text-right text-gray-600 font-medium w-28">Unit Price</th>
                    <th className="px-3 py-2 text-right text-gray-600 font-medium w-24">Amount</th>
                    <th className="px-3 py-2 text-right text-gray-600 font-medium w-20">GST %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            setLineItems((items) =>
                              items.map((x, j) => j === i ? { ...x, description: e.target.value } : x)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            setLineItems((items) =>
                              items.map((x, j) => j === i ? { ...x, quantity: Number(e.target.value) } : x)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            setLineItems((items) =>
                              items.map((x, j) => j === i ? { ...x, unitPrice: Number(e.target.value) } : x)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-gray-700">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.gstRate}
                          onChange={(e) =>
                            setLineItems((items) =>
                              items.map((x, j) => j === i ? { ...x, gstRate: Number(e.target.value) } : x)
                            )
                          }
                          className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="0"
                          max="100"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes for the invoice"
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
            {submitting ? "Creating..." : "Create Draft Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}
