// packages/server/src/commands/create-expense-from-receipt.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { accounts } from "@complianceos/db";
import { createJournalEntry } from "./create-journal-entry";

export async function createExpenseFromReceipt(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    date: string;
    vendorName: string;
    vendorGstin?: string;
    total: number;
    expenseAccountId: string;
    payableAccountId: string;
    narration?: string;
  },
): Promise<{ entryId: string; entryNumber: string }> {
  const { date, vendorName, total, expenseAccountId, payableAccountId, narration } = input;

  // Determine fiscal year from date
  const year = new Date(date).getFullYear();
  const fy = year >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;

  const entryNarration = narration || `Expense: ${vendorName} — receipt expense entry`;

  return await createJournalEntry(db, tenantId, actorId, fy, {
    date,
    narration: entryNarration,
    referenceType: "journal",
    lines: [
      {
        accountId: expenseAccountId,
        debit: String(total.toFixed(2)),
        credit: "0",
        description: vendorName,
      },
      {
        accountId: payableAccountId,
        debit: "0",
        credit: String(total.toFixed(2)),
        description: `Payable to ${vendorName}`,
      },
    ],
  });
}
