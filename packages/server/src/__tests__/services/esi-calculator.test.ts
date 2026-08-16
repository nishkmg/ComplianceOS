import { describe, it, expect } from "vitest";
import { calculateESI, calculateESIWithConfig } from "../../services/esi-calculator";

const DEFAULT_CONFIG = {
  esiErPercentage: 3.25,
  esiEePercentage: 0.75,
  esiWageCeiling: 21000,
};

describe("calculateESI", () => {
  it("applies 0.75% EE and 3.25% ER below the ceiling", () => {
    const result = calculateESI(15000, DEFAULT_CONFIG);
    expect(result.ee).toBe(112.5);
    expect(result.er).toBe(487.5);
    expect(result.grossSalary).toBe(15000);
    expect(result.wageCeiling).toBe(21000);
  });

  it("applies ESI when gross exactly equals the ceiling", () => {
    const result = calculateESI(21000, DEFAULT_CONFIG);
    expect(result.ee).toBe(157.5);
    expect(result.er).toBe(682.5);
  });

  it("returns zero when gross exceeds the ceiling", () => {
    const result = calculateESI(21001, DEFAULT_CONFIG);
    expect(result.ee).toBe(0);
    expect(result.er).toBe(0);
    expect(result.grossSalary).toBe(21001);
  });

  it("returns zero for a zero gross salary", () => {
    const result = calculateESI(0, DEFAULT_CONFIG);
    expect(result.ee).toBe(0);
    expect(result.er).toBe(0);
  });

  it("respects the <= boundary: 21000 applies, one rupee more does not", () => {
    expect(calculateESI(21000, DEFAULT_CONFIG).ee).toBe(157.5);
    expect(calculateESI(21001, DEFAULT_CONFIG).ee).toBe(0);
  });

  it("honors a custom wage ceiling", () => {
    const result = calculateESI(25000, {
      ...DEFAULT_CONFIG,
      esiWageCeiling: 25000,
    });
    expect(result.ee).toBe(187.5);
    expect(result.er).toBe(812.5);
  });
});

describe("calculateESIWithConfig", () => {
  it("falls back to statutory defaults when config is empty", () => {
    const result = calculateESIWithConfig(15000, {});
    expect(result.ee).toBe(112.5);
    expect(result.er).toBe(487.5);
    expect(result.wageCeiling).toBe(21000);
  });

  it("normalizes string config values", () => {
    const result = calculateESIWithConfig(10000, {
      esiErPercentage: "3.25",
      esiEePercentage: "0.75",
      esiWageCeiling: "21000",
    });
    expect(result.ee).toBe(75);
    expect(result.er).toBe(325);
  });
});
