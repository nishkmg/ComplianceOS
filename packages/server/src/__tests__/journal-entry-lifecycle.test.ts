import { describe, it, expect } from "vitest";
import { validateBalance } from "../lib/balance-validator";

describe("Balance Validator", () => {
  it("accepts balanced entries", () => {
    const result = validateBalance([
      { debit: "100.00", credit: "0.00" },
      { debit: "0.00", credit: "100.00" },
    ]);
    expect(result.valid).toBe(true);
    expect(result.totalDebit).toBe(100);
    expect(result.totalCredit).toBe(100);
  });

  it("rejects unbalanced entries", () => {
    const result = validateBalance([
      { debit: "100.00", credit: "0.00" },
      { debit: "0.00", credit: "50.00" },
    ]);
    expect(result.valid).toBe(false);
  });

  it("handles empty debit/credit as zero", () => {
    const result = validateBalance([
      { debit: "", credit: "" },
    ]);
    expect(result.valid).toBe(true);
    expect(result.totalDebit).toBe(0);
    expect(result.totalCredit).toBe(0);
  });

  it("handles missing debit/credit as zero", () => {
    const result = validateBalance([
      { debit: "0.00", credit: "0.00" },
    ]);
    expect(result.valid).toBe(true);
  });

  it("handles decimal amounts correctly", () => {
    const result = validateBalance([
      { debit: "33.33", credit: "0.00" },
      { debit: "33.33", credit: "0.00" },
      { debit: "33.34", credit: "0.00" },
      { debit: "0.00", credit: "100.00" },
    ]);
    expect(result.valid).toBe(true);
    expect(result.totalDebit).toBeCloseTo(100);
    expect(result.totalCredit).toBeCloseTo(100);
  });

  it("rejects entries with floating point drift above threshold", () => {
    // 0.02 drift exceeds the 0.01 threshold
    const result = validateBalance([
      { debit: "100.02", credit: "0.00" },
      { debit: "0.00", credit: "100.00" },
    ]);
    expect(result.valid).toBe(false);
  });
});

describe("CreateJournalEntry command", () => {
  it("rejects unbalanced journal entry lines", () => {
    const result = validateBalance([
      { debit: "100", credit: "0" },
      { debit: "0", credit: "50" },
    ]);
    expect(result.valid).toBe(false);
  });
});
