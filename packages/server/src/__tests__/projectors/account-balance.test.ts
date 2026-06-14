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

import { accountBalanceProjector } from "../../projectors/account-balance";

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
      update: vi.fn(() => ({
        set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
      })),
    },
    inserts,
    updates,
    pushResult: (r: any[]) => selectResults.push(r),
  };
}

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const ACTOR = "actor-1";

describe("account-balance projector", () => {
  it("updates running balance on journal entry posted", async () => {
    const { db, inserts } = createMockDb([
      // First select: journal entry lines
      [
        { accountId: "acct-1", debit: "100", credit: "0" },
        { accountId: "acct-2", debit: "0", credit: "100" },
      ],
      // Second select: journal entry
      [{ id: "je-1", fiscalYear: "2026-27", date: "2026-04-01" }],
    ]);

    await accountBalanceProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "je-1",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { journalEntryId: "je-1" },
    });

    expect(inserts).toHaveLength(2);
    expect(inserts[0].values.accountId).toBe("acct-1");
    expect(inserts[0].values.debitTotal).toBe("100");
    expect(inserts[0].values.creditTotal).toBe("0");
    expect(inserts[0].values.closingBalance).toBe("100");
    expect(inserts[0].values.fiscalYear).toBe("2026-27");
    expect(inserts[0].values.period).toBe("2026-04");

    expect(inserts[1].values.accountId).toBe("acct-2");
    expect(inserts[1].values.debitTotal).toBe("0");
    expect(inserts[1].values.creditTotal).toBe("100");
    expect(inserts[1].values.closingBalance).toBe("-100");
  });

  it("treats voided entry as negative sign", async () => {
    const { db, inserts } = createMockDb([
      [{ accountId: "acct-1", debit: "100", credit: "0" }],
      [{ id: "je-1", fiscalYear: "2026-27", date: "2026-04-01" }],
    ]);

    await accountBalanceProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "je-1",
      aggregateType: "journal_entry",
      eventType: "journal_entry_voided",
      sequence: 2n,
      actorId: ACTOR,
      payload: { journalEntryId: "je-1" },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.debitTotal).toBe("-100");
    expect(inserts[0].values.creditTotal).toBe("0");
    expect(inserts[0].values.closingBalance).toBe("-100");
  });

  it("enforces tenant isolation", async () => {
    const {
      db,
      inserts,
      pushResult,
    } = createMockDb();

    // Tenant A JE
    pushResult([{ accountId: "acct-1", debit: "100", credit: "0" }]);
    pushResult([{ id: "je-a", fiscalYear: "2026-27", date: "2026-04-01" }]);

    await accountBalanceProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "je-a",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { journalEntryId: "je-a" },
    });

    // Tenant B JE
    pushResult([{ accountId: "acct-1", debit: "200", credit: "0" }]);
    pushResult([{
      id: "je-b",
      fiscalYear: "2026-27",
      date: "2026-04-01",
    }]);

    await accountBalanceProjector.process(db, {
      tenantId: TENANT_B,
      aggregateId: "je-b",
      aggregateType: "journal_entry",
      eventType: "journal_entry_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: { journalEntryId: "je-b" },
    });

    expect(inserts).toHaveLength(2);
    expect(inserts[0].values.tenantId).toBe(TENANT_A);
    expect(inserts[1].values.tenantId).toBe(TENANT_B);
    expect(inserts[0].values.debitTotal).toBe("100");
    expect(inserts[1].values.debitTotal).toBe("200");
  });
});
