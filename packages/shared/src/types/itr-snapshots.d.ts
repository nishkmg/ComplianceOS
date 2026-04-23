import { z } from "zod";
export declare enum SnapshotType {
    TRIAL_BALANCE = "trial_balance",
    GST_DATA = "gst_data",
    INCOME_COMPUTATION = "income_computation",
    FULL_RETURN = "full_return"
}
export declare const GenerateSnapshotInputSchema: z.ZodObject<{
    financialYear: z.ZodString;
    snapshotType: z.ZodNativeEnum<typeof SnapshotType>;
    returnId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    financialYear: string;
    snapshotType: SnapshotType;
    returnId?: string | undefined;
}, {
    financialYear: string;
    snapshotType: SnapshotType;
    returnId?: string | undefined;
}>;
export type GenerateSnapshotInput = z.infer<typeof GenerateSnapshotInputSchema>;
export declare const TrialBalanceSnapshotSchema: z.ZodObject<{
    asOfDate: z.ZodString;
    accounts: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        accountName: z.ZodString;
        accountCode: z.ZodString;
        debitBalance: z.ZodString;
        creditBalance: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        accountId: string;
        accountCode: string;
        accountName: string;
        debitBalance: string;
        creditBalance: string;
    }, {
        accountId: string;
        accountCode: string;
        accountName: string;
        debitBalance: string;
        creditBalance: string;
    }>, "many">;
    totalDebits: z.ZodString;
    totalCredits: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accounts: {
        accountId: string;
        accountCode: string;
        accountName: string;
        debitBalance: string;
        creditBalance: string;
    }[];
    asOfDate: string;
    totalDebits: string;
    totalCredits: string;
}, {
    accounts: {
        accountId: string;
        accountCode: string;
        accountName: string;
        debitBalance: string;
        creditBalance: string;
    }[];
    asOfDate: string;
    totalDebits: string;
    totalCredits: string;
}>;
export type TrialBalanceSnapshot = z.infer<typeof TrialBalanceSnapshotSchema>;
export declare const GSTDataSnapshotSchema: z.ZodObject<{
    periodMonth: z.ZodNumber;
    periodYear: z.ZodNumber;
    outwardSupplies: z.ZodObject<{
        taxableValue: z.ZodString;
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
    inwardSupplies: z.ZodObject<{
        taxableValue: z.ZodString;
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
    itcAvailable: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
    itcUtilized: z.ZodObject<{
        igst: z.ZodString;
        cgst: z.ZodString;
        sgst: z.ZodString;
        cess: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }, {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    }>;
}, "strip", z.ZodTypeAny, {
    periodMonth: number;
    periodYear: number;
    outwardSupplies: {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    inwardSupplies: {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcAvailable: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcUtilized: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}, {
    periodMonth: number;
    periodYear: number;
    outwardSupplies: {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    inwardSupplies: {
        taxableValue: string;
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcAvailable: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
    itcUtilized: {
        igst: string;
        cgst: string;
        sgst: string;
        cess: string;
    };
}>;
export type GSTDataSnapshot = z.infer<typeof GSTDataSnapshotSchema>;
export declare const IncomeComputationSnapshotSchema: z.ZodObject<{
    financialYear: z.ZodString;
    incomeByHead: z.ZodRecord<z.ZodString, z.ZodString>;
    deductions: z.ZodRecord<z.ZodString, z.ZodString>;
    totalIncome: z.ZodString;
    taxComputed: z.ZodString;
    computedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    financialYear: string;
    deductions: Record<string, string>;
    totalIncome: string;
    incomeByHead: Record<string, string>;
    computedAt: string;
    taxComputed: string;
}, {
    financialYear: string;
    deductions: Record<string, string>;
    totalIncome: string;
    incomeByHead: Record<string, string>;
    computedAt: string;
    taxComputed: string;
}>;
export type IncomeComputationSnapshot = z.infer<typeof IncomeComputationSnapshotSchema>;
export declare const ITRSnapshotSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    returnId: z.ZodNullable<z.ZodString>;
    financialYear: z.ZodString;
    snapshotType: z.ZodNativeEnum<typeof SnapshotType>;
    snapshotData: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    id: string;
    financialYear: string;
    returnId: string | null;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotData: Record<string, unknown>;
}, {
    tenantId: string;
    id: string;
    financialYear: string;
    returnId: string | null;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotData: Record<string, unknown>;
}>;
export type ITRSnapshot = z.infer<typeof ITRSnapshotSchema>;
export declare const SnapshotSummarySchema: z.ZodObject<{
    snapshotId: z.ZodString;
    snapshotType: z.ZodNativeEnum<typeof SnapshotType>;
    financialYear: z.ZodString;
    generatedAt: z.ZodDate;
    keyMetrics: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    financialYear: string;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotId: string;
    keyMetrics: Record<string, string>;
}, {
    financialYear: string;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotId: string;
    keyMetrics: Record<string, string>;
}>;
export type SnapshotSummary = z.infer<typeof SnapshotSummarySchema>;
export declare const SnapshotGeneratedPayloadSchema: z.ZodObject<{
    snapshotId: z.ZodString;
    tenantId: z.ZodString;
    financialYear: z.ZodString;
    snapshotType: z.ZodNativeEnum<typeof SnapshotType>;
    returnId: z.ZodNullable<z.ZodString>;
    generatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    financialYear: string;
    returnId: string | null;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotId: string;
}, {
    tenantId: string;
    financialYear: string;
    returnId: string | null;
    generatedAt: Date;
    snapshotType: SnapshotType;
    snapshotId: string;
}>;
export type SnapshotGeneratedPayload = z.infer<typeof SnapshotGeneratedPayloadSchema>;
//# sourceMappingURL=itr-snapshots.d.ts.map