import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { snapshots } = _db;
import { getAggregateEvents } from "./event-store";

export interface AggregateState {
  aggregateId: string;
  lastSequence: bigint;
  state: Record<string, unknown>;
}

export async function loadAggregate(
  db: Database,
  aggregateId: string,
) {
  const snapshot = await db.select()
    .from(snapshots)
    .where(eq(snapshots.aggregateId, aggregateId))
    .orderBy(snapshots.sequence)
    .limit(1);

  const lastSequence = snapshot[0]?.sequence ?? 0n;
  const state = (snapshot[0]?.state as Record<string, unknown>) ?? {};
  const events = await getAggregateEvents(db, aggregateId, lastSequence);
  let currentState = { ...state };

  for (const event of events) {
    currentState = { ...currentState, ...event.payload as Record<string, unknown> };
  }

  return {
    aggregateId,
    lastSequence: events[events.length - 1]?.sequence ?? lastSequence,
    state: currentState,
  };
}
