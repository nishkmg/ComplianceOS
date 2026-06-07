import { describe, it, expect } from "vitest";
import { getCurrentFiscalYear } from "./fiscal-year";

describe("getCurrentFiscalYear", () => {
  it("returns 2026-27 on 2026-04-01 (FY start)", () => {
    expect(getCurrentFiscalYear(new Date(2026, 3, 1))).toBe("2026-27");
  });

  it("returns 2026-27 on 2027-03-31 (FY end)", () => {
    expect(getCurrentFiscalYear(new Date(2027, 2, 31))).toBe("2026-27");
  });

  it("returns 2027-28 on 2027-04-01 (next FY start)", () => {
    expect(getCurrentFiscalYear(new Date(2027, 3, 1))).toBe("2027-28");
  });

  it("returns 2026-27 mid-year (2026-06-06)", () => {
    expect(getCurrentFiscalYear(new Date(2026, 5, 6))).toBe("2026-27");
  });

  it("returns 2025-26 for date before April (2026-02-15)", () => {
    expect(getCurrentFiscalYear(new Date(2026, 1, 15))).toBe("2025-26");
  });
});
