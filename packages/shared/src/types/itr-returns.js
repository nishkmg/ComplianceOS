import { z } from "zod";
// ============================================================================
// Enums
// ============================================================================
export var ITRReturnType;
(function (ITRReturnType) {
    ITRReturnType["ITR1"] = "itr1";
    ITRReturnType["ITR2"] = "itr2";
    ITRReturnType["ITR3"] = "itr3";
    ITRReturnType["ITR4"] = "itr4";
    ITRReturnType["ITR5"] = "itr5";
})(ITRReturnType || (ITRReturnType = {}));
export var ITRReturnStatus;
(function (ITRReturnStatus) {
    ITRReturnStatus["DRAFT"] = "draft";
    ITRReturnStatus["COMPUTED"] = "computed";
    ITRReturnStatus["GENERATED"] = "generated";
    ITRReturnStatus["FILED"] = "filed";
    ITRReturnStatus["VERIFIED"] = "verified";
    ITRReturnStatus["VOIDED"] = "voided";
})(ITRReturnStatus || (ITRReturnStatus = {}));
export var IncomeHead;
(function (IncomeHead) {
    IncomeHead["SALARY"] = "salary";
    IncomeHead["HOUSE_PROPERTY"] = "house_property";
    IncomeHead["BUSINESS_PROFIT"] = "business_profit";
    IncomeHead["CAPITAL_GAINS"] = "capital_gains";
    IncomeHead["OTHER_SOURCES"] = "other_sources";
})(IncomeHead || (IncomeHead = {}));
export var TaxRegime;
(function (TaxRegime) {
    TaxRegime["OLD"] = "old";
    TaxRegime["NEW"] = "new";
})(TaxRegime || (TaxRegime = {}));
export var PresumptiveScheme;
(function (PresumptiveScheme) {
    PresumptiveScheme["SCHEME_44AD"] = "44ad";
    PresumptiveScheme["SCHEME_44ADA"] = "44ada";
    PresumptiveScheme["SCHEME_44AE"] = "44ae";
    PresumptiveScheme["NONE"] = "none";
})(PresumptiveScheme || (PresumptiveScheme = {}));
// ============================================================================
// Input Schemas
// ============================================================================
export const ComputeITRReturnInputSchema = z.object({
    returnId: z.string().uuid(),
    taxRegime: z.nativeEnum(TaxRegime),
    presumptiveScheme: z.nativeEnum(PresumptiveScheme).optional(),
});
export const FileITRReturnInputSchema = z.object({
    returnId: z.string().uuid(),
    itrAckNumber: z.string(),
    verificationMode: z.enum(["EVC", "EVC-AADHAAR", "EVC-DSC"]),
});
export const VerifyITRReturnInputSchema = z.object({
    returnId: z.string().uuid(),
    verificationMode: z.enum(["EVC", "EVC-AADHAAR", "EVC-DSC", "ITR-V"]),
    verificationDate: z.date(),
});
export const UpdateITRReturnLineInputSchema = z.object({
    returnId: z.string().uuid(),
    scheduleCode: z.string(),
    fieldCode: z.string(),
    fieldValue: z.string(),
    description: z.string().optional(),
});
export const UpdateITRScheduleInputSchema = z.object({
    returnId: z.string().uuid(),
    scheduleCode: z.string(),
    scheduleData: z.record(z.unknown()),
    totalAmount: z.string().optional(),
});
// ============================================================================
// Output Types - ITR Return Lines
// ============================================================================
export const ITRReturnLineSchema = z.object({
    id: z.string().uuid(),
    returnId: z.string().uuid(),
    scheduleCode: z.string(),
    fieldCode: z.string(),
    fieldValue: z.string(),
    description: z.string().nullable(),
});
// ============================================================================
// Output Types - ITR Schedules
// ============================================================================
export const ITRScheduleSchema = z.object({
    id: z.string().uuid(),
    returnId: z.string().uuid(),
    scheduleCode: z.string(),
    scheduleData: z.record(z.unknown()),
    totalAmount: z.string(),
});
// ============================================================================
// Output Types - ITR Return
// ============================================================================
export const ITRReturnSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    assessmentYear: z.string(),
    financialYear: z.string().regex(/^\d{4}-\d{2}$/),
    returnType: z.nativeEnum(ITRReturnType),
    status: z.nativeEnum(ITRReturnStatus),
    taxRegime: z.nativeEnum(TaxRegime).nullable(),
    presumptiveScheme: z.nativeEnum(PresumptiveScheme).nullable(),
    grossTotalIncome: z.string(),
    totalDeductions: z.string(),
    totalIncome: z.string(),
    taxPayable: z.string(),
    surcharge: z.string(),
    cess: z.string(),
    rebate87a: z.string(),
    advanceTaxPaid: z.string(),
    selfAssessmentTax: z.string(),
    tdsTcsCredit: z.string(),
    totalTaxPaid: z.string(),
    balancePayable: z.string(),
    refundDue: z.string(),
    generatedAt: z.date().nullable(),
    filedAt: z.date().nullable(),
    itrAckNumber: z.string().nullable(),
    verificationDate: z.date().nullable(),
    verificationMode: z.string().nullable(),
    itrJsonUrl: z.string().nullable(),
    createdBy: z.string().uuid(),
    filedBy: z.string().uuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
// ============================================================================
// Output Types - ITR Computation
// ============================================================================
export const IncomeByHeadSchema = z.object({
    salary: z.string(),
    houseProperty: z.string(),
    businessProfit: z.string(),
    capitalGains: z.object({
        shortTerm: z.string(),
        longTerm: z.string(),
        total: z.string(),
    }),
    otherSources: z.string(),
    grossTotal: z.string(),
});
export const DeductionsSchema = z.object({
    "chapter VIA": z.object({
        section80C: z.string(),
        section80D: z.string(),
        section80E: z.string(),
        section80G: z.string(),
        section80TTA: z.string(),
        section80TTB: z.string(),
        other: z.string(),
        total: z.string(),
    }),
    otherDeductions: z.object({
        section10AA: z.string(),
        section80CC: z.string(),
        other: z.string(),
        total: z.string(),
    }),
    totalDeductions: z.string(),
});
export const TaxComputationSchema = z.object({
    totalIncome: z.string(),
    taxOnTotalIncome: z.string(),
    surcharge: z.string(),
    cess: z.string(),
    grossTax: z.string(),
    rebate87a: z.string(),
    netTax: z.string(),
});
export const TaxPaidSchema = z.object({
    advanceTax: z.string(),
    selfAssessmentTax: z.string(),
    tdsTcs: z.string(),
    totalTaxPaid: z.string(),
});
export const ITRComputationSchema = z.object({
    returnId: z.string().uuid(),
    assessmentYear: z.string(),
    financialYear: z.string(),
    taxRegime: z.nativeEnum(TaxRegime),
    incomeByHead: IncomeByHeadSchema,
    deductions: DeductionsSchema,
    totalIncome: z.string(),
    taxComputation: TaxComputationSchema,
    taxPaid: TaxPaidSchema,
    balancePayable: z.string(),
    refundDue: z.string(),
    computedAt: z.date(),
});
// ============================================================================
// Event Payloads
// ============================================================================
export const ITRReturnComputedPayloadSchema = z.object({
    returnId: z.string().uuid(),
    assessmentYear: z.string(),
    financialYear: z.string(),
    taxpayerPan: z.string(),
    status: z.literal(ITRReturnStatus.COMPUTED),
    totalIncome: z.string(),
    taxPayable: z.string(),
    balancePayable: z.string(),
    refundDue: z.string(),
    computedAt: z.date(),
});
export const ITRReturnFiledPayloadSchema = z.object({
    returnId: z.string().uuid(),
    assessmentYear: z.string(),
    financialYear: z.string(),
    taxpayerPan: z.string(),
    returnType: z.nativeEnum(ITRReturnType),
    status: z.literal(ITRReturnStatus.FILED),
    itrAckNumber: z.string(),
    verificationMode: z.string(),
    filedAt: z.date(),
});
export const ITRReturnVerifiedPayloadSchema = z.object({
    returnId: z.string().uuid(),
    assessmentYear: z.string(),
    financialYear: z.string(),
    taxpayerPan: z.string(),
    returnType: z.nativeEnum(ITRReturnType),
    status: z.literal(ITRReturnStatus.VERIFIED),
    itrAckNumber: z.string(),
    verificationMode: z.string(),
    verifiedAt: z.date(),
});
//# sourceMappingURL=itr-returns.js.map