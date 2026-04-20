"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/format-inr";

interface CustomerRow {
  customerName: string;
  customerGstin: string | null;
  totalOutstanding: number;
  current030: number;
  aging3160: number;
  aging6190: number;
  aging90Plus: number;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
}

interface AgingTotals {
  current030: number;
  aging3160: number;
  aging6190: number;
  aging90Plus: number;
  total: number;
}

async function fetchReceivablesSummary(): Promise<CustomerRow[]> {
  const response = await fetch("/api/trpc/receivables.summary");
  if (!response.ok) throw new Error("Failed to load");
  const json = await response.json();
  return json.result?.data ?? [];
}

async function fetchReceivablesAging(): Promise<AgingTotals> {
  const response = await fetch("/api/trpc/receivables.aging");
  if (!response.ok) throw new Error("Failed to load");
  const json = await response.json();
  return json.result?.data ?? { current030: 0, aging3160: 0, aging6190: 0, aging90Plus: 0, total: 0 };
}

function KpiCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

export default function ReceivablesDashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [aging, setAging] = useState<AgingTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchReceivablesSummary(), fetchReceivablesAging()])
      .then(([cust, ag]) => {
        setCustomers(cust);
        setAging(ag);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  // Sort by total outstanding desc
  const sorted = [...customers].sort((a, b) => b.totalOutstanding - a.totalOutstanding);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Receivables</h1>
        <Link
          href="/payments/record"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 font-medium"
        >
          Record Payment
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KpiCard
          label="Total Outstanding"
          value={aging ? formatINR(aging.total) : "₹0.00"}
        />
        <KpiCard
          label="Current (0-30)"
          value={aging ? formatINR(aging.current030) : "₹0.00"}
          sublabel="Not yet due"
        />
        <KpiCard
          label="31-60 Days Overdue"
          value={aging ? formatINR(aging.aging3160) : "₹0.00"}
        />
        <KpiCard
          label="61-90 Days Overdue"
          value={aging ? formatINR(aging.aging6190) : "₹0.00"}
        />
        <KpiCard
          label="90+ Days Overdue"
          value={aging ? formatINR(aging.aging90Plus) : "₹0.00"}
          sublabel="Critical"
        />
      </div>

      {/* Customer Summary Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Customer Summary</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {sorted.length} customer{sorted.length !== 1 ? "s" : ""} with outstanding balance
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">Customer</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">Total Outstanding</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">Current (0-30)</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">31-60</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">61-90</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">90+</th>
                <th className="px-6 py-3 text-right text-gray-500 font-medium">Last Payment</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No outstanding receivables
                  </td>
                </tr>
              ) : (
                sorted.map((cust) => (
                  <tr
                    key={cust.customerName}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/receivables/${encodeURIComponent(cust.customerName)}`,
                      )
                    }
                  >
                    <td className="px-6 py-3">
                      <span className="font-medium text-gray-900">{cust.customerName}</span>
                      {cust.customerGstin && (
                        <span className="ml-2 text-xs text-gray-400">
                          {cust.customerGstin}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-gray-900">
                      {formatINR(cust.totalOutstanding)}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-green-700 bg-green-50">
                      {cust.current030 > 0 ? formatINR(cust.current030) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-yellow-700 bg-yellow-50">
                      {cust.aging3160 > 0 ? formatINR(cust.aging3160) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-orange-700 bg-orange-50">
                      {cust.aging6190 > 0 ? formatINR(cust.aging6190) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-mono text-red-700 bg-red-50">
                      {cust.aging90Plus > 0 ? formatINR(cust.aging90Plus) : "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-500 text-xs">
                      {cust.lastPaymentDate
                        ? `${formatINR(cust.lastPaymentAmount ?? 0)} on ${new Date(
                            cust.lastPaymentDate,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}