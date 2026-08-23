import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { snapshots, eventStore } = _db;
import { sql, eq, and, desc } from "drizzle-orm";
import type { Projector } from "./types";

const SNAPSHOT_INTERVAL = 10;
const MAX_EVENTS_PER_AGGREGATE = 50;

export const snapshotProjector: Projector = {
  name: "SnapshotProjector",
  handles: [
    "journal_entry_created",
    "journal_entry_modified",
    "journal_entry_deleted",
    "journal_entry_posted",
    "journal_entry_voided",
    "journal_entry_reversed",
    "account_created",
    "account_modified",
    "account_deactivated",
    "fiscal_year_created",
    "fiscal_year_closed",
  ],
  async process(db: Database, event: any): Promise<void> {
    const sequence = Number(event.sequence);
    const isFyClose = event.eventType === "fiscal_year_closed";
    const isFrequent = sequence > 0 && sequence % SNAPSHOT_INTERVAL === 0;
    if (!isFrequent && !isFyClose) return;

    const lastEvents = await (db as any)
      .select()
      .from(eventStore)
      .where(
        and(
          eq(eventStore.tenantId, event.tenantId),
          eq(eventStore.aggregateId, event.aggregateId),
        ),
      )
      .orderBy(desc(eventStore.sequence))
      .limit(MAX_EVENTS_PER_AGGREGATE);

    const state = {
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      lastEventSequence: sequence,
      capturedAt: new Date().toISOString(),
      isFiscalYearClose: isFyClose,
      recentEvents: lastEvents.reverse().map((e: any) => ({
        id: e.id,
        eventType: e.event_type,
        sequence: Number(e.sequence),
        payload: e.payload,
        createdAt: e.created_at,
      })),
    };

    await (db as any).insert(snapshots).values({
      tenantId: event.tenantId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      sequence: BigInt(sequence),
      state,
    }).onConflictDoUpdate({
      target: [snapshots.aggregateId, snapshots.sequence],
      set: { state, createdAt: new Date() },
    });
  },
};
