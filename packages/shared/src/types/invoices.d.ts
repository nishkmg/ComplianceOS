import { z } from "zod";
export declare const InvoiceCreatedPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    invoiceNumber: z.ZodString;
    date: z.ZodString;
    dueDate: z.ZodString;
    customerName: z.ZodString;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerGstin: z.ZodOptional<z.ZodString>;
    customerAddress: z.ZodOptional<z.ZodString>;
    customerState: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        amount: z.ZodNumber;
        gstRate: z.ZodNumber;
        cgstAmount: z.ZodNumber;
        sgstAmount: z.ZodNumber;
        igstAmount: z.ZodNumber;
        discountPercent: z.ZodDefault<z.ZodNumber>;
        discountAmount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
        gstRate?: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        discountPercent?: number;
        discountAmount?: number;
    }, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
        gstRate?: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        discountPercent?: number;
        discountAmount?: number;
    }>, "many">;
    subtotal: z.ZodNumber;
    cgstTotal: z.ZodNumber;
    sgstTotal: z.ZodNumber;
    igstTotal: z.ZodNumber;
    discountTotal: z.ZodNumber;
    grandTotal: z.ZodNumber;
    fiscalYear: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date?: string;
    fiscalYear?: string;
    invoiceId?: string;
    invoiceNumber?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    subtotal?: number;
    cgstTotal?: number;
    sgstTotal?: number;
    igstTotal?: number;
    discountTotal?: number;
    grandTotal?: number;
    customerAddress?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
        gstRate?: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        discountPercent?: number;
        discountAmount?: number;
    }[];
}, {
    date?: string;
    fiscalYear?: string;
    invoiceId?: string;
    invoiceNumber?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    subtotal?: number;
    cgstTotal?: number;
    sgstTotal?: number;
    igstTotal?: number;
    discountTotal?: number;
    grandTotal?: number;
    customerAddress?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        amount?: number;
        gstRate?: number;
        cgstAmount?: number;
        sgstAmount?: number;
        igstAmount?: number;
        discountPercent?: number;
        discountAmount?: number;
    }[];
}>;
export declare const InvoicePostedPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    journalEntryId: z.ZodOptional<z.ZodString>;
    postedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    journalEntryId?: string;
    invoiceId?: string;
    postedAt?: Date;
}, {
    journalEntryId?: string;
    invoiceId?: string;
    postedAt?: Date;
}>;
export declare const InvoiceSentPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    sentAt: z.ZodDate;
    pdfUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    invoiceId?: string;
    sentAt?: Date;
    pdfUrl?: string;
}, {
    invoiceId?: string;
    sentAt?: Date;
    pdfUrl?: string;
}>;
export declare const InvoiceVoidedPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    voidedAt: z.ZodDate;
    reversalJournalEntryId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    invoiceId?: string;
    reason?: string;
    voidedAt?: Date;
    reversalJournalEntryId?: string;
}, {
    invoiceId?: string;
    reason?: string;
    voidedAt?: Date;
    reversalJournalEntryId?: string;
}>;
export declare const CreditNoteCreatedPayloadSchema: z.ZodObject<{
    creditNoteId: z.ZodString;
    creditNoteNumber: z.ZodString;
    originalInvoiceId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodString;
    customerName: z.ZodString;
    totalAmount: z.ZodNumber;
    taxAmount: z.ZodNumber;
    reason: z.ZodString;
    journalEntryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    journalEntryId?: string;
    customerName?: string;
    originalInvoiceId?: string;
    reason?: string;
    totalAmount?: number;
    creditNoteId?: string;
    creditNoteNumber?: string;
    customerId?: string;
    taxAmount?: number;
}, {
    journalEntryId?: string;
    customerName?: string;
    originalInvoiceId?: string;
    reason?: string;
    totalAmount?: number;
    creditNoteId?: string;
    creditNoteNumber?: string;
    customerId?: string;
    taxAmount?: number;
}>;
export declare const InvoiceLineInputSchema: z.ZodObject<{
    accountId: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    gstRate: z.ZodNumber;
    discountPercent: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    accountId?: string;
    quantity?: number;
    unitPrice?: number;
    gstRate?: number;
    discountPercent?: number;
}, {
    description?: string;
    accountId?: string;
    quantity?: number;
    unitPrice?: number;
    gstRate?: number;
    discountPercent?: number;
}>;
export declare const CreateInvoiceInputSchema: z.ZodObject<{
    date: z.ZodString;
    dueDate: z.ZodString;
    customerName: z.ZodString;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerGstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    customerAddress: z.ZodOptional<z.ZodString>;
    customerState: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        gstRate: z.ZodNumber;
        discountPercent: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    customerAddress?: string;
    notes?: string;
    terms?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}, {
    date?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    customerAddress?: string;
    notes?: string;
    terms?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}>;
export declare const ModifyInvoiceInputSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    customerName: z.ZodOptional<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerGstin: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    customerAddress: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    customerState: z.ZodOptional<z.ZodString>;
    lines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        gstRate: z.ZodNumber;
        discountPercent: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    terms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    customerAddress?: string;
    notes?: string;
    terms?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}, {
    date?: string;
    dueDate?: string;
    customerName?: string;
    customerEmail?: string;
    customerGstin?: string;
    customerState?: string;
    customerAddress?: string;
    notes?: string;
    terms?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}>;
export declare const CreateCreditNoteInputSchema: z.ZodObject<{
    originalInvoiceId: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    customerName: z.ZodString;
    customerGstin: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    customerAddress: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        gstRate: z.ZodNumber;
        discountPercent: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }, {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date?: string;
    customerName?: string;
    customerGstin?: string;
    customerAddress?: string;
    originalInvoiceId?: string;
    reason?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}, {
    date?: string;
    customerName?: string;
    customerGstin?: string;
    customerAddress?: string;
    originalInvoiceId?: string;
    reason?: string;
    lines?: {
        description?: string;
        accountId?: string;
        quantity?: number;
        unitPrice?: number;
        gstRate?: number;
        discountPercent?: number;
    }[];
}>;
export declare const BankDetailsSchema: z.ZodObject<{
    accountName: z.ZodOptional<z.ZodString>;
    accountNumber: z.ZodOptional<z.ZodString>;
    ifscCode: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
}, {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
}>;
export declare const InvoiceConfigInputSchema: z.ZodObject<{
    prefix: z.ZodString;
    logoUrl: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    companyAddress: z.ZodOptional<z.ZodString>;
    companyGstin: z.ZodOptional<z.ZodString>;
    paymentTerms: z.ZodOptional<z.ZodString>;
    bankDetails: z.ZodOptional<z.ZodObject<{
        accountName: z.ZodOptional<z.ZodString>;
        accountNumber: z.ZodOptional<z.ZodString>;
        ifscCode: z.ZodOptional<z.ZodString>;
        bankName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        ifscCode?: string;
    }, {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        ifscCode?: string;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string;
    terms?: string;
    prefix?: string;
    logoUrl?: string;
    companyName?: string;
    companyAddress?: string;
    companyGstin?: string;
    paymentTerms?: string;
    bankDetails?: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        ifscCode?: string;
    };
}, {
    notes?: string;
    terms?: string;
    prefix?: string;
    logoUrl?: string;
    companyName?: string;
    companyAddress?: string;
    companyGstin?: string;
    paymentTerms?: string;
    bankDetails?: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        ifscCode?: string;
    };
}>;
//# sourceMappingURL=invoices.d.ts.map