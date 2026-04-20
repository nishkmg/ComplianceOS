import type { Database } from "@complianceos/db";
import { accountBalances } from "@complianceos/db";
import { sql } from "drizzle-orm";
import type { Projector } from "./types.js";

export const accountBalanceProjector: Projector = {
  name: "AccountBalanceProjector",
  handles: [
    "journal_entry_created",
    "journal_entry_modified",
    "journal_entry_deleted",
    "journal_entry_posted",
    "journal_entry_voided",
  ],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    if (!payload.lines || !payload.fiscalYear || !payload.date) return;

    const period = (payload.date as string).substring(0, 7);

    for (const line of payload.lines as any[]) {
      if (!line.accountId) continue;
      const deltaDebit = parseFloat(line.debit || "0");
      const deltaCredit = parseFloat(line.credit || "0");

      await (db as any).insert(accountBalances).values({
        tenantId: event.tenantId,
        accountId: line.accountId,
        fiscalYear: payload.fiscalYear,
        period,
        openingBalance: "0",
        debitTotal: String(deltaDebit),
        creditTotal: String(deltaCredit),
        closingBalance: "0",
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
          updatedAt: new Date(),
        },
      });
    }
  },
};
