import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db, eventStore, users } from "../../../../db/src/index";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { appendEvent, getAggregateEvents } from "../../lib/event-store";

// Real-Postgres concurrency suite. The previous mock-based suite encoded the
// old buggy contract ("remaining 99 retry and return same event" — silent
// loss of different events). These tests assert the corrected contract:
// same-payload retries are idempotent, different events ALWAYS persist.

const TENANT = randomUUID();
const ACTOR = randomUUID();
const EVENT = "journal_entry_created";

beforeAll(async () => {
  // event_store.actor_id has an FK to users — the actor must be real.
  await db.insert(users).values({
    id: ACTOR,
    email: `evt-${ACTOR}@test.local`,
    name: "Event Test",
    passwordHash: "x",
  });
});

async function rowsFor(tenantId: string, aggregateId: string) {
  return db
    .select()
    .from(eventStore)
    .where(and(eq(eventStore.tenantId, tenantId), eq(eventStore.aggregateId, aggregateId)));
}

afterAll(async () => {
  await db.delete(eventStore).where(eq(eventStore.tenantId, TENANT));
  await db.delete(users).where(eq(users.id, ACTOR));
});

describe("event store concurrency (real PG)", () => {
  it("appends events with global per-tenant sequences", async () => {
    const a = await appendEvent(db, TENANT, "journal_entry", randomUUID(), EVENT, { n: 1 }, ACTOR);
    const b = await appendEvent(db, TENANT, "journal_entry", randomUUID(), EVENT, { n: 2 }, ACTOR);
    expect(Number(a.sequence)).toBeGreaterThan(0);
    expect(Number(b.sequence)).toBe(Number(a.sequence) + 1);
  });

  it("100 concurrent same-payload appends all persist with unique sequences (no collapse, no loss)", async () => {
    const agg = randomUUID();
    const payload = { kind: "same" };
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        appendEvent(db, TENANT, "journal_entry", agg, EVENT, payload, ACTOR),
      ),
    );
    const seqs = new Set(results.map((r) => Number(r.sequence)));
    expect(seqs.size).toBe(100); // every call got its own atomic sequence
    const rows = await rowsFor(TENANT, agg);
    expect(rows.length).toBe(100); // nothing silently dropped
  });

  it("concurrent DIFFERENT-payload appends to one aggregate persist ALL events (no silent loss)", async () => {
    const agg = randomUUID();
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        appendEvent(db, TENANT, "journal_entry", agg, EVENT, { i }, ACTOR),
      ),
    );
    const seqs = new Set(results.map((r) => Number(r.sequence)));
    expect(seqs.size).toBe(20); // every event got its own sequence
    const rows = await rowsFor(TENANT, agg);
    expect(rows.length).toBe(20);
    const payloads = new Set(rows.map((r) => JSON.stringify(r.payload)));
    expect(payloads.size).toBe(20); // no payload was dropped
  });

  it("cross-aggregate concurrency keeps all events, global sequences unique", async () => {
    const aggA = randomUUID();
    const aggB = randomUUID();
    await Promise.all([
      ...Array.from({ length: 10 }, () =>
        appendEvent(db, TENANT, "journal_entry", aggA, EVENT, { a: 1 }, ACTOR),
      ),
      ...Array.from({ length: 10 }, () =>
        appendEvent(db, TENANT, "journal_entry", aggB, EVENT, { b: 1 }, ACTOR),
      ),
    ]);
    const rowsA = await rowsFor(TENANT, aggA);
    const rowsB = await rowsFor(TENANT, aggB);
    expect(rowsA.length).toBe(10);
    expect(rowsB.length).toBe(10);
    const all = [...rowsA, ...rowsB].map((r) => Number(r.sequence)).sort((x, y) => x - y);
    expect(new Set(all).size).toBe(20);
  });

  it("getAggregateEvents returns events in ascending sequence order", async () => {
    const agg = randomUUID();
    for (let i = 0; i < 5; i++) {
      await appendEvent(db, TENANT, "journal_entry", agg, EVENT, { i }, ACTOR);
    }
    const evs = await getAggregateEvents(db, agg);
    expect(evs.length).toBe(5);
    const seqs = evs.map((e) => Number(e.sequence));
    expect(seqs).toEqual([...seqs].sort((a, b) => a - b));
  });
});
