import { describe, it, expect } from "vitest";
import { itrFieldMappings } from "./itr-mappings";

describe("ITR Mappings Schema", () => {
  it("itr_field_mappings table has required columns", () => {
    expect(itrFieldMappings.id).toBeDefined();
    expect(itrFieldMappings.returnType).toBeDefined();
    expect(itrFieldMappings.fieldCode).toBeDefined();
    expect(itrFieldMappings.fieldName).toBeDefined();
    expect(itrFieldMappings.description).toBeDefined();
    expect(itrFieldMappings.sourceTable).toBeDefined();
    expect(itrFieldMappings.sourceField).toBeDefined();
    expect(itrFieldMappings.calculationLogic).toBeDefined();
  });
});
