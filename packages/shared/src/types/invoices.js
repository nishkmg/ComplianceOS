"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceConfigInputSchema = exports.BankDetailsSchema = exports.CreateCreditNoteInputSchema = exports.ModifyInvoiceInputSchema = exports.CreateInvoiceInputSchema = exports.InvoiceLineInputSchema = exports.CreditNoteCreatedPayloadSchema = exports.InvoiceVoidedPayloadSchema = exports.InvoiceSentPayloadSchema = exports.InvoicePostedPayloadSchema = exports.InvoiceCreatedPayloadSchema = void 0;
const zod_1 = require("zod");
// Event payloads
exports.InvoiceCreatedPayloadSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    invoiceNumber: zod_1.z.string(),
    date: zod_1.z.string(),
    dueDate: zod_1.z.string(),
    customerName: zod_1.z.string(),
    customerEmail: zod_1.z.string().email().optional(),
    customerGstin: zod_1.z.string().optional(),
    customerAddress: zod_1.z.string().optional(),
    customerState: zod_1.z.string(),
    lines: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().uuid(),
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        amount: zod_1.z.number(),
        gstRate: zod_1.z.number(),
        cgstAmount: zod_1.z.number(),
        sgstAmount: zod_1.z.number(),
        igstAmount: zod_1.z.number(),
        discountPercent: zod_1.z.number().default(0),
        discountAmount: zod_1.z.number().default(0),
    })),
    subtotal: zod_1.z.number(),
    cgstTotal: zod_1.z.number(),
    sgstTotal: zod_1.z.number(),
    igstTotal: zod_1.z.number(),
    discountTotal: zod_1.z.number(),
    grandTotal: zod_1.z.number(),
    fiscalYear: zod_1.z.string(),
});
exports.InvoicePostedPayloadSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    journalEntryId: zod_1.z.string().uuid().optional(),
    postedAt: zod_1.z.date(),
});
exports.InvoiceSentPayloadSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    sentAt: zod_1.z.date(),
    pdfUrl: zod_1.z.string().optional(),
});
exports.InvoiceVoidedPayloadSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    voidedAt: zod_1.z.date(),
    reversalJournalEntryId: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string(),
});
exports.CreditNoteCreatedPayloadSchema = zod_1.z.object({
    creditNoteId: zod_1.z.string().uuid(),
    creditNoteNumber: zod_1.z.string(),
    originalInvoiceId: zod_1.z.string().uuid().optional(),
    customerId: zod_1.z.string().uuid(),
    customerName: zod_1.z.string(),
    totalAmount: zod_1.z.number(),
    taxAmount: zod_1.z.number(),
    reason: zod_1.z.string(),
    journalEntryId: zod_1.z.string().uuid(),
});
// Command inputs
exports.InvoiceLineInputSchema = zod_1.z.object({
    accountId: zod_1.z.string().uuid(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().positive(),
    unitPrice: zod_1.z.number().min(0),
    gstRate: zod_1.z.number().min(0).max(28),
    discountPercent: zod_1.z.number().min(0).max(100).default(0),
});
exports.CreateInvoiceInputSchema = zod_1.z.object({
    date: zod_1.z.string().date(),
    dueDate: zod_1.z.string().date(),
    customerName: zod_1.z.string().min(1),
    customerEmail: zod_1.z.string().email().optional(),
    customerGstin: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().or(zod_1.z.literal('')),
    customerAddress: zod_1.z.string().optional(),
    customerState: zod_1.z.string(),
    lines: zod_1.z.array(exports.InvoiceLineInputSchema).min(1),
    notes: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
});
exports.ModifyInvoiceInputSchema = exports.CreateInvoiceInputSchema.partial().extend({
// Same as create but all optional
});
exports.CreateCreditNoteInputSchema = zod_1.z.object({
    originalInvoiceId: zod_1.z.string().uuid().optional(),
    date: zod_1.z.string().date(),
    customerName: zod_1.z.string().min(1),
    customerGstin: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().or(zod_1.z.literal('')),
    customerAddress: zod_1.z.string().optional(),
    reason: zod_1.z.string().min(1),
    lines: zod_1.z.array(exports.InvoiceLineInputSchema).min(1),
});
exports.BankDetailsSchema = zod_1.z.object({
    accountName: zod_1.z.string().optional(),
    accountNumber: zod_1.z.string().optional(),
    ifscCode: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
});
exports.InvoiceConfigInputSchema = zod_1.z.object({
    prefix: zod_1.z.string().min(1).max(10),
    logoUrl: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    companyAddress: zod_1.z.string().optional(),
    companyGstin: zod_1.z.string().optional(),
    paymentTerms: zod_1.z.string().optional(),
    bankDetails: exports.BankDetailsSchema.optional(),
    notes: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
});
//# sourceMappingURL=invoices.js.map