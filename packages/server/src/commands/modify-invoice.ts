// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines } = _db;
import { appendEvent } from "../lib/event-store";

type ModifyInvoiceInput = {
  id: string;
  date?: string;
  dueDate?: string;
  customerName?: string;
  customerEmail?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerState?: string;
  notes?: string;
  terms?: string;
};

export async function modifyInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  input: ModifyInvoiceInput,
): Promise<{ invoiceId: string }> {
  const existing = await db.select().from(invoices).where(
    and(eq(invoices.id, input.id), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (!existing[0]) {
    throw new Error("Invoice not found");
  }
  if (existing[0].status !== "draft") {
    throw new Error("Only draft invoices can be modified");
  }

  const result = await db.transaction(async (tx) => {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (input.date !== undefined) updateData.date = input.date;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
    if (input.customerName !== undefined) updateData.customerName = input.customerName;
    if (input.customerEmail !== undefined) updateData.customerEmail = input.customerEmail;
    if (input.customerGstin !== undefined) updateData.customerGstin = input.customerGstin || null;
    if (input.customerAddress !== undefined) updateData.customerAddress = input.customerAddress;
    if (input.customerState !== undefined) updateData.customerState = input.customerState;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.terms !== undefined) updateData.terms = input.terms;

    await tx.update(invoices).set(updateData).where(eq(invoices.id, input.id));

    await appendEvent(tx, tenantId, "invoice", input.id, "invoice_modified", {
      invoiceId: input.id,
      invoiceNumber: existing[0].invoiceNumber,
      changes: updateData,
    }, actorId);

    return { invoiceId: input.id };
  });

  return result;
}
