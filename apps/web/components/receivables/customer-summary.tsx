// @ts-nocheck
"use client";

import Link from "next/link";
import { formatINR } from "@/lib/format-inr";

interface CustomerSummaryProps {
  customerName: string;
  customerGstin?: string | null;
  totalOutstanding: number;
  currentAmount: number;
  aging31to60: number;
  aging61to90: number;
  aging90Plus: number;
  lastPaymentDate?: string | null;
  lastPaymentAmount?: number | null;
}

function AgingBadge({ amount, label }: { amount: number; label: string }) {
  if (amount === 0) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
      {label}: {formatINR(amount)}
    </span>
  );
}

export default function CustomerSummaryCard({
  customerName,
  customerGstin,
  totalOutstanding,
  currentAmount,
  aging31to60,
  aging61to90,
  aging90Plus,
  lastPaymentDate,
  lastPaymentAmount,
}: CustomerSummaryProps) {
  return (
    <Link
      href={`/receivables/${encodeURIComponent(customerName)}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border border-gray-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{customerName}</h3>
          {customerGstin && (
            <p className="text-xs text-gray-500 mt-0.5">GSTIN: {customerGstin}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <AgingBadge amount={currentAmount} label="0-30" />
            <AgingBadge amount={aging31to60} label="31-60" />
            <AgingBadge amount={aging61to90} label="61-90" />
            <AgingBadge amount={aging90Plus} label="90+" />
          </div>
          {lastPaymentDate && lastPaymentAmount && (
            <p className="text-xs text-gray-400 mt-2">
              Last payment: {formatINR(lastPaymentAmount)} on{" "}
              {new Date(lastPaymentDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-gray-900">{formatINR(totalOutstanding)}</p>
          <p className="text-xs text-gray-500">Outstanding</p>
        </div>
      </div>
    </Link>
  );
}