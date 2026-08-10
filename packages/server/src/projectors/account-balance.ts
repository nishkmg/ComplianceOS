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

    // Recompute-per-event: delete the affected (account, period) rows then
    // insert plain values. The old additive upsert double-counted on event
    // replay (projectors must be replay-idempotent).
    const perAccount = new Map<string, { debit: number; credit: number }>();
    for (const line of lines) {
      const deltaDebit = parseFloat(String(line.debit || "0")) * sign;
      const deltaCredit = parseFloat(String(line.credit || "0")) * sign;
      const cur = perAccount.get(line.accountId) ?? { debit: 0, credit: 0 };
      cur.debit += deltaDebit;
      cur.credit += deltaCredit;
      perAccount.set(line.accountId, cur);
    }
    for (const [accountId, agg] of perAccount) {
      await (db as any).delete(accountBalances).where(
        and(
          eq(accountBalances.tenantId, event.tenantId),
          eq(accountBalances.accountId, accountId),
          eq(accountBalances.fiscalYear, fiscalYear),
          eq(accountBalances.period, period),
        ),
      );
      await (db as any).insert(accountBalances).values({
        tenantId: event.tenantId,
        accountId,
        fiscalYear,
        period,
        openingBalance: "0",
        debitTotal: String(agg.debit),
        creditTotal: String(agg.credit),
        closingBalance: String(agg.debit - agg.credit),
      });
    }
  },
};
