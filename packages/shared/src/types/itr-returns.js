"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITRReturnVerifiedPayloadSchema = exports.ITRReturnFiledPayloadSchema = exports.ITRReturnComputedPayloadSchema = exports.ITRComputationSchema = exports.TaxPaidSchema = exports.TaxComputationSchema = exports.DeductionsSchema = exports.IncomeByHeadSchema = exports.ITRReturnSchema = exports.ITRScheduleSchema = exports.ITRReturnLineSchema = exports.UpdateITRScheduleInputSchema = exports.UpdateITRReturnLineInputSchema = exports.VerifyITRReturnInputSchema = exports.FileITRReturnInputSchema = exports.ComputeITRReturnInputSchema = exports.PresumptiveScheme = exports.TaxRegime = exports.IncomeHead = exports.ITRReturnStatus = exports.ITRReturnType = void 0;
const zod_1 = require("zod");
// ============================================================================
// Enums
// ============================================================================
var ITRReturnType;
(function (ITRReturnType) {
    ITRReturnType["ITR1"] = "itr1";
    ITRReturnType["ITR2"] = "itr2";
    ITRReturnType["ITR3"] = "itr3";
    ITRReturnType["ITR4"] = "itr4";
    ITRReturnType["ITR5"] = "itr5";
})(ITRReturnType || (exports.ITRReturnType = ITRReturnType = {}));
var ITRReturnStatus;
(function (ITRReturnStatus) {
    ITRReturnStatus["DRAFT"] = "draft";
    ITRReturnStatus["COMPUTED"] = "computed";
    ITRReturnStatus["GENERATED"] = "generated";
    ITRReturnStatus["FILED"] = "filed";
    ITRReturnStatus["VERIFIED"] = "verified";
    ITRReturnStatus["VOIDED"] = "voided";
})(ITRReturnStatus || (exports.ITRReturnStatus = ITRReturnStatus = {}));
var IncomeHead;
(function (IncomeHead) {
    IncomeHead["SALARY"] = "salary";
    IncomeHead["HOUSE_PROPERTY"] = "house_property";
    IncomeHead["BUSINESS_PROFIT"] = "business_profit";
    IncomeHead["CAPITAL_GAINS"] = "capital_gains";
    IncomeHead["OTHER_SOURCES"] = "other_sources";
})(IncomeHead || (exports.IncomeHead = IncomeHead = {}));
var TaxRegime;
(function (TaxRegime) {
    TaxRegime["OLD"] = "old";
    TaxRegime["NEW"] = "new";
})(TaxRegime || (exports.TaxRegime = TaxRegime = {}));
var PresumptiveScheme;
(function (PresumptiveScheme) {
    PresumptiveScheme["SCHEME_44AD"] = "44ad";
    PresumptiveScheme["SCHEME_44ADA"] = "44ada";
    PresumptiveScheme["SCHEME_44AE"] = "44ae";
    PresumptiveScheme["NONE"] = "none";
})(PresumptiveScheme || (exports.PresumptiveScheme = PresumptiveScheme = {}));
// ============================================================================
// Input Schemas
// ============================================================================
exports.ComputeITRReturnInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    taxRegime: zod_1.z.nativeEnum(TaxRegime),
    presumptiveScheme: zod_1.z.nativeEnum(PresumptiveScheme).optional(),
});
exports.FileITRReturnInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    itrAckNumber: zod_1.z.string(),
    verificationMode: zod_1.z.enum(["EVC", "EVC-AADHAAR", "EVC-DSC"]),
});
exports.VerifyITRReturnInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    verificationMode: zod_1.z.enum(["EVC", "EVC-AADHAAR", "EVC-DSC", "ITR-V"]),
    verificationDate: zod_1.z.date(),
});
exports.UpdateITRReturnLineInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    scheduleCode: zod_1.z.string(),
    fieldCode: zod_1.z.string(),
    fieldValue: zod_1.z.string(),
    description: zod_1.z.string().optional(),
});
exports.UpdateITRScheduleInputSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    scheduleCode: zod_1.z.string(),
    scheduleData: zod_1.z.record(zod_1.z.unknown()),
    totalAmount: zod_1.z.string().optional(),
});
// ============================================================================
// Output Types - ITR Return Lines
// ============================================================================
exports.ITRReturnLineSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    returnId: zod_1.z.string().uuid(),
    scheduleCode: zod_1.z.string(),
    fieldCode: zod_1.z.string(),
    fieldValue: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
});
// ============================================================================
// Output Types - ITR Schedules
// ============================================================================
exports.ITRScheduleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    returnId: zod_1.z.string().uuid(),
    scheduleCode: zod_1.z.string(),
    scheduleData: zod_1.z.record(zod_1.z.unknown()),
    totalAmount: zod_1.z.string(),
});
// ============================================================================
// Output Types - ITR Return
// ============================================================================
exports.ITRReturnSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    financialYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    returnType: zod_1.z.nativeEnum(ITRReturnType),
    status: zod_1.z.nativeEnum(ITRReturnStatus),
    taxRegime: zod_1.z.nativeEnum(TaxRegime).nullable(),
    presumptiveScheme: zod_1.z.nativeEnum(PresumptiveScheme).nullable(),
    grossTotalIncome: zod_1.z.string(),
    totalDeductions: zod_1.z.string(),
    totalIncome: zod_1.z.string(),
    taxPayable: zod_1.z.string(),
    surcharge: zod_1.z.string(),
    cess: zod_1.z.string(),
    rebate87a: zod_1.z.string(),
    advanceTaxPaid: zod_1.z.string(),
    selfAssessmentTax: zod_1.z.string(),
    tdsTcsCredit: zod_1.z.string(),
    totalTaxPaid: zod_1.z.string(),
    balancePayable: zod_1.z.string(),
    refundDue: zod_1.z.string(),
    generatedAt: zod_1.z.date().nullable(),
    filedAt: zod_1.z.date().nullable(),
    itrAckNumber: zod_1.z.string().nullable(),
    verificationDate: zod_1.z.date().nullable(),
    verificationMode: zod_1.z.string().nullable(),
    itrJsonUrl: zod_1.z.string().nullable(),
    createdBy: zod_1.z.string().uuid(),
    filedBy: zod_1.z.string().uuid().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// ============================================================================
// Output Types - ITR Computation
// ============================================================================
exports.IncomeByHeadSchema = zod_1.z.object({
    salary: zod_1.z.string(),
    houseProperty: zod_1.z.string(),
    businessProfit: zod_1.z.string(),
    capitalGains: zod_1.z.object({
        shortTerm: zod_1.z.string(),
        longTerm: zod_1.z.string(),
        total: zod_1.z.string(),
    }),
    otherSources: zod_1.z.string(),
    grossTotal: zod_1.z.string(),
});
exports.DeductionsSchema = zod_1.z.object({
    "chapter VIA": zod_1.z.object({
        section80C: zod_1.z.string(),
        section80D: zod_1.z.string(),
        section80E: zod_1.z.string(),
        section80G: zod_1.z.string(),
        section80TTA: zod_1.z.string(),
        section80TTB: zod_1.z.string(),
        other: zod_1.z.string(),
        total: zod_1.z.string(),
    }),
    otherDeductions: zod_1.z.object({
        section10AA: zod_1.z.string(),
        section80CC: zod_1.z.string(),
        other: zod_1.z.string(),
        total: zod_1.z.string(),
    }),
    totalDeductions: zod_1.z.string(),
});
exports.TaxComputationSchema = zod_1.z.object({
    totalIncome: zod_1.z.string(),
    taxOnTotalIncome: zod_1.z.string(),
    surcharge: zod_1.z.string(),
    cess: zod_1.z.string(),
    grossTax: zod_1.z.string(),
    rebate87a: zod_1.z.string(),
    netTax: zod_1.z.string(),
});
exports.TaxPaidSchema = zod_1.z.object({
    advanceTax: zod_1.z.string(),
    selfAssessmentTax: zod_1.z.string(),
    tdsTcs: zod_1.z.string(),
    totalTaxPaid: zod_1.z.string(),
});
exports.ITRComputationSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    financialYear: zod_1.z.string(),
    taxRegime: zod_1.z.nativeEnum(TaxRegime),
    incomeByHead: exports.IncomeByHeadSchema,
    deductions: exports.DeductionsSchema,
    totalIncome: zod_1.z.string(),
    taxComputation: exports.TaxComputationSchema,
    taxPaid: exports.TaxPaidSchema,
    balancePayable: zod_1.z.string(),
    refundDue: zod_1.z.string(),
    computedAt: zod_1.z.date(),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.ITRReturnComputedPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    financialYear: zod_1.z.string(),
    taxpayerPan: zod_1.z.string(),
    status: zod_1.z.literal(ITRReturnStatus.COMPUTED),
    totalIncome: zod_1.z.string(),
    taxPayable: zod_1.z.string(),
    balancePayable: zod_1.z.string(),
    refundDue: zod_1.z.string(),
    computedAt: zod_1.z.date(),
});
exports.ITRReturnFiledPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    financialYear: zod_1.z.string(),
    taxpayerPan: zod_1.z.string(),
    returnType: zod_1.z.nativeEnum(ITRReturnType),
    status: zod_1.z.literal(ITRReturnStatus.FILED),
    itrAckNumber: zod_1.z.string(),
    verificationMode: zod_1.z.string(),
    filedAt: zod_1.z.date(),
});
exports.ITRReturnVerifiedPayloadSchema = zod_1.z.object({
    returnId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    financialYear: zod_1.z.string(),
    taxpayerPan: zod_1.z.string(),
    returnType: zod_1.z.nativeEnum(ITRReturnType),
    status: zod_1.z.literal(ITRReturnStatus.VERIFIED),
    itrAckNumber: zod_1.z.string(),
    verificationMode: zod_1.z.string(),
    verifiedAt: zod_1.z.date(),
});
//# sourceMappingURL=itr-returns.js.map