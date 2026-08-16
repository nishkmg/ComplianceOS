import { describe, it, expect } from "vitest";
import {
  calculateProfessionalTax,
  calculateProfessionalTaxFromConfig,
} from "../../services/professional-tax-calculator";

describe("calculateProfessionalTax (default schedule)", () => {
  it("applies the default schedule regardless of state", () => {
    for (const state of ["maharashtra", "karnataka", "delhi", "unknown"]) {
      expect(calculateProfessionalTax(15000, state)).toBe(100);
    }
  });

  it("zero tax at and below the 10000 exempt boundary", () => {
    expect(calculateProfessionalTax(0, "maharashtra")).toBe(0);
    expect(calculateProfessionalTax(9999, "maharashtra")).toBe(0);
    expect(calculateProfessionalTax(10000, "maharashtra")).toBe(0);
  });

  it("100 at the 15000 boundary (inclusive)", () => {
    expect(calculateProfessionalTax(10001, "maharashtra")).toBe(100);
    expect(calculateProfessionalTax(15000, "maharashtra")).toBe(100);
  });

  it("200 at the 20000 boundary (inclusive)", () => {
    expect(calculateProfessionalTax(15001, "maharashtra")).toBe(200);
    expect(calculateProfessionalTax(20000, "maharashtra")).toBe(200);
  });

  it("250 above the 20000 ceiling", () => {
    expect(calculateProfessionalTax(20001, "maharashtra")).toBe(250);
    expect(calculateProfessionalTax(100000, "maharashtra")).toBe(250);
    expect(calculateProfessionalTax(1000000, "maharashtra")).toBe(250);
  });
});

describe("calculateProfessionalTax (custom schedule)", () => {
  const karnatakaStyleSlabs = [
    { maxSalary: 7500, tax: 0 },
    { maxSalary: 10000, tax: 40 },
    { maxSalary: null, tax: 200 },
  ];

  it("uses the provided slabs instead of the default schedule", () => {
    expect(calculateProfessionalTaxFromConfig(5000, "karnataka", karnatakaStyleSlabs)).toBe(0);
    expect(calculateProfessionalTaxFromConfig(7500, "karnataka", karnatakaStyleSlabs)).toBe(0);
    expect(calculateProfessionalTaxFromConfig(7501, "karnataka", karnatakaStyleSlabs)).toBe(40);
    expect(calculateProfessionalTaxFromConfig(10000, "karnataka", karnatakaStyleSlabs)).toBe(40);
    expect(calculateProfessionalTaxFromConfig(10001, "karnataka", karnatakaStyleSlabs)).toBe(200);
    expect(calculateProfessionalTaxFromConfig(90000, "karnataka", karnatakaStyleSlabs)).toBe(200);
  });

  it("falls back to zero for an empty slab list", () => {
    expect(calculateProfessionalTax(50000, "maharashtra", [])).toBe(0);
  });
});
