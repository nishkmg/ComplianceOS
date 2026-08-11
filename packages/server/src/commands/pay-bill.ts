// packages/server/src/commands/pay-bill.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { purchaseBills, accounts } = _db;
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function payBill(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    billId: string;
    amount: number;
    date: string;
    paymentAccountId: string;
    narration?: string;
  },
): Promise<{ billId: string; status: string; remaining: number }> {
  const [bill] = await db
    .select()
    .from(purchaseBills)
    .where(and(eq(purchaseBills.id, input.billId), eq(purchaseBills.tenantId, tenantId)))
    .limit(1);
  if (!bill) throw new Error("Bill not found");

  const grandTotal = Number(bill.grandTotal);
  const paidSoFar = Number(bill.paidAmount);
  const amount = Number(input.amount);
  if (amount <= 0) throw new Error("Payment amount must be positive");
  if (paidSoFar + amount > grandTotal + 0.01) {
    throw new Error(`Payment exceeds outstanding balance of ${(grandTotal - paidSoFar).toFixed(2)}`);
  }

  const [paymentAccount] = await db
    .select({ id: accounts.id, kind: accounts.kind })
    .from(accounts)
    .where(eq(accounts.id, input.paymentAccountId))
    .limit(1);
  if (!paymentAccount || paymentAccount.kind !== "Asset") {
    throw new Error("Payment account must be a Bank, Cash or Asset account");
  }

  const newPaid = paidSoFar + amount;
  const status = Math.abs(grandTotal - newPaid) < 0.01 ? "paid" : "partial";

  const result = await db.transaction(async (tx) => {
    await tx.update(purchaseBills)
      .set({ paidAmount: String(newPaid.toFixed(2)), status, updatedAt: new Date() })
      .where(eq(purchaseBills.id, input.billId));

    const je = await createJournalEntry(db, tenantId, actorId, bill.fiscalYear, {
      date: input.date,
      narration: `Payment for bill ${bill.billNumber} (${bill.vendorName})`,
      referenceType: "purchase_bill",
      referenceId: bill.id,
      lines: [
        { accountId: bill.vendorAccountId, debit: String(amount.toFixed(2)), credit: "0", description: `Bill ${bill.billNumber}` },
        { accountId: input.paymentAccountId, debit: "0", credit: String(amount.toFixed(2)), description: input.narration || "Vendor payment" },
      ],
    });

    await appendEvent(tx, tenantId, "purchase_bill", bill.id, "purchase_bill_paid", {
      billId: bill.id,
      billNumber: bill.billNumber,
      amount: Number(amount.toFixed(2)),
      status,
      journalEntryId: je.entryId,
    }, actorId);

    return { billId: bill.id, status, remaining: Number((grandTotal - newPaid).toFixed(2)) };
  });

  return result;
}
