"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvanceRecoveredPayloadSchema = exports.AdvanceGivenPayloadSchema = exports.PayslipGeneratedPayloadSchema = exports.PayrollVoidedPayloadSchema = exports.PayrollFinalizedPayloadSchema = exports.PayrollProcessedPayloadSchema = exports.SalaryStructureUpdatedPayloadSchema = exports.SalaryStructureCreatedPayloadSchema = exports.EmployeeDeactivatedPayloadSchema = exports.EmployeeUpdatedPayloadSchema = exports.EmployeeCreatedPayloadSchema = void 0;
const zod_1 = require("zod");
exports.EmployeeCreatedPayloadSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    employeeCode: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string().optional(),
    pan: zod_1.z.string(),
    dateOfJoining: zod_1.z.string(),
    designation: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
exports.EmployeeUpdatedPayloadSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    updatedFields: zod_1.z.record(zod_1.z.unknown()),
});
exports.EmployeeDeactivatedPayloadSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    dateOfExit: zod_1.z.string(),
    reason: zod_1.z.string(),
});
exports.SalaryStructureCreatedPayloadSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    structureId: zod_1.z.string().uuid(),
    version: zod_1.z.number(),
    effectiveFrom: zod_1.z.string(),
    components: zod_1.z.array(zod_1.z.object({
        componentCode: zod_1.z.string(),
        componentName: zod_1.z.string(),
        amount: zod_1.z.string().optional(),
        percentageOfBasic: zod_1.z.string().optional(),
    })),
    grossEarnings: zod_1.z.string(),
    grossDeductions: zod_1.z.string(),
});
exports.SalaryStructureUpdatedPayloadSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    structureId: zod_1.z.string().uuid(),
    oldVersion: zod_1.z.number(),
    newVersion: zod_1.z.number(),
    effectiveFrom: zod_1.z.string(),
});
exports.PayrollProcessedPayloadSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
    employeeId: zod_1.z.string().uuid(),
    month: zod_1.z.string(),
    year: zod_1.z.string(),
    grossEarnings: zod_1.z.string(),
    grossDeductions: zod_1.z.string(),
    netPay: zod_1.z.string(),
    pfEe: zod_1.z.string(),
    pfEr: zod_1.z.string(),
    esiEe: zod_1.z.string(),
    esiEr: zod_1.z.string(),
    tdsDeducted: zod_1.z.string(),
    professionalTax: zod_1.z.string(),
    advanceDeduction: zod_1.z.string().optional(),
    arrears: zod_1.z.string().optional(),
});
exports.PayrollFinalizedPayloadSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
    journalEntryId: zod_1.z.string().uuid(),
    finalizedAt: zod_1.z.date(),
});
exports.PayrollVoidedPayloadSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
    reversalJournalEntryId: zod_1.z.string().uuid().optional(),
    voidedAt: zod_1.z.date(),
    reason: zod_1.z.string(),
});
exports.PayslipGeneratedPayloadSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
    payslipId: zod_1.z.string().uuid(),
    pdfUrl: zod_1.z.string(),
});
exports.AdvanceGivenPayloadSchema = zod_1.z.object({
    advanceId: zod_1.z.string().uuid(),
    employeeId: zod_1.z.string().uuid(),
    totalAmount: zod_1.z.string(),
    monthlyDeduction: zod_1.z.string(),
    installments: zod_1.z.number(),
    advanceDate: zod_1.z.string(),
});
exports.AdvanceRecoveredPayloadSchema = zod_1.z.object({
    advanceId: zod_1.z.string().uuid(),
    employeeId: zod_1.z.string().uuid(),
    deductedAmount: zod_1.z.string(),
    remainingBalance: zod_1.z.string(),
    installmentNumber: zod_1.z.number(),
});
//# sourceMappingURL=payroll.js.map