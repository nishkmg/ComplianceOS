import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { invoiceView } from "@complianceos/db";
import type { Projector } from "./types.js";

export const InvoiceViewProjector: Projector = {
  name: "InvoiceViewProjector",
  handles: [
    "invoice_created",
    "invoice_modified",
    "invoice_deleted",
    "invoice_posted",
    "invoice_voided",
    "invoice_sent",
    "credit_note_created",
  ],
  async process(db: Database, event: any): Promise<void> {
    const payload = event.payload as any;
    if (!payload.invoiceId) return;

    // Delete existing row (idempotent upsert via delete+insert)
    await (db as any).delete(invoiceView).where(
      eq(invoiceView.invoiceId, payload.invoiceId),
    );

    // Skip insert for delete/void events
    if (
      event.eventType === "invoice_deleted" ||
      event.eventType === "invoice_voided"
    ) {
      return;
    }

    // Compute days_overdue
    let daysOverdue: string | null = null;
    if (payload.dueDate) {
      const due = new Date(payload.dueDate);
      const now = new Date();
      const diff = Math.floor(
        (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
      daysOverdue = String(diff > 0 ? diff : 0);
    }

    // Map status for credit notes
    let status = payload.status ?? "draft";
    if (event.eventType === "credit_note_created") {
      status = payload.status ?? "issued";
    }

    await (db as any).insert(invoiceView).values({
      tenantId: event.tenantId,
      invoiceId: payload.invoiceId,
      invoiceNumber: payload.invoiceNumber ?? "",
      date: payload.date ?? null,
      dueDate: payload.dueDate ?? null,
      customerName: payload.customerName ?? "",
      customerEmail: payload.customerEmail ?? null,
      customerGstin: payload.customerGstin ?? null,
      customerState: payload.customerState ?? null,
      status,
      subtotal: payload.subtotal ?? "0",
      cgstTotal: payload.cgstTotal ?? "0",
      sgstTotal: payload.sgstTotal ?? "0",
      igstTotal: payload.igstTotal ?? "0",
      discountTotal: payload.discountTotal ?? "0",
      grandTotal: payload.grandTotal ?? "0",
      fiscalYear: payload.fiscalYear ?? "",
      createdBy: payload.createdBy ?? "00000000-0000-0000-0000-000000000000",
      sentAt: payload.sentAt ? new Date(payload.sentAt) : null,
      paidAt: payload.paidAt ? new Date(payload.paidAt) : null,
      pdfUrl: payload.pdfUrl ?? null,
      daysOverdue: daysOverdue,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
};