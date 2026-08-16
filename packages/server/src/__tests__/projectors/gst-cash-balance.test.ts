import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, gstCashLedger, tenants, users, userTenants } from "../../../../db/src/index";
import { eq, and, asc, like } from "drizzle-orm";
import { randomUUID } from "crypto";
import { gstCashBalanceProjector } from "../../projectors/gst-cash-balance";

const stamp = randomUUID().slice(0, 8);

interface FixtureEvent {
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

function makeEvents(actorId: string): FixtureEvent[] {
  const challanId = randomUUID();
  const paymentId = randomUUID();
  const refundId = randomUUID();
  return [
    {
      eventType: "gst_challan_created",
      aggregateId: challanId,
      payload: {
        aggregateId: challanId,
        fiscalYear: "2026-27",
        challan: {
          date: "2026-07-01",
          challanNumber: "CH-001",
          bankName: "SBI",
          payments: [
            { taxType: "igst", amount: "10000" },
            { taxType: "cgst", amount: "5000" },
          ],
        },
      },
    },
    {
      eventType: "gst_payment_made",
      aggregateId: paymentId,
      payload: {
        aggregateId: paymentId,
        fiscalYear: "2026-27",
        payment: {
          date: "2026-07-05",
          paymentNumber: "PAY-001",
          paymentMode: "cash",
          bankName: "SBI",
          challanNumber: "CH-001",
          igstAmount: "6000",
          cgstAmount: "3000",
          interestAmount: "1200",
          penaltyAmount: "500",
        },
      },
    },
    {
      eventType: "gst_refund_claimed",
      aggregateId: refundId,
      payload: {
        aggregateId: refundId,
        fiscalYear: "2026-27",
        refund: {
          date: "2026-07-10",
          refundNumber: "RF-001",
          reason: "Excess payment",
          igstAmount: "500",
        },
      },
    },
  ];
}

function ledgerProjection(rows: any[]) {
  return rows
    .map((r) => ({
      taxType: r.taxType,
      transactionType: r.transactionType,
      amount: Number(r.amount),
      balance: Number(r.balance),
      referenceType: r.referenceType,
      referenceId: r.referenceId,
    }))
    .sort((a, b) =>
      `${a.taxType}|${a.referenceType}|${a.referenceId}|${a.amount}`.localeCompare(
        `${b.taxType}|${b.referenceType}|${b.referenceId}|${b.amount}`,
      ),
    );
}

describe("gst-cash-balance projector (replay idempotency)", () => {
  let tenantId: string;
  let actorId: string;

  beforeEach(async () => {
    tenantId = randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      name: `GCB Test ${stamp}`,
      pan: `AAAGCB${stamp.toUpperCase()}P`,
      address: "Test Address",
      state: "karnataka",
      stateCode: "29",
    });
    actorId = randomUUID();
    await db.insert(users).values({ id: actorId, email: `gcb-${stamp}-${tenantId.slice(0, 6)}@example.com` });
    await db.insert(userTenants).values({ userId: actorId, tenantId, role: "owner" });
  });

  afterEach(async () => {
    await db.delete(gstCashLedger).where(eq(gstCashLedger.tenantId, tenantId));
    await db.delete(userTenants).where(eq(userTenants.tenantId, tenantId));
    await db.delete(users).where(like(users.email, `gcb-${stamp}-%`));
    await db.delete(tenants).where(eq(tenants.id, tenantId));
  });

  async function run(events: FixtureEvent[]) {
    for (const e of events) {
      await gstCashBalanceProjector.process(db, {
        tenantId,
        aggregateId: e.aggregateId,
        aggregateType: "gst_payment",
        eventType: e.eventType,
        sequence: 1n,
        actorId,
        createdBy: actorId,
        payload: e.payload,
      });
    }
  }

  async function readLedger() {
    const rows = await db.select()
      .from(gstCashLedger)
      .where(eq(gstCashLedger.tenantId, tenantId))
      .orderBy(
        asc(gstCashLedger.taxType),
        asc(gstCashLedger.transactionDate),
        asc(gstCashLedger.amount),
      );
    return ledgerProjection(rows);
  }

  it("replay produces identical rows; interest/penalty sit in their own buckets", async () => {
    const events = makeEvents(actorId);

    await run(events);
    const afterFirst = await readLedger();
    const igstRowsAfterFirst = afterFirst.filter((r) => r.taxType === "igst");

    expect(igstRowsAfterFirst.map((r) => r.amount)).toEqual([10000, -6000, -500]);
    expect(igstRowsAfterFirst.map((r) => r.balance)).toEqual([10000, 4000, 3500]);

    const interest = afterFirst.filter((r) => r.taxType === "interest");
    const penalty = afterFirst.filter((r) => r.taxType === "penalty");
    expect(interest).toHaveLength(1);
    expect(interest[0].amount).toBe(-1200);
    expect(interest[0].balance).toBe(-1200);
    expect(penalty).toHaveLength(1);
    expect(penalty[0].amount).toBe(-500);
    expect(penalty[0].balance).toBe(-500);

    expect(afterFirst.some((r) => r.taxType === "igst" && r.amount === -1200)).toBe(false);
    expect(afterFirst.some((r) => r.taxType === "igst" && r.amount === -500 && r.referenceType === "gst_payment")).toBe(false);

    await run(events);
    const afterReplay = await readLedger();

    expect(afterReplay).toEqual(afterFirst);
  });

  it("replaying in a different event order yields the same rows", async () => {
    const events = makeEvents(actorId);

    await run(events);
    const afterFirst = await readLedger();

    await run([...events].reverse());
    const afterReverseReplay = await readLedger();

    expect(afterReverseReplay).toEqual(afterFirst);
    expect(afterReverseReplay).toHaveLength(7);
  });
});
