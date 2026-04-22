import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export enum SnapshotType {
  TRIAL_BALANCE = "trial_balance",
  GST_DATA = "gst_data",
  INCOME_COMPUTATION = "income_computation",
  FULL_RETURN = "full_return",
}

// ============================================================================
// Input Schemas
// ============================================================================

export const GenerateSnapshotInputSchema = z.object({
  financialYear: z.string().regex(/^\d{4}-\d{2}$/),
  snapshotType: z.nativeEnum(SnapshotType),
  returnId: z.string().uuid().optional(),
});

export type GenerateSnapshotInput = z.infer<typeof GenerateSnapshotInputSchema>;

// ============================================================================
// Output Types
// ============================================================================

export const TrialBalanceSnapshotSchema = z.object({
  asOfDate: z.string(),
  accounts: z.array(z.object({
    accountId: z.string().uuid(),
    accountName: z.string(),
    accountCode: z.string(),
    debitBalance: z.string(),
    creditBalance: z.string(),
  })),
  totalDebits: z.string(),
  totalCredits: z.string(),
});

export type TrialBalanceSnapshot = z.infer<typeof TrialBalanceSnapshotSchema>;

export const GSTDataSnapshotSchema = z.object({
  periodMonth: z.number(),
  periodYear: z.number(),
  outwardSupplies: z.object({
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
  inwardSupplies: z.object({
    taxableValue: z.string(),
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
  itcAvailable: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
  itcUtilized: z.object({
    igst: z.string(),
    cgst: z.string(),
    sgst: z.string(),
    cess: z.string(),
  }),
});

export type GSTDataSnapshot = z.infer<typeof GSTDataSnapshotSchema>;

export const IncomeComputationSnapshotSchema = z.object({
  financialYear: z.string(),
  incomeByHead: z.record(z.string()),
  deductions: z.record(z.string()),
  totalIncome: z.string(),
  taxComputed: z.string(),
  computedAt: z.string(),
});

export type IncomeComputationSnapshot = z.infer<typeof IncomeComputationSnapshotSchema>;

export const ITRSnapshotSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  returnId: z.string().uuid().nullable(),
  financialYear: z.string(),
  snapshotType: z.nativeEnum(SnapshotType),
  snapshotData: z.record(z.unknown()),
  generatedAt: z.date(),
});

export type ITRSnapshot = z.infer<typeof ITRSnapshotSchema>;

// ============================================================================
// Summary Types
// ============================================================================

export const SnapshotSummarySchema = z.object({
  snapshotId: z.string().uuid(),
  snapshotType: z.nativeEnum(SnapshotType),
  financialYear: z.string(),
  generatedAt: z.date(),
  keyMetrics: z.record(z.string()),
});

export type SnapshotSummary = z.infer<typeof SnapshotSummarySchema>;

// ============================================================================
// Event Payloads
// ============================================================================

export const SnapshotGeneratedPayloadSchema = z.object({
  snapshotId: z.string().uuid(),
  tenantId: z.string().uuid(),
  financialYear: z.string(),
  snapshotType: z.nativeEnum(SnapshotType),
  returnId: z.string().uuid().nullable(),
  generatedAt: z.date(),
});

export type SnapshotGeneratedPayload = z.infer<typeof SnapshotGeneratedPayloadSchema>;
