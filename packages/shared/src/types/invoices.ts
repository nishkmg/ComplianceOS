import { z } from "zod";

// Event payloads
export const InvoiceCreatedPayloadSchema = z.object({
  invoiceId: z.string().uuid(),
  invoiceNumber: z.string(),
  date: z.string(),
  dueDate: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email().optional(),
  customerGstin: z.string().optional(),
  customerAddress: z.string().optional(),
  customerState: z.string(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number(),
    gstRate: z.number(),
    cgstAmount: z.number(),
    sgstAmount: z.number(),
    igstAmount: z.number(),
    discountPercent: z.number().default(0),
    discountAmount: z.number().default(0),
  })),
  subtotal: z.number(),
  cgstTotal: z.number(),
  sgstTotal: z.number(),
  igstTotal: z.number(),
  discountTotal: z.number(),
  grandTotal: z.number(),
  fiscalYear: z.string(),
});

export const InvoicePostedPayloadSchema = z.object({
  invoiceId: z.string().uuid(),
  journalEntryId: z.string().uuid().optional(),
  postedAt: z.date(),
});

export const InvoiceSentPayloadSchema = z.object({
  invoiceId: z.string().uuid(),
  sentAt: z.date(),
  pdfUrl: z.string().optional(),
});

export const InvoiceVoidedPayloadSchema = z.object({
  invoiceId: z.string().uuid(),
  voidedAt: z.date(),
  reversalJournalEntryId: z.string().uuid().optional(),
  reason: z.string(),
});

export const CreditNoteCreatedPayloadSchema = z.object({
  creditNoteId: z.string().uuid(),
  originalInvoiceId: z.string().uuid(),
  reason: z.string(),
  amount: z.number(),
  journalEntryId: z.string().uuid().optional(),
});

// Command inputs
export const InvoiceLineInputSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  gstRate: z.number().min(0).max(28),
  discountPercent: z.number().min(0).max(100).default(0),
});

export const CreateInvoiceInputSchema = z.object({
  date: z.string().date(),
  dueDate: z.string().date(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerGstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().or(z.literal('')),
  customerAddress: z.string().optional(),
  customerState: z.string(),
  lines: z.array(InvoiceLineInputSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export const ModifyInvoiceInputSchema = CreateInvoiceInputSchema.partial().extend({
  // Same as create but all optional
});

export const CreateCreditNoteInputSchema = z.object({
  originalInvoiceId: z.string().uuid(),
  reason: z.string().min(1),
  lines: z.array(InvoiceLineInputSchema).min(1),
});
