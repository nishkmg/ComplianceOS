import { describe, it, expect } from "vitest";
import { narration, accountName, accountCode, amountString, reason, address, description } from "../helpers";

describe("narration()", () => {
  it("accepts valid narration", () => {
    expect(narration().parse("Payment for invoice #123")).toBe("Payment for invoice #123");
  });

  it("strips HTML tags", () => {
    expect(narration().parse("Payment <script>alert('xss')</script>")).toBe("Payment alert('xss')");
  });

  it("rejects empty narration", () => {
    expect(() => narration().parse("")).toThrow();
  });

  it("rejects narration over 1000 characters", () => {
    expect(() => narration().parse("a".repeat(1001))).toThrow();
  });

  it("accepts narration at exactly 1000 characters", () => {
    expect(narration().parse("a".repeat(1000))).toBe("a".repeat(1000));
  });

  it("strips nested HTML", () => {
    const result = narration().parse("<div><span>Test</span></div>");
    expect(result).toBe("Test");
  });
});

describe("accountName()", () => {
  it("accepts valid account name", () => {
    expect(accountName().parse("Cash in Hand")).toBe("Cash in Hand");
  });

  it("strips HTML tags", () => {
    expect(accountName().parse("Bank <b>Account</b>")).toBe("Bank Account");
  });

  it("rejects empty name", () => {
    expect(() => accountName().parse("")).toThrow();
  });

  it("rejects name over 200 characters", () => {
    expect(() => accountName().parse("a".repeat(201))).toThrow();
  });
});

describe("accountCode()", () => {
  it("accepts valid code", () => {
    expect(accountCode().parse("1000001")).toBe("1000001");
  });

  it("trims whitespace", () => {
    expect(accountCode().parse(" 10001 ")).toBe("10001");
  });

  it("rejects empty code", () => {
    expect(() => accountCode().parse("")).toThrow();
  });

  it("rejects code over 20 characters", () => {
    expect(() => accountCode().parse("1".repeat(21))).toThrow();
  });
});

describe("amountString()", () => {
  it("accepts whole numbers", () => {
    expect(amountString().parse("1000")).toBe("1000");
  });

  it("accepts decimals with 2 places", () => {
    expect(amountString().parse("1000.50")).toBe("1000.50");
  });

  it("accepts default value '0'", () => {
    expect(amountString().parse(undefined)).toBe("0");
  });

  it("rejects decimals with more than 2 places", () => {
    expect(() => amountString().parse("1000.123")).toThrow();
  });

  it("rejects negative amounts", () => {
    expect(() => amountString().parse("-100")).toThrow();
  });
});

describe("reason()", () => {
  it("accepts valid reason", () => {
    expect(reason().parse("Duplicate entry")).toBe("Duplicate entry");
  });

  it("strips HTML", () => {
    expect(reason().parse("<b>Duplicate</b>")).toBe("Duplicate");
  });

  it("rejects empty", () => {
    expect(() => reason().parse("")).toThrow();
  });

  it("rejects over 500 characters", () => {
    expect(() => reason().parse("a".repeat(501))).toThrow();
  });
});

describe("address()", () => {
  it("accepts valid address", () => {
    expect(address().parse("123 Main St, Bangalore")).toBe("123 Main St, Bangalore");
  });

  it("strips HTML", () => {
    expect(address().parse("<p>123 Main St</p>")).toBe("123 Main St");
  });

  it("rejects over 500 characters", () => {
    expect(() => address().parse("a".repeat(501))).toThrow();
  });

  it("accepts undefined/empty", () => {
    expect(address().parse(undefined)).toBe(undefined);
  });
});

describe("description()", () => {
  it("accepts valid description", () => {
    expect(description().parse("Office supplies")).toBe("Office supplies");
  });

  it("strips HTML", () => {
    expect(description().parse("Office <em>supplies</em>")).toBe("Office supplies");
  });

  it("accepts undefined", () => {
    expect(description().parse(undefined)).toBe(undefined);
  });
});
