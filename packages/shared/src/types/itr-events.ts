import { z } from "zod";
import { TaxRegime, ITRReturnType, ITRReturnStatus } from "./itr-returns";

// ============================================================================
// Income Computation Events
// ============================================================================

export const IncomeByHeadEventSchema = z.object({
  salary: z.number(),
  houseProperty: z.number(),
  businessProfit: z.number(),
  capitalGains: z.number(),
  otherSources: z.number(),
});

export type IncomeByHeadEvent = z.infer<typeof IncomeByHeadEventSchema>;

export const DeductionsEventSchema = z.object({
  chapterVIA: z.object({
    section80C: z.number(),
    section80D: z.number(),
    section80E: z.number(),
    section80G: z.number(),
    section80TTA: z.number(),
    section80TTB: z.number(),
    other: z.number(),
    total: z.number(),
  }),
  otherDeductions: z.object({
    section10AA: z.number(),
    section80CC: z.number(),
    other: z.number(),
    total: z.number(),
  }),
  totalDeductions: z.number(),
});

export type DeductionsEvent = z.infer<typeof DeductionsEventSchema>;

export const IncomeComputedPayloadSchema = z.object({
  itrReturnId: z.string().uuid(),
  financialYear: z.string().regex(/^\d{4}-\d{2}$/),
  incomeByHead: IncomeByHeadEventSchema,
  grossTotalIncome: z.number(),
  deductions: DeductionsEventSchema,
  totalIncome: z.number(),
  computedAt: z.date(),
});

export type IncomeComputedPayload = z.infer<typeof IncomeComputedPayloadSchema>;

// ============================================================================
// Tax Computation Events
// ============================================================================

export const TaxComputedPayloadSchema = z.object({
  itrReturnId: z.string().uuid(),
  taxRegime: z.nativeEnum(TaxRegime),
  taxOnTotalIncome: z.number(),
  rebate87A: z.number(),
  surcharge: z.number(),
  cess: z.number(),
  totalTaxPayable: z.number(),
  tdsTcsCredit: z.number(),
  advanceTaxPaid: z.number(),
  balancePayable: z.number(),
  computedAt: z.date(),
});

export type TaxComputedPayload = z.infer<typeof TaxComputedPayloadSchema>;

// ============================================================================
// ITR Generation Events
// ============================================================================

export const ITRGeneratedPayloadSchema = z.object({
  itrReturnId: z.string().uuid(),
  returnType: z.nativeEnum(ITRReturnType),
  itrJson: z.record(z.unknown()),
  acknowledgmentNumber: z.string().optional(),
  generatedAt: z.date(),
});

export type ITRGeneratedPayload = z.infer<typeof ITRGeneratedPayloadSchema>;

// ============================================================================
// Event Type Union for ITR Domain
// ============================================================================

export const ItrEventTypeSchema = z.enum([
  "income_computed",
  "tax_computed",
  "itr_generated",
]);

export type ItrEventType = z.infer<typeof ItrEventTypeSchema>;

export const ItrEventPayloadSchema = z.discriminatedUnion("itrReturnId", [
  IncomeComputedPayloadSchema,
  TaxComputedPayloadSchema,
  ITRGeneratedPayloadSchema,
]);

export type ItrEventPayload = z.infer<typeof ItrEventPayloadSchema>;
