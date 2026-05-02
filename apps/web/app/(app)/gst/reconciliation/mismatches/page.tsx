"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format-inr";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = [2025, 2026, 2027, 2028];

interface Mismatch {
  type: string;
  description: string;
  invoiceNumber?: string;
  supplierGstin?: string;
  supplierName?: string;
  bookValue?: number;
  returnValue?: number;
  difference: number;
  severity: string;
}

export default function GSTMismatchesPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  const { data: mismatches, isLoading }: any = api.gstReconciliation.mismatches.useQuery({
    periodMonth,
    periodYear,
  });

  const handleExportCSV = () => {
    if (!mismatches) return;

    const headers = [
      "Invoice #",
      "Supplier",
      "Date",
      "Books Value",
      "2B Value",
      "Difference",
      "Reason",
    ];
    const rows = (mismatches as any[]).map((m) => [
      m.invoiceNumber ?? "",
      m.supplierName ?? m.description ?? "",
      "",
      m.bookValue ? formatINR(m.bookValue) : "",
      m.returnValue ? formatINR(m.returnValue) : "",
      formatINR(Math.abs(m.difference ?? m.taxAmount ?? 0)),
      m.type,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gst-mismatches-${periodYear}-${String(periodMonth).padStart(2, "0")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAccept = (mismatch: any) => {
    console.log("Accept mismatch:", mismatch);
  };

  const handleReject = (mismatch: Mismatch) => {
    console.log("Reject mismatch:", mismatch);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-dark">GST Mismatches</h1>
          <p className="font-ui text-[13px] text-secondary mt-1">
            {MONTHS.find((m) => m.value === periodMonth)?.label} {periodYear}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodMonth}
            onChange={(e) => setPeriodMonth(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm bg-surface"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={periodYear}
            onChange={(e) => setPeriodYear(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm bg-surface"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            disabled={!mismatches || mismatches.length === 0}
            className="px-4 py-2 bg-mid text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted border-b">
            <tr>
              <th className="px-4 py-3 text-left text-light font-medium">Invoice #</th>
              <th className="px-4 py-3 text-left text-light font-medium">Supplier</th>
              <th className="px-4 py-3 text-left text-light font-medium">Books Value</th>
              <th className="px-4 py-3 text-left text-light font-medium">2B Value</th>
              <th className="px-4 py-3 text-right text-light font-medium">Difference</th>
              <th className="px-4 py-3 text-left text-light font-medium">Reason</th>
              <th className="px-4 py-3 text-left text-light font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-light">
                  Loading...
                </td>
              </tr>
            ) : mismatches && mismatches.length > 0 ? (
              (mismatches as any[]).map((mismatch: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 text-dark">
                    {mismatch.invoiceNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-dark">{mismatch.supplierName ?? "—"}</div>
                    {mismatch.supplierGstin && (
                      <div className="text-xs text-light">{mismatch.supplierGstin}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {mismatch.bookValue ? formatINR(mismatch.bookValue) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {mismatch.returnValue ? formatINR(mismatch.returnValue) : "—"}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      mismatch.difference > 0
                        ? "text-danger"
                        : mismatch.difference < 0
                        ? "text-success"
                        : "text-gray-600"
                    }`}
                  >
                    {formatINR(Math.abs(mismatch.difference))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{mismatch.description}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(mismatch)}
                        className="text-success hover:text-success text-sm"
                        title="Accept (book correction)"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(mismatch)}
                        className="text-danger hover:text-danger text-sm"
                        title="Reject (contact supplier)"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-light">
                  No mismatches found for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mismatches && mismatches.length > 0 && (
        <div className="text-sm text-light">
          Showing {mismatches.length} mismatch{mismatches.length !== 1 ? "es" : ""}
        </div>
      )}
    </div>
  );
}
