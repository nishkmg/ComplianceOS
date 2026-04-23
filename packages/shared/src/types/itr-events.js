"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItrEventPayloadSchema = exports.ItrEventTypeSchema = exports.ITRGeneratedPayloadSchema = exports.TaxComputedPayloadSchema = exports.IncomeComputedPayloadSchema = exports.DeductionsEventSchema = exports.IncomeByHeadEventSchema = void 0;
const zod_1 = require("zod");
const itr_returns_1 = require("./itr-returns");
const itr_ledgers_1 = require("./itr-ledgers");
// ============================================================================
// Income Computation Events
// ============================================================================
exports.IncomeByHeadEventSchema = zod_1.z.object({
    salary: zod_1.z.number(),
    houseProperty: zod_1.z.number(),
    businessProfit: zod_1.z.number(),
    capitalGains: zod_1.z.number(),
    otherSources: zod_1.z.number(),
});
exports.DeductionsEventSchema = zod_1.z.object({
    chapterVIA: zod_1.z.object({
        section80C: zod_1.z.number(),
        section80D: zod_1.z.number(),
        section80E: zod_1.z.number(),
        section80G: zod_1.z.number(),
        section80TTA: zod_1.z.number(),
        section80TTB: zod_1.z.number(),
        other: zod_1.z.number(),
        total: zod_1.z.number(),
    }),
    otherDeductions: zod_1.z.object({
        section10AA: zod_1.z.number(),
        section80CC: zod_1.z.number(),
        other: zod_1.z.number(),
        total: zod_1.z.number(),
    }),
    totalDeductions: zod_1.z.number(),
});
exports.IncomeComputedPayloadSchema = zod_1.z.object({
    itrReturnId: zod_1.z.string().uuid(),
    financialYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    incomeByHead: exports.IncomeByHeadEventSchema,
    grossTotalIncome: zod_1.z.number(),
    deductions: exports.DeductionsEventSchema,
    totalIncome: zod_1.z.number(),
    computedAt: zod_1.z.date(),
});
// ============================================================================
// Tax Computation Events
// ============================================================================
exports.TaxComputedPayloadSchema = zod_1.z.object({
    itrReturnId: zod_1.z.string().uuid(),
    taxRegime: zod_1.z.nativeEnum(itr_returns_1.TaxRegime),
    taxOnTotalIncome: zod_1.z.number(),
    rebate87A: zod_1.z.number(),
    surcharge: zod_1.z.number(),
    cess: zod_1.z.number(),
    totalTaxPayable: zod_1.z.number(),
    tdsTcsCredit: zod_1.z.number(),
    advanceTaxPaid: zod_1.z.number(),
    balancePayable: zod_1.z.number(),
    computedAt: zod_1.z.date(),
});
// ============================================================================
// ITR Generation Events
// ============================================================================
exports.ITRGeneratedPayloadSchema = zod_1.z.object({
    itrReturnId: zod_1.z.string().uuid(),
    returnType: zod_1.z.nativeEnum(itr_returns_1.ITRReturnType),
    itrJson: zod_1.z.record(zod_1.z.unknown()),
    acknowledgmentNumber: zod_1.z.string().optional(),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// Event Type Union for ITR Domain
// ============================================================================
exports.ItrEventTypeSchema = zod_1.z.enum([
    "income_computed",
    "tax_computed",
    "itr_generated",
    "advance_tax_paid",
    "self_assessment_tax_paid",
]);
// Union without discriminator - events have different shapes
exports.ItrEventPayloadSchema = zod_1.z.union([
    exports.IncomeComputedPayloadSchema,
    exports.TaxComputedPayloadSchema,
    exports.ITRGeneratedPayloadSchema,
    itr_ledgers_1.AdvanceTaxPaidPayloadSchema,
    itr_ledgers_1.SelfAssessmentTaxPaidPayloadSchema,
]);
//# sourceMappingURL=itr-events.js.map