import { eq, and, gt, max, sql } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as schema from "../../../db/src/index";

const { eventStore } = schema;

// Accept both the top-level DB and Drizzle transaction objects
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbOrTx = Database | Tx;

/**
 * Append an event to the event store, computing the next sequence number
 * for the given aggregate. Idempotent: if called via retry and the event
 * was already appended (detected by unique constraint on aggregateId + sequence),
 * the existing event is returned instead of creating a duplicate.
 */
export async function appendEvent(
  db: DbOrTx,
  tenantId: string,
  aggregateType: "journal_entry" | "account" | "fiscal_year" | "invoice" | "credit_note" | "payment" | "payroll_run" | "salary_structure" | "employee_advance" | "gst_challan" | "gst_payment" | "gst_return" | "itr_return",
  aggregateId: string,
  eventType: string,
  payload: Record<string, unknown>,
  actorId: string,
): Promise<{ id: string; sequence: bigint }> {
  // Compute next sequence for this aggregate (sequence per aggregate)
  const maxResult = await db
    .select({ maxSeq: max(eventStore.sequence) })
    .from(eventStore)
    .where(eq(eventStore.aggregateId, aggregateId));
  const nextSequence = (maxResult[0]?.maxSeq ?? 0n) + 1n;

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
    // If unique constraint on (aggregate_id, sequence) was violated,
    // a retry tried to re-append the same sequence. Return existing event.
    const pgErr = err as { code?: string };
    if (pgErr?.code === '23505') {
      const existing = await db
        .select({ id: eventStore.id, sequence: eventStore.sequence })
        .from(eventStore)
        .where(
          and(
            eq(eventStore.aggregateId, aggregateId),
            eq(eventStore.sequence, nextSequence),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        return existing[0];
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
