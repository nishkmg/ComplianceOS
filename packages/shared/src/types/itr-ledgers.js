import { z } from "zod";
// ============================================================================
// Enums
// ============================================================================
export var AdvanceTaxInstallmentNumber;
(function (AdvanceTaxInstallmentNumber) {
    AdvanceTaxInstallmentNumber["INSTALLMENT_1"] = "1";
    AdvanceTaxInstallmentNumber["INSTALLMENT_2"] = "2";
    AdvanceTaxInstallmentNumber["INSTALLMENT_3"] = "3";
    AdvanceTaxInstallmentNumber["INSTALLMENT_4"] = "4";
})(AdvanceTaxInstallmentNumber || (AdvanceTaxInstallmentNumber = {}));
// Due dates for advance tax installments
export const ADVANCE_TAX_DUE_DATES = {
    [AdvanceTaxInstallmentNumber.INSTALLMENT_1]: "06-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_2]: "09-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_3]: "12-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_4]: "03-15",
};
// ============================================================================
// Input Schemas
// ============================================================================
export const RecordAdvanceTaxPaymentInputSchema = z.object({
    assessmentYear: z.string(),
    installmentNumber: z.nativeEnum(AdvanceTaxInstallmentNumber),
    paidAmount: z.string(),
    paidDate: z.string(),
    challanNumber: z.string(),
    challanDate: z.string(),
});
export const RecordSelfAssessmentTaxInputSchema = z.object({
    assessmentYear: z.string(),
    taxPayable: z.string(),
    advanceTaxPaid: z.string(),
    tdsTcsCredit: z.string(),
    balancePayable: z.string(),
    paidAmount: z.string().optional(),
    challanNumber: z.string().optional(),
    challanDate: z.string().optional(),
    paidDate: z.string().optional(),
});
// ============================================================================
// Output Types - Advance Tax
// ============================================================================
export const AdvanceTaxInstallmentSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    assessmentYear: z.string(),
    installmentNumber: z.string(),
    dueDate: z.string(),
    payableAmount: z.string(),
    paidAmount: z.string(),
    paidDate: z.string().nullable(),
    challanNumber: z.string().nullable(),
    challanDate: z.string().nullable(),
    interest234b: z.string(),
    interest234c: z.string(),
    balance: z.string(),
    createdAt: z.date(),
});
export const AdvanceTaxLedgerSchema = z.object({
    assessmentYear: z.string(),
    installments: z.array(AdvanceTaxInstallmentSchema),
    totalPayable: z.string(),
    totalPaid: z.string(),
    totalBalance: z.string(),
    totalInterest234b: z.string(),
    totalInterest234c: z.string(),
});
// ============================================================================
// Output Types - Self Assessment Tax
// ============================================================================
export const SelfAssessmentTaxSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    assessmentYear: z.string(),
    taxPayable: z.string(),
    advanceTaxPaid: z.string(),
    tdsTcsCredit: z.string(),
    balancePayable: z.string(),
    paidAmount: z.string(),
    challanNumber: z.string().nullable(),
    challanDate: z.string().nullable(),
    paidDate: z.string().nullable(),
    createdAt: z.date(),
});
export const SelfAssessmentLedgerSchema = z.object({
    assessmentYear: z.string(),
    taxPayable: z.string(),
    advanceTaxPaid: z.string(),
    tdsTcsCredit: z.string(),
    balancePayable: z.string(),
    paidAmount: z.string(),
    challanNumber: z.string().nullable(),
    challanDate: z.string().nullable(),
    paidDate: z.string().nullable(),
    createdAt: z.date(),
});
// ============================================================================
// Summary Types
// ============================================================================
export const ITRTaxLedgerSummarySchema = z.object({
    assessmentYear: z.string(),
    advanceTax: AdvanceTaxLedgerSchema,
    selfAssessment: SelfAssessmentLedgerSchema,
    totalTaxPaid: z.string(),
    totalBalance: z.string(),
    totalInterest: z.string(),
});
// ============================================================================
// Event Payloads
// ============================================================================
export const AdvanceTaxPaidPayloadSchema = z.object({
    aggregateId: z.string(), // tenant-assessmentYear
    installmentId: z.string().uuid(),
    tenantId: z.string().uuid(),
    assessmentYear: z.string().regex(/^\d{4}-\d{2}$/),
    installmentNumber: z.string(),
    amount: z.number(),
    challanNumber: z.string(),
    challanDate: z.string(),
    interest234C: z.number().optional(),
    paidAt: z.date(),
});
export const SelfAssessmentTaxPaidPayloadSchema = z.object({
    aggregateId: z.string(), // itrReturnId
    paymentId: z.string().uuid(),
    tenantId: z.string().uuid(),
    assessmentYear: z.string().regex(/^\d{4}-\d{2}$/),
    itrReturnId: z.string().uuid(),
    amount: z.number(),
    challanNumber: z.string(),
    challanDate: z.string(),
    balanceAfterPayment: z.number(),
    paidAt: z.date(),
});
//# sourceMappingURL=itr-ledgers.js.map