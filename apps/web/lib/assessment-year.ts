/** FY "2026-27" → assessment year "2027-28" */
export function assessmentYearFromFinancialYear(financialYear: string): string {
  const match = financialYear.match(/^(\d{4})-(\d{2})$/);
  if (!match) return financialYear;
  const startYear = Number(match[1]);
  return `${startYear + 1}-${(startYear + 2).toString().slice(-2)}`;
}
