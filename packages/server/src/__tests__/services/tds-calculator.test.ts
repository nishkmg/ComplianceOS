import { describe, it, expect } from "vitest";
import { calculateTDS, calculateTDSWithConfig } from "../../services/tds-calculator";

// New-regime slabs (FY 2026-27, Sec 192): 0 / 5% / 10% / 15% / 20% / 30%,
// with a 50,000 standard deduction applied only in the new regime.
const newRegimeAnnualTDS = (projectedAnnualIncome: number, deductions: Record<string, number> = {}): number =>
  calculateTDS(projectedAnnualIncome, deductions, "2025-2026").annualTDS;

describe("calculateTDS (new regime)", () => {
  it("returns zero for zero income", () => {
    const result = calculateTDS(0, {}, "2025-2026");
    expect(result.taxableIncome).toBe(0);
    expect(result.annualTDS).toBe(0);
    expect(result.monthlyTDS).toBe(0);
    expect(result.regime).toBe("new");
  });

  it("zero tax for income at or below the 300000 slab top after standard deduction", () => {
    expect(newRegimeAnnualTDS(299999)).toBe(0);
    expect(newRegimeAnnualTDS(300000)).toBe(0);
    expect(newRegimeAnnualTDS(350000)).toBe(0);
  });

  it("taxes only the amount above 300000 once the 5% slab starts", () => {
    expect(newRegimeAnnualTDS(350000)).toBe(0);
    expect(newRegimeAnnualTDS(350001)).toBeCloseTo(0.05, 6);
    expect(newRegimeAnnualTDS(600000)).toBeCloseTo(12500, 6);
  });

  it("5% slab boundary at 700000", () => {
    expect(newRegimeAnnualTDS(699999)).toBeCloseTo(17499.95, 6);
    expect(newRegimeAnnualTDS(700000)).toBe(17500);
    expect(newRegimeAnnualTDS(700001)).toBeCloseTo(17500.05, 6);
  });

  it("10% slab boundary at 1000000", () => {
    expect(newRegimeAnnualTDS(999999)).toBeCloseTo(44999.9, 6);
    expect(newRegimeAnnualTDS(1000000)).toBe(45000);
    expect(newRegimeAnnualTDS(1000001)).toBeCloseTo(45000.1, 6);
  });

  it("15% slab boundary at 1200000", () => {
    expect(newRegimeAnnualTDS(1199999)).toBeCloseTo(72499.85, 6);
    expect(newRegimeAnnualTDS(1200000)).toBe(72500);
    expect(newRegimeAnnualTDS(1200001)).toBeCloseTo(72500.15, 6);
  });

  it("20% slab boundary at 1500000", () => {
    expect(newRegimeAnnualTDS(1499999)).toBeCloseTo(129999.8, 6);
    expect(newRegimeAnnualTDS(1500000)).toBe(130000);
    expect(newRegimeAnnualTDS(1500001)).toBeCloseTo(130000.2, 6);
  });

  it("30% slab applies above 1500000 (raw slab math only, no surcharge)", () => {
    expect(newRegimeAnnualTDS(2500000)).toBe(425000);
    expect(newRegimeAnnualTDS(10000000)).toBe(2675000);
  });

  it("applies the 50000 standard deduction before slab math", () => {
    const result = calculateTDS(750000, {}, "2025-2026");
    expect(result.taxableIncome).toBe(700000);
    expect(result.annualTDS).toBe(20000);
  });

  it("subtracts section 80C deductions from taxable income", () => {
    const result = calculateTDS(800000, { sec80c: 100000 }, "2025-2026");
    expect(result.taxableIncome).toBe(650000);
    expect(result.annualTDS).toBe(17500);
    expect(result.deductions).toEqual({ sec80c: 100000 });
  });

  it("floors taxable income at zero when deductions exceed income", () => {
    const result = calculateTDS(10000, { sec80c: 50000 }, "2025-2026");
    expect(result.taxableIncome).toBe(0);
    expect(result.annualTDS).toBe(0);
  });

  it("splits annual TDS across remaining months", () => {
    const result = calculateTDS(1200000, {}, "2025-2026");
    expect(result.remainingMonths).toBeGreaterThanOrEqual(1);
    expect(result.monthlyTDS).toBeCloseTo(result.annualTDS / result.remainingMonths, 6);
    expect(result.annualTDS).toBe(72500);
  });
});

describe("calculateTDS (old regime)", () => {
  it("uses old-regime slabs and does not apply the standard deduction", () => {
    const result = calculateTDSWithConfig(1200000, {}, "2025-2026", "old");
    expect(result.regime).toBe("old");
    expect(result.taxableIncome).toBe(1200000);
    expect(result.annualTDS).toBe(172500);
  });

  it("still subtracts explicit deductions in the old regime", () => {
    const result = calculateTDSWithConfig(1200000, { sec80c: 150000 }, "2025-2026", "old");
    expect(result.taxableIncome).toBe(1050000);
    expect(result.annualTDS).toBe(127500);
  });
});

describe("calculateTDSWithConfig", () => {
  it("defaults to the new regime", () => {
    const result = calculateTDSWithConfig(1000000, {}, "2025-2026");
    expect(result.regime).toBe("new");
    expect(result.annualTDS).toBe(45000);
  });
});
