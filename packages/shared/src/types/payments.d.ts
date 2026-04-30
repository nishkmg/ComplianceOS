import { z } from "zod";
export declare const PaymentRecordedPayloadSchema: z.ZodObject<{
    paymentId: z.ZodString;
    paymentNumber: z.ZodString;
    date: z.ZodString;
    amount: z.ZodNumber;
    customerName: z.ZodString;
    allocations: z.ZodArray<z.ZodObject<{
        invoiceId: z.ZodString;
        allocatedAmount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        invoiceId?: string;
        allocatedAmount?: number;
    }, {
        invoiceId?: string;
        allocatedAmount?: number;
    }>, "many">;
    journalEntryId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    journalEntryId?: string;
    customerName?: string;
    amount?: number;
    paymentNumber?: string;
    paymentId?: string;
    allocations?: {
        invoiceId?: string;
        allocatedAmount?: number;
    }[];
}, {
    date?: string;
    journalEntryId?: string;
    customerName?: string;
    amount?: number;
    paymentNumber?: string;
    paymentId?: string;
    allocations?: {
        invoiceId?: string;
        allocatedAmount?: number;
    }[];
}>;
export declare const PaymentVoidedPayloadSchema: z.ZodObject<{
    paymentId: z.ZodString;
    voidedAt: z.ZodDate;
    reversalJournalEntryId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    paymentId?: string;
    voidedAt?: Date;
    reversalJournalEntryId?: string;
}, {
    reason?: string;
    paymentId?: string;
    voidedAt?: Date;
    reversalJournalEntryId?: string;
}>;
export declare const PaymentAllocationInputSchema: z.ZodObject<{
    invoiceId: z.ZodString;
    allocatedAmount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    invoiceId?: string;
    allocatedAmount?: number;
}, {
    invoiceId?: string;
    allocatedAmount?: number;
}>;
export declare const RecordPaymentInputSchema: z.ZodObject<{
    date: z.ZodString;
    customerName: z.ZodString;
    amount: z.ZodNumber;
    paymentMethod: z.ZodEnum<["cash", "bank", "online", "cheque"]>;
    referenceNumber: z.ZodOptional<z.ZodString>;
    allocations: z.ZodArray<z.ZodObject<{
        invoiceId: z.ZodString;
        allocatedAmount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        invoiceId?: string;
        allocatedAmount?: number;
    }, {
        invoiceId?: string;
        allocatedAmount?: number;
    }>, "many">;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    customerName?: string;
    notes?: string;
    amount?: number;
    paymentMethod?: "bank" | "cash" | "online" | "cheque";
    referenceNumber?: string;
    allocations?: {
        invoiceId?: string;
        allocatedAmount?: number;
    }[];
}, {
    date?: string;
    customerName?: string;
    notes?: string;
    amount?: number;
    paymentMethod?: "bank" | "cash" | "online" | "cheque";
    referenceNumber?: string;
    allocations?: {
        invoiceId?: string;
        allocatedAmount?: number;
    }[];
}>;
export declare const VoidPaymentInputSchema: z.ZodObject<{
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
}, {
    reason?: string;
}>;
//# sourceMappingURL=payments.d.ts.map