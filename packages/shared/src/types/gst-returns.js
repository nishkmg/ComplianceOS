"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTReturnFiledPayloadSchema = exports.GSTR3BGeneratedPayloadSchema = exports.GSTR2BGeneratedPayloadSchema = exports.GSTR1GeneratedPayloadSchema = exports.GSTReturnSummarySchema = exports.GSTR3BOutputSchema = exports.GSTR3BTable9Schema = exports.GSTR3BTable8Schema = exports.GSTR3BTable7Schema = exports.GSTR3BTable6Schema = exports.GSTR3BTable5Schema = exports.GSTR3BTable4Schema = exports.GSTR3BTable3_2EntrySchema = exports.GSTR3BTable3_1Schema = exports.GSTR2BOutputSchema = exports.GSTR2B5EntrySchema = exports.GSTR2B4EntrySchema = exports.GSTR2B3DEntrySchema = exports.GSTR2B3BEntrySchema = exports.GSTR2B3AEntrySchema = exports.GSTR1OutputSchema = exports.GSTR1EXPEntrySchema = exports.GSTR1CDNUREntrySchema = exports.GSTR1CDNREntrySchema = exports.GSTR1B2CSEntrySchema = exports.GSTR1B2CLEntrySchema = exports.GSTR1B2BEntrySchema = exports.AmendGSTReturnInputSchema = exports.FileGSTReturnInputSchema = exports.GenerateGSTR3BInputSchema = exports.GenerateGSTR2BInputSchema = exports.GenerateGSTR1InputSchema = exports.GSTReturnStatus = exports.GSTReturnType = void 0;
const zod_1 = require("zod");
// ============================================================================
// Enums
// ============================================================================
var GSTReturnType;
(function (GSTReturnType) {
    GSTReturnType["GSTR1"] = "gstr1";
    GSTReturnType["GSTR2B"] = "gstr2b";
    GSTReturnType["GSTR3B"] = "gstr3b";
})(GSTReturnType || (exports.GSTReturnType = GSTReturnType = {}));
var GSTReturnStatus;
(function (GSTReturnStatus) {
    GSTReturnStatus["DRAFT"] = "draft";
    GSTReturnStatus["GENERATED"] = "generated";
    GSTReturnStatus["FILED"] = "filed";
    GSTReturnStatus["AMENDED"] = "amended";
})(GSTReturnStatus || (exports.GSTReturnStatus = GSTReturnStatus = {}));
// ============================================================================
// Input Schemas
// ============================================================================
exports.GenerateGSTR1InputSchema = zod_1.z.object({
    periodMonth: zod_1.z.number().min(1).max(12),
    periodYear: zod_1.z.number().min(2000),
});
exports.GenerateGSTR2BInputSchema = zod_1.z.object({
    periodMonth: zod_1.z.number().min(1).max(12),
    periodYear: zod_1.z.number().min(2000),
});
exports.GenerateGSTR3BInputSchema = zod_1.z.object({
    periodMonth: zod_1.z.number().min(1).max(12),
    periodYear: zod_1.z.number().min(2000),
});
exports.FileGSTReturnInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    arn: zod_1.z.string(),
});
exports.AmendGSTReturnInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    changes: zod_1.z.record(zod_1.z.unknown()),
});
// ============================================================================
// Output Types - GSTR1 Tables
// ============================================================================
exports.GSTR1B2BEntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    recipientGstin: zod_1.z.string(),
    recipientName: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
});
exports.GSTR1B2CLEntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    recipientGstin: zod_1.z.string(),
    recipientName: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
});
exports.GSTR1B2CSEntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
    ecommerceGstin: zod_1.z.string().optional(),
});
exports.GSTR1CDNREntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    returnInvoiceNumber: zod_1.z.string(),
    returnInvoiceDate: zod_1.z.string(),
    recipientGstin: zod_1.z.string(),
    recipientName: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
});
exports.GSTR1CDNUREntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    returnInvoiceNumber: zod_1.z.string(),
    returnInvoiceDate: zod_1.z.string(),
    recipientGstin: zod_1.z.string().optional(),
    recipientName: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
});
exports.GSTR1EXPEntrySchema = zod_1.z.object({
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cess: zod_1.z.string(),
    shippingBillNumber: zod_1.z.string(),
    shippingBillDate: zod_1.z.string(),
    portCode: zod_1.z.string(),
});
exports.GSTR1OutputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    tables: zod_1.z.object({
        B2B: zod_1.z.array(exports.GSTR1B2BEntrySchema),
        B2CL: zod_1.z.array(exports.GSTR1B2CLEntrySchema),
        B2CS: zod_1.z.array(exports.GSTR1B2CSEntrySchema),
        CDNR: zod_1.z.array(exports.GSTR1CDNREntrySchema),
        CDNUR: zod_1.z.array(exports.GSTR1CDNUREntrySchema),
        EXP: zod_1.z.array(exports.GSTR1EXPEntrySchema),
    }),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// Output Types - GSTR2B Tables
// ============================================================================
exports.GSTR2B3AEntrySchema = zod_1.z.object({
    supplierGstin: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
    reverseCharge: zod_1.z.boolean(),
});
exports.GSTR2B3BEntrySchema = zod_1.z.object({
    supplierGstin: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
    importType: zod_1.z.enum(["SEZ", "Non-SEZ"]),
});
exports.GSTR2B3DEntrySchema = zod_1.z.object({
    supplierGstin: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
});
exports.GSTR2B4EntrySchema = zod_1.z.object({
    supplierGstin: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    serviceType: zod_1.z.string(),
    importType: zod_1.z.enum(["SEZ", "Non-SEZ"]),
});
exports.GSTR2B5EntrySchema = zod_1.z.object({
    supplierGstin: zod_1.z.string(),
    supplierName: zod_1.z.string(),
    invoiceNumber: zod_1.z.string(),
    invoiceDate: zod_1.z.string(),
    invoiceValue: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    placeOfSupply: zod_1.z.string(),
});
exports.GSTR2BOutputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    tables: zod_1.z.object({
        "3A": zod_1.z.array(exports.GSTR2B3AEntrySchema),
        "3B": zod_1.z.array(exports.GSTR2B3BEntrySchema),
        "3D": zod_1.z.array(exports.GSTR2B3DEntrySchema),
        "4": zod_1.z.array(exports.GSTR2B4EntrySchema),
        "5": zod_1.z.array(exports.GSTR2B5EntrySchema),
    }),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// Output Types - GSTR3B Tables
// ============================================================================
exports.GSTR3BTable3_1Schema = zod_1.z.object({
    natureOfSupplies: zod_1.z.string(),
    totalTaxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
});
exports.GSTR3BTable3_2EntrySchema = zod_1.z.object({
    placeOfSupply: zod_1.z.string(),
    interStateSupplies: zod_1.z.string(),
    intraStateSupplies: zod_1.z.string(),
});
exports.GSTR3BTable4Schema = zod_1.z.object({
    eligibleITC: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    reversedITC: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    ineligibleITC: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
});
exports.GSTR3BTable5Schema = zod_1.z.object({
    natureOfSupplies: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
});
exports.GSTR3BTable6Schema = zod_1.z.object({
    natureOfSupplies: zod_1.z.string(),
    taxableValue: zod_1.z.string(),
    igst: zod_1.z.string(),
    cess: zod_1.z.string(),
});
exports.GSTR3BTable7Schema = zod_1.z.object({
    interestAmount: zod_1.z.string(),
    lateFeeAmount: zod_1.z.string(),
    paidInCash: zod_1.z.string(),
    paidThroughITC: zod_1.z.string(),
});
exports.GSTR3BTable8Schema = zod_1.z.object({
    taxPayable: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    taxPaid: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
});
exports.GSTR3BTable9Schema = zod_1.z.object({
    refundClaimed: zod_1.z.string(),
    refundSanctioned: zod_1.z.string(),
});
exports.GSTR3BOutputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    tables: zod_1.z.object({
        "3.1": zod_1.z.array(exports.GSTR3BTable3_1Schema),
        "3.2": zod_1.z.array(exports.GSTR3BTable3_2EntrySchema),
        "4": exports.GSTR3BTable4Schema,
        "5": zod_1.z.array(exports.GSTR3BTable5Schema),
        "6": zod_1.z.array(exports.GSTR3BTable6Schema),
        "7": exports.GSTR3BTable7Schema,
        "8": exports.GSTR3BTable8Schema,
        "9": exports.GSTR3BTable9Schema,
    }),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// Summary Type
// ============================================================================
exports.GSTReturnSummarySchema = zod_1.z.object({
    gross_turnover: zod_1.z.string(),
    taxable_value: zod_1.z.string(),
    igst: zod_1.z.string(),
    cgst: zod_1.z.string(),
    sgst: zod_1.z.string(),
    cess: zod_1.z.string(),
    itc_available: zod_1.z.string(),
    tax_payable: zod_1.z.string(),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.GSTR1GeneratedPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    taxpayerGstin: zod_1.z.string(),
    status: zod_1.z.literal(GSTReturnStatus.GENERATED),
    summary: exports.GSTReturnSummarySchema,
    generatedAt: zod_1.z.date(),
});
exports.GSTR2BGeneratedPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    taxpayerGstin: zod_1.z.string(),
    status: zod_1.z.literal(GSTReturnStatus.GENERATED),
    summary: exports.GSTReturnSummarySchema,
    generatedAt: zod_1.z.date(),
});
exports.GSTR3BGeneratedPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    taxpayerGstin: zod_1.z.string(),
    status: zod_1.z.literal(GSTReturnStatus.GENERATED),
    summary: exports.GSTReturnSummarySchema,
    generatedAt: zod_1.z.date(),
});
exports.GSTReturnFiledPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    taxpayerGstin: zod_1.z.string(),
    returnType: zod_1.z.nativeEnum(GSTReturnType),
    status: zod_1.z.literal(GSTReturnStatus.FILED),
    arn: zod_1.z.string(),
    filedAt: zod_1.z.date(),
});
//# sourceMappingURL=gst-returns.js.map