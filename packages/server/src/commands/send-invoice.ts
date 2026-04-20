import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { invoices } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

// Stub for PDF generation - in real impl this would call a PDF service
async function generateInvoicePdf(invoiceId: string): Promise<{ pdfUrl: string }> {
  // TODO: integrate with actual PDF generator service
  return { pdfUrl: `https://storage.example.com/invoices/${invoiceId}.pdf` };
}

// Stub for email queue - in real impl this would queue an email job
async function queueInvoiceEmail(invoiceId: string, pdfUrl: string): Promise<void> {
  // TODO: integrate with email queue service
  console.log(`Queued email for invoice ${invoiceId} with PDF ${pdfUrl}`);
}

export async function sendInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  invoiceId: string,
): Promise<{ invoiceId: string; pdfUrl: string }> {
  // Load invoice
  const invoice = await db.select().from(invoices).where(
    and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (invoice.length === 0) {
    throw new Error("Invoice not found");
  }

  const status = invoice[0].status;
  if (status !== "draft" && status !== "sent") {
    throw new Error(`Invoice status must be draft or sent, got: ${status}`);
  }

  // Generate PDF
  const { pdfUrl } = await generateInvoicePdf(invoiceId);

  // Queue email
  await queueInvoiceEmail(invoiceId, pdfUrl);

  const now = new Date();

  // Update invoice: sent_at = now, pdf_url, status = 'sent'
  await db.update(invoices)
    .set({
      status: "sent",
      sentAt: now,
      pdfUrl,
      updatedAt: now,
    })
    .where(eq(invoices.id, invoiceId));

  // Append event
  await appendEvent(db, tenantId, "invoice", invoiceId, "invoice_sent", {
    invoiceId,
    sentAt: now.toISOString(),
    pdfUrl,
  }, actorId);

  return { invoiceId, pdfUrl };
}