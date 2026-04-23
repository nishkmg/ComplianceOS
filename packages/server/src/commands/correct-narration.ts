// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { journalEntries, narrationCorrections } = _db;
import { appendEvent } from "../lib/event-store";

export async function correctNarration(
  db: Database,
  tenantId: string,
  entryId: string,
  newNarration: string,
  actorId: string,
): Promise<void> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");

  await db.transaction(async (tx) => {
    await tx.insert(narrationCorrections).values({
      journalEntryId: entryId,
      oldNarration: entry[0].narration,
      newNarration,
      correctedBy: actorId,
    });

    await tx.update(journalEntries)
      .set({ narration: newNarration, updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "narration_corrected", {
      entryId,
      oldNarration: entry[0].narration,
      newNarration,
    }, actorId);
  });
}
