import { eq, and, gt, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as schema from "../../../db/src/index";

const { eventStore } = schema;

// Accept both the top-level DB and Drizzle transaction objects
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbOrTx = Database | Tx;

/**
 * Append an event to the event store. Sequence allocation is atomic per
 * tenant (event_sequences counter) — concurrent appends never collide and
 * never silently drop events. The 23505 path below is a safety net only:
 * if a true duplicate insert somehow occurs (same aggregate + sequence +
 * eventType + payload), the existing event is returned.
 */
export async function appendEvent(
  db: DbOrTx,
  tenantId: string,
  aggregateType: "journal_entry" | "account" | "fiscal_year" | "invoice" | "credit_note" | "payment" | "payroll_run" | "salary_structure" | "employee_advance" | "gst_challan" | "gst_payment" | "gst_return" | "itr_return" | "purchase_bill",
  aggregateId: string,
  eventType: string,
  payload: Record<string, unknown>,
  actorId: string,
): Promise<{ id: string; sequence: bigint }> {
  // Sequence is global per tenant (cross-aggregate order must be defined —
  // projectors track a single per-tenant cursor; per-aggregate sequences
  // made payment_recorded/invoice_posted order arbitrary).
  //
  // Allocation is atomic: a single INSERT ... ON CONFLICT DO UPDATE ...
  // RETURNING on the event_sequences counter. The old MAX(sequence)+1
  // read-then-write raced — concurrent appends computed the same sequence,
  // and the naive 23505 fallback returned the OTHER command's event,
  // silently dropping ours (projectors never fired for it). The 23505 path
  // below remains as a safety net for true duplicate retries only.
  const counter = await db
    .insert(schema.eventSequences)
    .values({ tenantId, lastSequence: 1n })
    .onConflictDoUpdate({
      target: schema.eventSequences.tenantId,
      set: { lastSequence: sql`${schema.eventSequences.lastSequence} + 1` },
    })
    .returning({ lastSequence: schema.eventSequences.lastSequence });
  const nextSequence = counter[0].lastSequence;

  try {
    const result = await db.insert(eventStore).values({
      tenantId,
      aggregateType,
      aggregateId,
      eventType: eventType as any,
      payload,
      sequence: nextSequence,
      actorId,
    }).returning({ id: eventStore.id, sequence: eventStore.sequence });

    return result[0];
  } catch (err: unknown) {
    // drizzle wraps the driver PostgresError ("Failed query: insert into…")
    // with the real error on `cause` — check both surfaces.
    const pgErr = err as { code?: string; cause?: { code?: string } };
    const code = pgErr?.code ?? pgErr?.cause?.code;
    if (code === '23505') {
      const existing = await db
        .select({ id: eventStore.id, sequence: eventStore.sequence, aggregateId: eventStore.aggregateId, eventType: eventStore.eventType, payload: eventStore.payload })
        .from(eventStore)
        .where(
          and(
            eq(eventStore.tenantId, tenantId),
            eq(eventStore.sequence, nextSequence),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        const row = existing[0];
        if (
          row.aggregateId === aggregateId &&
          row.eventType === eventType &&
          JSON.stringify(row.payload) === JSON.stringify(payload)
        ) {
          // True idempotent retry of the same event — safe to return.
          return { id: row.id, sequence: row.sequence };
        }
      }
    }
    throw err;
  }
}

export async function getAggregateEvents(
  db: DbOrTx,
  aggregateId: string,
  afterSequence: bigint = 0n,
) {
  return db.select().from(eventStore).where(
    and(
      eq(eventStore.aggregateId, aggregateId),
      gt(eventStore.sequence, afterSequence),
    ),
  ).orderBy(eventStore.sequence);
}
