import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { creditNotes, invoiceLines, invoices, accounts } from "@complianceos/db";
import { CreateCreditNoteInputSchema } from "@complianceos/shared";
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";
import { getNextInvoiceNumber } from "../services/invoice-number";

export async function createCreditNote(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    originalInvoiceId: string;
    reason: string;
    lines: Array<{
      accountId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      gstRate: number;
      discountPercent?: number;
    }>;
  },
): Promise<{ creditNoteId: string; journalEntryId: string }> {
  const validated = CreateCreditNoteInputSchema.parse(input);

  // Verify original invoice exists and is posted
  const originalInvoice = await db.select().from(invoices).where(
    and(eq(invoices.id, validated.originalInvoiceId), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (originalInvoice.length === 0) {
    throw new Error("Original invoice not found");
  }

  if (originalInvoice[0].status !== "sent") {
    throw new Error(`Original invoice must be posted/sent, got: ${originalInvoice[0].status}`);
  }

  // Determine fiscal year from date
  const dateStr = new Date().toISOString().split("T")[0];
  const year = new Date().getFullYear();
  const fy = `${year}-${String(year + 1).slice(-2)}`;

  const creditNoteNumber = await getNextInvoiceNumber(db, tenantId, fy);

  // Calculate line amounts (same as invoice but with negative amounts)
  const lineCalculations = validated.lines.map((line) => {
    const qty = Number(line.quantity);
    const unitPrice = Number(line.unitPrice);
    const gstRate = Number(line.gstRate);
    const discountPct = Number(line.discountPercent ?? 0);

    const beforeDiscount = qty * unitPrice;
    const discountAmount = beforeDiscount * (discountPct / 100);
    const amount = beforeDiscount - discountAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const customerState = originalInvoice[0].customerState;
    const tenantState = "IN-TN"; // TODO: fetch from tenant config

    if (customerState === tenantState) {
      cgstAmount = amount * gstRate / 200;
      sgstAmount = amount * gstRate / 200;
    } else {
      igstAmount = amount * gstRate / 100;
    }

    return {
      accountId: line.accountId,
      description: line.description,
      quantity: String(qty),
      unitPrice: String(unitPrice),
      amount: String((-amount).toFixed(2)), // Negative for credit note
      gstRate: String(gstRate),
      cgstAmount: String((-cgstAmount).toFixed(2)),
      sgstAmount: String((-sgstAmount).toFixed(2)),
      igstAmount: String((-igstAmount).toFixed(2)),
      discountPercent: String(discountPct),
      discountAmount: String((-discountAmount).toFixed(2)),
    };
  });

  // Calculate totals (will be negative)
  const subtotal = lineCalculations.reduce((sum, l) => sum + Number(l.amount), 0);
  const cgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.cgstAmount), 0);
  const sgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.sgstAmount), 0);
  const igstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.igstAmount), 0);
  const discountTotal = lineCalculations.reduce((sum, l) => sum + Number(l.discountAmount), 0);
  const gstTotal = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = subtotal + gstTotal - discountTotal;

  // Insert credit note
  const result = await db.transaction(async (tx) => {
    const cn = await tx.insert(creditNotes).values({
      tenantId,
      invoiceNumber: creditNoteNumber,
      date: dateStr,
      customerName: originalInvoice[0].customerName,
      customerEmail: originalInvoice[0].customerEmail,
      customerGstin: originalInvoice[0].customerGstin,
      customerAddress: originalInvoice[0].customerAddress,
      customerState: originalInvoice[0].customerState,
      status: "issued",
      subtotal: String(subtotal.toFixed(2)),
      cgstTotal: String(cgstTotal.toFixed(2)),
      sgstTotal: String(sgstTotal.toFixed(2)),
      igstTotal: String(igstTotal.toFixed(2)),
      discountTotal: String(discountTotal.toFixed(2)),
      grandTotal: String(grandTotal.toFixed(2)),
      fiscalYear: fy,
      createdBy: actorId,
      originalInvoiceId: validated.originalInvoiceId,
      reason: validated.reason,
    }).returning({ id: creditNotes.id });

    // Create reversal JE
    // Cr Trade Receivable (negative - reduces receivable)
    // Dr CGST/SGST/IGST Input (negative - reduces input tax)
    // Dr Revenue accounts (negative - reduces revenue)

    const allAccounts = await db.select({ id: accounts.id, name: accounts.name, kind: accounts.kind })
      .from(accounts).where(eq(accounts.tenantId, tenantId));

    const jeLines: Array<{ accountId: string; debit: string; credit: string; description?: string }> = [];

    // Find receivables account
    const receivable = allAccounts.find(
      (a) => a.kind === "Asset" && a.name.toLowerCase().includes("receivable"),
    );

    if (receivable) {
      jeLines.push({
        accountId: receivable.id,
        debit: "0",
        credit: String(Math.abs(Number(grandTotal))),
        description: `Credit Note ${creditNoteNumber}`,
      });
    }

    // Dr Revenue per line (negative amounts)
    for (const line of lineCalculations) {
      jeLines.push({
        accountId: line.accountId,
        debit: String(Math.abs(Number(line.amount))),
        credit: "0",
        description: line.description,
      });
    }

    // Dr CGST/SGST/IGST Input (negative)
    const cgstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("cgst") && a.name.toLowerCase().includes("input"));
    const sgstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("sgst") && a.name.toLowerCase().includes("input"));
    const igstAccount = allAccounts.find((a) => a.name.toLowerCase().includes("igst") && a.name.toLowerCase().includes("input"));

    if (Number(cgstTotal) < 0 && cgstAccount) {
      jeLines.push({ accountId: cgstAccount.id, debit: String(Math.abs(Number(cgstTotal))), credit: "0", description: "CGST Input" });
    }
    if (Number(sgstTotal) < 0 && sgstAccount) {
      jeLines.push({ accountId: sgstAccount.id, debit: String(Math.abs(Number(sgstTotal))), credit: "0", description: "SGST Input" });
    }
    if (Number(igstTotal) < 0 && igstAccount) {
      jeLines.push({ accountId: igstAccount.id, debit: String(Math.abs(Number(igstTotal))), credit: "0", description: "IGST Input" });
    }

    const jeResult = await createJournalEntry(db, tenantId, actorId, fy, {
      date: dateStr,
      narration: `Credit Note ${creditNoteNumber} for ${originalInvoice[0].invoiceNumber}: ${validated.reason}`,
      referenceType: "credit_note",
      referenceId: cn[0].id,
      lines: jeLines,
    });

    // Append event
    await appendEvent(tx, tenantId, "credit_note", cn[0].id, "credit_note_created", {
      creditNoteId: cn[0].id,
      originalInvoiceId: validated.originalInvoiceId,
      reason: validated.reason,
      amount: Number(grandTotal),
      journalEntryId: jeResult.entryId,
    }, actorId);

    return { creditNoteId: cn[0].id, journalEntryId: jeResult.entryId };
  });

  return result;
}