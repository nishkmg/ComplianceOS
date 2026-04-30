import { z } from "zod";
// ============================================================================
// Enums
// ============================================================================
export var GSTReturnType;
(function (GSTReturnType) {
    GSTReturnType["GSTR1"] = "gstr1";
    GSTReturnType["GSTR2B"] = "gstr2b";
    GSTReturnType["GSTR3B"] = "gstr3b";
})(GSTReturnType || (GSTReturnType = {}));
export var GSTReturnStatus;
(function (GSTReturnStatus) {
    GSTReturnStatus["DRAFT"] = "draft";
    GSTReturnStatus["GENERATED"] = "generated";
    GSTReturnStatus["FILED"] = "filed";
    GSTReturnStatus["AMENDED"] = "amended";
})(GSTReturnStatus || (GSTReturnStatus = {}));
// ============================================================================
// Input Schemas
// ============================================================================
export const GenerateGSTR1InputSchema = z.object({
    periodMonth: z.number().min(1).max(12),
    periodYear: z.number().min(2000),
});
export const GenerateGSTR2BInputSchema = z.object({
    periodMonth: z.number().min(1).max(12),
    periodYear: z.number().min(2000),
});
export const GenerateGSTR3BInputSchema = z.object({
    periodMonth: z.number().min(1).max(12),
    periodYear: z.number().min(2000),
});
export const FileGSTReturnInputSchema = z.object({
    returnId: z.string().uuid(),
    arn: z.string(),
});
export const AmendGSTReturnInputSchema = z.object({
    returnId: z.string().uuid(),
    changes: z.record(z.unknown()),
});
// ============================================================================
// Output Types - GSTR1 Tables
// ============================================================================
export const GSTR1B2BEntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    recipientGstin: z.string(),
    recipientName: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
});
export const GSTR1B2CLEntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    recipientGstin: z.string(),
    recipientName: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
});
export const GSTR1B2CSEntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
    ecommerceGstin: z.string().optional(),
});
export const GSTR1CDNREntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    returnInvoiceNumber: z.string(),
    returnInvoiceDate: z.string(),
    recipientGstin: z.string(),
    recipientName: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
});
export const GSTR1CDNUREntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    returnInvoiceNumber: z.string(),
    returnInvoiceDate: z.string(),
    recipientGstin: z.string().optional(),
    recipientName: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
});
export const GSTR1EXPEntrySchema = z.object({
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cess: z.string(),
    shippingBillNumber: z.string(),
    shippingBillDate: z.string(),
    portCode: z.string(),
});
export const GSTR1OutputSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    tables: z.object({
        B2B: z.array(GSTR1B2BEntrySchema),
        B2CL: z.array(GSTR1B2CLEntrySchema),
        B2CS: z.array(GSTR1B2CSEntrySchema),
        CDNR: z.array(GSTR1CDNREntrySchema),
        CDNUR: z.array(GSTR1CDNUREntrySchema),
        EXP: z.array(GSTR1EXPEntrySchema),
    }),
    generatedAt: z.date(),
});
// ============================================================================
// Output Types - GSTR2B Tables
// ============================================================================
export const GSTR2B3AEntrySchema = z.object({
    supplierGstin: z.string(),
    supplierName: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
    reverseCharge: z.boolean(),
});
export const GSTR2B3BEntrySchema = z.object({
    supplierGstin: z.string(),
    supplierName: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
    importType: z.enum(["SEZ", "Non-SEZ"]),
});
export const GSTR2B3DEntrySchema = z.object({
    supplierGstin: z.string(),
    supplierName: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
});
export const GSTR2B4EntrySchema = z.object({
    supplierGstin: z.string(),
    supplierName: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    serviceType: z.string(),
    importType: z.enum(["SEZ", "Non-SEZ"]),
});
export const GSTR2B5EntrySchema = z.object({
    supplierGstin: z.string(),
    supplierName: z.string(),
    invoiceNumber: z.string(),
    invoiceDate: z.string(),
    invoiceValue: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    placeOfSupply: z.string(),
});
export const GSTR2BOutputSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    tables: z.object({
        "3A": z.array(GSTR2B3AEntrySchema),
        "3B": z.array(GSTR2B3BEntrySchema),
        "3D": z.array(GSTR2B3DEntrySchema),
        "4": z.array(GSTR2B4EntrySchema),
        "5": z.array(GSTR2B5EntrySchema),
    }),
    generatedAt: z.date(),
});
// ============================================================================
// Output Types - GSTR3B Tables
// ============================================================================
export const GSTR3BTable3_1Schema = z.object({
    natureOfSupplies: z.string(),
    totalTaxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
});
export const GSTR3BTable3_2EntrySchema = z.object({
    placeOfSupply: z.string(),
    interStateSupplies: z.string(),
    intraStateSupplies: z.string(),
});
export const GSTR3BTable4Schema = z.object({
    eligibleITC: z.object({
        igst: z.string(),
        cgst: z.string(),
        sgst: z.string(),
        cess: z.string(),
    }),
    reversedITC: z.object({
        igst: z.string(),
        cgst: z.string(),
        sgst: z.string(),
        cess: z.string(),
    }),
    ineligibleITC: z.object({
        igst: z.string(),
        cgst: z.string(),
        sgst: z.string(),
        cess: z.string(),
    }),
});
export const GSTR3BTable5Schema = z.object({
    natureOfSupplies: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
});
export const GSTR3BTable6Schema = z.object({
    natureOfSupplies: z.string(),
    taxableValue: z.string(),
    igst: z.string(),
    cess: z.string(),
});
export const GSTR3BTable7Schema = z.object({
    interestAmount: z.string(),
    lateFeeAmount: z.string(),
    paidInCash: z.string(),
    paidThroughITC: z.string(),
});
export const GSTR3BTable8Schema = z.object({
    taxPayable: z.object({
        igst: z.string(),
        cgst: z.string(),
        sgst: z.string(),
        cess: z.string(),
    }),
    taxPaid: z.object({
        igst: z.string(),
        cgst: z.string(),
        sgst: z.string(),
        cess: z.string(),
    }),
});
export const GSTR3BTable9Schema = z.object({
    refundClaimed: z.string(),
    refundSanctioned: z.string(),
});
export const GSTR3BOutputSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    tables: z.object({
        "3.1": z.array(GSTR3BTable3_1Schema),
        "3.2": z.array(GSTR3BTable3_2EntrySchema),
        "4": GSTR3BTable4Schema,
        "5": z.array(GSTR3BTable5Schema),
        "6": z.array(GSTR3BTable6Schema),
        "7": GSTR3BTable7Schema,
        "8": GSTR3BTable8Schema,
        "9": GSTR3BTable9Schema,
    }),
    generatedAt: z.date(),
});
// ============================================================================
// Summary Type
// ============================================================================
export const GSTReturnSummarySchema = z.object({
    gross_turnover: z.string(),
    taxable_value: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    itc_available: z.string(),
    tax_payable: z.string(),
});
// ============================================================================
// Event Payloads
// ============================================================================
export const GSTR1GeneratedPayloadSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    taxpayerGstin: z.string(),
    status: z.literal(GSTReturnStatus.GENERATED),
    summary: GSTReturnSummarySchema,
    generatedAt: z.date(),
});
export const GSTR2BGeneratedPayloadSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    taxpayerGstin: z.string(),
    status: z.literal(GSTReturnStatus.GENERATED),
    summary: GSTReturnSummarySchema,
    generatedAt: z.date(),
});
export const GSTR3BGeneratedPayloadSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    taxpayerGstin: z.string(),
    status: z.literal(GSTReturnStatus.GENERATED),
    summary: GSTReturnSummarySchema,
    generatedAt: z.date(),
});
export const GSTReturnFiledPayloadSchema = z.object({
    returnId: z.string().uuid(),
    periodMonth: z.number(),
    periodYear: z.number(),
    taxpayerGstin: z.string(),
    returnType: z.nativeEnum(GSTReturnType),
    status: z.literal(GSTReturnStatus.FILED),
    arn: z.string(),
    filedAt: z.date(),
});
//# sourceMappingURL=gst-returns.js.map