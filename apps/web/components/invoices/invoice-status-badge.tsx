"use client";

type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "voided" | string;

const statusConfig: Record<InvoiceStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-gray-100 text-gray-800", label: "Draft" },
  sent: { bg: "bg-blue-100 text-blue-800", label: "Sent" },
  partially_paid: { bg: "bg-yellow-100 text-yellow-800", label: "Partially Paid" },
  paid: { bg: "bg-green-100 text-green-800", label: "Paid" },
  voided: { bg: "bg-red-100 text-red-800", label: "Voided" },
};

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status as InvoiceStatus] ?? { bg: "bg-gray-100 text-gray-800", label: status };
  return (
    <span className={`px-2 py-1 text-xs rounded-full capitalize ${config.bg}`}>
      {config.label}
    </span>
  );
}
