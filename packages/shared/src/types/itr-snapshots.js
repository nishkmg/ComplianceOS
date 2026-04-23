"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotGeneratedPayloadSchema = exports.SnapshotSummarySchema = exports.ITRSnapshotSchema = exports.IncomeComputationSnapshotSchema = exports.GSTDataSnapshotSchema = exports.TrialBalanceSnapshotSchema = exports.GenerateSnapshotInputSchema = exports.SnapshotType = void 0;
const zod_1 = require("zod");
// ============================================================================
// Enums
// ============================================================================
var SnapshotType;
(function (SnapshotType) {
    SnapshotType["TRIAL_BALANCE"] = "trial_balance";
    SnapshotType["GST_DATA"] = "gst_data";
    SnapshotType["INCOME_COMPUTATION"] = "income_computation";
    SnapshotType["FULL_RETURN"] = "full_return";
})(SnapshotType || (exports.SnapshotType = SnapshotType = {}));
// ============================================================================
// Input Schemas
// ============================================================================
exports.GenerateSnapshotInputSchema = zod_1.z.object({
    financialYear: zod_1.z.string().regex(/^\d{4}-\d{2}$/),
    snapshotType: zod_1.z.nativeEnum(SnapshotType),
    returnId: zod_1.z.string().uuid().optional(),
});
// ============================================================================
// Output Types
// ============================================================================
exports.TrialBalanceSnapshotSchema = zod_1.z.object({
    asOfDate: zod_1.z.string(),
    accounts: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().uuid(),
        accountName: zod_1.z.string(),
        accountCode: zod_1.z.string(),
        debitBalance: zod_1.z.string(),
        creditBalance: zod_1.z.string(),
    })),
    totalDebits: zod_1.z.string(),
    totalCredits: zod_1.z.string(),
});
exports.GSTDataSnapshotSchema = zod_1.z.object({
    periodMonth: zod_1.z.number(),
    periodYear: zod_1.z.number(),
    outwardSupplies: zod_1.z.object({
        taxableValue: zod_1.z.string(),
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    inwardSupplies: zod_1.z.object({
        taxableValue: zod_1.z.string(),
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    itcAvailable: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
    itcUtilized: zod_1.z.object({
        igst: zod_1.z.string(),
        cgst: zod_1.z.string(),
        sgst: zod_1.z.string(),
        cess: zod_1.z.string(),
    }),
});
exports.IncomeComputationSnapshotSchema = zod_1.z.object({
    financialYear: zod_1.z.string(),
    incomeByHead: zod_1.z.record(zod_1.z.string()),
    deductions: zod_1.z.record(zod_1.z.string()),
    totalIncome: zod_1.z.string(),
    taxComputed: zod_1.z.string(),
    computedAt: zod_1.z.string(),
});
exports.ITRSnapshotSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    returnId: zod_1.z.string().uuid().nullable(),
    financialYear: zod_1.z.string(),
    snapshotType: zod_1.z.nativeEnum(SnapshotType),
    snapshotData: zod_1.z.record(zod_1.z.unknown()),
    generatedAt: zod_1.z.date(),
});
// ============================================================================
// Summary Types
// ============================================================================
exports.SnapshotSummarySchema = zod_1.z.object({
    snapshotId: zod_1.z.string().uuid(),
    snapshotType: zod_1.z.nativeEnum(SnapshotType),
    financialYear: zod_1.z.string(),
    generatedAt: zod_1.z.date(),
    keyMetrics: zod_1.z.record(zod_1.z.string()),
});
// ============================================================================
// Event Payloads
// ============================================================================
exports.SnapshotGeneratedPayloadSchema = zod_1.z.object({
    snapshotId: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    financialYear: zod_1.z.string(),
    snapshotType: zod_1.z.nativeEnum(SnapshotType),
    returnId: zod_1.z.string().uuid().nullable(),
    generatedAt: zod_1.z.date(),
});
//# sourceMappingURL=itr-snapshots.js.map