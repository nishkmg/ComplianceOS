import { z } from "zod";

// ── Shared ────────────────────────────────────────────────
export const UuidParam = z.object({ id: z.string().uuid() });
export const PaginationInput = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(20),
});

// ── Auth ──────────────────────────────────────────────────
export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const LoginOutput = z.object({
  token: z.string(),
  user: z.object({ id: z.string(), email: z.string() }),
});
export type LoginOutput = z.infer<typeof LoginOutput>;

// ── Accounts ──────────────────────────────────────────────
export const AccountTypeEnum = z.enum([
  "Asset", "Liability", "Equity", "Revenue", "Expense",
]);
export type AccountType = z.infer<typeof AccountTypeEnum>;

export const AccountInput = z.object({
  name: z.string().min(1),
  kind: AccountTypeEnum,
  parentId: z.string().uuid().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
});
export type AccountInput = z.infer<typeof AccountInput>;

export const ModifyAccountInput = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  parentId: z.string().uuid().optional(),
});
export type ModifyAccountInput = z.infer<typeof ModifyAccountInput>;

// ── Journal Entries ───────────────────────────────────────
export const JournalEntryLineInput = z.object({
  accountId: z.string().uuid(),
  debit: z.string().default("0"),
  credit: z.string().default("0"),
  description: z.string().optional(),
});
export type JournalEntryLineInput = z.infer<typeof JournalEntryLineInput>;

export const JournalEntryListInput = z.object({
  status: z.enum(["draft", "posted", "voided"]).optional(),
  fiscalYear: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});
export type JournalEntryListInput = z.infer<typeof JournalEntryListInput>;

export const CreateJournalEntryInput = z.object({
  date: z.string(),
  narration: z.string(),
  referenceType: z.string().default("manual"),
  referenceId: z.string().uuid().optional(),
  fiscalYear: z.string(),
  lines: z.array(JournalEntryLineInput),
});
export type CreateJournalEntryInput = z.infer<typeof CreateJournalEntryInput>;

export const ModifyJournalEntryInput = z.object({
  id: z.string().uuid(),
  narration: z.string().optional(),
  date: z.string().optional(),
  lines: z.array(JournalEntryLineInput).optional(),
});
export type ModifyJournalEntryInput = z.infer<typeof ModifyJournalEntryInput>;

export const VoidJournalEntryInput = z.object({
  id: z.string().uuid(),
  reason: z.string(),
});
export type VoidJournalEntryInput = z.infer<typeof VoidJournalEntryInput>;

export const CorrectNarrationInput = z.object({
  id: z.string().uuid(),
  newNarration: z.string(),
});
export type CorrectNarrationInput = z.infer<typeof CorrectNarrationInput>;

// ── Fiscal Years ──────────────────────────────────────────
export const FiscalYearEnum = z.enum(["2025-26", "2026-27", "2027-28"]);
export type FiscalYear = z.infer<typeof FiscalYearEnum>;

export const CreateFiscalYearInput = z.object({
  year: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});
export type CreateFiscalYearInput = z.infer<typeof CreateFiscalYearInput>;

// ── Invoices ──────────────────────────────────────────────
export const InvoiceStatusEnum = z.enum([
  "draft", "sent", "partially_paid", "paid", "voided",
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const CreateInvoiceLineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  hsnCode: z.string().optional(),
  gstRate: z.number().nonnegative().optional(),
});
export type CreateInvoiceLine = z.infer<typeof CreateInvoiceLineSchema>;

export const CreateInvoiceInput = z.object({
  date: z.string().date(),
  dueDate: z.string().date(),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerGstin: z.string().optional(),
  customerAddress: z.string().optional(),
  customerState: z.string().optional(),
  items: z.array(CreateInvoiceLineSchema).min(1),
  notes: z.string().optional(),
  terms: z.string().optional(),
});
export type CreateInvoiceInput = z.infer<typeof CreateInvoiceInput>;

export const InvoiceListInput = z.object({
  status: InvoiceStatusEnum.optional(),
  customerName: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(20),
});
export type InvoiceListInput = z.infer<typeof InvoiceListInput>;

// ── Balances / Reports ────────────────────────────────────
export const FiscalYearParam = z.object({ fiscalYear: z.string() });
export type FiscalYearParam = z.infer<typeof FiscalYearParam>;

export const LedgerInput = z.object({
  accountId: z.string().uuid(),
  fiscalYear: z.string(),
});
export type LedgerInput = z.infer<typeof LedgerInput>;

export const PAndLInput = z.object({
  fiscalYear: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type PAndLInput = z.infer<typeof PAndLInput>;

export const BalanceSheetInput = z.object({
  fiscalYear: z.string(),
  asOf: z.string().optional(),
});
export type BalanceSheetInput = z.infer<typeof BalanceSheetInput>;

export const CashFlowInput = z.object({
  fiscalYear: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});
export type CashFlowInput = z.infer<typeof CashFlowInput>;

// ── GST Returns ───────────────────────────────────────────
export const GstReturnTypeEnum = z.enum(["gstr1", "gstr2b", "gstr3b"]);
export type GstReturnType = z.infer<typeof GstReturnTypeEnum>;

export const GstReturnStatusEnum = z.enum([
  "draft", "generated", "filed", "amended",
]);
export type GstReturnStatus = z.infer<typeof GstReturnStatusEnum>;

export const GstReturnListInput = z.object({
  periodMonth: z.number().min(1).max(12).optional(),
  periodYear: z.number().min(2000).optional(),
  returnType: GstReturnTypeEnum.optional(),
  status: GstReturnStatusEnum.optional(),
});
export type GstReturnListInput = z.infer<typeof GstReturnListInput>;

export const GstReturnIdParam = z.object({ returnId: z.string().uuid() });
export type GstReturnIdParam = z.infer<typeof GstReturnIdParam>;

export const GstPeriodInput = z.object({
  periodMonth: z.number().min(1).max(12),
  periodYear: z.number().min(2000),
});
export type GstPeriodInput = z.infer<typeof GstPeriodInput>;

export const FileGstReturnInput = z.object({
  returnId: z.string().uuid(),
  arn: z.string(),
});
export type FileGstReturnInput = z.infer<typeof FileGstReturnInput>;

export const AmendGstReturnInput = z.object({
  returnId: z.string().uuid(),
  changes: z.record(z.unknown()),
});
export type AmendGstReturnInput = z.infer<typeof AmendGstReturnInput>;

// ── ITR Returns ───────────────────────────────────────────
export const ItrFormTypeEnum = z.enum([
  "ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7",
]);
export type ItrFormType = z.infer<typeof ItrFormTypeEnum>;

export const ItrReturnTypeEnum = z.enum(["itr3", "itr4"]);
export type ItrReturnType = z.infer<typeof ItrReturnTypeEnum>;

export const ItrReturnStatusEnum = z.enum([
  "draft", "generated", "filed", "verified", "voided", "amended",
]);
export type ItrReturnStatus = z.infer<typeof ItrReturnStatusEnum>;

export const ItrReturnListInput = z.object({
  financialYear: z.string().optional(),
  status: ItrReturnStatusEnum.optional(),
  returnType: ItrReturnTypeEnum.optional(),
});
export type ItrReturnListInput = z.infer<typeof ItrReturnListInput>;

export const ItrReturnIdParam = z.object({ itrReturnId: z.string().uuid() });
export type ItrReturnIdParam = z.infer<typeof ItrReturnIdParam>;

export const CreateItrReturnInput = z.object({
  financialYear: z.string(),
  returnType: z.enum(["itr3", "itr4"]),
});
export type CreateItrReturnInput = z.infer<typeof CreateItrReturnInput>;

export const GenerateItrReturnInput = z.object({
  itrReturnId: z.string().uuid(),
  returnType: z.enum(["itr3", "itr4"]),
});
export type GenerateItrReturnInput = z.infer<typeof GenerateItrReturnInput>;

export const FileItrReturnInput = z.object({
  itrReturnId: z.string().uuid(),
  acknowledgmentNumber: z.string(),
  verificationMode: z.string(),
});
export type FileItrReturnInput = z.infer<typeof FileItrReturnInput>;

export const VoidItrReturnInput = z.object({
  itrReturnId: z.string().uuid(),
  reason: z.string(),
});
export type VoidItrReturnInput = z.infer<typeof VoidItrReturnInput>;

// ── Payroll ───────────────────────────────────────────────

// ── Products / Inventory ──────────────────────────────────

// ── Payments ──────────────────────────────────────────────

// ── Receivables ───────────────────────────────────────────

// ── Employees ─────────────────────────────────────────────

// ── Tenant / Config ───────────────────────────────────────

// ── OCR ───────────────────────────────────────────────────
