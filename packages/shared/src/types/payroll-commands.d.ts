import { z } from "zod";
export declare const SalaryComponentInputSchema: z.ZodObject<{
    componentCode: z.ZodString;
    componentName: z.ZodString;
    componentType: z.ZodEnum<["earning", "deduction", "statutory", "advance", "arrears"]>;
    isTaxable: z.ZodDefault<z.ZodBoolean>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean;
    componentCode?: string;
    componentName?: string;
    componentType?: "earning" | "deduction" | "statutory" | "advance" | "arrears";
    isTaxable?: boolean;
    displayOrder?: number;
}, {
    isActive?: boolean;
    componentCode?: string;
    componentName?: string;
    componentType?: "earning" | "deduction" | "statutory" | "advance" | "arrears";
    isTaxable?: boolean;
    displayOrder?: number;
}>;
export type SalaryComponentInput = z.infer<typeof SalaryComponentInputSchema>;
export declare const EmployeeSalaryStructureInputSchema: z.ZodObject<{
    employeeId: z.ZodString;
    effectiveFrom: z.ZodString;
    components: z.ZodArray<z.ZodObject<{
        componentCode: z.ZodString;
        amount: z.ZodOptional<z.ZodString>;
        percentageOfBasic: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount?: string;
        componentCode?: string;
        percentageOfBasic?: string;
    }, {
        amount?: string;
        componentCode?: string;
        percentageOfBasic?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    employeeId?: string;
    effectiveFrom?: string;
    components?: {
        amount?: string;
        componentCode?: string;
        percentageOfBasic?: string;
    }[];
}, {
    employeeId?: string;
    effectiveFrom?: string;
    components?: {
        amount?: string;
        componentCode?: string;
        percentageOfBasic?: string;
    }[];
}>;
export type EmployeeSalaryStructureInput = z.infer<typeof EmployeeSalaryStructureInputSchema>;
export declare const ProcessPayrollInputSchema: z.ZodObject<{
    employeeId: z.ZodString;
    month: z.ZodString;
    year: z.ZodString;
    paymentDate: z.ZodOptional<z.ZodString>;
    narration: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    narration?: string;
    year?: string;
    employeeId?: string;
    month?: string;
    paymentDate?: string;
}, {
    narration?: string;
    year?: string;
    employeeId?: string;
    month?: string;
    paymentDate?: string;
}>;
export type ProcessPayrollInput = z.infer<typeof ProcessPayrollInputSchema>;
export declare const FinalizePayrollInputSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    payrollRunId?: string;
}, {
    payrollRunId?: string;
}>;
export type FinalizePayrollInput = z.infer<typeof FinalizePayrollInputSchema>;
export declare const VoidPayrollInputSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    payrollRunId?: string;
}, {
    reason?: string;
    payrollRunId?: string;
}>;
export type VoidPayrollInput = z.infer<typeof VoidPayrollInputSchema>;
export declare const CreateAdvanceInputSchema: z.ZodObject<{
    employeeId: z.ZodString;
    totalAmount: z.ZodString;
    monthlyDeduction: z.ZodString;
    installments: z.ZodNumber;
    advanceDate: z.ZodString;
    monthReference: z.ZodString;
    narration: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    narration?: string;
    employeeId?: string;
    totalAmount?: string;
    monthlyDeduction?: string;
    installments?: number;
    advanceDate?: string;
    monthReference?: string;
}, {
    narration?: string;
    employeeId?: string;
    totalAmount?: string;
    monthlyDeduction?: string;
    installments?: number;
    advanceDate?: string;
    monthReference?: string;
}>;
export type CreateAdvanceInput = z.infer<typeof CreateAdvanceInputSchema>;
export declare const RecoverAdvanceInputSchema: z.ZodObject<{
    advanceId: z.ZodString;
    deductedAmount: z.ZodString;
}, "strip", z.ZodTypeAny, {
    advanceId?: string;
    deductedAmount?: string;
}, {
    advanceId?: string;
    deductedAmount?: string;
}>;
export type RecoverAdvanceInput = z.infer<typeof RecoverAdvanceInputSchema>;
export declare const GeneratePayslipInputSchema: z.ZodObject<{
    payrollRunId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    payrollRunId?: string;
}, {
    payrollRunId?: string;
}>;
export type GeneratePayslipInput = z.infer<typeof GeneratePayslipInputSchema>;
export declare const PayrollRunOutputSchema: z.ZodObject<{
    id: z.ZodString;
    payrollNumber: z.ZodString;
    employeeId: z.ZodString;
    employeeName: z.ZodString;
    employeeCode: z.ZodString;
    month: z.ZodString;
    year: z.ZodString;
    fiscalYear: z.ZodString;
    status: z.ZodEnum<["draft", "processing", "calculated", "finalized", "voided", "failed"]>;
    grossEarnings: z.ZodString;
    grossDeductions: z.ZodString;
    netPay: z.ZodString;
    pfEe: z.ZodString;
    pfEr: z.ZodString;
    esiEe: z.ZodString;
    esiEr: z.ZodString;
    tdsDeducted: z.ZodString;
    professionalTax: z.ZodString;
    advanceDeduction: z.ZodString;
    arrears: z.ZodString;
    lines: z.ZodArray<z.ZodObject<{
        componentCode: z.ZodString;
        componentName: z.ZodString;
        componentType: z.ZodString;
        amount: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        amount?: string;
        componentCode?: string;
        componentName?: string;
        componentType?: string;
    }, {
        description?: string;
        amount?: string;
        componentCode?: string;
        componentName?: string;
        componentType?: string;
    }>, "many">;
    journalEntryId: z.ZodOptional<z.ZodString>;
    payslipUrl: z.ZodOptional<z.ZodString>;
    isDistributed: z.ZodBoolean;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    arrears?: string;
    id?: string;
    createdAt?: Date;
    status?: "draft" | "voided" | "processing" | "failed" | "calculated" | "finalized";
    fiscalYear?: string;
    journalEntryId?: string;
    year?: string;
    employeeCode?: string;
    employeeId?: string;
    payrollNumber?: string;
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
    payslipUrl?: string;
    isDistributed?: boolean;
    employeeName?: string;
    lines?: {
        description?: string;
        amount?: string;
        componentCode?: string;
        componentName?: string;
        componentType?: string;
    }[];
}, {
    arrears?: string;
    id?: string;
    createdAt?: Date;
    status?: "draft" | "voided" | "processing" | "failed" | "calculated" | "finalized";
    fiscalYear?: string;
    journalEntryId?: string;
    year?: string;
    employeeCode?: string;
    employeeId?: string;
    payrollNumber?: string;
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
    payslipUrl?: string;
    isDistributed?: boolean;
    employeeName?: string;
    lines?: {
        description?: string;
        amount?: string;
        componentCode?: string;
        componentName?: string;
        componentType?: string;
    }[];
}>;
export type PayrollRunOutput = z.infer<typeof PayrollRunOutputSchema>;
export declare const PayrollRegisterEntrySchema: z.ZodObject<{
    employeeId: z.ZodString;
    employeeName: z.ZodString;
    employeeCode: z.ZodString;
    designation: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
    daysPresent: z.ZodNumber;
    grossEarnings: z.ZodString;
    pfEe: z.ZodString;
    pfEr: z.ZodString;
    esiEe: z.ZodString;
    esiEr: z.ZodString;
    tdsDeducted: z.ZodString;
    professionalTax: z.ZodString;
    advanceDeduction: z.ZodString;
    otherDeductions: z.ZodString;
    netPay: z.ZodString;
    paymentDate: z.ZodString;
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status?: string;
    employeeCode?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
    paymentDate?: string;
    grossEarnings?: string;
    netPay?: string;
    pfEe?: string;
    pfEr?: string;
    esiEe?: string;
    esiEr?: string;
    tdsDeducted?: string;
    professionalTax?: string;
    advanceDeduction?: string;
    employeeName?: string;
    daysPresent?: number;
    otherDeductions?: string;
}, {
    status?: string;
    employeeCode?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
    paymentDate?: string;
    grossEarnings?: string;
    netPay?: string;
    pfEe?: string;
    pfEr?: string;
    esiEe?: string;
    esiEr?: string;
    tdsDeducted?: string;
    professionalTax?: string;
    advanceDeduction?: string;
    employeeName?: string;
    daysPresent?: number;
    otherDeductions?: string;
}>;
export type PayrollRegisterEntry = z.infer<typeof PayrollRegisterEntrySchema>;
export declare const PFCalculationResultSchema: z.ZodObject<{
    ee: z.ZodNumber;
    er: z.ZodNumber;
    eps: z.ZodNumber;
    epf: z.ZodNumber;
    grossSalary: z.ZodNumber;
    wageCeiling: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    wageCeiling?: number;
    ee?: number;
    er?: number;
    eps?: number;
    epf?: number;
    grossSalary?: number;
}, {
    wageCeiling?: number;
    ee?: number;
    er?: number;
    eps?: number;
    epf?: number;
    grossSalary?: number;
}>;
export type PFCalculationResult = z.infer<typeof PFCalculationResultSchema>;
export declare const ESICalculationResultSchema: z.ZodObject<{
    ee: z.ZodNumber;
    er: z.ZodNumber;
    grossSalary: z.ZodNumber;
    wageCeiling: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    wageCeiling?: number;
    ee?: number;
    er?: number;
    grossSalary?: number;
}, {
    wageCeiling?: number;
    ee?: number;
    er?: number;
    grossSalary?: number;
}>;
export type ESICalculationResult = z.infer<typeof ESICalculationResultSchema>;
export declare const TDSCalculationResultSchema: z.ZodObject<{
    projectedAnnualIncome: z.ZodNumber;
    taxableIncome: z.ZodNumber;
    annualTDS: z.ZodNumber;
    monthlyTDS: z.ZodNumber;
    remainingMonths: z.ZodNumber;
    regime: z.ZodEnum<["old", "new"]>;
    deductions: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    regime?: "old" | "new";
    projectedAnnualIncome?: number;
    taxableIncome?: number;
    annualTDS?: number;
    monthlyTDS?: number;
    remainingMonths?: number;
    deductions?: Record<string, number>;
}, {
    regime?: "old" | "new";
    projectedAnnualIncome?: number;
    taxableIncome?: number;
    annualTDS?: number;
    monthlyTDS?: number;
    remainingMonths?: number;
    deductions?: Record<string, number>;
}>;
export type TDSCalculationResult = z.infer<typeof TDSCalculationResultSchema>;
export declare const ArrearsCalculationResultSchema: z.ZodObject<{
    oldMonthlyCTC: z.ZodNumber;
    newMonthlyCTC: z.ZodNumber;
    monthlyDifference: z.ZodNumber;
    arrearsMonths: z.ZodNumber;
    totalArrears: z.ZodNumber;
    effectiveFrom: z.ZodString;
    currentMonth: z.ZodString;
}, "strip", z.ZodTypeAny, {
    effectiveFrom?: string;
    oldMonthlyCTC?: number;
    newMonthlyCTC?: number;
    monthlyDifference?: number;
    arrearsMonths?: number;
    totalArrears?: number;
    currentMonth?: string;
}, {
    effectiveFrom?: string;
    oldMonthlyCTC?: number;
    newMonthlyCTC?: number;
    monthlyDifference?: number;
    arrearsMonths?: number;
    totalArrears?: number;
    currentMonth?: string;
}>;
export type ArrearsCalculationResult = z.infer<typeof ArrearsCalculationResultSchema>;
//# sourceMappingURL=payroll-commands.d.ts.map