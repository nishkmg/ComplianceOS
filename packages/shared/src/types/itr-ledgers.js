"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfAssessmentTaxPaidPayloadSchema = exports.AdvanceTaxPaidPayloadSchema = exports.ITRTaxLedgerSummarySchema = exports.SelfAssessmentLedgerSchema = exports.SelfAssessmentTaxSchema = exports.AdvanceTaxLedgerSchema = exports.AdvanceTaxInstallmentSchema = exports.RecordSelfAssessmentTaxInputSchema = exports.RecordAdvanceTaxPaymentInputSchema = exports.ADVANCE_TAX_DUE_DATES = exports.AdvanceTaxInstallmentNumber = void 0;
const zod_1 = require("zod");
// ============================================================================
// Enums
// ============================================================================
var AdvanceTaxInstallmentNumber;
(function (AdvanceTaxInstallmentNumber) {
    AdvanceTaxInstallmentNumber["INSTALLMENT_1"] = "1";
    AdvanceTaxInstallmentNumber["INSTALLMENT_2"] = "2";
    AdvanceTaxInstallmentNumber["INSTALLMENT_3"] = "3";
    AdvanceTaxInstallmentNumber["INSTALLMENT_4"] = "4";
})(AdvanceTaxInstallmentNumber || (exports.AdvanceTaxInstallmentNumber = AdvanceTaxInstallmentNumber = {}));
// Due dates for advance tax installments
exports.ADVANCE_TAX_DUE_DATES = {
    [AdvanceTaxInstallmentNumber.INSTALLMENT_1]: "06-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_2]: "09-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_3]: "12-15",
    [AdvanceTaxInstallmentNumber.INSTALLMENT_4]: "03-15",
};
// ============================================================================
// Input Schemas
// ============================================================================
exports.RecordAdvanceTaxPaymentInputSchema = zod_1.z.object({
    assessmentYear: zod_1.z.string(),
    installmentNumber: zod_1.z.nativeEnum(AdvanceTaxInstallmentNumber),
    paidAmount: zod_1.z.string(),
    paidDate: zod_1.z.string(),
    challanNumber: zod_1.z.string(),
    challanDate: zod_1.z.string(),
});
exports.RecordSelfAssessmentTaxInputSchema = zod_1.z.object({
    assessmentYear: zod_1.z.string(),
    taxPayable: zod_1.z.string(),
    advanceTaxPaid: zod_1.z.string(),
    tdsTcsCredit: zod_1.z.string(),
    balancePayable: zod_1.z.string(),
    paidAmount: zod_1.z.string().optional(),
    challanNumber: zod_1.z.string().optional(),
    challanDate: zod_1.z.string().optional(),
    paidDate: zod_1.z.string().optional(),
});
// ============================================================================
// Output Types - Advance Tax
// ============================================================================
exports.AdvanceTaxInstallmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    installmentNumber: zod_1.z.string(),
    dueDate: zod_1.z.string(),
    payableAmount: zod_1.z.string(),
    paidAmount: zod_1.z.string(),
    paidDate: zod_1.z.string().nullable(),
    challanNumber: zod_1.z.string().nullable(),
    challanDate: zod_1.z.string().nullable(),
    interest234b: zod_1.z.string(),
    interest234c: zod_1.z.string(),
    balance: zod_1.z.string(),
    createdAt: zod_1.z.date(),
});
exports.AdvanceTaxLedgerSchema = zod_1.z.object({
    assessmentYear: zod_1.z.string(),
    installments: zod_1.z.array(exports.AdvanceTaxInstallmentSchema),
    totalPayable: zod_1.z.string(),
    totalPaid: zod_1.z.string(),
    totalBalance: zod_1.z.string(),
    totalInterest234b: zod_1.z.string(),
    totalInterest234c: zod_1.z.string(),
});
// ============================================================================
// Output Types - Self Assessment Tax
// ============================================================================
exports.SelfAssessmentTaxSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string(),
    taxPayable: zod_1.z.string(),
    advanceTaxPaid: zod_1.z.string(),
    tdsTcsCredit: zod_1.z.string(),
    balancePayable: zod_1.z.string(),
    paidAmount: zod_1.z.string(),
    challanNumber: zod_1.z.string().nullable(),
    challanDate: zod_1.z.string().nullable(),
    paidDate: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
});
exports.SelfAssessmentLedgerSchema = zod_1.z.object({
    assessmentYear: zod_1.z.string(),
    taxPayable: zod_1.z.string(),
    advanceTaxPaid: zod_1.z.string(),
    tdsTcsCredit: zod_1.z.string(),
    balancePayable: zod_1.z.string(),
    paidAmount: zod_1.z.string(),
    challanNumber: zod_1.z.string().nullable(),
    challanDate: zod_1.z.string().nullable(),
    paidDate: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
});
// ============================================================================
// Summary Types
// ============================================================================
exports.ITRTaxLedgerSummarySchema = zod_1.z.object({
    assessmentYear: zod_1.z.string(),
    advanceTax: exports.AdvanceTaxLedgerSchema,
    selfAssessment: exports.SelfAssessmentLedgerSchema,
    totalTaxPaid: zod_1.z.string(),
    totalBalance: zod_1.z.string(),
    totalInterest: zod_1.z.string(),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.AdvanceTaxPaidPayloadSchema = zod_1.z.object({
    aggregateId: zod_1.z.string(), // tenant-assessmentYear
    installmentId: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    installmentNumber: zod_1.z.string(),
    amount: zod_1.z.number(),
    challanNumber: zod_1.z.string(),
    challanDate: zod_1.z.string(),
    interest234C: zod_1.z.number().optional(),
    paidAt: zod_1.z.date(),
});
exports.SelfAssessmentTaxPaidPayloadSchema = zod_1.z.object({
    aggregateId: zod_1.z.string(), // itrReturnId
    paymentId: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    assessmentYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    itrReturnId: zod_1.z.string().uuid(),
    amount: zod_1.z.number(),
    challanNumber: zod_1.z.string(),
    challanDate: zod_1.z.string(),
    balanceAfterPayment: zod_1.z.number(),
    paidAt: zod_1.z.date(),
});
//# sourceMappingURL=itr-ledgers.js.map