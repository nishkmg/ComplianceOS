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
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        gstRate: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        discountPercent: number;
        discountAmount: number;
    }, {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        gstRate: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        discountPercent?: number | undefined;
        discountAmount?: number | undefined;
    }>, "many">;
    subtotal: z.ZodNumber;
    cgstTotal: z.ZodNumber;
    sgstTotal: z.ZodNumber;
    igstTotal: z.ZodNumber;
    discountTotal: z.ZodNumber;
    grandTotal: z.ZodNumber;
    fiscalYear: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        gstRate: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        discountPercent: number;
        discountAmount: number;
    }[];
    fiscalYear: string;
    invoiceId: string;
    invoiceNumber: string;
    dueDate: string;
    customerName: string;
    customerState: string;
    subtotal: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    discountTotal: number;
    grandTotal: number;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
}, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        gstRate: number;
        cgstAmount: number;
        sgstAmount: number;
        igstAmount: number;
        discountPercent?: number | undefined;
        discountAmount?: number | undefined;
    }[];
    fiscalYear: string;
    invoiceId: string;
    invoiceNumber: string;
    dueDate: string;
    customerName: string;
    customerState: string;
    subtotal: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    discountTotal: number;
    grandTotal: number;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
}>;
export declare const InvoicePostedPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    journalEntryId: z.ZodOptional<z.ZodString>;
    postedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    postedAt: Date;
    invoiceId: string;
    journalEntryId?: string | undefined;
}, {
    postedAt: Date;
    invoiceId: string;
    journalEntryId?: string | undefined;
}>;
export declare const InvoiceSentPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    sentAt: z.ZodDate;
    pdfUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    invoiceId: string;
    sentAt: Date;
    pdfUrl?: string | undefined;
}, {
    invoiceId: string;
    sentAt: Date;
    pdfUrl?: string | undefined;
}>;
export declare const InvoiceVoidedPayloadSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    voidedAt: z.ZodDate;
    reversalJournalEntryId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    voidedAt: Date;
    invoiceId: string;
    reversalJournalEntryId?: string | undefined;
}, {
    reason: string;
    voidedAt: Date;
    invoiceId: string;
    reversalJournalEntryId?: string | undefined;
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
    reason: string;
    customerName: string;
    journalEntryId: string;
    creditNoteId: string;
    creditNoteNumber: string;
    customerId: string;
    totalAmount: number;
    taxAmount: number;
    originalInvoiceId?: string | undefined;
}, {
    reason: string;
    customerName: string;
    journalEntryId: string;
    creditNoteId: string;
    creditNoteNumber: string;
    customerId: string;
    totalAmount: number;
    taxAmount: number;
    originalInvoiceId?: string | undefined;
}>;
export declare const InvoiceLineInputSchema: z.ZodObject<{
    accountId: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
    gstRate: z.ZodNumber;
    discountPercent: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    accountId: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    discountPercent: number;
}, {
    description: string;
    accountId: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    discountPercent?: number | undefined;
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
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }, {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }[];
    dueDate: string;
    customerName: string;
    customerState: string;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    notes?: string | undefined;
    terms?: string | undefined;
}, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }[];
    dueDate: string;
    customerName: string;
    customerState: string;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    notes?: string | undefined;
    terms?: string | undefined;
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
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }, {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }>, "many">>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    terms: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    date?: string | undefined;
    lines?: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }[] | undefined;
    dueDate?: string | undefined;
    customerName?: string | undefined;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    customerState?: string | undefined;
    notes?: string | undefined;
    terms?: string | undefined;
}, {
    date?: string | undefined;
    lines?: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }[] | undefined;
    dueDate?: string | undefined;
    customerName?: string | undefined;
    customerEmail?: string | undefined;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    customerState?: string | undefined;
    notes?: string | undefined;
    terms?: string | undefined;
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
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }, {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent: number;
    }[];
    reason: string;
    customerName: string;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    originalInvoiceId?: string | undefined;
}, {
    date: string;
    lines: {
        description: string;
        accountId: string;
        quantity: number;
        unitPrice: number;
        gstRate: number;
        discountPercent?: number | undefined;
    }[];
    reason: string;
    customerName: string;
    customerGstin?: string | undefined;
    customerAddress?: string | undefined;
    originalInvoiceId?: string | undefined;
}>;
export declare const BankDetailsSchema: z.ZodObject<{
    accountName: z.ZodOptional<z.ZodString>;
    accountNumber: z.ZodOptional<z.ZodString>;
    ifscCode: z.ZodOptional<z.ZodString>;
    bankName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountName?: string | undefined;
    accountNumber?: string | undefined;
    ifscCode?: string | undefined;
    bankName?: string | undefined;
}, {
    accountName?: string | undefined;
    accountNumber?: string | undefined;
    ifscCode?: string | undefined;
    bankName?: string | undefined;
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
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        bankName?: string | undefined;
    }, {
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        bankName?: string | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prefix: string;
    notes?: string | undefined;
    terms?: string | undefined;
    logoUrl?: string | undefined;
    companyName?: string | undefined;
    companyAddress?: string | undefined;
    companyGstin?: string | undefined;
    paymentTerms?: string | undefined;
    bankDetails?: {
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        bankName?: string | undefined;
    } | undefined;
}, {
    prefix: string;
    notes?: string | undefined;
    terms?: string | undefined;
    logoUrl?: string | undefined;
    companyName?: string | undefined;
    companyAddress?: string | undefined;
    companyGstin?: string | undefined;
    paymentTerms?: string | undefined;
    bankDetails?: {
        accountName?: string | undefined;
        accountNumber?: string | undefined;
        ifscCode?: string | undefined;
        bankName?: string | undefined;
    } | undefined;
}>;
//# sourceMappingURL=invoices.d.ts.map