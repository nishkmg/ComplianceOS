"use client";

import { Icon } from "@/components/ui/icon";

/**
 * Month picker used by payroll pages (process, preview, challans).
 * Value is "YYYY-MM"; onChange receives the same shape.
 */
export function PeriodPicker({
  value,
  onChange,
  label = "Payroll period",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center bg-surface-muted border border-border rounded-md h-9 px-3">
      <Icon name="calendar_month" className="text-light text-ui-xl mr-2" />
      <label className="sr-only">{label}</label>
      <input
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="bg-transparent font-mono text-ui-xs text-dark outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-sm"
      />
    </div>
  );
}
