import { describe, it, expect } from "vitest";
import { getTableColumns } from "drizzle-orm";
import { accounts, accountTags, cashFlowDefaultMapping, accountCashFlowOverrides } from "../schema/accounts";

describe("accounts schema", () => {
  it("accounts has tenantId, code, name, kind, subType, isLeaf", () => {
    const cols = Object.keys(getTableColumns(accounts));
    expect(cols).toContain("tenantId");
    expect(cols).toContain("code");
    expect(cols).toContain("isLeaf");
  });

  it("cashFlowDefaultMapping is keyed on sub_type", () => {
    expect(cashFlowDefaultMapping).toBeDefined();
  });

  it("accountCashFlowOverrides has unique on tenant_id + account_id", () => {
    expect(accountCashFlowOverrides).toBeDefined();
  });
});
