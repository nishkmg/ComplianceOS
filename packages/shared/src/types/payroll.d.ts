import { z } from "zod";
export declare const EmployeeCreatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    employeeCode: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodOptional<z.ZodString>;
    pan: z.ZodString;
    dateOfJoining: z.ZodString;
    designation: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pan?: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    dateOfJoining?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
}, {
    pan?: string;
    employeeCode?: string;
    firstName?: string;
    lastName?: string;
    dateOfJoining?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
}>;
export type EmployeeCreatedPayload = z.infer<typeof EmployeeCreatedPayloadSchema>;
export declare const EmployeeUpdatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    updatedFields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    updatedFields?: Record<string, unknown>;
}, {
    employeeId?: string;
    updatedFields?: Record<string, unknown>;
}>;
export type EmployeeUpdatedPayload = z.infer<typeof EmployeeUpdatedPayloadSchema>;
export declare const EmployeeDeactivatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    dateOfExit: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    dateOfExit?: string;
    employeeId?: string;
}, {
    reason?: string;
    dateOfExit?: string;
    employeeId?: string;
}>;
export type EmployeeDeactivatedPayload = z.infer<typeof EmployeeDeactivatedPayloadSchema>;
export declare const SalaryStructureCreatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    structureId: z.ZodString;
    version: z.ZodNumber;
    effectiveFrom: z.ZodString;
    components: z.ZodArray<z.ZodObject<{
        componentCode: z.ZodString;
        componentName: z.ZodString;
        amount: z.ZodOptional<z.ZodString>;
        percentageOfBasic: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount?: string;
        componentCode?: string;
        componentName?: string;
        percentageOfBasic?: string;
    }, {
        amount?: string;
        componentCode?: string;
        componentName?: string;
        percentageOfBasic?: string;
    }>, "many">;
    grossEarnings: z.ZodString;
    grossDeductions: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    version?: number;
    effectiveFrom?: string;
    grossEarnings?: string;
    grossDeductions?: string;
    structureId?: string;
    components?: {
        amount?: string;
        componentCode?: string;
        componentName?: string;
        percentageOfBasic?: string;
    }[];
}, {
    employeeId?: string;
    version?: number;
    effectiveFrom?: string;
    grossEarnings?: string;
    grossDeductions?: string;
    structureId?: string;
    components?: {
        amount?: string;
        componentCode?: string;
        componentName?: string;
        percentageOfBasic?: string;
    }[];
}>;
export type SalaryStructureCreatedPayload = z.infer<typeof SalaryStructureCreatedPayloadSchema>;
export declare const SalaryStructureUpdatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    structureId: z.ZodString;
    oldVersion: z.ZodNumber;
    newVersion: z.ZodNumber;
    effectiveFrom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    effectiveFrom?: string;
    structureId?: string;
    oldVersion?: number;
    newVersion?: number;
}, {
    employeeId?: string;
    effectiveFrom?: string;
    structureId?: string;
    oldVersion?: number;
    newVersion?: number;
}>;
export type SalaryStructureUpdatedPayload = z.infer<typeof SalaryStructureUpdatedPayloadSchema>;
export declare const PayrollProcessedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    employeeId: z.ZodString;
    month: z.ZodString;
    year: z.ZodString;
    grossEarnings: z.ZodString;
    grossDeductions: z.ZodString;
    netPay: z.ZodString;
    pfEe: z.ZodString;
    pfEr: z.ZodString;
    esiEe: z.ZodString;
    esiEr: z.ZodString;
    tdsDeducted: z.ZodString;
    professionalTax: z.ZodString;
    advanceDeduction: z.ZodOptional<z.ZodString>;
    arrears: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    arrears?: string;
    year?: string;
    employeeId?: string;
    month?: string;
    grossEarnings?: string;
    grossDeductions?: string;
    netPay?: string;
    pfEe?: string;
    pfEr?: string;
    esiEe?: string;
    esiEr?: string;
    tdsDeducted?: string;
    professionalTax?: string;
    advanceDeduction?: string;
    payrollRunId?: string;
}, {
    arrears?: string;
    year?: string;
    employeeId?: string;
    month?: string;
    grossEarnings?: string;
    grossDeductions?: string;
    netPay?: string;
    pfEe?: string;
    pfEr?: string;
    esiEe?: string;
    esiEr?: string;
    tdsDeducted?: string;
    professionalTax?: string;
    advanceDeduction?: string;
    payrollRunId?: string;
}>;
export type PayrollProcessedPayload = z.infer<typeof PayrollProcessedPayloadSchema>;
export declare const PayrollFinalizedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    journalEntryId: z.ZodString;
    finalizedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    journalEntryId?: string;
    finalizedAt?: Date;
    payrollRunId?: string;
}, {
    journalEntryId?: string;
    finalizedAt?: Date;
    payrollRunId?: string;
}>;
export type PayrollFinalizedPayload = z.infer<typeof PayrollFinalizedPayloadSchema>;
export declare const PayrollVoidedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    reversalJournalEntryId: z.ZodOptional<z.ZodString>;
    voidedAt: z.ZodDate;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    voidedAt?: Date;
    payrollRunId?: string;
    reversalJournalEntryId?: string;
}, {
    reason?: string;
    voidedAt?: Date;
    payrollRunId?: string;
    reversalJournalEntryId?: string;
}>;
export type PayrollVoidedPayload = z.infer<typeof PayrollVoidedPayloadSchema>;
export declare const PayslipGeneratedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    payslipId: z.ZodString;
    pdfUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pdfUrl?: string;
    payrollRunId?: string;
    payslipId?: string;
}, {
    pdfUrl?: string;
    payrollRunId?: string;
    payslipId?: string;
}>;
export type PayslipGeneratedPayload = z.infer<typeof PayslipGeneratedPayloadSchema>;
export declare const AdvanceGivenPayloadSchema: z.ZodObject<{
    advanceId: z.ZodString;
    employeeId: z.ZodString;
    totalAmount: z.ZodString;
    monthlyDeduction: z.ZodString;
    installments: z.ZodNumber;
    advanceDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    totalAmount?: string;
    monthlyDeduction?: string;
    installments?: number;
    advanceDate?: string;
    advanceId?: string;
}, {
    employeeId?: string;
    totalAmount?: string;
    monthlyDeduction?: string;
    installments?: number;
    advanceDate?: string;
    advanceId?: string;
}>;
export type AdvanceGivenPayload = z.infer<typeof AdvanceGivenPayloadSchema>;
export declare const AdvanceRecoveredPayloadSchema: z.ZodObject<{
    advanceId: z.ZodString;
    employeeId: z.ZodString;
    deductedAmount: z.ZodString;
    remainingBalance: z.ZodString;
    installmentNumber: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    remainingBalance?: string;
    installmentNumber?: number;
    advanceId?: string;
    deductedAmount?: string;
}, {
    employeeId?: string;
    remainingBalance?: string;
    installmentNumber?: number;
    advanceId?: string;
    deductedAmount?: string;
}>;
export type AdvanceRecoveredPayload = z.infer<typeof AdvanceRecoveredPayloadSchema>;
//# sourceMappingURL=payroll.d.ts.map