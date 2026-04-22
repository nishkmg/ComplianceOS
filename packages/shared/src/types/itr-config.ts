import { z } from "zod";
import { TaxRegime, PresumptiveScheme } from "./itr-returns";

// ============================================================================
// Enums
// ============================================================================

export enum TDSDeductionSection {
  SECTION_194A = "194A",
  SECTION_194C = "194C",
  SECTION_194H = "194H",
  SECTION_194J = "194J",
  SECTION_194Q = "194Q",
  SECTION_194R = "194R",
  NONE = "none",
}

// ============================================================================
// Input Schemas
// ============================================================================

export const UpdateITRConfigInputSchema = z.object({
  taxRegime: z.nativeEnum(TaxRegime),
  presumptiveScheme: z.nativeEnum(PresumptiveScheme).optional(),
  presumptiveRate: z.string().optional(),
  eligibleDeductions: z.record(z.unknown()).optional(),
  tdsApplicable: z.boolean().optional(),
  advanceTaxApplicable: z.boolean().optional(),
  regimeOptOutDate: z.string().optional(),
  regimeLockinUntil: z.string().optional(),
});

export type UpdateITRConfigInput = z.infer<typeof UpdateITRConfigInputSchema>;

// ============================================================================
// Output Types
// ============================================================================

export const DeductionConfigSchema = z.object({
  section80C: z.boolean().default(false),
  section80D: z.boolean().default(false),
  section80E: z.boolean().default(false),
  section80G: z.boolean().default(false),
  section80TTA: z.boolean().default(false),
  section80TTB: z.boolean().default(false),
  section80CCD: z.boolean().default(false),
  other: z.array(z.string()).default([]),
});

export type DeductionConfig = z.infer<typeof DeductionConfigSchema>;

export const ITRConfigSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  taxRegime: z.nativeEnum(TaxRegime),
  presumptiveScheme: z.nativeEnum(PresumptiveScheme),
  presumptiveRate: z.string(),
  eligibleDeductions: z.record(z.unknown()),
  tdsApplicable: z.string(),
  advanceTaxApplicable: z.string(),
  regimeOptOutDate: z.string().nullable(),
  regimeLockinUntil: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ITRConfig = z.infer<typeof ITRConfigSchema>;

// ============================================================================
// Helper Types
// ============================================================================

export const PresumptiveRateConfigSchema = z.object({
  scheme: z.nativeEnum(PresumptiveScheme),
  rate: z.string(),
  applicableFrom: z.string(),
});

export type PresumptiveRateConfig = z.infer<typeof PresumptiveRateConfigSchema>;

// ============================================================================
// Event Payloads
// ============================================================================

export const ITRConfigUpdatedPayloadSchema = z.object({
  configId: z.string().uuid(),
  tenantId: z.string().uuid(),
  taxRegime: z.nativeEnum(TaxRegime),
  presumptiveScheme: z.nativeEnum(PresumptiveScheme),
  updatedAt: z.date(),
});

export type ITRConfigUpdatedPayload = z.infer<typeof ITRConfigUpdatedPayloadSchema>;
