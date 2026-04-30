import { z } from "zod";
export declare const CreateJournalEntryInputSchema: z.ZodEffects<z.ZodObject<{
    date: z.ZodString;
    narration: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    referenceType: z.ZodDefault<z.ZodEnum<["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]>>;
    referenceId: z.ZodOptional<z.ZodString>;
    lines: z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        debit: z.ZodDefault<z.ZodString>;
        credit: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    referenceId?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
}, {
    date?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    referenceId?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
}>, {
    date?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    referenceId?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
}, {
    date?: string;
    narration?: string;
    referenceType?: "inventory" | "payroll" | "manual" | "opening_balance" | "invoice" | "payment" | "receipt" | "journal";
    referenceId?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
}>;
export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInputSchema>;
export declare const PostJournalEntryInputSchema: z.ZodObject<{
    entryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entryId?: string;
}, {
    entryId?: string;
}>;
export type PostJournalEntryInput = z.infer<typeof PostJournalEntryInputSchema>;
export declare const VoidJournalEntryInputSchema: z.ZodObject<{
    entryId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    entryId?: string;
}, {
    reason?: string;
    entryId?: string;
}>;
export type VoidJournalEntryInput = z.infer<typeof VoidJournalEntryInputSchema>;
export declare const ModifyJournalEntryInputSchema: z.ZodEffects<z.ZodObject<{
    entryId: z.ZodString;
    narration: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>>;
    date: z.ZodOptional<z.ZodString>;
    lines: z.ZodOptional<z.ZodArray<z.ZodObject<{
        accountId: z.ZodString;
        debit: z.ZodDefault<z.ZodString>;
        credit: z.ZodDefault<z.ZodString>;
        description: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    }, "strip", z.ZodTypeAny, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }, {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    date?: string;
    narration?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}, {
    date?: string;
    narration?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}>, {
    date?: string;
    narration?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}, {
    date?: string;
    narration?: string;
    lines?: {
        description?: string;
        accountId?: string;
        debit?: string;
        credit?: string;
    }[];
    entryId?: string;
}>;
export type ModifyJournalEntryInput = z.infer<typeof ModifyJournalEntryInputSchema>;
export declare const CreateAccountInputSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    kind: z.ZodEnum<["Asset", "Liability", "Equity", "Revenue", "Expense"]>;
    subType: z.ZodEnum<["CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory", "CurrentLiability", "LongTermLiability", "Capital", "Drawing", "Reserves", "OperatingRevenue", "OtherRevenue", "DirectExpense", "IndirectExpense"]>;
    parentId: z.ZodOptional<z.ZodString>;
    reconciliationAccount: z.ZodDefault<z.ZodEnum<["bank", "none"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodEnum<["trade_receivable", "trade_payable", "gst", "tds", "tds_payable", "finance_cost", "depreciation", "tax", "employee_benefits", "manufacturing", "inventory_adjustment", "trading", "returns", "opening_balance"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    code?: string;
    kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    subType?: "CurrentAsset" | "FixedAsset" | "Bank" | "Cash" | "Inventory" | "CurrentLiability" | "LongTermLiability" | "Capital" | "Drawing" | "Reserves" | "OperatingRevenue" | "OtherRevenue" | "DirectExpense" | "IndirectExpense";
    parentId?: string;
    reconciliationAccount?: "none" | "bank";
    tags?: ("manufacturing" | "gst" | "trade_receivable" | "trade_payable" | "tds" | "tds_payable" | "finance_cost" | "depreciation" | "tax" | "employee_benefits" | "inventory_adjustment" | "trading" | "returns" | "opening_balance")[];
}, {
    name?: string;
    code?: string;
    kind?: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
    subType?: "CurrentAsset" | "FixedAsset" | "Bank" | "Cash" | "Inventory" | "CurrentLiability" | "LongTermLiability" | "Capital" | "Drawing" | "Reserves" | "OperatingRevenue" | "OtherRevenue" | "DirectExpense" | "IndirectExpense";
    parentId?: string;
    reconciliationAccount?: "none" | "bank";
    tags?: ("manufacturing" | "gst" | "trade_receivable" | "trade_payable" | "tds" | "tds_payable" | "finance_cost" | "depreciation" | "tax" | "employee_benefits" | "inventory_adjustment" | "trading" | "returns" | "opening_balance")[];
}>;
export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;
//# sourceMappingURL=commands.d.ts.map