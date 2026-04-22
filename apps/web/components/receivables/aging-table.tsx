"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/format-inr";

interface AgingRow {
  customerName: string;
  customerGstin: string | null;
  current: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  total: number;
}

interface AgingTableProps {
  data: AgingRow[];
}

type SortKey = "customerName" | "total" | "current" | "days31to60" | "days61to90" | "days90Plus";
type SortDirection = "asc" | "desc";
type FilterBucket = "all" | "current" | "days31to60" | "days61to90" | "days90Plus" | "overdue";

export default function AgingTable({ data }: AgingTableProps) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterBucket, setFilterBucket] = useState<FilterBucket>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const filteredData = data.filter((row) => {
    if (filterBucket === "all") return true;
    if (filterBucket === "overdue") {
      return row.days31to60 > 0 || row.days61to90 > 0 || row.days90Plus > 0;
    }
    return row[filterBucket] > 0;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (sortKey === "customerName") {
      const aStr = aVal as string;
      const bStr = bVal as string;
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    }
    const aNum = aVal as number;
    const bNum = bVal as number;
    return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
  });

  const totals = sortedData.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days31to60: acc.days31to60 + row.days31to60,
      days61to90: acc.days61to90 + row.days61to90,
      days90Plus: acc.days90Plus + row.days90Plus,
      total: acc.total + row.total,
    }),
    { current: 0, days31to60: 0, days61to90: 0, days90Plus: 0, total: 0 },
  );

  const exportToCsv = () => {
    const headers = ["Customer", "GSTIN", "Total Outstanding", "Current (0-30)", "31-60 Days", "61-90 Days", "90+ Days"];
    const rows = sortedData.map((row) => [
      row.customerName,
      row.customerGstin ?? "",
      row.total.toString(),
      row.current.toString(),
      row.days31to60.toString(),
      row.days61to90.toString(),
      row.days90Plus.toString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aging-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="ml-1 text-gray-300">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const BucketCell = ({
    amount,
    bucket,
  }: {
    amount: number;
    bucket: "current" | "days31to60" | "days61to90" | "days90Plus";
  }) => {
    const colorMap = {
      current: "bg-green-50 text-green-800",
      days31to60: "bg-yellow-50 text-yellow-800",
      days61to90: "bg-orange-50 text-orange-800",
      days90Plus: "bg-red-100 text-red-900",
    };
    const bgClass = colorMap[bucket];

    if (amount === 0) {
      return <td className="px-4 py-3 text-right text-gray-400">—</td>;
    }

    return (
      <td className={`px-4 py-3 text-right font-mono text-sm ${bgClass}`}>
        {formatINR(amount)}
      </td>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filterBucket}
            onChange={(e) => setFilterBucket(e.target.value as FilterBucket)}
            className="px-3 py-1.5 border rounded-md text-sm bg-white"
          >
            <option value="all">All Customers</option>
            <option value="current">Current (0-30)</option>
            <option value="days31to60">31-60 Days</option>
            <option value="days61to90">61-90 Days</option>
            <option value="days90Plus">90+ Days</option>
            <option value="overdue">All Overdue (31+)</option>
          </select>
        </div>
        <button
          onClick={exportToCsv}
          className="px-4 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th
                className="px-4 py-3 text-left text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("customerName")}
              >
                Customer <SortIndicator column="customerName" />
              </th>
              <th
                className="px-4 py-3 text-right text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("current")}
              >
                Current (0-30) <SortIndicator column="current" />
              </th>
              <th
                className="px-4 py-3 text-right text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("days31to60")}
              >
                31-60 Days <SortIndicator column="days31to60" />
              </th>
              <th
                className="px-4 py-3 text-right text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("days61to90")}
              >
                61-90 Days <SortIndicator column="days61to90" />
              </th>
              <th
                className="px-4 py-3 text-right text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("days90Plus")}
              >
                90+ Days <SortIndicator column="days90Plus" />
              </th>
              <th
                className="px-4 py-3 text-right text-gray-500 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("total")}
              >
                Total Outstanding <SortIndicator column="total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No customers match the selected filter
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={row.customerName}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/receivables/${encodeURIComponent(row.customerName)}`)
                  }
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{row.customerName}</span>
                    {row.customerGstin && (
                      <span className="ml-2 text-xs text-gray-400">{row.customerGstin}</span>
                    )}
                  </td>
                  <BucketCell amount={row.current} bucket="current" />
                  <BucketCell amount={row.days31to60} bucket="days31to60" />
                  <BucketCell amount={row.days61to90} bucket="days61to90" />
                  <BucketCell amount={row.days90Plus} bucket="days90Plus" />
                  <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                    {formatINR(row.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2">
            <tr>
              <td className="px-4 py-3 font-semibold text-gray-700">Total</td>
              <td className="px-4 py-3 text-right font-mono text-sm bg-green-100 font-semibold">
                {formatINR(totals.current)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm bg-yellow-100 font-semibold">
                {formatINR(totals.days31to60)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm bg-orange-100 font-semibold">
                {formatINR(totals.days61to90)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm bg-red-100 font-semibold">
                {formatINR(totals.days90Plus)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                {formatINR(totals.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {sortedData.length} of {data.length} customer{data.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
