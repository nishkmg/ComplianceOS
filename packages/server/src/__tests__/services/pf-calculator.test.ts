import { describe, it, expect } from "vitest";
import { calculatePF, calculatePFWithConfig } from "../../services/pf-calculator";

const DEFAULT_CONFIG = {
  pfErPercentage: 12,
  pfEePercentage: 12,
  epsPercentage: 8.33,
  pfWageCeiling: 15000,
};

describe("calculatePF", () => {
  it("applies 12% EE and 12% ER on gross below the wage ceiling", () => {
    const result = calculatePF(10000, DEFAULT_CONFIG);
    expect(result.ee).toBe(1200);
    expect(result.er).toBe(1200);
    expect(result.grossSalary).toBe(10000);
    expect(result.wageCeiling).toBe(15000);
  });

  it("computes EPS 8.33% uncapped on the wage base", () => {
    const result = calculatePF(10000, DEFAULT_CONFIG);
    expect(result.eps).toBe(833);
    expect(result.epf).toBe(367);
  });

  it("caps the PF wage at the ceiling when gross equals the ceiling", () => {
    const result = calculatePF(15000, DEFAULT_CONFIG);
    expect(result.ee).toBe(1800);
    expect(result.er).toBe(1800);
    expect(result.eps).toBe(1249.5);
    expect(result.epf).toBe(550.5);
  });

  it("caps the PF wage at the ceiling when gross exceeds the ceiling", () => {
    const result = calculatePF(50000, DEFAULT_CONFIG);
    expect(result.ee).toBe(1800);
    expect(result.er).toBe(1800);
    expect(result.eps).toBe(1249.5);
    expect(result.epf).toBe(550.5);
  });

  it("EPS stays below the 1250 cap at the default 8.33% rate on the ceiling wage", () => {
    const result = calculatePF(15000, DEFAULT_CONFIG);
    expect(result.eps).toBeLessThan(1250);
    expect(result.epf).toBeGreaterThan(0);
  });

  it("caps EPS at 1250 when a higher EPS rate would exceed it", () => {
    const result = calculatePF(15000, {
      ...DEFAULT_CONFIG,
      epsPercentage: 10,
    });
    expect(result.eps).toBe(1250);
    expect(result.epf).toBe(550);
  });

  it("returns all zeros for a zero gross salary", () => {
    const result = calculatePF(0, DEFAULT_CONFIG);
    expect(result.ee).toBe(0);
    expect(result.er).toBe(0);
    expect(result.eps).toBe(0);
    expect(result.epf).toBe(0);
    expect(result.wageCeiling).toBe(15000);
  });

  it("does not round fractional wages (raw float arithmetic)", () => {
    const result = calculatePF(12345.67, DEFAULT_CONFIG);
    expect(result.ee).toBeCloseTo(1481.4804, 6);
    expect(result.er).toBeCloseTo(1481.4804, 6);
    expect(result.eps).toBeCloseTo(1028.394311, 6);
    expect(result.epf).toBeCloseTo(453.086089, 6);
  });

  it("honors a custom wage ceiling while keeping the EPS base at 15000", () => {
    const result = calculatePF(18000, {
      ...DEFAULT_CONFIG,
      pfWageCeiling: 20000,
    });
    expect(result.ee).toBe(2160);
    expect(result.er).toBe(2160);
    expect(result.eps).toBe(1249.5);
    expect(result.epf).toBe(910.5);
  });
});

describe("calculatePFWithConfig", () => {
  it("falls back to statutory defaults when config is empty", () => {
    const result = calculatePFWithConfig(15000, {});
    expect(result.ee).toBe(1800);
    expect(result.er).toBe(1800);
    expect(result.eps).toBe(1249.5);
    expect(result.wageCeiling).toBe(15000);
  });

  it("normalizes string config values", () => {
    const result = calculatePFWithConfig(10000, {
      pfErPercentage: "12",
      pfEePercentage: "12",
      epsPercentage: "8.33",
      pfWageCeiling: "15000",
    });
    expect(result.ee).toBe(1200);
    expect(result.er).toBe(1200);
    expect(result.eps).toBe(833);
  });
});
