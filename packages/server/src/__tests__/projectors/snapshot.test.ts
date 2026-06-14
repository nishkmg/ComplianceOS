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

import { snapshotProjector } from "../../projectors/snapshot";

function createMockDb(results: any[][] = []): {
  db: any;
  inserts: any[];
  pushResult: (r: any[]) => void;
} {
  const inserts: any[] = [];
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
    pushResult: (r: any[]) => selectResults.push(r),
  };
}

const TENANT = "tenant-1";
const ACTOR = "actor-1";

function buildEvent(
  seq: number,
  eventType = "journal_entry_posted",
) {
  return {
    tenantId: TENANT,
    aggregateId: "agg-1",
    aggregateType: "journal_entry" as const,
    eventType,
    sequence: BigInt(seq),
    actorId: ACTOR,
    payload: {},
  };
}

function buildEventRow(seq: number, eventType = "journal_entry_posted") {
  return {
    id: `evt-${seq}`,
    event_type: eventType,
    sequence: seq,
    payload: {},
    created_at: new Date().toISOString(),
  };
}

describe("snapshot projector", () => {
  it("creates snapshot at every 10th event", async () => {
    const { db, inserts, pushResult } = createMockDb();

    // Return 10 recent events for the snapshot
    const recentEvents = Array.from({ length: 10 }, (_, i) =>
      buildEventRow(i + 1));
    pushResult(recentEvents);

    await snapshotProjector.process(db, buildEvent(10));

    expect(inserts).toHaveLength(1);
    const state = inserts[0].values.state;
    expect(state.aggregateId).toBe("agg-1");
    expect(state.lastEventSequence).toBe(10);
    expect(state.isFiscalYearClose).toBe(false);
    expect(state.recentEvents).toHaveLength(10);
  });

  it("skips non-multiple-of-10 events", async () => {
    const { db, inserts } = createMockDb();

    await snapshotProjector.process(db, buildEvent(11));

    expect(inserts).toHaveLength(0);
  });

  it("truncates to 50 max events in snapshot", async () => {
    const { db, inserts, pushResult } = createMockDb();

    // 60 events; DB returns DESC, projector reverses
    const sixtyEvents = Array.from({ length: 60 }, (_, i) =>
      buildEventRow(i + 1));
    pushResult(sixtyEvents.slice(-50).reverse());

    await snapshotProjector.process(db, buildEvent(60));

    expect(inserts).toHaveLength(1);
    const state = inserts[0].values.state;
    expect(state.recentEvents).toHaveLength(50);
    expect(state.recentEvents[0].sequence).toBe(11);
    expect(state.recentEvents[49].sequence).toBe(60);
  });

  it("triggers mandatory snapshot on fiscal_year_closed", async () => {
    const { db, inserts, pushResult } = createMockDb();

    pushResult([buildEventRow(5)]);

    await snapshotProjector.process(
      db,
      buildEvent(5, "fiscal_year_closed"),
    );

    expect(inserts).toHaveLength(1);
    const state = inserts[0].values.state;
    expect(state.isFiscalYearClose).toBe(true);
    expect(state.lastEventSequence).toBe(5);
  });

  it("snapshots include correct recent event payloads", async () => {
    const { db, inserts, pushResult } = createMockDb();

    const events = [
      { ...buildEventRow(2), payload: { amount: 200 } },
      { ...buildEventRow(1), payload: { amount: 100 } },
    ];
    pushResult(events);

    await snapshotProjector.process(db, buildEvent(10));

    const state = inserts[0].values.state;
    expect(state.recentEvents[1].payload).toEqual({ amount: 200 });
  });
});
