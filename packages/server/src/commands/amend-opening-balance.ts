// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { journalEntries } = _db;
import { createJournalEntry } from "./create-journal-entry";
import { voidJournalEntry } from "./void-journal-entry";

export async function amendOpeningBalance(
  db: Database,
  tenantId: string,
  originalEntryId: string,
  newLines: Array<{ accountId: string; debit: string; credit: string }>,
  actorId: string,
  fiscalYear: string,
): Promise<{ newEntryId: string }> {
  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, originalEntryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Entry not found");
  if (entry[0].referenceType !== "opening_balance") throw new Error("Only opening balance entries can be amended");
  if (entry[0].status !== "posted") throw new Error("Entry must be posted");

  const otherPosted = await db.select({ id: journalEntries.id }).from(journalEntries).where(
    and(
      eq(journalEntries.tenantId, tenantId),
      eq(journalEntries.fiscalYear, fiscalYear),
      eq(journalEntries.status, "posted"),
    ),
  ).limit(2);

  const otherEntries = otherPosted.filter((e) => e.id !== originalEntryId);
  if (otherEntries.length > 0) {
    throw new Error("Cannot amend opening balance: other posted entries exist in this FY");
  }

  await voidJournalEntry(db, tenantId, originalEntryId, "Amending opening balance", actorId);

  const result = await createJournalEntry(db, tenantId, actorId, fiscalYear, {
    date: entry[0].date,
    narration: "Opening balance (amended)",
    referenceType: "opening_balance",
    lines: newLines,
  });

  return { newEntryId: result.entryId };
}
