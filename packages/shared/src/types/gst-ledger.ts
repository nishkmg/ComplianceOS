import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export enum GSTTaxType {
  IGST = "igst",
  CGST = "cgst",
  SGST = "sgst",
  CESS = "cess",
}

export enum GSTTransactionType {
  PAYMENT = "payment",
  INTEREST = "interest",
  PENALTY = "penalty",
  REFUND = "refund",
  ITC_UTILIZATION = "itc_utilization",
}

// ============================================================================
// Input Schemas
// ============================================================================

export const CreateGSTChallanInputSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
  taxAmounts: z.object({
    igst: z.string().optional(),
    cgst: z.string().optional(),
    sgst: z.string().optional(),
    cess: z.string().optional(),
    interest: z.string().optional(),
    penalty: z.string().optional(),
  }),
});

export type CreateGSTChallanInput = z.infer<typeof CreateGSTChallanInputSchema>;

export const PayGSTInputSchema = z.object({
  challanId: z.string().uuid(),
  paymentMode: z.enum(["NEFT", "RTGS", "UPI", "Credit Card", "Debit Card", "Over the Counter"]),
});

export type PayGSTInput = z.infer<typeof PayGSTInputSchema>;

export const UtilizeITCInputSchema = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
  taxType: z.nativeEnum(GSTTaxType),
  utilizationOrder: z.array(z.nativeEnum(GSTTaxType)).optional(),
});

export type UtilizeITCInput = z.infer<typeof UtilizeITCInputSchema>;

// ============================================================================
// Output Types
// ============================================================================

export const GSTLedgerBalanceSchema = z.object({
  cashBalance: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
  itcBalance: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
  liabilityBalance: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    interest: z.string(),
    penalty: z.string(),
  }),
  asOfDate: z.date(),
});

export type GSTLedgerBalance = z.infer<typeof GSTLedgerBalanceSchema>;

export const GSTChallanOutputSchema = z.object({
  challanNumber: z.string(),
  cin: z.string().optional(),
  amount: z.string(),
  generatedAt: z.date(),
  validUntil: z.date(),
  status: z.enum(["generated", "paid", "expired"]),
});

export type GSTChallanOutput = z.infer<typeof GSTChallanOutputSchema>;

export const ITCUtilizationResultSchema = z.object({
  utilized: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
  }),
  remaining: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
  }),
  cashRequired: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
});

export type ITCUtilizationResult = z.infer<typeof ITCUtilizationResultSchema>;

// ============================================================================
// Event Payloads
// ============================================================================

export const GSTPaymentMadePayloadSchema = z.object({
  paymentId: z.string().uuid(),
  challanNumber: z.string(),
  cin: z.string(),
  taxpayerGstin: z.string(),
  periodMonth: z.number(),
  periodYear: z.number(),
  amount: z.string(),
  paymentMode: z.string(),
  paidAt: z.date(),
  taxBreakup: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    interest: z.string(),
    penalty: z.string(),
  }),
});

export type GSTPaymentMadePayload = z.infer<typeof GSTPaymentMadePayloadSchema>;

export const ITCUtilizedPayloadSchema = z.object({
  utilizationId: z.string().uuid(),
  taxpayerGstin: z.string(),
  periodMonth: z.number(),
  periodYear: z.number(),
  utilized: ITCUtilizationResultSchema.shape.utilized,
  remaining: ITCUtilizationResultSchema.shape.remaining,
  utilizedAt: z.date(),
});

export type ITCUtilizedPayload = z.infer<typeof ITCUtilizedPayloadSchema>;

export const GSTChallanCreatedPayloadSchema = z.object({
  challanId: z.string().uuid(),
  challanNumber: z.string(),
  taxpayerGstin: z.string(),
  periodMonth: z.number(),
  periodYear: z.number(),
  totalAmount: z.string(),
  taxBreakup: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
    interest: z.string(),
    penalty: z.string(),
  }),
  validUntil: z.date(),
  createdAt: z.date(),
});

export type GSTChallanCreatedPayload = z.infer<typeof GSTChallanCreatedPayloadSchema>;
