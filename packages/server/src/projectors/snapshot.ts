import type { Database } from "@complianceos/db";
import { snapshots } from "@complianceos/db";
import type { Projector } from "./types.js";

const SNAPSHOT_INTERVAL = 10;

export const snapshotProjector: Projector = {
  name: "SnapshotProjector",
  handles: [
    "journal_entry_created",
    "journal_entry_modified",
    "journal_entry_deleted",
    "journal_entry_posted",
    "journal_entry_voided",
    "account_created",
    "account_modified",
    "account_deactivated",
    "fiscal_year_created",
    "fiscal_year_closed",
  ],
  async process(db: Database, event: any): Promise<void> {
    const sequence = Number(event.sequence);
    if (sequence === 0 || sequence % SNAPSHOT_INTERVAL !== 0) return;

    const state = event.payload as Record<string, unknown>;

    await (db as any).insert(snapshots).values({
      tenantId: event.tenantId,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      sequence: BigInt(sequence),
      state,
    }).onConflictDoUpdate({
      target: [snapshots.aggregateId, snapshots.sequence],
      set: { state },
    });
  },
};
