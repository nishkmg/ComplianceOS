"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTChallanCreatedPayloadSchema = exports.ITCUtilizedPayloadSchema = exports.GSTPaymentMadePayloadSchema = exports.ITCUtilizationResultSchema = exports.GSTChallanOutputSchema = exports.GSTLedgerBalanceSchema = exports.UtilizeITCInputSchema = exports.PayGSTInputSchema = exports.CreateGSTChallanInputSchema = exports.GSTTransactionType = exports.GSTTaxType = void 0;
const zod_1 = require("zod");
// ============================================================================
// Enums
// ============================================================================
var GSTTaxType;
(function (GSTTaxType) {
    GSTTaxType["IGST"] = "igst";
    GSTTaxType["CGST"] = "cgst";
    GSTTaxType["SGST"] = "sgst";
    GSTTaxType["CESS"] = "cess";
})(GSTTaxType || (exports.GSTTaxType = GSTTaxType = {}));
var GSTTransactionType;
(function (GSTTransactionType) {
    GSTTransactionType["PAYMENT"] = "payment";
    GSTTransactionType["INTEREST"] = "interest";
    GSTTransactionType["PENALTY"] = "penalty";
    GSTTransactionType["REFUND"] = "refund";
    GSTTransactionType["ITC_UTILIZATION"] = "itc_utilization";
})(GSTTransactionType || (exports.GSTTransactionType = GSTTransactionType = {}));
// ============================================================================
// Input Schemas
// ============================================================================
exports.CreateGSTChallanInputSchema = zod_1.z.object({
    periodMonth: zod_1.z.number().min(1).max(12),
    periodYear: zod_1.z.number().min(2000),
    taxAmounts: zod_1.z.object({
        igst: zod_1.z.string().optional(),
        cgst: zod_1.z.string().optional(),
        sgst: zod_1.z.string().optional(),
        cess: zod_1.z.string().optional(),
        interest: zod_1.z.string().optional(),
        penalty: zod_1.z.string().optional(),
    }),
});
exports.PayGSTInputSchema = zod_1.z.object({
    challanId: zod_1.z.string().uuid(),
    paymentMode: zod_1.z.enum(["NEFT", "RTGS", "UPI", "Credit Card", "Debit Card", "Over the Counter"]),
});
exports.UtilizeITCInputSchema = zod_1.z.object({
    periodMonth: zod_1.z.number().min(1).max(12),
    periodYear: zod_1.z.number().min(2000),
    taxType: zod_1.z.nativeEnum(GSTTaxType),
    utilizationOrder: zod_1.z.array(zod_1.z.nativeEnum(GSTTaxType)).optional(),
});
// ============================================================================
// Output Types
// ============================================================================
exports.GSTLedgerBalanceSchema = zod_1.z.object({
    cashBalance: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    itcBalance: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    liabilityBalance: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
        interest: zod_1.z.string(),
        penalty: zod_1.z.string(),
    }),
    asOfDate: zod_1.z.date(),
});
exports.GSTChallanOutputSchema = zod_1.z.object({
    challanNumber: zod_1.z.string(),
    cin: zod_1.z.string().optional(),
    amount: zod_1.z.string(),
    generatedAt: zod_1.z.date(),
    validUntil: zod_1.z.date(),
    status: zod_1.z.enum(["generated", "paid", "expired"]),
});
exports.ITCUtilizationResultSchema = zod_1.z.object({
    utilized: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
    }),
    remaining: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
    }),
    cashRequired: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.GSTPaymentMadePayloadSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid(),
    challanNumber: zod_1.z.string(),
    cin: zod_1.z.string(),
    taxpayerGstin: zod_1.z.string(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    amount: zod_1.z.string(),
    paymentMode: zod_1.z.string(),
    paidAt: zod_1.z.date(),
    taxBreakup: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
        interest: zod_1.z.string(),
        penalty: zod_1.z.string(),
    }),
});
exports.ITCUtilizedPayloadSchema = zod_1.z.object({
    utilizationId: zod_1.z.string().uuid(),
    taxpayerGstin: zod_1.z.string(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    utilized: exports.ITCUtilizationResultSchema.shape.utilized,
    remaining: exports.ITCUtilizationResultSchema.shape.remaining,
    utilizedAt: zod_1.z.date(),
});
exports.GSTChallanCreatedPayloadSchema = zod_1.z.object({
    challanId: zod_1.z.string().uuid(),
    challanNumber: zod_1.z.string(),
    taxpayerGstin: zod_1.z.string(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    totalAmount: zod_1.z.string(),
    taxBreakup: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
        interest: zod_1.z.string(),
        penalty: zod_1.z.string(),
    }),
    validUntil: zod_1.z.date(),
    createdAt: zod_1.z.date(),
});
//# sourceMappingURL=gst-ledger.js.map