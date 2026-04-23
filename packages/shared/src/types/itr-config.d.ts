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
    taxRegime: TaxRegime;
    tdsApplicable?: boolean | undefined;
    presumptiveScheme?: PresumptiveScheme | undefined;
    presumptiveRate?: string | undefined;
    eligibleDeductions?: Record<string, unknown> | undefined;
    advanceTaxApplicable?: boolean | undefined;
    regimeOptOutDate?: string | undefined;
    regimeLockinUntil?: string | undefined;
}, {
    taxRegime: TaxRegime;
    tdsApplicable?: boolean | undefined;
    presumptiveScheme?: PresumptiveScheme | undefined;
    presumptiveRate?: string | undefined;
    eligibleDeductions?: Record<string, unknown> | undefined;
    advanceTaxApplicable?: boolean | undefined;
    regimeOptOutDate?: string | undefined;
    regimeLockinUntil?: string | undefined;
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
    other: string[];
    section80C: boolean;
    section80D: boolean;
    section80E: boolean;
    section80G: boolean;
    section80TTA: boolean;
    section80TTB: boolean;
    section80CCD: boolean;
}, {
    other?: string[] | undefined;
    section80C?: boolean | undefined;
    section80D?: boolean | undefined;
    section80E?: boolean | undefined;
    section80G?: boolean | undefined;
    section80TTA?: boolean | undefined;
    section80TTB?: boolean | undefined;
    section80CCD?: boolean | undefined;
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
    tenantId: string;
    tdsApplicable: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    taxRegime: TaxRegime;
    presumptiveScheme: PresumptiveScheme;
    presumptiveRate: string;
    eligibleDeductions: Record<string, unknown>;
    advanceTaxApplicable: string;
    regimeOptOutDate: string | null;
    regimeLockinUntil: string | null;
}, {
    tenantId: string;
    tdsApplicable: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    taxRegime: TaxRegime;
    presumptiveScheme: PresumptiveScheme;
    presumptiveRate: string;
    eligibleDeductions: Record<string, unknown>;
    advanceTaxApplicable: string;
    regimeOptOutDate: string | null;
    regimeLockinUntil: string | null;
}>;
export type ITRConfig = z.infer<typeof ITRConfigSchema>;
export declare const PresumptiveRateConfigSchema: z.ZodObject<{
    scheme: z.ZodNativeEnum<typeof PresumptiveScheme>;
    rate: z.ZodString;
    applicableFrom: z.ZodString;
}, "strip", z.ZodTypeAny, {
    scheme: PresumptiveScheme;
    rate: string;
    applicableFrom: string;
}, {
    scheme: PresumptiveScheme;
    rate: string;
    applicableFrom: string;
}>;
export type PresumptiveRateConfig = z.infer<typeof PresumptiveRateConfigSchema>;
export declare const ITRConfigUpdatedPayloadSchema: z.ZodObject<{
    configId: z.ZodString;
    tenantId: z.ZodString;
    taxRegime: z.ZodNativeEnum<typeof TaxRegime>;
    presumptiveScheme: z.ZodNativeEnum<typeof PresumptiveScheme>;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    updatedAt: Date;
    taxRegime: TaxRegime;
    presumptiveScheme: PresumptiveScheme;
    configId: string;
}, {
    tenantId: string;
    updatedAt: Date;
    taxRegime: TaxRegime;
    presumptiveScheme: PresumptiveScheme;
    configId: string;
}>;
export type ITRConfigUpdatedPayload = z.infer<typeof ITRConfigUpdatedPayloadSchema>;
//# sourceMappingURL=itr-config.d.ts.map