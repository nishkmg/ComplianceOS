import { describe, it, expect } from "vitest";
import {
  businessTypeEnum,
  stateEnum,
  industryEnum,
  gstRegistrationEnum,
  roleEnum,
  moduleEnum,
  setByEnum,
  accountKindEnum,
  accountSubTypeEnum,
  tagEnum,
  reconciliationAccountEnum,
  referenceTypeEnum,
  jeStatusEnum,
  aggregateTypeEnum,
  eventTypeEnum,
  cashFlowCategoryEnum,
  fyStatusEnum,
} from "../schema/enums";

describe("enums", () => {
  // Business Types: 6
  it("businessTypeEnum has 6 values", () => {
    expect(businessTypeEnum.enumValues).toHaveLength(6);
    expect(businessTypeEnum.enumValues).toEqual([
      "sole_proprietorship",
      "partnership",
      "llp",
      "private_limited",
      "public_limited",
      "huf",
    ]);
  });

  // States: 36
  it("stateEnum has 36 values", () => {
    expect(stateEnum.enumValues).toHaveLength(36);
  });

  // Industries: 5
  it("industryEnum has 5 values", () => {
    expect(industryEnum.enumValues).toHaveLength(5);
    expect(industryEnum.enumValues).toEqual([
      "retail_trading",
      "manufacturing",
      "services_professional",
      "freelancer_consultant",
      "regulated_professional",
    ]);
  });

  // GST Registration: 3
  it("gstRegistrationEnum has 3 values", () => {
    expect(gstRegistrationEnum.enumValues).toHaveLength(3);
  });

  // Roles: 4
  it("roleEnum has 4 values", () => {
    expect(roleEnum.enumValues).toHaveLength(4);
  });

  // Modules: 7
  it("moduleEnum has 7 values", () => {
    expect(moduleEnum.enumValues).toHaveLength(7);
  });

  // Set By: 2
  it("setByEnum has 2 values", () => {
    expect(setByEnum.enumValues).toHaveLength(2);
  });

  // Account Kinds: 5
  it("accountKindEnum has 5 values", () => {
    expect(accountKindEnum.enumValues).toHaveLength(5);
  });

  // Account Sub Types: 14
  it("accountSubTypeEnum has 14 values", () => {
    expect(accountSubTypeEnum.enumValues).toHaveLength(14);
  });

  // Tags: 14
  it("tagEnum has 14 values", () => {
    expect(tagEnum.enumValues).toHaveLength(14);
  });

  // Reconciliation Account: 2
  it("reconciliationAccountEnum has 2 values", () => {
    expect(reconciliationAccountEnum.enumValues).toHaveLength(2);
  });

  // Reference Types: 8
  it("referenceTypeEnum has 8 values", () => {
    expect(referenceTypeEnum.enumValues).toHaveLength(8);
  });

  // JE Status: 3 (draft, posted, voided)
  it("jeStatusEnum has 3 values", () => {
    expect(jeStatusEnum.enumValues).toHaveLength(3);
    expect(jeStatusEnum.enumValues).toEqual(["draft", "posted", "voided"]);
  });

  // Aggregate Types: 3
  it("aggregateTypeEnum has 3 values", () => {
    expect(aggregateTypeEnum.enumValues).toHaveLength(3);
  });

  // Event Types: 12
  it("eventTypeEnum has 12 values", () => {
    expect(eventTypeEnum.enumValues).toHaveLength(12);
  });

  // Cash Flow Categories: 3
  it("cashFlowCategoryEnum has 3 values", () => {
    expect(cashFlowCategoryEnum.enumValues).toHaveLength(3);
  });

  // FY Status: 2
  it("fyStatusEnum has 2 values", () => {
    expect(fyStatusEnum.enumValues).toHaveLength(2);
  });
});
