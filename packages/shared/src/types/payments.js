"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoidPaymentInputSchema = exports.RecordPaymentInputSchema = exports.PaymentAllocationInputSchema = exports.PaymentVoidedPayloadSchema = exports.PaymentRecordedPayloadSchema = void 0;
const zod_1 = require("zod");
exports.PaymentRecordedPayloadSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid(),
    paymentNumber: zod_1.z.string(),
    date: zod_1.z.string(),
    amount: zod_1.z.number(),
    customerName: zod_1.z.string(),
    allocations: zod_1.z.array(zod_1.z.object({
        invoiceId: zod_1.z.string().uuid(),
        allocatedAmount: zod_1.z.number().positive(),
    })),
    journalEntryId: zod_1.z.string().uuid().optional(),
});
exports.PaymentVoidedPayloadSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid(),
    voidedAt: zod_1.z.date(),
    reversalJournalEntryId: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string(),
});
exports.PaymentAllocationInputSchema = zod_1.z.object({
    invoiceId: zod_1.z.string().uuid(),
    allocatedAmount: zod_1.z.number().positive(),
});
exports.RecordPaymentInputSchema = zod_1.z.object({
    date: zod_1.z.string().date(),
    customerName: zod_1.z.string().min(1),
    amount: zod_1.z.number().positive(),
    paymentMethod: zod_1.z.enum(['cash', 'bank', 'online', 'cheque']),
    referenceNumber: zod_1.z.string().optional(),
    allocations: zod_1.z.array(exports.PaymentAllocationInputSchema).min(1),
    notes: zod_1.z.string().optional(),
});
exports.VoidPaymentInputSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1),
});
//# sourceMappingURL=payments.js.map