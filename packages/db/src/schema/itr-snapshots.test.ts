import { describe, it, expect } from "vitest";
import { itrSnapshots } from "./itr-snapshots";

describe("ITR Snapshots Schema", () => {
  it("itr_snapshots table has required columns", () => {
    expect(itrSnapshots.id).toBeDefined();
    expect(itrSnapshots.tenantId).toBeDefined();
    expect(itrSnapshots.returnId).toBeDefined();
    expect(itrSnapshots.financialYear).toBeDefined();
    expect(itrSnapshots.snapshotType).toBeDefined();
    expect(itrSnapshots.snapshotData).toBeDefined();
    expect(itrSnapshots.generatedAt).toBeDefined();
  });
});
