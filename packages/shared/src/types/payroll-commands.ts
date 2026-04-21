import { z } from "zod";

export const SalaryComponentInputSchema = z.object({
  componentCode: z.string(),
  componentName: z.string(),
  componentType: z.enum(["earning", "deduction", "statutory", "advance", "arrears"]),
  isTaxable: z.boolean().default(true),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type SalaryComponentInput = z.infer<typeof SalaryComponentInputSchema>;

export const EmployeeSalaryStructureInputSchema = z.object({
  employeeId: z.string().uuid(),
  effectiveFrom: z.string(),
  components: z.array(z.object({
    componentCode: z.string(),
    amount: z.string().optional(),
    percentageOfBasic: z.string().optional(),
  })).min(1, "At least one component required"),
});

export type EmployeeSalaryStructureInput = z.infer<typeof EmployeeSalaryStructureInputSchema>;

export const ProcessPayrollInputSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.string().regex(/^\d{2}$/, "Month must be MM format"),
  year: z.string().regex(/^\d{4}$/, "Year must be YYYY format"),
  paymentDate: z.string().optional(),
  narration: z.string().optional(),
});

export type ProcessPayrollInput = z.infer<typeof ProcessPayrollInputSchema>;

export const FinalizePayrollInputSchema = z.object({
  payrollRunId: z.string().uuid(),
});

export type FinalizePayrollInput = z.infer<typeof FinalizePayrollInputSchema>;

export const VoidPayrollInputSchema = z.object({
  payrollRunId: z.string().uuid(),
  reason: z.string().min(1),
});

export type VoidPayrollInput = z.infer<typeof VoidPayrollInputSchema>;

export const CreateAdvanceInputSchema = z.object({
  employeeId: z.string().uuid(),
  totalAmount: z.string(),
  monthlyDeduction: z.string(),
  installments: z.number().min(1),
  advanceDate: z.string(),
  monthReference: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM format"),
  narration: z.string().optional(),
});

export type CreateAdvanceInput = z.infer<typeof CreateAdvanceInputSchema>;

export const RecoverAdvanceInputSchema = z.object({
  advanceId: z.string().uuid(),
  deductedAmount: z.string(),
});

export type RecoverAdvanceInput = z.infer<typeof RecoverAdvanceInputSchema>;

export const GeneratePayslipInputSchema = z.object({
  payrollRunId: z.string().uuid(),
});

export type GeneratePayslipInput = z.infer<typeof GeneratePayslipInputSchema>;

export const PayrollRunOutputSchema = z.object({
  id: z.string().uuid(),
  payrollNumber: z.string(),
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  employeeCode: z.string(),
  month: z.string(),
  year: z.string(),
  fiscalYear: z.string(),
  status: z.enum(["draft", "processing", "calculated", "finalized", "voided", "failed"]),
  grossEarnings: z.string(),
  grossDeductions: z.string(),
  netPay: z.string(),
  pfEe: z.string(),
  pfEr: z.string(),
  esiEe: z.string(),
  esiEr: z.string(),
  tdsDeducted: z.string(),
  professionalTax: z.string(),
  advanceDeduction: z.string(),
  arrears: z.string(),
  lines: z.array(z.object({
    componentCode: z.string(),
    componentName: z.string(),
    componentType: z.string(),
    amount: z.string(),
    description: z.string().optional(),
  })),
  journalEntryId: z.string().uuid().optional(),
  payslipUrl: z.string().optional(),
  isDistributed: z.boolean(),
  createdAt: z.date(),
});

export type PayrollRunOutput = z.infer<typeof PayrollRunOutputSchema>;

export const PayrollRegisterEntrySchema = z.object({
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  employeeCode: z.string(),
  designation: z.string().optional(),
  department: z.string().optional(),
  daysPresent: z.number(),
  grossEarnings: z.string(),
  pfEe: z.string(),
  pfEr: z.string(),
  esiEe: z.string(),
  esiEr: z.string(),
  tdsDeducted: z.string(),
  professionalTax: z.string(),
  advanceDeduction: z.string(),
  otherDeductions: z.string(),
  netPay: z.string(),
  paymentDate: z.string(),
  status: z.string(),
});

export type PayrollRegisterEntry = z.infer<typeof PayrollRegisterEntrySchema>;

export const PFCalculationResultSchema = z.object({
  ee: z.number(),
  er: z.number(),
  eps: z.number(),
  epf: z.number(),
  grossSalary: z.number(),
  wageCeiling: z.number(),
});

export type PFCalculationResult = z.infer<typeof PFCalculationResultSchema>;

export const ESICalculationResultSchema = z.object({
  ee: z.number(),
  er: z.number(),
  grossSalary: z.number(),
  wageCeiling: z.number(),
});

export type ESICalculationResult = z.infer<typeof ESICalculationResultSchema>;

export const TDSCalculationResultSchema = z.object({
  projectedAnnualIncome: z.number(),
  taxableIncome: z.number(),
  annualTDS: z.number(),
  monthlyTDS: z.number(),
  remainingMonths: z.number(),
  regime: z.enum(["old", "new"]),
  deductions: z.record(z.number()),
});

export type TDSCalculationResult = z.infer<typeof TDSCalculationResultSchema>;

export const ArrearsCalculationResultSchema = z.object({
  oldMonthlyCTC: z.number(),
  newMonthlyCTC: z.number(),
  monthlyDifference: z.number(),
  arrearsMonths: z.number(),
  totalArrears: z.number(),
  effectiveFrom: z.string(),
  currentMonth: z.string(),
});

export type ArrearsCalculationResult = z.infer<typeof ArrearsCalculationResultSchema>;
