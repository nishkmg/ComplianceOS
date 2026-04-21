import type { ArrearsCalculationResult } from "@complianceos/shared";

interface ArrearsConfig {
  oldMonthlyCTC: number;
  newMonthlyCTC: number;
  effectiveFrom: string;
  currentMonth: string;
}

export function calculateArrears(
  config: ArrearsConfig,
): ArrearsCalculationResult {
  const { oldMonthlyCTC, newMonthlyCTC, effectiveFrom, currentMonth } = config;

  const effectiveDate = new Date(effectiveFrom);
  const currentDate = new Date(currentMonth + "-01");

  const monthsDiff =
    (currentDate.getFullYear() - effectiveDate.getFullYear()) * 12 +
    (currentDate.getMonth() - effectiveDate.getMonth());

  const arrearsMonths = Math.max(0, monthsDiff);
  const monthlyDifference = newMonthlyCTC - oldMonthlyCTC;
  const totalArrears = monthlyDifference * arrearsMonths;

  return {
    oldMonthlyCTC,
    newMonthlyCTC,
    monthlyDifference,
    arrearsMonths,
    totalArrears,
    effectiveFrom,
    currentMonth,
  };
}

export function calculateArrearsFromCTCChange(
  oldAnnualCTC: number,
  newAnnualCTC: number,
  effectiveFrom: string,
  currentMonth: string,
): ArrearsCalculationResult {
  const oldMonthlyCTC = oldAnnualCTC / 12;
  const newMonthlyCTC = newAnnualCTC / 12;

  return calculateArrears({
    oldMonthlyCTC,
    newMonthlyCTC,
    effectiveFrom,
    currentMonth,
  });
}
