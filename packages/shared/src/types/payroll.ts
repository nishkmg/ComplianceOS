import { z } from "zod";

export const EmployeeCreatedPayloadSchema = z.object({
  employeeId: z.string().uuid(),
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
  pan: z.string(),
  dateOfJoining: z.string(),
  designation: z.string().optional(),
  department: z.string().optional(),
});

export type EmployeeCreatedPayload = z.infer<typeof EmployeeCreatedPayloadSchema>;

export const EmployeeUpdatedPayloadSchema = z.object({
  employeeId: z.string().uuid(),
  updatedFields: z.record(z.unknown()),
});

export type EmployeeUpdatedPayload = z.infer<typeof EmployeeUpdatedPayloadSchema>;

export const EmployeeDeactivatedPayloadSchema = z.object({
  employeeId: z.string().uuid(),
  dateOfExit: z.string(),
  reason: z.string(),
});

export type EmployeeDeactivatedPayload = z.infer<typeof EmployeeDeactivatedPayloadSchema>;

export const SalaryStructureCreatedPayloadSchema = z.object({
  employeeId: z.string().uuid(),
  structureId: z.string().uuid(),
  version: z.number(),
  effectiveFrom: z.string(),
  components: z.array(z.object({
    componentCode: z.string(),
    componentName: z.string(),
    amount: z.string().optional(),
    percentageOfBasic: z.string().optional(),
  })),
  grossEarnings: z.string(),
  grossDeductions: z.string(),
});

export type SalaryStructureCreatedPayload = z.infer<typeof SalaryStructureCreatedPayloadSchema>;

export const SalaryStructureUpdatedPayloadSchema = z.object({
  employeeId: z.string().uuid(),
  structureId: z.string().uuid(),
  oldVersion: z.number(),
  newVersion: z.number(),
  effectiveFrom: z.string(),
});

export type SalaryStructureUpdatedPayload = z.infer<typeof SalaryStructureUpdatedPayloadSchema>;

export const PayrollProcessedPayloadSchema = z.object({
  payrollRunId: z.string().uuid(),
  employeeId: z.string().uuid(),
  month: z.string(),
  year: z.string(),
  grossEarnings: z.string(),
  grossDeductions: z.string(),
  netPay: z.string(),
  pfEe: z.string(),
  pfEr: z.string(),
  esiEe: z.string(),
  esiEr: z.string(),
  tdsDeducted: z.string(),
  professionalTax: z.string(),
  advanceDeduction: z.string().optional(),
  arrears: z.string().optional(),
});

export type PayrollProcessedPayload = z.infer<typeof PayrollProcessedPayloadSchema>;

export const PayrollFinalizedPayloadSchema = z.object({
  payrollRunId: z.string().uuid(),
  journalEntryId: z.string().uuid(),
  finalizedAt: z.date(),
});

export type PayrollFinalizedPayload = z.infer<typeof PayrollFinalizedPayloadSchema>;

export const PayrollVoidedPayloadSchema = z.object({
  payrollRunId: z.string().uuid(),
  reversalJournalEntryId: z.string().uuid().optional(),
  voidedAt: z.date(),
  reason: z.string(),
});

export type PayrollVoidedPayload = z.infer<typeof PayrollVoidedPayloadSchema>;

export const PayslipGeneratedPayloadSchema = z.object({
  payrollRunId: z.string().uuid(),
  payslipId: z.string().uuid(),
  pdfUrl: z.string(),
});

export type PayslipGeneratedPayload = z.infer<typeof PayslipGeneratedPayloadSchema>;

export const AdvanceGivenPayloadSchema = z.object({
  advanceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  totalAmount: z.string(),
  monthlyDeduction: z.string(),
  installments: z.number(),
  advanceDate: z.string(),
});

export type AdvanceGivenPayload = z.infer<typeof AdvanceGivenPayloadSchema>;

export const AdvanceRecoveredPayloadSchema = z.object({
  advanceId: z.string().uuid(),
  employeeId: z.string().uuid(),
  deductedAmount: z.string(),
  remainingBalance: z.string(),
  installmentNumber: z.number(),
});

export type AdvanceRecoveredPayload = z.infer<typeof AdvanceRecoveredPayloadSchema>;
