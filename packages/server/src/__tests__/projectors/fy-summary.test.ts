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

import { fySummaryProjector } from "../../projectors/fy-summary";

function createMockDb(results: any[][] = []): {
  db: any;
  inserts: any[];
  pushResult: (r: any[]) => void;
} {
  const inserts: any[] = [];
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
        values: vi.fn((vals: any) => {
          inserts.push({ table: tbl, values: vals });
          // thenable so `await db.insert(...).values(...)` settles
          return {
            onConflictDoUpdate: vi.fn(),
            then: vi.fn((r: any) => Promise.resolve({}).then(r)),
            catch: vi.fn(),
          };
        }),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
      select: vi.fn(() => ({ from: vi.fn(() => q()) })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
      })),
    },
    inserts,
    pushResult: (r: any[]) => selectResults.push(r),
  };
}

const TENANT = "tenant-1";
const ACTOR = "actor-1";

describe("fy-summary projector", () => {
  it("computes summary across account kinds", async () => {
    const { db, inserts } = createMockDb([
      // groupBy result: kind totals
      [
        { kind: "Revenue", total: "-50000" },
        { kind: "Expense", total: "30000" },
        { kind: "Asset", total: "200000" },
        { kind: "Liability", total: "-100000" },
        { kind: "Equity", total: "-50000" },
      ],
    ]);

    await fySummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "je-1",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { fiscalYear: "2026-27" },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.fiscalYear).toBe("2026-27");
    expect(inserts[0].values.totalRevenue).toBe("50000");
    expect(inserts[0].values.totalExpenses).toBe("30000");
    expect(inserts[0].values.netIncome).toBe("20000");
    expect(inserts[0].values.netProfit).toBe("20000");
    expect(inserts[0].values.totalAssets).toBe("200000");
    expect(inserts[0].values.totalLiabilities).toBe("100000");
    expect(inserts[0].values.totalEquity).toBe("50000");
    expect(inserts[0].values.retainedEarnings).toBe("70000");
    expect(inserts[0].values.closedAt).toBeNull();
  });

  it("separates summaries for different FYs", async () => {
    const { db, inserts, pushResult } = createMockDb();

    // FY 2025-26
    pushResult([
      { kind: "Revenue", total: "-40000" },
      { kind: "Expense", total: "25000" },
    ]);
    await fySummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "je-1",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { fiscalYear: "2025-26" },
    });

    // FY 2026-27
    pushResult([
      { kind: "Revenue", total: "-60000" },
      { kind: "Expense", total: "35000" },
    ]);
    await fySummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "je-2",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 2n,
      actorId: ACTOR,
      payload: { fiscalYear: "2026-27" },
    });

    expect(inserts).toHaveLength(2);
    expect(inserts[0].values.fiscalYear).toBe("2025-26");
    expect(inserts[0].values.netProfit).toBe("15000");
    expect(inserts[1].values.fiscalYear).toBe("2026-27");
    expect(inserts[1].values.netProfit).toBe("25000");
  });

  it("sets closedAt on fiscal_year_closed event", async () => {
    const { db, inserts } = createMockDb([
      [{ kind: "Revenue", total: "0" }],
    ]);

    await fySummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "fy-1",
      aggregateType: "fiscal_year",
      eventType: "fiscal_year_closed",
      sequence: 10n,
      actorId: ACTOR,
      payload: { year: "2025-26", closedAt: "2026-04-30T00:00:00Z" },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.fiscalYear).toBe("2025-26");
    expect(inserts[0].values.closedAt).toBeInstanceOf(Date);
  });

  it("handles zero revenue/expense gracefully", async () => {
    const { db, inserts } = createMockDb([
      [{ kind: "Asset", total: "100000" }],
    ]);

    await fySummaryProjector.process(db, {
      tenantId: TENANT,
      aggregateId: "je-empty",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { fiscalYear: "2026-27" },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.totalRevenue).toBe("0");
    expect(inserts[0].values.totalExpenses).toBe("0");
    expect(inserts[0].values.netIncome).toBe("0");
  });
});
