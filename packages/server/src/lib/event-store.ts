import { eq, and, gt } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { eventStore } from "@complianceos/db";

export async function appendEvent(
  db: Database,
  tenantId: string,
  aggregateType: "journal_entry" | "account" | "fiscal_year",
  aggregateId: string,
  eventType: string,
  payload: Record<string, unknown>,
  actorId: string,
): Promise<{ id: string; sequence: bigint }> {
  const result = await db.insert(eventStore).values({
    tenantId,
    aggregateType,
    aggregateId,
    eventType: eventType as any,
    payload,
    actorId,
  }).returning({ id: eventStore.id, sequence: eventStore.sequence });

  return result[0];
}

export async function getAggregateEvents(
  db: Database,
  aggregateId: string,
  afterSequence: bigint = 0n,
) {
  return db.select().from(eventStore).where(
    and(
      gt(eventStore.aggregateId, aggregateId),
      gt(eventStore.sequence, afterSequence),
    ),
  ).orderBy(eventStore.sequence);
}
