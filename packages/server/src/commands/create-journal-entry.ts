import { eq, and, inArray } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { accounts, journalEntries, journalEntryLines } from "@complianceos/db";
import { validateBalance } from "../lib/balance-validator";
import { getNextEntryNumber } from "../lib/entry-number";
import { appendEvent } from "../lib/event-store";
import { CreateJournalEntryInputSchema } from "@complianceos/shared";

export async function createJournalEntry(
  db: Database,
  tenantId: string,
  actorId: string,
  fiscalYear: string,
  input: {
    date: string;
    narration: string;
    referenceType: string;
    referenceId?: string;
    lines: Array<{ accountId: string; debit: string; credit: string; description?: string }>;
  },
): Promise<{ entryId: string; entryNumber: string }> {
  const validated = CreateJournalEntryInputSchema.parse(input);

  const { valid, totalDebit, totalCredit } = validateBalance(validated.lines);
  if (!valid) {
    throw new Error(`Total debits must equal total credits. Debits: ${totalDebit}, Credits: ${totalCredit}`);
  }

  const accountIds = validated.lines.map((l) => l.accountId);
  const accountRows = await db.select({
    id: accounts.id,
    isLeaf: accounts.isLeaf,
    isActive: accounts.isActive,
  }).from(accounts).where(
    and(
      eq(accounts.tenantId, tenantId),
      inArray(accounts.id, accountIds),
    ),
  );

  const foundIds = new Set(accountRows.map((a) => a.id));
  for (const id of accountIds) {
    if (!foundIds.has(id)) {
      throw new Error(`Account ${id} not found in this tenant`);
    }
  }

  const nonLeaf = accountRows.filter((a) => !a.isLeaf);
  if (nonLeaf.length > 0) {
    throw new Error(`Journal entries can only reference leaf accounts`);
  }

  const inactive = accountRows.filter((a) => !a.isActive);
  if (inactive.length > 0) {
    throw new Error(`Cannot use inactive accounts`);
  }

  const entryNumber = await getNextEntryNumber(db, tenantId, fiscalYear);

  const result = await db.transaction(async (tx) => {
    const entry = await tx.insert(journalEntries).values({
      tenantId,
      entryNumber,
      date: validated.date,
      narration: validated.narration,
      referenceType: validated.referenceType,
      referenceId: validated.referenceId,
      status: "draft",
      fiscalYear,
      createdBy: actorId,
    }).returning({ id: journalEntries.id });

    await tx.insert(journalEntryLines).values(
      validated.lines.map((l) => ({
        journalEntryId: entry[0].id,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
        description: l.description,
      })),
    );

    await appendEvent(tx, tenantId, "journal_entry", entry[0].id, "journal_entry_created", {
      entryId: entry[0].id,
      entryNumber,
      date: validated.date,
      narration: validated.narration,
      lines: validated.lines,
      fiscalYear,
    }, actorId);

    return { entryId: entry[0].id, entryNumber };
  });

  return result;
}
