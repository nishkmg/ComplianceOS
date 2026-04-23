"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrearsCalculationResultSchema = exports.TDSCalculationResultSchema = exports.ESICalculationResultSchema = exports.PFCalculationResultSchema = exports.PayrollRegisterEntrySchema = exports.PayrollRunOutputSchema = exports.GeneratePayslipInputSchema = exports.RecoverAdvanceInputSchema = exports.CreateAdvanceInputSchema = exports.VoidPayrollInputSchema = exports.FinalizePayrollInputSchema = exports.ProcessPayrollInputSchema = exports.EmployeeSalaryStructureInputSchema = exports.SalaryComponentInputSchema = void 0;
const zod_1 = require("zod");
exports.SalaryComponentInputSchema = zod_1.z.object({
    componentCode: zod_1.z.string(),
    componentName: zod_1.z.string(),
    componentType: zod_1.z.enum(["earning", "deduction", "statutory", "advance", "arrears"]),
    isTaxable: zod_1.z.boolean().default(true),
    displayOrder: zod_1.z.number().default(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.EmployeeSalaryStructureInputSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    effectiveFrom: zod_1.z.string(),
    components: zod_1.z.array(zod_1.z.object({
        componentCode: zod_1.z.string(),
        amount: zod_1.z.string().optional(),
        percentageOfBasic: zod_1.z.string().optional(),
    })).min(1, "At least one component required"),
});
exports.ProcessPayrollInputSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    month: zod_1.z.string().regex(/^\d{2}$/, "Month must be MM format"),
    year: zod_1.z.string().regex(/^\d{4}$/, "Year must be YYYY format"),
    paymentDate: zod_1.z.string().optional(),
    narration: zod_1.z.string().optional(),
});
exports.FinalizePayrollInputSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
});
exports.VoidPayrollInputSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(1),
});
exports.CreateAdvanceInputSchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    totalAmount: zod_1.z.string(),
    monthlyDeduction: zod_1.z.string(),
    installments: zod_1.z.number().min(1),
    advanceDate: zod_1.z.string(),
    monthReference: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
    narration: zod_1.z.string().optional(),
});
exports.RecoverAdvanceInputSchema = zod_1.z.object({
    advanceId: zod_1.z.string().uuid(),
    deductedAmount: zod_1.z.string(),
});
exports.GeneratePayslipInputSchema = zod_1.z.object({
    payrollRunId: zod_1.z.string().uuid(),
});
exports.PayrollRunOutputSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    payrollNumber: zod_1.z.string(),
    employeeId: zod_1.z.string().uuid(),
    employeeName: zod_1.z.string(),
    employeeCode: zod_1.z.string(),
    month: zod_1.z.string(),
    year: zod_1.z.string(),
    fiscalYear: zod_1.z.string(),
    status: zod_1.z.enum(["draft", "processing", "calculated", "finalized", "voided", "failed"]),
    grossEarnings: zod_1.z.string(),
    grossDeductions: zod_1.z.string(),
    netPay: zod_1.z.string(),
    pfEe: zod_1.z.string(),
    pfEr: zod_1.z.string(),
    esiEe: zod_1.z.string(),
    esiEr: zod_1.z.string(),
    tdsDeducted: zod_1.z.string(),
    professionalTax: zod_1.z.string(),
    advanceDeduction: zod_1.z.string(),
    arrears: zod_1.z.string(),
    lines: zod_1.z.array(zod_1.z.object({
        componentCode: zod_1.z.string(),
        componentName: zod_1.z.string(),
        componentType: zod_1.z.string(),
        amount: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })),
    journalEntryId: zod_1.z.string().uuid().optional(),
    payslipUrl: zod_1.z.string().optional(),
    isDistributed: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
});
exports.PayrollRegisterEntrySchema = zod_1.z.object({
    employeeId: zod_1.z.string().uuid(),
    employeeName: zod_1.z.string(),
    employeeCode: zod_1.z.string(),
    designation: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    daysPresent: zod_1.z.number(),
    grossEarnings: zod_1.z.string(),
    pfEe: zod_1.z.string(),
    pfEr: zod_1.z.string(),
    esiEe: zod_1.z.string(),
    esiEr: zod_1.z.string(),
    tdsDeducted: zod_1.z.string(),
    professionalTax: zod_1.z.string(),
    advanceDeduction: zod_1.z.string(),
    otherDeductions: zod_1.z.string(),
    netPay: zod_1.z.string(),
    paymentDate: zod_1.z.string(),
    status: zod_1.z.string(),
});
exports.PFCalculationResultSchema = zod_1.z.object({
    ee: zod_1.z.number(),
    er: zod_1.z.number(),
    eps: zod_1.z.number(),
    epf: zod_1.z.number(),
    grossSalary: zod_1.z.number(),
    wageCeiling: zod_1.z.number(),
});
exports.ESICalculationResultSchema = zod_1.z.object({
    ee: zod_1.z.number(),
    er: zod_1.z.number(),
    grossSalary: zod_1.z.number(),
    wageCeiling: zod_1.z.number(),
});
exports.TDSCalculationResultSchema = zod_1.z.object({
    projectedAnnualIncome: zod_1.z.number(),
    taxableIncome: zod_1.z.number(),
    annualTDS: zod_1.z.number(),
    monthlyTDS: zod_1.z.number(),
    remainingMonths: zod_1.z.number(),
    regime: zod_1.z.enum(["old", "new"]),
    deductions: zod_1.z.record(zod_1.z.number()),
});
exports.ArrearsCalculationResultSchema = zod_1.z.object({
    oldMonthlyCTC: zod_1.z.number(),
    newMonthlyCTC: zod_1.z.number(),
    monthlyDifference: zod_1.z.number(),
    arrearsMonths: zod_1.z.number(),
    totalArrears: zod_1.z.number(),
    effectiveFrom: zod_1.z.string(),
    currentMonth: zod_1.z.string(),
});
//# sourceMappingURL=payroll-commands.js.map