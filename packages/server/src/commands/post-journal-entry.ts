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
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  if (entry[0].status !== "draft") throw new Error(`Cannot post entry with status ${entry[0].status}`);

  await db.transaction(async (tx) => {
    await tx.update(journalEntries)
      .set({ status: "posted", updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_posted", {
      entryId,
      postedAt: new Date().toISOString(),
    }, actorId);
  });
}
