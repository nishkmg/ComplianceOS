import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { invoices, invoiceLines, tenants } = _db;
import { appendEvent } from "../lib/event-store";
import { generateInvoicePdf, type InvoiceWithLines, type InvoiceConfig } from "../services/pdf-generator";
import { EmailQueueService } from "../services/email-queue";
import { stateCodeToGstPrefix, getStateName } from "@complianceos/shared";

export async function sendInvoice(
  db: Database,
  tenantId: string,
  actorId: string,
  invoiceId: string,
): Promise<{ invoiceId: string; pdfUrl: string; emailQueued: boolean }> {
  // Load invoice
  const [invoice] = await db.select().from(invoices).where(
    and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)),
  ).limit(1);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status !== "draft" && invoice.status !== "sent") {
    throw new Error(`Invoice status must be draft or sent, got: ${invoice.status}`);
  }

  // Load invoice lines
  const lines = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId));

  // Transform to PDF generator format
  const invoiceData: InvoiceWithLines = {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    cgstTotal: Number(invoice.cgstTotal),
    sgstTotal: Number(invoice.sgstTotal),
    igstTotal: Number(invoice.igstTotal),
    discountTotal: Number(invoice.discountTotal),
    grandTotal: Number(invoice.grandTotal),
    lines: lines.map((line) => ({
      description: line.description,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      gstRate: Number(line.gstRate),
      amount: Number(line.amount),
      cgstAmount: Number(line.cgstAmount),
      sgstAmount: Number(line.sgstAmount),
      igstAmount: Number(line.igstAmount),
      discountPercent: Number(line.discountPercent ?? 0),
      discountAmount: Number(line.discountAmount ?? 0),
    })),
  };

  // Fetch tenant config for invoice header
  const [tenant] = await db.select({
    name: tenants.name,
    legalName: tenants.legalName,
    stateCode: tenants.stateCode,
    gstin: tenants.gstin,
    pan: tenants.pan,
    address: tenants.address,
    bankAccount: tenants.bankAccount,
    bankIfsc: tenants.bankIfsc,
  }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);

  if (!tenant) {
    throw new Error("Tenant not found");
  }
  if (!tenant.stateCode) {
    throw new Error("Tenant state code not configured. Update tenant config before sending invoices.");
  }

  const config: InvoiceConfig = {
    company: {
      name: tenant.legalName || tenant.name,
      address: invoice.customerAddress || "123 Business Park, Suite 100",
      city: "Chennai",
      state: stateCodeToGstPrefix(tenant.stateCode),
      gstin: tenant.gstin || "",
      pan: tenant.pan || "",
      email: "billing@example.com",
      phone: "+91 98765 43210",
      bankName: "Bank",
      bankAccount: tenant.bankAccount || "",
      bankIfsc: tenant.bankIfsc || "",
    },
  };

  // Generate PDF
  const { buffer, url: signedUrl, storagePath } = await generateInvoicePdf(invoiceData, config);

  // Update invoice with PDF URL
  const now = new Date();
  await db.update(invoices)
    .set({
      status: "sent",
      sentAt: now,
      pdfUrl: storagePath,
      updatedAt: now,
    })
    .where(eq(invoices.id, invoiceId));

  // Queue email if customer email exists
  let emailQueued = false;
  if (invoice.customerEmail) {
    const emailService = new EmailQueueService(db);
    await emailService.enqueue({
      tenantId,
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber} from ${config.company.name}`,
      body: buildEmailBody(invoice, config),
      attachments: [{ filename: `Invoice-${invoice.invoiceNumber}.pdf`, url: signedUrl }],
    });
    emailQueued = true;
  }

  // Append event
  await appendEvent(db, tenantId, "invoice", invoiceId, "invoice_sent", {
    invoiceId,
    sentAt: now.toISOString(),
    pdfUrl: storagePath,
  }, actorId);

  return { invoiceId, pdfUrl: signedUrl, emailQueued };
}

function buildEmailBody(invoice: typeof invoices.$inferSelect, config: InvoiceConfig): string {
  return `
    <html>
      <body>
        <p>Dear ${invoice.customerName},</p>
        <p>Please find attached invoice <strong>${invoice.invoiceNumber}</strong> dated ${invoice.date}.</p>
        <p><strong>Amount Due: ₹${invoice.grandTotal}</strong></p>
        <p>Due Date: ${invoice.dueDate}</p>
        <p>Thank you for your business!</p>
        <br/>
        <p>Best regards,<br/>${config.company.name}</p>
      </body>
    </html>
  `;
}