import { describe, it, expect } from "vitest";
import {
  businessTypeEnum, stateEnum, industryEnum,
  accountKindEnum, jeStatusEnum, eventTypeEnum,
} from "../schema/enums";

describe("Enums match spec", () => {
  it("businessTypeEnum has 6 values", () => {
    expect(businessTypeEnum.enumValues).toHaveLength(6);
  });

  it("stateEnum has 36 values", () => {
    expect(stateEnum.enumValues).toHaveLength(36);
  });

  it("industryEnum has 5 values", () => {
    expect(industryEnum.enumValues).toHaveLength(5);
  });

  it("accountKindEnum has Asset, Liability, Equity, Revenue, Expense", () => {
    expect(accountKindEnum.enumValues).toContain("Asset");
    expect(accountKindEnum.enumValues).toContain("Liability");
    expect(accountKindEnum.enumValues).toContain("Equity");
    expect(accountKindEnum.enumValues).toContain("Revenue");
    expect(accountKindEnum.enumValues).toContain("Expense");
  });

  it("jeStatusEnum is draft, posted, voided", () => {
    expect(jeStatusEnum.enumValues).toEqual(["draft", "posted", "voided"]);
  });

  it("eventTypeEnum includes all lifecycle events", () => {
    const vals = eventTypeEnum.enumValues;
    expect(vals).toContain("journal_entry_created");
    expect(vals).toContain("journal_entry_posted");
    expect(vals).toContain("journal_entry_voided");
    expect(vals).toContain("narration_corrected");
  });
});
