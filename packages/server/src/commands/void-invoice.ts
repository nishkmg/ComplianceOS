// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, journalEntries, journalEntryLines, accounts } = _db;
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";

export async function voidInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  invoiceId: string,
  reason: string,
): Promise<{ invoiceId: string; reversalJournalEntryId: string }> {
  // Load invoice
  const invoice = await db.select().from(invoices).where(
    and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (invoice.length === 0) {
    throw new Error("Invoice not found");
  }

  if (invoice[0].status === "voided") {
    throw new Error("Invoice is already voided");
  }

  // Load original JE if exists (from invoice's referenceId)
  let reversalEntryId: string | null = null;

  // Find the original JE via referenceId or by looking up JE lines with this invoice reference
  const originalJE = await db.select().from(journalEntries).where(
    and(eq(journalEntries.referenceType, "invoice"), eq(journalEntries.referenceId, invoiceId)),
  ).limit(1);

  if (originalJE.length > 0) {
    const origJEId = originalJE[0].id;

    // Load original lines
    const origLines = await db.select().from(journalEntryLines).where(
      eq(journalEntryLines.journalEntryId, origJEId),
    );

    // Create reversal JE (swap debits and credits)
    const reversalLines = origLines.map((l) => ({
      accountId: l.accountId,
      debit: l.credit,
      credit: l.debit,
      description: `Reversal: ${l.description ?? ""}`,
    }));

    const reversalResult = await createJournalEntry(db, tenantId, actorId, invoice[0].fiscalYear, {
      date: new Date().toISOString().split("T")[0],
      narration: `Reversal of JE for voided invoice ${invoice[0].invoiceNumber}: ${reason}`,
      referenceType: "invoice",
      referenceId: invoiceId,
      lines: reversalLines,
    });

    reversalEntryId = reversalResult.entryId;

    // Mark original JE as reversed
    await db.update(journalEntries)
      .set({ reversalOf: reversalEntryId })
      .where(eq(journalEntries.id, origJEId));
  }

  // Update invoice status to voided
  await db.update(invoices)
    .set({ status: "voided", updatedAt: new Date() })
    .where(eq(invoices.id, invoiceId));

  // Append event
  await appendEvent(db, tenantId, "invoice", invoiceId, "invoice_voided", {
    invoiceId,
    voidedAt: new Date().toISOString(),
    reversalJournalEntryId: reversalEntryId,
    reason,
  }, actorId);

  return { invoiceId, reversalJournalEntryId: reversalEntryId ?? "" };
}