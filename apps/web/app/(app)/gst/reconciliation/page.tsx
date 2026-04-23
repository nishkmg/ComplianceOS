// @ts-nocheck
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

export default function GSTReconciliationPage() {
  const [periodMonth, setPeriodMonth] = useState<number>(4);
  const [periodYear, setPeriodYear] = useState<number>(2026);

  const { data: summary, refetch } = api.gstReconciliation.matchedSummary.useQuery(
    { periodMonth, periodYear },
    { enabled: false }
  );

  const { data: mismatches } = api.gstReconciliation.mismatches.useQuery(
    { periodMonth, periodYear },
    { enabled: false }
  );

  const reconcileMutation = api.gstReconciliation.reconcile.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleReconcile = () => {
    reconcileMutation.mutateAsync({ periodMonth, periodYear });
  };

  const matchedCount = summary?.salesInvoices.matched ?? 0;
  const matchedValue = summary?.totalMatchedValue ?? 0;
  const mismatchedCount = (mismatches as any[])?.length ?? 0;
  const mismatchedValue = (mismatches as any[])?.reduce((sum, m) => sum + Math.abs(m.taxAmount ?? 0), 0) ?? 0;
  const pendingCount = (summary?.salesInvoices.total ?? 0) - matchedCount;

  const mismatchReasons = (mismatches as any[])?.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  const maxReasonCount = Math.max(...Object.values(mismatchReasons).map(v => Number(v) || 1), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">GST Reconciliation</h1>
        <div className="flex items-center gap-2">
          <select
            value={periodMonth}
            onChange={(e) => setPeriodMonth(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm bg-white"
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
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={handleReconcile}
            disabled={reconcileMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {reconcileMutation.isPending ? "Reconciling..." : "Run Reconciliation"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Matched</p>
          <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
          <p className="text-sm text-gray-600">{formatINR(matchedValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Mismatched</p>
          <p className="text-2xl font-bold text-red-600">{mismatchedCount}</p>
          <p className="text-sm text-gray-600">{formatINR(mismatchedValue)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-600">Awaiting reconciliation</p>
        </div>
      </div>

      {mismatchedCount > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Mismatch Reasons</h2>
          <div className="space-y-3">
            {Object.entries(mismatchReasons).map(([reason, count]) => (
              <div key={reason} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 capitalize">{reason.replace(/_/g, " ")}</span>
                    <span className="text-gray-500">{String(count)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(Number(count) / maxReasonCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/gst/reconciliation/mismatches"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm"
          >
            View all mismatches →
          </a>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Reconciliation Status</h2>
        <p className="text-sm text-gray-600 mb-4">
          Period: {MONTHS.find((m) => m.value === periodMonth)?.label} {periodYear}
        </p>
        {summary?.reconciliationStatus ? (
          <span
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              summary.reconciliationStatus === "filed"
                ? "bg-green-100 text-green-800"
                : summary.reconciliationStatus === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {summary.reconciliationStatus}
          </span>
        ) : (
          <p className="text-sm text-gray-500">Not yet reconciled. Click "Run Reconciliation" to start.</p>
        )}
      </div>
    </div>
  );
}
