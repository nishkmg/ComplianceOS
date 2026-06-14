import { describe, it, expect, vi } from "vitest";

vi.mock("../../../db/src/index", () => {
  const t = () =>
    new Proxy(
      {},
      {
        get: (_, p) => (p === "then" ? undefined : t()),
      },
    );
  return new Proxy(
    {},
    {
      get: (_, p) => (p === "then" || p === "db" ? undefined : t()),
    },
  );
});

import { inventoryValuationProjector } from "../../projectors/inventory-valuation";

function createMockDb(): {
  db: any;
  inserts: any[];
  updates: any[];
} {
  const inserts: any[] = [];
  const updates: any[] = [];
  const selectResults: any[][] = [];
  let selectIdx = 0;

  function q(): any {
    const self: any = {};
    self.limit = vi.fn(() => Promise.resolve(selectResults[selectIdx++] ?? []));
    self.innerJoin = vi.fn(() => self);
    self.orderBy = vi.fn(() => self);
    self.groupBy = vi.fn(() => self);
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
  };
}

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const ACTOR = "actor-1";
const PROD = "product-1";

describe("inventory-valuation projector", () => {
  it("updates valuation on purchase", async () => {
    const { db, inserts } = createMockDb();

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "purchase-1",
      aggregateType: "invoice",
      eventType: "purchase_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        purchase: {
          lines: [{ productId: PROD, quantity: "10", unitPrice: "100" }],
        },
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.tenantId).toBe(TENANT_A);
    expect(inserts[0].values.productId).toBe(PROD);
    expect(inserts[0].values.quantityOnHand).toBe("10");
    expect(inserts[0].values.totalValue).toBe("1000");
  });

  it("updates valuation on sale (FIFO cost flow)", async () => {
    const { db, inserts } = createMockDb();

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "invoice-1",
      aggregateType: "invoice",
      eventType: "invoice_posted",
      sequence: 2n,
      actorId: ACTOR,
      payload: {
        invoice: {
          lines: [{ productId: PROD, quantity: "5", unitPrice: "150" }],
        },
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.quantityOnHand).toBe("-5");
    expect(inserts[0].values.totalValue).toBe("-750");
  });

  it("is idempotent on replay", async () => {
    const { db, inserts } = createMockDb();
    const event = {
      tenantId: TENANT_A,
      aggregateId: "purchase-2",
      aggregateType: "invoice",
      eventType: "purchase_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        purchase: {
          lines: [{ productId: PROD, quantity: "10", unitPrice: "100" }],
        },
      },
    };

    await inventoryValuationProjector.process(db, event);
    await inventoryValuationProjector.process(db, event);

    expect(inserts).toHaveLength(2);
    const { updatedAt: _, ...rest0 } = inserts[0].values;
    const { updatedAt: __, ...rest1 } = inserts[1].values;
    expect(rest0).toEqual(rest1);
    expect(inserts[0].conf.target).toEqual(inserts[1].conf.target);
  });

  it("reverses on voided purchase", async () => {
    const { db, inserts } = createMockDb();

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "purchase-1",
      aggregateType: "invoice",
      eventType: "purchase_voided",
      sequence: 2n,
      actorId: ACTOR,
      payload: {
        purchase: {
          lines: [{ productId: PROD, quantity: "10", unitPrice: "100" }],
        },
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.quantityOnHand).toBe("-10");
    expect(inserts[0].values.totalValue).toBe("-1000");
  });

  it("reverses on voided invoice", async () => {
    const { db, inserts } = createMockDb();

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "invoice-1",
      aggregateType: "invoice",
      eventType: "invoice_voided",
      sequence: 3n,
      actorId: ACTOR,
      payload: {
        invoice: {
          lines: [{ productId: PROD, quantity: "5", unitPrice: "150" }],
        },
      },
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0].values.quantityOnHand).toBe("5");
    expect(inserts[0].values.totalValue).toBe("750");
  });

  it("respects tenant isolation", async () => {
    const { db, inserts } = createMockDb();

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_A,
      aggregateId: "purchase-1",
      aggregateType: "invoice",
      eventType: "purchase_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        purchase: {
          lines: [{ productId: PROD, quantity: "10", unitPrice: "100" }],
        },
      },
    });

    await inventoryValuationProjector.process(db, {
      tenantId: TENANT_B,
      aggregateId: "purchase-2",
      aggregateType: "invoice",
      eventType: "purchase_posted",
      sequence: 1n,
      actorId: ACTOR,
      payload: {
        purchase: {
          lines: [{ productId: PROD, quantity: "20", unitPrice: "50" }],
        },
      },
    });

    expect(inserts).toHaveLength(2);
    expect(inserts[0].values.tenantId).toBe(TENANT_A);
    expect(inserts[1].values.tenantId).toBe(TENANT_B);
    expect(inserts[0].values.quantityOnHand).toBe("10");
    expect(inserts[1].values.quantityOnHand).toBe("20");
  });
});
