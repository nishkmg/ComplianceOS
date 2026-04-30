import { z } from "zod";
import { TaxRegime, PresumptiveScheme } from "./itr-returns";
export declare enum TDSDeductionSection {
    SECTION_194A = "194A",
    SECTION_194C = "194C",
    SECTION_194H = "194H",
    SECTION_194J = "194J",
    SECTION_194Q = "194Q",
    SECTION_194R = "194R",
    NONE = "none"
}
export declare const UpdateITRConfigInputSchema: z.ZodObject<{
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    presumptiveScheme: z.ZodOptional<z.ZodNativeEnum<typeof PresumptiveScheme>>;
    presumptiveRate: z.ZodOptional<z.ZodString>;
    eligibleDeductions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tdsApplicable: z.ZodOptional<z.ZodBoolean>;
    advanceTaxApplicable: z.ZodOptional<z.ZodBoolean>;
    regimeOptOutDate: z.ZodOptional<z.ZodString>;
    regimeLockinUntil: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    presumptiveRate?: string;
    eligibleDeductions?: Record<string, unknown>;
    tdsApplicable?: boolean;
    advanceTaxApplicable?: boolean;
    regimeOptOutDate?: string;
    regimeLockinUntil?: string;
}, {
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    presumptiveRate?: string;
    eligibleDeductions?: Record<string, unknown>;
    tdsApplicable?: boolean;
    advanceTaxApplicable?: boolean;
    regimeOptOutDate?: string;
    regimeLockinUntil?: string;
}>;
export type UpdateITRConfigInput = z.infer<typeof UpdateITRConfigInputSchema>;
export declare const DeductionConfigSchema: z.ZodObject<{
    section80C: z.ZodDefault<z.ZodBoolean>;
    section80D: z.ZodDefault<z.ZodBoolean>;
    section80E: z.ZodDefault<z.ZodBoolean>;
    section80G: z.ZodDefault<z.ZodBoolean>;
    section80TTA: z.ZodDefault<z.ZodBoolean>;
    section80TTB: z.ZodDefault<z.ZodBoolean>;
    section80CCD: z.ZodDefault<z.ZodBoolean>;
    other: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    other?: string[];
    section80C?: boolean;
    section80D?: boolean;
    section80E?: boolean;
    section80G?: boolean;
    section80TTA?: boolean;
    section80TTB?: boolean;
    section80CCD?: boolean;
}, {
    other?: string[];
    section80C?: boolean;
    section80D?: boolean;
    section80E?: boolean;
    section80G?: boolean;
    section80TTA?: boolean;
    section80TTB?: boolean;
    section80CCD?: boolean;
}>;
export type DeductionConfig = z.infer<typeof DeductionConfigSchema>;
export declare const ITRConfigSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    presumptiveScheme: z.ZodNativeEnum<typeof PresumptiveScheme>;
    presumptiveRate: z.ZodString;
    eligibleDeductions: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    tdsApplicable: z.ZodString;
    advanceTaxApplicable: z.ZodString;
    regimeOptOutDate: z.ZodNullable<z.ZodString>;
    regimeLockinUntil: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    presumptiveRate?: string;
    eligibleDeductions?: Record<string, unknown>;
    tdsApplicable?: string;
    advanceTaxApplicable?: string;
    regimeOptOutDate?: string;
    regimeLockinUntil?: string;
}, {
    tenantId?: string;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    presumptiveRate?: string;
    eligibleDeductions?: Record<string, unknown>;
    tdsApplicable?: string;
    advanceTaxApplicable?: string;
    regimeOptOutDate?: string;
    regimeLockinUntil?: string;
}>;
export type ITRConfig = z.infer<typeof ITRConfigSchema>;
export declare const PresumptiveRateConfigSchema: z.ZodObject<{
    scheme: z.ZodNativeEnum<typeof PresumptiveScheme>;
    rate: z.ZodString;
    applicableFrom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rate?: string;
    scheme?: PresumptiveScheme;
    applicableFrom?: string;
}, {
    rate?: string;
    scheme?: PresumptiveScheme;
    applicableFrom?: string;
}>;
export type PresumptiveRateConfig = z.infer<typeof PresumptiveRateConfigSchema>;
export declare const ITRConfigUpdatedPayloadSchema: z.ZodObject<{
    configId: z.ZodString;
    tenantId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    presumptiveScheme: z.ZodNativeEnum<typeof PresumptiveScheme>;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId?: string;
    updatedAt?: Date;
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    configId?: string;
}, {
    tenantId?: string;
    updatedAt?: Date;
    taxRegime?: TaxRegime;
    presumptiveScheme?: PresumptiveScheme;
    configId?: string;
}>;
export type ITRConfigUpdatedPayload = z.infer<typeof ITRConfigUpdatedPayloadSchema>;
//# sourceMappingURL=itr-config.d.ts.map