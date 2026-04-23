"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITRConfigUpdatedPayloadSchema = exports.PresumptiveRateConfigSchema = exports.ITRConfigSchema = exports.DeductionConfigSchema = exports.UpdateITRConfigInputSchema = exports.TDSDeductionSection = void 0;
const zod_1 = require("zod");
const itr_returns_1 = require("./itr-returns");
// ============================================================================
// Enums
// ============================================================================
var TDSDeductionSection;
(function (TDSDeductionSection) {
    TDSDeductionSection["SECTION_194A"] = "194A";
    TDSDeductionSection["SECTION_194C"] = "194C";
    TDSDeductionSection["SECTION_194H"] = "194H";
    TDSDeductionSection["SECTION_194J"] = "194J";
    TDSDeductionSection["SECTION_194Q"] = "194Q";
    TDSDeductionSection["SECTION_194R"] = "194R";
    TDSDeductionSection["NONE"] = "none";
})(TDSDeductionSection || (exports.TDSDeductionSection = TDSDeductionSection = {}));
// ============================================================================
// Input Schemas
// ============================================================================
exports.UpdateITRConfigInputSchema = zod_1.z.object({
    taxRegime: zod_1.z.nativeEnum(itr_returns_1.TaxRegime),
    presumptiveScheme: zod_1.z.nativeEnum(itr_returns_1.PresumptiveScheme).optional(),
    presumptiveRate: zod_1.z.string().optional(),
    eligibleDeductions: zod_1.z.record(zod_1.z.unknown()).optional(),
    tdsApplicable: zod_1.z.boolean().optional(),
    advanceTaxApplicable: zod_1.z.boolean().optional(),
    regimeOptOutDate: zod_1.z.string().optional(),
    regimeLockinUntil: zod_1.z.string().optional(),
});
// ============================================================================
// Output Types
// ============================================================================
exports.DeductionConfigSchema = zod_1.z.object({
    section80C: zod_1.z.boolean().default(false),
    section80D: zod_1.z.boolean().default(false),
    section80E: zod_1.z.boolean().default(false),
    section80G: zod_1.z.boolean().default(false),
    section80TTA: zod_1.z.boolean().default(false),
    section80TTB: zod_1.z.boolean().default(false),
    section80CCD: zod_1.z.boolean().default(false),
    other: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.ITRConfigSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    taxRegime: zod_1.z.nativeEnum(itr_returns_1.TaxRegime),
    presumptiveScheme: zod_1.z.nativeEnum(itr_returns_1.PresumptiveScheme),
    presumptiveRate: zod_1.z.string(),
    eligibleDeductions: zod_1.z.record(zod_1.z.unknown()),
    tdsApplicable: zod_1.z.string(),
    advanceTaxApplicable: zod_1.z.string(),
    regimeOptOutDate: zod_1.z.string().nullable(),
    regimeLockinUntil: zod_1.z.string().nullable(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// ============================================================================
// Helper Types
// ============================================================================
exports.PresumptiveRateConfigSchema = zod_1.z.object({
    scheme: zod_1.z.nativeEnum(itr_returns_1.PresumptiveScheme),
    rate: zod_1.z.string(),
    applicableFrom: zod_1.z.string(),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.ITRConfigUpdatedPayloadSchema = zod_1.z.object({
    configId: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    taxRegime: zod_1.z.nativeEnum(itr_returns_1.TaxRegime),
    presumptiveScheme: zod_1.z.nativeEnum(itr_returns_1.PresumptiveScheme),
    updatedAt: zod_1.z.date(),
});
//# sourceMappingURL=itr-config.js.map