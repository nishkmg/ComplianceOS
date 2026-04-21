import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export enum GSTReturnType {
  GSTR1 = "gstr1",
  GSTR2B = "gstr2b",
  GSTR3B = "gstr3b",
}

export enum GSTReturnStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  FILED = "filed",
  AMENDED = "amended",
}

// ============================================================================
// Input Schemas
// ============================================================================

export const GenerateGSTR1InputSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
});

export type GenerateGSTR1Input = z.infer<typeof GenerateGSTR1InputSchema>;

export const GenerateGSTR2BInputSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
});

export type GenerateGSTR2BInput = z.infer<typeof GenerateGSTR2BInputSchema>;

export const GenerateGSTR3BInputSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
});

export type GenerateGSTR3BInput = z.infer<typeof GenerateGSTR3BInputSchema>;

export const FileGSTReturnInputSchema = z.object({
  returnId: z.string().uuid(),
  arn: z.string(),
});

export type FileGSTReturnInput = z.infer<typeof FileGSTReturnInputSchema>;

export const AmendGSTReturnInputSchema = z.object({
  returnId: z.string().uuid(),
  changes: z.record(z.unknown()),
});

export type AmendGSTReturnInput = z.infer<typeof AmendGSTReturnInputSchema>;

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

export type GSTR1B2BEntry = z.infer<typeof GSTR1B2BEntrySchema>;

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

export type GSTR1B2CLEntry = z.infer<typeof GSTR1B2CLEntrySchema>;

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

export type GSTR1B2CSEntry = z.infer<typeof GSTR1B2CSEntrySchema>;

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

export type GSTR1CDNREntry = z.infer<typeof GSTR1CDNREntrySchema>;

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

export type GSTR1CDNUREntry = z.infer<typeof GSTR1CDNUREntrySchema>;

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

export type GSTR1EXPEntry = z.infer<typeof GSTR1EXPEntrySchema>;

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

export type GSTR1Output = z.infer<typeof GSTR1OutputSchema>;

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

export type GSTR2B3AEntry = z.infer<typeof GSTR2B3AEntrySchema>;

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

export type GSTR2B3BEntry = z.infer<typeof GSTR2B3BEntrySchema>;

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

export type GSTR2B3DEntry = z.infer<typeof GSTR2B3DEntrySchema>;

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

export type GSTR2B4Entry = z.infer<typeof GSTR2B4EntrySchema>;

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

export type GSTR2B5Entry = z.infer<typeof GSTR2B5EntrySchema>;

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

export type GSTR2BOutput = z.infer<typeof GSTR2BOutputSchema>;

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

export type GSTR3BTable3_1 = z.infer<typeof GSTR3BTable3_1Schema>;

export const GSTR3BTable3_2EntrySchema = z.object({
  placeOfSupply: z.string(),
  interStateSupplies: z.string(),
  intraStateSupplies: z.string(),
});

export type GSTR3BTable3_2Entry = z.infer<typeof GSTR3BTable3_2EntrySchema>;

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

export type GSTR3BTable4 = z.infer<typeof GSTR3BTable4Schema>;

export const GSTR3BTable5Schema = z.object({
  natureOfSupplies: z.string(),
  taxableValue: z.string(),
  igst: z.string(),
  cgst: z.string(),
  sgst: z.string(),
  cess: z.string(),
});

export type GSTR3BTable5 = z.infer<typeof GSTR3BTable5Schema>;

export const GSTR3BTable6Schema = z.object({
  natureOfSupplies: z.string(),
  taxableValue: z.string(),
  igst: z.string(),
  cess: z.string(),
});

export type GSTR3BTable6 = z.infer<typeof GSTR3BTable6Schema>;

export const GSTR3BTable7Schema = z.object({
  interestAmount: z.string(),
  lateFeeAmount: z.string(),
  paidInCash: z.string(),
  paidThroughITC: z.string(),
});

export type GSTR3BTable7 = z.infer<typeof GSTR3BTable7Schema>;

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

export type GSTR3BTable8 = z.infer<typeof GSTR3BTable8Schema>;

export const GSTR3BTable9Schema = z.object({
  refundClaimed: z.string(),
  refundSanctioned: z.string(),
});

export type GSTR3BTable9 = z.infer<typeof GSTR3BTable9Schema>;

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

export type GSTR3BOutput = z.infer<typeof GSTR3BOutputSchema>;

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

export type GSTReturnSummary = z.infer<typeof GSTReturnSummarySchema>;

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

export type GSTR1GeneratedPayload = z.infer<typeof GSTR1GeneratedPayloadSchema>;

export const GSTR2BGeneratedPayloadSchema = z.object({
  returnId: z.string().uuid(),
  periodMonth: z.number(),
  periodYear: z.number(),
  taxpayerGstin: z.string(),
  status: z.literal(GSTReturnStatus.GENERATED),
  summary: GSTReturnSummarySchema,
  generatedAt: z.date(),
});

export type GSTR2BGeneratedPayload = z.infer<typeof GSTR2BGeneratedPayloadSchema>;

export const GSTR3BGeneratedPayloadSchema = z.object({
  returnId: z.string().uuid(),
  periodMonth: z.number(),
  periodYear: z.number(),
  taxpayerGstin: z.string(),
  status: z.literal(GSTReturnStatus.GENERATED),
  summary: GSTReturnSummarySchema,
  generatedAt: z.date(),
});

export type GSTR3BGeneratedPayload = z.infer<typeof GSTR3BGeneratedPayloadSchema>;

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

export type GSTReturnFiledPayload = z.infer<typeof GSTReturnFiledPayloadSchema>;
