import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import {
  payments,
  paymentAllocations,
  invoices,
  journalEntries,
  journalEntryLines,
} from "@complianceos/db";
import { appendEvent } from "../lib/event-store";
import { VoidPaymentInputSchema } from "@complianceos/shared";
import { getNextEntryNumber } from "../lib/entry-number";
import { validateBalance } from "../lib/balance-validator";

export async function voidPayment(
  db: Database,
  tenantId: string,
  paymentId: string,
  reason: string,
  actorId: string,
  fiscalYear: string,
): Promise<{
  paymentId: string;
  reversalJournalEntryId: string;
}> {
  VoidPaymentInputSchema.parse({ reason });

  // Load payment and verify it's not already voided
  const paymentRows = await db.select().from(payments).where(
    and(eq(payments.id, paymentId), eq(payments.tenantId, tenantId)),
  );

  if (paymentRows.length === 0) throw new Error("Payment not found");
  if (paymentRows[0].status === "voided") throw new Error("Payment is already voided");

  const payment = paymentRows[0];

  // Load existing allocations to know what to reverse
  const allocationRows = await db.select({
    invoiceId: paymentAllocations.invoiceId,
    allocatedAmount: paymentAllocations.allocatedAmount,
  }).from(paymentAllocations).where(eq(paymentAllocations.paymentId, paymentId));

  // Load the original journal entry
  const originalJeRows = await db.select({
    id: journalEntries.id,
  }).from(journalEntries).where(
    and(
      eq(journalEntries.referenceId, paymentId),
      eq(journalEntries.referenceType, "payment"),
    ),
  );

  if (originalJeRows.length === 0) throw new Error("Original journal entry not found");

  const originalJeId = originalJeRows[0].id;

  // Load original JE lines to get account IDs and amounts
  const originalLines = await db.select({
    accountId: journalEntryLines.accountId,
    debit: journalEntryLines.debit,
    credit: journalEntryLines.credit,
  }).from(journalEntryLines).where(eq(journalEntryLines.journalEntryId, originalJeId));

  if (originalLines.length === 0) throw new Error("Original journal entry has no lines");

  // Create reversal JE in transaction
  const result = await db.transaction(async (tx) => {
    // Build reversal lines (swap debit/credit on original lines)
    const reversalLines = originalLines.map((line) => ({
      accountId: line.accountId,
      debit: String(line.credit),  // Swap: original credit becomes debit
      credit: String(line.debit),  // Swap: original debit becomes credit
    }));

    // Validate reversal balances
    const { valid } = validateBalance(reversalLines);
    if (!valid) throw new Error("Reversal journal entry would be unbalanced");

    // Create reversal journal entry
    const entryNumber = await getNextEntryNumber(db, tenantId, fiscalYear);

    const reversalJe = await tx.insert(journalEntries).values({
      tenantId,
      entryNumber,
      date: new Date().toISOString().split("T")[0],
      narration: `Reversal of payment ${payment.paymentNumber} - ${reason}`,
      referenceType: "payment",
      referenceId: paymentId,
      reversalOf: originalJeId,
      status: "posted",
      fiscalYear,
      createdBy: actorId,
    }).returning({ id: journalEntries.id });

    const reversalJournalEntryId = reversalJe[0].id;

    await tx.insert(journalEntryLines).values(
      reversalLines.map((l) => ({
        journalEntryId: reversalJournalEntryId,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
      })),
    );

    // Update invoice statuses based on remaining allocations after voiding this payment
    for (const allocation of allocationRows) {
      // Find other non-voided payments allocated to this invoice
      const otherAllocations = await tx.select({
        allocatedAmount: paymentAllocations.allocatedAmount,
      }).from(paymentAllocations)
        .innerJoin(payments, eq(payments.id, paymentAllocations.paymentId))
        .where(
          and(
            eq(paymentAllocations.invoiceId, allocation.invoiceId),
            eq(payments.status, "recorded"),
          ),
        );

      // Sum up remaining allocations
      const remainingTotal = otherAllocations.reduce(
        (sum, a) => sum + parseFloat(a.allocatedAmount.toString()),
        0,
      );

      // Get invoice to check against grand total
      const invoiceRows = await tx.select({ grandTotal: invoices.grandTotal }).from(invoices).where(
        eq(invoices.id, allocation.invoiceId),
      );

      if (invoiceRows.length === 0) continue;

      const invoiceGrandTotal = parseFloat(invoiceRows[0].grandTotal.toString());

      // Determine new status
      let newStatus: "sent" | "partially_paid" | "paid" = "sent";
      if (remainingTotal > 0.01) {
        newStatus = remainingTotal >= invoiceGrandTotal - 0.01 ? "paid" : "partially_paid";
      }

      await tx.update(invoices)
        .set({
          status: newStatus,
          paidAt: newStatus === "paid" ? new Date() : undefined,
        })
        .where(eq(invoices.id, allocation.invoiceId));
    }

    // Delete payment allocations
    await tx.delete(paymentAllocations).where(eq(paymentAllocations.paymentId, paymentId));

    // Update payment status to voided
    await tx.update(payments)
      .set({ status: "voided" })
      .where(eq(payments.id, paymentId));

    // Append payment_voided event
    await appendEvent(tx, tenantId, "journal_entry", reversalJournalEntryId, "payment_voided", {
      paymentId,
      voidedAt: new Date().toISOString(),
      reversalJournalEntryId,
      reason,
    }, actorId);

    return { paymentId, reversalJournalEntryId };
  });

  return result;
}