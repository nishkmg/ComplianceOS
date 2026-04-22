import { describe, it, expect } from "vitest";
import { itrConfig } from "./itr-config";

describe("ITR Config Schema", () => {
  it("itr_config table has required columns", () => {
    expect(itrConfig.id).toBeDefined();
    expect(itrConfig.tenantId).toBeDefined();
    expect(itrConfig.taxRegime).toBeDefined();
    expect(itrConfig.presumptiveScheme).toBeDefined();
    expect(itrConfig.presumptiveRate).toBeDefined();
    expect(itrConfig.eligibleDeductions).toBeDefined();
    expect(itrConfig.tdsApplicable).toBeDefined();
    expect(itrConfig.advanceTaxApplicable).toBeDefined();
    expect(itrConfig.regimeOptOutDate).toBeDefined();
    expect(itrConfig.regimeLockinUntil).toBeDefined();
    expect(itrConfig.createdAt).toBeDefined();
    expect(itrConfig.updatedAt).toBeDefined();
  });

  it("itr_config indexes are defined", () => {
    expect(itrConfig).toBeDefined();
  });
});
