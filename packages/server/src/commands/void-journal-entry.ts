// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { journalEntries } = _db;
import { appendEvent } from "../lib/event-store";

export async function voidJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  reason: string,
  actorId: string,
): Promise<void> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  if (entry[0].status !== "posted") throw new Error("Only posted entries can be voided");
  if (entry[0].referenceType === "opening_balance") throw new Error("Opening balance entries cannot be voided");

  await db.transaction(async (tx) => {
    await tx.update(journalEntries)
      .set({ status: "voided", updatedAt: new Date() })
      .where(eq(journalEntries.id, entryId));

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_voided", {
      entryId,
      reason,
      voidedAt: new Date().toISOString(),
    }, actorId);
  });
}
