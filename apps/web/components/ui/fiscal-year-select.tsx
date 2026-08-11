"use client";

import { useFiscalYear } from "@/hooks/use-fiscal-year";

/**
 * Fiscal-year selector fed by the real FY list (useFiscalYear). Replaces the
 * hardcoded 2–3 option selects that drifted from tenant fiscal years.
 */
export function FiscalYearSelect({ className = "" }: { className?: string }) {
  const { activeFy, setActiveFy, fiscalYears } = useFiscalYear();

  return (
    <select
      value={activeFy}
      onChange={(e) => setActiveFy(e.target.value)}
      aria-label="Fiscal year"
      className={`rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${className}`}
    >
      {(fiscalYears?.length ? fiscalYears : [activeFy]).map((fy) => (
        <option key={typeof fy === "string" ? fy : fy.year} value={typeof fy === "string" ? fy : fy.year}>
          {typeof fy === "string" ? fy : `FY ${fy.year}`}
        </option>
      ))}
    </select>
  );
}
