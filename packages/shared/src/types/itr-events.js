import { z } from "zod";
import { TaxRegime, ITRReturnType } from "./itr-returns";
import { AdvanceTaxPaidPayloadSchema, SelfAssessmentTaxPaidPayloadSchema } from "./itr-ledgers";
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
export const IncomeComputedPayloadSchema = z.object({
    itrReturnId: z.string().uuid(),
    financialYear: z.string().regex(/^\d{4}-\d{2}$/),
    incomeByHead: IncomeByHeadEventSchema,
    grossTotalIncome: z.number(),
    deductions: DeductionsEventSchema,
    totalIncome: z.number(),
    computedAt: z.date(),
});
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
// ============================================================================
// Event Type Union for ITR Domain
// ============================================================================
export const ItrEventTypeSchema = z.enum([
    "income_computed",
    "tax_computed",
    "itr_generated",
    "advance_tax_paid",
    "self_assessment_tax_paid",
]);
// Union without discriminator - events have different shapes
export const ItrEventPayloadSchema = z.union([
    IncomeComputedPayloadSchema,
    TaxComputedPayloadSchema,
    ITRGeneratedPayloadSchema,
    AdvanceTaxPaidPayloadSchema,
    SelfAssessmentTaxPaidPayloadSchema,
]);
//# sourceMappingURL=itr-events.js.map