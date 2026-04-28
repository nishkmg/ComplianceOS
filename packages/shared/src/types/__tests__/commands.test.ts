import { describe, it, expect } from "vitest";
import {
  CreateJournalEntryInputSchema,
  PostJournalEntryInputSchema,
  VoidJournalEntryInputSchema,
  ModifyJournalEntryInputSchema,
  CreateAccountInputSchema,
} from "../commands";

describe("CreateJournalEntryInputSchema", () => {
  const validEntry = {
    date: "2026-04-01",
    narration: "Payment to vendor",
    lines: [
      { accountId: "00000000-0000-0000-0000-000000000001", debit: "1000" },
      { accountId: "00000000-0000-0000-0000-000000000002", credit: "1000" },
    ],
  };

  it("accepts valid journal entry", () => {
    const result = CreateJournalEntryInputSchema.parse(validEntry);
    expect(result.date).toBe("2026-04-01");
    expect(result.lines).toHaveLength(2);
  });

  it("defaults referenceType to manual", () => {
    const result = CreateJournalEntryInputSchema.parse(validEntry);
    expect(result.referenceType).toBe("manual");
  });

  it("rejects unbalanced entry", () => {
    expect(() =>
      CreateJournalEntryInputSchema.parse({
        ...validEntry,
        lines: [
          { accountId: "00000000-0000-0000-0000-000000000001", debit: "1000" },
          { accountId: "00000000-0000-0000-0000-000000000002", credit: "500" },
        ],
      }),
    ).toThrow("Total debits must equal total credits");
  });

  it("rejects single line entry", () => {
    expect(() =>
      CreateJournalEntryInputSchema.parse({
        ...validEntry,
        lines: [{ accountId: "00000000-0000-0000-0000-000000000001", debit: "1000" }],
      }),
    ).toThrow();
  });

  it("rejects invalid date", () => {
    expect(() =>
      CreateJournalEntryInputSchema.parse({
        ...validEntry,
        date: "not-a-date",
      }),
    ).toThrow();
  });

  it("rejects empty narration", () => {
    expect(() =>
      CreateJournalEntryInputSchema.parse({
        ...validEntry,
        narration: "",
      }),
    ).toThrow();
  });

  it("rejects debit with non-numeric value", () => {
    expect(() =>
      CreateJournalEntryInputSchema.parse({
        ...validEntry,
        lines: [
          { accountId: "00000000-0000-0000-0000-000000000001", debit: "abc" },
          { accountId: "00000000-0000-0000-0000-000000000002", credit: "1000" },
        ],
      }),
    ).toThrow();
  });
});

describe("PostJournalEntryInputSchema", () => {
  it("accepts valid entryId", () => {
    const result = PostJournalEntryInputSchema.parse({
      entryId: "00000000-0000-0000-0000-000000000001",
    });
    expect(result.entryId).toBe("00000000-0000-0000-0000-000000000001");
  });

  it("rejects invalid UUID", () => {
    expect(() =>
      PostJournalEntryInputSchema.parse({ entryId: "not-a-uuid" }),
    ).toThrow();
  });
});

describe("VoidJournalEntryInputSchema", () => {
  it("accepts valid void input", () => {
    const result = VoidJournalEntryInputSchema.parse({
      entryId: "00000000-0000-0000-0000-000000000001",
      reason: "Wrong entry",
    });
    expect(result.reason).toBe("Wrong entry");
  });

  it("rejects empty reason", () => {
    expect(() =>
      VoidJournalEntryInputSchema.parse({
        entryId: "00000000-0000-0000-0000-000000000001",
        reason: "",
      }),
    ).toThrow();
  });

});

describe("ModifyJournalEntryInputSchema", () => {
  const validModify = {
    entryId: "00000000-0000-0000-0000-000000000001",
    narration: "Updated narration",
  };

  it("accepts partial update with just narration", () => {
    const result = ModifyJournalEntryInputSchema.parse(validModify);
    expect(result.narration).toBe("Updated narration");
  });

  it("accepts empty object (no fields to update)", () => {
    const result = ModifyJournalEntryInputSchema.parse({
      entryId: "00000000-0000-0000-0000-000000000001",
    });
    expect(result.entryId).toBeDefined();
  });

  it("validates balanced lines when provided", () => {
    expect(() =>
      ModifyJournalEntryInputSchema.parse({
        ...validModify,
        lines: [
          { accountId: "00000000-0000-0000-0000-000000000001", debit: "500" },
          { accountId: "00000000-0000-0000-0000-000000000002", credit: "200" },
        ],
      }),
    ).toThrow("Total debits must equal total credits");
  });
});

describe("CreateAccountInputSchema", () => {
  const validAccount = {
    code: "1000001",
    name: "Cash in Hand",
    kind: "Asset" as const,
    subType: "Cash" as const,
  };

  it("accepts valid account", () => {
    const result = CreateAccountInputSchema.parse(validAccount);
    expect(result.code).toBe("1000001");
    expect(result.reconciliationAccount).toBe("none");
  });

  it("rejects empty code", () => {
    expect(() =>
      CreateAccountInputSchema.parse({ ...validAccount, code: "" }),
    ).toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      CreateAccountInputSchema.parse({ ...validAccount, name: "" }),
    ).toThrow();
  });

  it("rejects invalid kind", () => {
    expect(() =>
      CreateAccountInputSchema.parse({ ...validAccount, kind: "Invalid" }),
    ).toThrow();
  });

  it("rejects invalid subType", () => {
    expect(() =>
      CreateAccountInputSchema.parse({
        ...validAccount,
        subType: "InvalidSubType",
      }),
    ).toThrow();
  });
});
