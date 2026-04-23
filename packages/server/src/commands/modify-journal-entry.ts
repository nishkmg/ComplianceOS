// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { journalEntries, journalEntryLines } = _db;
import { validateBalance } from "../lib/balance-validator";
import { appendEvent } from "../lib/event-store";
import * as _shared from "../../../shared/src/index";
const { ModifyJournalEntryInputSchema } = _shared;

export async function modifyJournalEntry(
  db: Database,
  tenantId: string,
  entryId: string,
  actorId: string,
  input: { narration?: string; date?: string; lines?: Array<{ accountId: string; debit: string; credit: string; description?: string }> },
): Promise<void> {
  const validated = ModifyJournalEntryInputSchema.parse({ entryId, ...input });

  const entry = await db.select().from(journalEntries).where(
    and(eq(journalEntries.id, entryId), eq(journalEntries.tenantId, tenantId)),
  );

  if (entry.length === 0) throw new Error("Journal entry not found");
  if (entry[0].status !== "draft") throw new Error("Only draft entries can be modified");

  if (validated.lines) {
    const { valid } = validateBalance(validated.lines);
    if (!valid) throw new Error("Total debits must equal total credits");
  }

  await db.transaction(async (tx) => {
    await tx.update(journalEntries)
      .set({
        ...(validated.narration && { narration: validated.narration }),
        ...(validated.date && { date: validated.date }),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, entryId));

    if (validated.lines) {
      await tx.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, entryId));
      await tx.insert(journalEntryLines).values(
        validated.lines.map((l) => ({
          journalEntryId: entryId,
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
        })),
      );
    }

    await appendEvent(tx, tenantId, "journal_entry", entryId, "journal_entry_modified", {
      ...validated,
    }, actorId);
  });
}
