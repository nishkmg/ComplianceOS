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
    pan: string;
    employeeCode: string;
    firstName: string;
    dateOfJoining: string;
    employeeId: string;
    lastName?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
}, {
    pan: string;
    employeeCode: string;
    firstName: string;
    dateOfJoining: string;
    employeeId: string;
    lastName?: string | undefined;
    designation?: string | undefined;
    department?: string | undefined;
}>;
export type EmployeeCreatedPayload = z.infer<typeof EmployeeCreatedPayloadSchema>;
export declare const EmployeeUpdatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    updatedFields: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    updatedFields: Record<string, unknown>;
}, {
    employeeId: string;
    updatedFields: Record<string, unknown>;
}>;
export type EmployeeUpdatedPayload = z.infer<typeof EmployeeUpdatedPayloadSchema>;
export declare const EmployeeDeactivatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    dateOfExit: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    dateOfExit: string;
    employeeId: string;
}, {
    reason: string;
    dateOfExit: string;
    employeeId: string;
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
        componentCode: string;
        componentName: string;
        amount?: string | undefined;
        percentageOfBasic?: string | undefined;
    }, {
        componentCode: string;
        componentName: string;
        amount?: string | undefined;
        percentageOfBasic?: string | undefined;
    }>, "many">;
    grossEarnings: z.ZodString;
    grossDeductions: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    structureId: string;
    version: number;
    effectiveFrom: string;
    components: {
        componentCode: string;
        componentName: string;
        amount?: string | undefined;
        percentageOfBasic?: string | undefined;
    }[];
    grossEarnings: string;
    grossDeductions: string;
}, {
    employeeId: string;
    structureId: string;
    version: number;
    effectiveFrom: string;
    components: {
        componentCode: string;
        componentName: string;
        amount?: string | undefined;
        percentageOfBasic?: string | undefined;
    }[];
    grossEarnings: string;
    grossDeductions: string;
}>;
export type SalaryStructureCreatedPayload = z.infer<typeof SalaryStructureCreatedPayloadSchema>;
export declare const SalaryStructureUpdatedPayloadSchema: z.ZodObject<{
    employeeId: z.ZodString;
    structureId: z.ZodString;
    oldVersion: z.ZodNumber;
    newVersion: z.ZodNumber;
    effectiveFrom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    structureId: string;
    effectiveFrom: string;
    oldVersion: number;
    newVersion: number;
}, {
    employeeId: string;
    structureId: string;
    effectiveFrom: string;
    oldVersion: number;
    newVersion: number;
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
    employeeId: string;
    grossEarnings: string;
    grossDeductions: string;
    payrollRunId: string;
    month: string;
    year: string;
    netPay: string;
    pfEe: string;
    pfEr: string;
    esiEe: string;
    esiEr: string;
    tdsDeducted: string;
    professionalTax: string;
    advanceDeduction?: string | undefined;
    arrears?: string | undefined;
}, {
    employeeId: string;
    grossEarnings: string;
    grossDeductions: string;
    payrollRunId: string;
    month: string;
    year: string;
    netPay: string;
    pfEe: string;
    pfEr: string;
    esiEe: string;
    esiEr: string;
    tdsDeducted: string;
    professionalTax: string;
    advanceDeduction?: string | undefined;
    arrears?: string | undefined;
}>;
export type PayrollProcessedPayload = z.infer<typeof PayrollProcessedPayloadSchema>;
export declare const PayrollFinalizedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    journalEntryId: z.ZodString;
    finalizedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    journalEntryId: string;
    payrollRunId: string;
    finalizedAt: Date;
}, {
    journalEntryId: string;
    payrollRunId: string;
    finalizedAt: Date;
}>;
export type PayrollFinalizedPayload = z.infer<typeof PayrollFinalizedPayloadSchema>;
export declare const PayrollVoidedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    reversalJournalEntryId: z.ZodOptional<z.ZodString>;
    voidedAt: z.ZodDate;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    voidedAt: Date;
    payrollRunId: string;
    reversalJournalEntryId?: string | undefined;
}, {
    reason: string;
    voidedAt: Date;
    payrollRunId: string;
    reversalJournalEntryId?: string | undefined;
}>;
export type PayrollVoidedPayload = z.infer<typeof PayrollVoidedPayloadSchema>;
export declare const PayslipGeneratedPayloadSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    payslipId: z.ZodString;
    pdfUrl: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pdfUrl: string;
    payrollRunId: string;
    payslipId: string;
}, {
    pdfUrl: string;
    payrollRunId: string;
    payslipId: string;
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
    totalAmount: string;
    employeeId: string;
    advanceId: string;
    monthlyDeduction: string;
    installments: number;
    advanceDate: string;
}, {
    totalAmount: string;
    employeeId: string;
    advanceId: string;
    monthlyDeduction: string;
    installments: number;
    advanceDate: string;
}>;
export type AdvanceGivenPayload = z.infer<typeof AdvanceGivenPayloadSchema>;
export declare const AdvanceRecoveredPayloadSchema: z.ZodObject<{
    advanceId: z.ZodString;
    employeeId: z.ZodString;
    deductedAmount: z.ZodString;
    remainingBalance: z.ZodString;
    installmentNumber: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    employeeId: string;
    advanceId: string;
    deductedAmount: string;
    remainingBalance: string;
    installmentNumber: number;
}, {
    employeeId: string;
    advanceId: string;
    deductedAmount: string;
    remainingBalance: string;
    installmentNumber: number;
}>;
export type AdvanceRecoveredPayload = z.infer<typeof AdvanceRecoveredPayloadSchema>;
//# sourceMappingURL=payroll.d.ts.map