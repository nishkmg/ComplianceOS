import { eq, and, gt, max, sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { eventStore } from "@complianceos/db";

// Accept both the top-level DB and Drizzle transaction objects
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DbOrTx = Database | Tx;

export async function appendEvent(
  db: DbOrTx,
  tenantId: string,
  aggregateType: "journal_entry" | "account" | "fiscal_year",
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
