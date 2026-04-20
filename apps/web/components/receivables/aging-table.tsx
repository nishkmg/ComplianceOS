"use client";

import { formatINR } from "@/lib/format-inr";

interface AgingRow {
  customerName: string;
  current: number;
  days31to60: number;
  days61to90: number;
  days90Plus: number;
  total: number;
}

interface AgingTableProps {
  data: AgingRow[];
  onCustomerClick?: (customerName: string) => void;
}

function BucketCell({
  amount,
  bucket,
}: {
  amount: number;
  bucket: "current" | "days31to60" | "days61to90" | "days90Plus";
}) {
  const colorMap = {
    current: "bg-green-50 text-green-800",
    days31to60: "bg-yellow-50 text-yellow-800",
    days61to90: "bg-orange-50 text-orange-800",
    days90Plus: "bg-red-100 text-red-900",
  };
  const bgClass = colorMap[bucket];

  if (amount === 0) {
    return (
      <td className="px-4 py-3 text-right text-gray-400">
        —
      </td>
    );
  }

  return (
    <td className={`px-4 py-3 text-right font-mono text-sm ${bgClass}`}>
      {formatINR(amount)}
    </td>
  );
}

export default function AgingTable({ data, onCustomerClick }: AgingTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days31to60: acc.days31to60 + row.days31to60,
      days61to90: acc.days61to90 + row.days61to90,
      days90Plus: acc.days90Plus + row.days90Plus,
      total: acc.total + row.total,
    }),
    { current: 0, days31to60: 0, days61to90: 0, days90Plus: 0, total: 0 },
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-gray-500 font-medium">Customer</th>
            <th className="px-4 py-3 text-right text-gray-500 font-medium">Current (0-30)</th>
            <th className="px-4 py-3 text-right text-gray-500 font-medium">31-60 Days</th>
            <th className="px-4 py-3 text-right text-gray-500 font-medium">61-90 Days</th>
            <th className="px-4 py-3 text-right text-gray-500 font-medium">90+ Days</th>
            <th className="px-4 py-3 text-right text-gray-500 font-medium">Total Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.customerName}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onCustomerClick?.(row.customerName)}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{row.customerName}</td>
              <BucketCell amount={row.current} bucket="current" />
              <BucketCell amount={row.days31to60} bucket="days31to60" />
              <BucketCell amount={row.days61to90} bucket="days61to90" />
              <BucketCell amount={row.days90Plus} bucket="days90Plus" />
              <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                {formatINR(row.total)}
              </td>
            </tr>
          ))}
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
  );
}