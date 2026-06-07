/**
 * Indian Fiscal Year utility.
 * Indian FY runs April 1 to March 31.
 * Format: "YYYY-YY" (e.g. "2026-27" for Apr 2026 – Mar 2027).
 */
export function getCurrentFiscalYear(now: Date = new Date()): string {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  return `${startYear}-${String(endYear).slice(-2)}`;
}
