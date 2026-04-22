import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { creditNotes, invoiceLines, invoices, accounts, receivablesSummary } from "@complianceos/db";
import { CreateCreditNoteInputSchema } from "@complianceos/shared";
import { createJournalEntry } from "./create-journal-entry";
import { appendEvent } from "../lib/event-store";
import { getNextCreditNoteNumber } from "../services/invoice-number";

export async function createCreditNote(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    originalInvoiceId?: string;
    date: string;
    customerName: string;
    customerGstin?: string;
    customerAddress?: string;
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
): Promise<{ creditNoteId: string; creditNoteNumber: string; journalEntryId: string }> {
  const validated = CreateCreditNoteInputSchema.parse(input);

  let customerName = validated.customerName;
  let customerGstin = validated.customerGstin;
  let customerAddress = validated.customerAddress;
  let customerState: string;

  // If original invoice provided, fetch and validate
  if (validated.originalInvoiceId) {
    const originalInvoice = await db.select().from(invoices).where(
      and(eq(invoices.id, validated.originalInvoiceId), eq(invoices.tenantId, tenantId)),
    ).limit(1);

    if (originalInvoice.length === 0) {
      throw new Error("Original invoice not found");
    }

    // Validate same customer
    if (originalInvoice[0].customerName !== validated.customerName) {
      throw new Error("Credit note customer must match original invoice customer");
    }

    customerState = originalInvoice[0].customerState || "IN-TN";
    customerGstin = originalInvoice[0].customerGstin || undefined;
    customerAddress = originalInvoice[0].customerAddress || undefined;
  } else {
    // Standalone credit note - require customer details
    customerState = "IN-TN"; // Default for standalone, could be made configurable
  }

  // Determine fiscal year from date
  const dateStr = validated.date;
  const year = new Date(dateStr).getFullYear();
  const month = new Date(dateStr).getMonth() + 1;
  const fy = month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;

  const creditNoteNumber = await getNextCreditNoteNumber(db, tenantId, fy);

  // For GST calculation
  const tenantState = "IN-TN"; // TODO: fetch from tenant config

  // Calculate line amounts
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

    if (customerState === tenantState) {
      // Intra-state: CGST + SGST each half of rate
      cgstAmount = amount * gstRate / 200;
      sgstAmount = amount * gstRate / 200;
    } else {
      // Inter-state: IGST = full rate
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

  // Validate against outstanding
  const outstandingResult = await db.select().from(receivablesSummary).where(
    and(eq(receivablesSummary.tenantId, tenantId), eq(receivablesSummary.customerName, customerName)),
  ).limit(1);

  let outstanding = 0;
  if (outstandingResult.length > 0) {
    outstanding = Number(outstandingResult[0].totalOutstanding);
  }

  // For linked CN, also check against original invoice outstanding
  let originalInvoiceNumber: string | undefined;
  if (validated.originalInvoiceId) {
    const origInv = await db.select({ grandTotal: invoices.grandTotal, invoiceNumber: invoices.invoiceNumber }).from(invoices).where(
      eq(invoices.id, validated.originalInvoiceId),
    ).limit(1);
    
    if (origInv.length > 0) {
      originalInvoiceNumber = origInv[0].invoiceNumber;
      const invoiceOutstanding = Number(origInv[0].grandTotal);
      if (Math.abs(grandTotal) > invoiceOutstanding) {
        throw new Error("Credit amount exceeds outstanding");
      }
    }
  } else {
    // Standalone CN - check against customer total outstanding
    if (Math.abs(grandTotal) > outstanding) {
      throw new Error("Credit amount exceeds customer outstanding");
    }
  }

  // Insert credit note
  const result = await db.transaction(async (tx) => {
    const cn = await tx.insert(creditNotes).values({
      tenantId,
      invoiceNumber: creditNoteNumber,
      date: validated.date,
      customerName,
      customerGstin: customerGstin || null,
      customerAddress: customerAddress || null,
      customerState,
      status: "issued",
      subtotal: String(subtotal.toFixed(2)),
      cgstTotal: String(cgstTotal.toFixed(2)),
      sgstTotal: String(sgstTotal.toFixed(2)),
      igstTotal: String(igstTotal.toFixed(2)),
      discountTotal: String(discountTotal.toFixed(2)),
      grandTotal: String(grandTotal.toFixed(2)),
      fiscalYear: fy,
      createdBy: actorId,
      originalInvoiceId: validated.originalInvoiceId || null,
      reason: validated.reason,
    }).returning({ id: creditNotes.id });

    // Create reversal JE
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

    // Dr Revenue per line (negative amounts reversed)
    for (const line of lineCalculations) {
      jeLines.push({
        accountId: line.accountId,
        debit: String(Math.abs(Number(line.amount))),
        credit: "0",
        description: line.description,
      });
    }

    // Dr CGST/SGST/IGST Input (negative amounts reversed)
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
      date: validated.date,
      narration: `Credit Note ${creditNoteNumber} for ${originalInvoiceNumber ? originalInvoiceNumber + ": " : ""}${validated.reason}`,
      referenceType: "credit_note",
      referenceId: cn[0].id,
      lines: jeLines,
    });

    // Get customer account ID for event (use receivables account as proxy)
    const customerId = receivable?.id || "00000000-0000-0000-0000-000000000000";

    // Append event
    await appendEvent(tx, tenantId, "credit_note", cn[0].id, "credit_note_created", {
      creditNoteId: cn[0].id,
      creditNoteNumber,
      originalInvoiceId: validated.originalInvoiceId,
      customerId,
      customerName,
      totalAmount: Number(grandTotal),
      taxAmount: Number(gstTotal),
      reason: validated.reason,
      journalEntryId: jeResult.entryId,
    }, actorId);

    return { creditNoteId: cn[0].id, creditNoteNumber, journalEntryId: jeResult.entryId };
  });

  return result;
}
