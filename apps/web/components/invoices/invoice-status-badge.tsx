"use client";

type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "voided" | string;

const statusConfig: Record<InvoiceStatus, { bg: string; label: string }> = {
  draft: { bg: "bg-lighter/40 text-dark", label: "Draft" },
  sent: { bg: "bg-blue-100 text-blue-800", label: "Sent" },
  partially_paid: { bg: "bg-yellow-100 text-yellow-800", label: "Partially Paid" },
  paid: { bg: "bg-green-100 text-green-800", label: "Paid" },
  voided: { bg: "bg-red-100 text-red-800", label: "Voided" },
  overdue: { bg: "bg-red-200 text-red-900", label: "Overdue" },
};

interface InvoiceStatusBadgeProps {
  status: string;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status as InvoiceStatus] ?? { bg: "bg-lighter/40 text-dark", label: status };
  return (
    <span className={`px-2 py-1 text-xs rounded-full capitalize ${config.bg}`}>
      {config.label}
    </span>
  );
}
