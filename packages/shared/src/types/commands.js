"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountInputSchema = exports.ModifyJournalEntryInputSchema = exports.VoidJournalEntryInputSchema = exports.PostJournalEntryInputSchema = exports.CreateJournalEntryInputSchema = void 0;
const zod_1 = require("zod");
exports.CreateJournalEntryInputSchema = zod_1.z.object({
    date: zod_1.z.string().date(),
    narration: zod_1.z.string().min(1),
    referenceType: zod_1.z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]).default("manual"),
    referenceId: zod_1.z.string().uuid().optional(),
    lines: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().uuid(),
        debit: zod_1.z.string().default("0"),
        credit: zod_1.z.string().default("0"),
        description: zod_1.z.string().optional(),
    })).min(2),
}).refine((data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
}, { message: "Total debits must equal total credits" });
exports.PostJournalEntryInputSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
});
exports.VoidJournalEntryInputSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
    reason: zod_1.z.string().min(1),
});
exports.ModifyJournalEntryInputSchema = zod_1.z.object({
    entryId: zod_1.z.string().uuid(),
    narration: zod_1.z.string().min(1).optional(),
    date: zod_1.z.string().date().optional(),
    lines: zod_1.z.array(zod_1.z.object({
        accountId: zod_1.z.string().uuid(),
        debit: zod_1.z.string().default("0"),
        credit: zod_1.z.string().default("0"),
        description: zod_1.z.string().optional(),
    })).min(2).optional(),
}).refine((data) => {
    if (!data.lines)
        return true;
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
}, { message: "Total debits must equal total credits" });
exports.CreateAccountInputSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    kind: zod_1.z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
    subType: zod_1.z.enum([
        "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
        "CurrentLiability", "LongTermLiability",
        "Capital", "Drawing", "Reserves",
        "OperatingRevenue", "OtherRevenue",
        "DirectExpense", "IndirectExpense",
    ]),
    parentId: zod_1.z.string().uuid().optional(),
    reconciliationAccount: zod_1.z.enum(["bank", "none"]).default("none"),
    tags: zod_1.z.array(zod_1.z.enum([
        "trade_receivable", "trade_payable", "gst", "tds", "tds_payable",
        "finance_cost", "depreciation", "tax", "employee_benefits", "manufacturing",
        "inventory_adjustment", "trading", "returns", "opening_balance",
    ])).optional(),
});
//# sourceMappingURL=commands.js.map