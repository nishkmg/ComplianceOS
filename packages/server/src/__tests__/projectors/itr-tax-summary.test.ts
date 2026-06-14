import { describe, it, expect, vi } from "vitest";

vi.mock("../../../db/src/index", () => {
  const t = () =>
    new Proxy(
      {},
      { get: (_, p) => (p === "then" ? undefined : t()) },
    );
  return new Proxy(
    {},
    { get: (_, p) => (p === "then" || p === "db" ? undefined : t()) },
  );
});

import { itrTaxSummaryProjector } from "../../projectors/itr-tax-summary";

function createMockDb(results: any[][] = []): {
  db: any;
  inserts: any[];
  updates: any[];
  pushResult: (r: any[]) => void;
} {
  const inserts: any[] = [];
  const updates: any[] = [];
  const selectResults: any[][] = [...results];
  let selectIdx = 0;

  function q(): any {
    const self: any = {};
    self.limit = vi.fn(() => Promise.resolve(selectResults[selectIdx++] ?? []));
    self.innerJoin = vi.fn(() => self);
    self.orderBy = vi.fn(() => self);
    self.groupBy = vi.fn(() => self);
    self.where = vi.fn(() => self);
    self.then = vi.fn((r: any) =>
      Promise.resolve(selectResults[selectIdx++] ?? []).then(r),
    );
    self.catch = vi.fn();
    return self;
  }

  return {
    db: {
      insert: vi.fn((tbl: any) => ({
        values: vi.fn((vals: any) => ({
          onConflictDoUpdate: vi.fn((conf: any) => {
            inserts.push({ table: tbl, values: vals, conf });
          }),
        })),
      })),
      select: vi.fn(() => ({ from: vi.fn(() => q()) })),
      update: vi.fn((tbl: any) => ({
        set: vi.fn((vals: any) => {
          const qr: any = {};
          qr.where = vi.fn(() => {
            updates.push({ table: tbl, values: vals });
            return Promise.resolve();
          });
          return qr;
        }),
      })),
    },
    inserts,
    updates,
    pushResult: (r: any[]) => selectResults.push(r),
  };
}

const TENANT = "tenant-1";
const ACTOR = "actor-1";

describe("itr-tax-summary projector", () => {
  it("inserts tax summary on tax_computed event", async () => {
    const { db, inserts } = createMockDb([
      // First select: itrReturns
      [{
        id: "itr-1",
        financialYear: "2025-26",
        assessmentYear: "2026-27",
      }],
      // Second select: itrAnnualIncomeProjection
      [{
        salaryIncome: "800000",
        housePropertyIncome: "0",
        businessIncome: "0",
        capitalGains: "0",
        otherSources: "50000",
        totalDeductions: "150000",
        totalIncome: "700000",
      }],
    ]);

    await itrTaxSummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "itr-1",
      aggregateType: "itr_return",
      eventType: "tax_computed",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        itrReturnId: "itr-1",
        taxRegime: "new",
        taxOnTotalIncome: "65000",
        rebate87A: "0",
        surcharge: "0",
        cess: "2600",
        totalTaxPayable: "67600",
        tdsTcsCredit: "50000",
        advanceTaxPaid: "10000",
        balancePayable: "7600",
        computedAt: "2026-06-01T00:00:00Z",
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.itrReturnId).toBe("itr-1");
    expect(inserts[0].values.assessmentYear).toBe("2026-27");
    expect(inserts[0].values.financialYear).toBe("2025-26");
    expect(inserts[0].values.taxRegime).toBe("new");
    expect(inserts[0].values.taxOnTotalIncome).toBe("65000");
    expect(inserts[0].values.totalTaxPayable).toBe("67600");
    expect(inserts[0].values.tdsTcsCredit).toBe("50000");
    expect(inserts[0].values.advanceTaxPaid).toBe("10000");
    expect(inserts[0].values.balancePayable).toBe("7600");
    expect(inserts[0].values.salaryIncome).toBe("800000");
    expect(inserts[0].values.taxableIncome).toBe("700000");
    expect(inserts[0].values.refundDue).toBe("0");
  });

  it("computes refund when credits exceed tax payable", async () => {
    const { db, inserts } = createMockDb([
      [{ id: "itr-2", financialYear: "2025-26", assessmentYear: "2026-27" }],
      [{
        salaryIncome: "600000",
        totalDeductions: "100000",
        totalIncome: "500000",
      }],
    ]);

    await itrTaxSummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "itr-2",
      aggregateType: "itr_return",
      eventType: "tax_computed",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        itrReturnId: "itr-2",
        taxRegime: "old",
        taxOnTotalIncome: "25000",
        totalTaxPayable: "25000",
        tdsTcsCredit: "30000",
        advanceTaxPaid: "0",
        balancePayable: "0",
        computedAt: "2026-06-01T00:00:00Z",
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.refundDue).toBe("5000");
    expect(inserts[0].values.balancePayable).toBe("0");
  });

  it("updates self-assessment tax on self_assessment_tax_paid", async () => {
    const { db, updates } = createMockDb([
      // Select existing summary
      [{
        totalTaxPayable: "67600",
        advanceTaxPaid: "10000",
        tdsTcsCredit: "50000",
      }],
    ]);

    await itrTaxSummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "itr-1",
      aggregateType: "itr_return",
      eventType: "self_assessment_tax_paid",
      sequence: 2n,
      actorId: ACTOR,
      payload: {
        assessmentYear: "2026-27",
        amount: "5000",
      },
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].values.selfAssessmentTax).toBe("5000");
    expect(updates[0].values.balancePayable).toBe("2600");
    expect(updates[0].values.refundDue).toBe("0");
  });

  it("computes refund on self-assessment exceeding balance", async () => {
    const { db, updates } = createMockDb([
      [{ totalTaxPayable: "67600", advanceTaxPaid: "10000", tdsTcsCredit: "50000" }],
    ]);

    await itrTaxSummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "itr-1",
      aggregateType: "itr_return",
      eventType: "self_assessment_tax_paid",
      sequence: 2n,
      actorId: ACTOR,
      payload: { assessmentYear: "2026-27", amount: "10000" },
    });

    expect(updates[0].values.balancePayable).toBe("0");
    expect(updates[0].values.refundDue).toBe("2400");
  });

  it("derives FY from itrReturn on tax_computed", async () => {
    const { db, inserts } = createMockDb([
      [{ id: "itr-3", financialYear: "2024-25", assessmentYear: "2025-26" }],
      [{}],
    ]);

    await itrTaxSummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "itr-3",
      aggregateType: "itr_return",
      eventType: "tax_computed",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        itrReturnId: "itr-3",
        taxRegime: "new",
        computedAt: "2025-06-01T00:00:00Z",
      },
    });

    expect(inserts[0].values.financialYear).toBe("2024-25");
    expect(inserts[0].values.assessmentYear).toBe("2025-26");
  });
});
