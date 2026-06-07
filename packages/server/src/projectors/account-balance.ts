import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { accountBalances, journalEntries, journalEntryLines } = _db;
import { sql, eq, and, inArray } from "drizzle-orm";
import type { Projector } from "./types.js";

export const accountBalanceProjector: Projector = {
  name: "AccountBalanceProjector",
  handles: [
    "journal_entry_posted",
    "journal_entry_voided",
    "journal_entry_reversed",
  ],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    const journalEntryId = payload.journalEntryId || event.aggregateId;
    if (!journalEntryId) return;

    const isVoid = event.eventType === "journal_entry_voided";
    const sign = isVoid ? -1 : 1;

    const lines = await (db as any)
      .select()
      .from(journalEntryLines)
      .where(eq(journalEntryLines.journalEntryId, journalEntryId));

    if (!lines.length) return;

    const [entry] = await (db as any)
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, journalEntryId))
      .limit(1);

    if (!entry) return;

    const fiscalYear = entry.fiscalYear;
    const period = String(entry.date).substring(0, 7);

    for (const line of lines) {
      const deltaDebit = parseFloat(String(line.debit || "0")) * sign;
      const deltaCredit = parseFloat(String(line.credit || "0")) * sign;

      await (db as any).insert(accountBalances).values({
        tenantId: event.tenantId,
        accountId: line.accountId,
        fiscalYear,
        period,
        openingBalance: "0",
        debitTotal: String(deltaDebit),
        creditTotal: String(deltaCredit),
        closingBalance: String(deltaDebit - deltaCredit),
      }).onConflictDoUpdate({
        target: [
          accountBalances.tenantId,
          accountBalances.accountId,
          accountBalances.fiscalYear,
          accountBalances.period,
        ],
        set: {
          debitTotal: sql`${accountBalances.debitTotal} + ${deltaDebit}`,
          creditTotal: sql`${accountBalances.creditTotal} + ${deltaCredit}`,
          closingBalance: sql`${accountBalances.closingBalance} + ${deltaDebit - deltaCredit}`,
          updatedAt: new Date(),
        },
      });
    }
  },
};
