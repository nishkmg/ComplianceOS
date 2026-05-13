import { z } from "zod";
import { narration, amountString, description } from "../validation/helpers";

export const CreateJournalEntryInputSchema = z.object({
  date: z.string().date(),
  narration: narration(),
  referenceType: z.enum(["invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual"]).default("manual"),
  referenceId: z.string().uuid().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: amountString(),
    credit: amountString(),
    description: description(),
  })).min(2),
}).refine(
  (data) => {
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total debits must equal total credits" },
);

export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInputSchema>;

export const PostJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
});

export type PostJournalEntryInput = z.infer<typeof PostJournalEntryInputSchema>;

export const VoidJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
});

export type VoidJournalEntryInput = z.infer<typeof VoidJournalEntryInputSchema>;

export const ModifyJournalEntryInputSchema = z.object({
  entryId: z.string().uuid(),
  narration: narration().optional(),
  date: z.string().date().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: amountString(),
    credit: amountString(),
    description: description(),
  })).min(2).optional(),
}).refine(
  (data) => {
    if (!data.lines) return true;
    const totalDebit = data.lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);
    return Math.abs(totalDebit - totalCredit) < 0.01;
  },
  { message: "Total debits must equal total credits" },
);

export type ModifyJournalEntryInput = z.infer<typeof ModifyJournalEntryInputSchema>;

export const CreateAccountInputSchema = z.object({
  code: z.string().min(1).max(20, "Account code must be at most 20 characters"),
  name: z.string().min(1).max(200, "Account name must be at most 200 characters"),
  kind: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  subType: z.enum([
    "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
    "CurrentLiability", "LongTermLiability",
    "Capital", "Drawing", "Reserves",
    "OperatingRevenue", "OtherRevenue",
    "DirectExpense", "IndirectExpense",
  ]),
  parentId: z.string().uuid().optional(),
  reconciliationAccount: z.enum(["bank", "none"]).default("none"),
  tags: z.array(z.enum([
    "trade_receivable", "trade_payable", "gst", "tds", "tds_payable",
    "finance_cost", "depreciation", "tax", "employee_benefits", "manufacturing",
    "inventory_adjustment", "trading", "returns", "opening_balance",
  ])).optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountInputSchema>;