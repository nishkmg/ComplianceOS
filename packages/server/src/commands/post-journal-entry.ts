// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { journalEntries } = _db;
import { appendEvent } from "../lib/event-store";

export async function postJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  actorId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const entry = await tx.select().from(journalEntries).where(
      and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
    ).for("update");

    if (entry.length === 0) throw new Error("Journal entry not found");
    if (entry[0].status !== "draft") throw new Error(`Cannot post entry with status ${entry[0].status}`);

    const updated = await tx.update(journalEntries)
      .set({ status: "posted", updatedAt: new Date() })
      .where(
        and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.tenantId, tenantId),
          eq(journalEntries.status, "draft"),
        ),
      )
      .returning();

    if (updated.length === 0) {
      throw new Error("Concurrent modification: entry status changed");
    }

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_posted", {
      entryId,
      postedAt: new Date().toISOString(),
    }, actorId);
  });
}
