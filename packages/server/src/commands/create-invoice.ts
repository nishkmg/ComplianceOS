// @ts-nocheck
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines } = _db;
import * as _shared from "../../../shared/src/index";
const { CreateInvoiceInputSchema } = _shared;
import { getNextInvoiceNumber } from "../services/invoice-number";

export async function createInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    date: string;
    dueDate: string;
    customerName: string;
    customerEmail?: string;
    customerGstin?: string;
    customerAddress?: string;
    customerState: string;
    lines: Array<{
      accountId: string;
      description: string;
      quantity: number;
      unitPrice: number;
      gstRate: number;
      discountPercent?: number;
    }>;
    notes?: string;
    terms?: string;
  },
): Promise<{ invoiceId: string; invoiceNumber: string }> {
  const validated = CreateInvoiceInputSchema.parse(input);

  // Determine fiscal year from date
  const dateStr = validated.date;
  const year = new Date(dateStr).getFullYear();
  const fy = year >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;

  const invoiceNumber = await getNextInvoiceNumber(db, tenantId, fy);

  // For GST calculation, we need tenant state. Use a default "IN-TN" for now or
  // require it to be passed in. We'll use a placeholder - in real impl would come from tenant config.
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

    let cgstAmount = "0";
    let sgstAmount = "0";
    let igstAmount = "0";

    if (validated.customerState === tenantState) {
      // Intra-state: CGST + SGST each half of rate
      cgstAmount = String((amount * gstRate / 200).toFixed(2));
      sgstAmount = String((amount * gstRate / 200).toFixed(2));
    } else {
      // Inter-state: IGST = full rate
      igstAmount = String((amount * gstRate / 100).toFixed(2));
    }

    return {
      accountId: line.accountId,
      description: line.description,
      quantity: String(qty),
      unitPrice: String(unitPrice),
      amount: String(amount.toFixed(2)),
      gstRate: String(gstRate),
      cgstAmount,
      sgstAmount,
      igstAmount,
      discountPercent: String(discountPct),
      discountAmount: String(discountAmount.toFixed(2)),
    };
  });

  // Calculate totals
  const subtotal = lineCalculations.reduce((sum, l) => sum + Number(l.amount), 0);
  const cgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.cgstAmount), 0);
  const sgstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.sgstAmount), 0);
  const igstTotal = lineCalculations.reduce((sum, l) => sum + Number(l.igstAmount), 0);
  const discountTotal = lineCalculations.reduce((sum, l) => sum + Number(l.discountAmount), 0);
  const gstTotal = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = subtotal + gstTotal - discountTotal;

  const result = await db.transaction(async (tx) => {
    const invoice = await tx.insert(invoices).values({
      tenantId,
      invoiceNumber,
      date: validated.date,
      dueDate: validated.dueDate,
      customerName: validated.customerName,
      customerEmail: validated.customerEmail,
      customerGstin: validated.customerGstin || null,
      customerAddress: validated.customerAddress || null,
      customerState: validated.customerState,
      status: "draft",
      subtotal: String(subtotal.toFixed(2)),
      cgstTotal: String(cgstTotal.toFixed(2)),
      sgstTotal: String(sgstTotal.toFixed(2)),
      igstTotal: String(igstTotal.toFixed(2)),
      discountTotal: String(discountTotal.toFixed(2)),
      grandTotal: String(grandTotal.toFixed(2)),
      fiscalYear: fy,
      createdBy: actorId,
      notes: validated.notes || null,
      terms: validated.terms || null,
    }).returning({ id: invoices.id });

    await tx.insert(invoiceLines).values(
      lineCalculations.map((l) => ({
        invoiceId: invoice[0].id,
        accountId: l.accountId,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        amount: l.amount,
        gstRate: l.gstRate,
        cgstAmount: l.cgstAmount,
        sgstAmount: l.sgstAmount,
        igstAmount: l.igstAmount,
        discountPercent: l.discountPercent,
        discountAmount: l.discountAmount,
      })),
    );

    return { invoiceId: invoice[0].id, invoiceNumber };
  });

  return result;
}