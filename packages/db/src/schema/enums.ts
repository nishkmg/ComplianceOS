import { pgEnum } from "drizzle-orm/pg-core";

export const businessTypeEnum = pgEnum("business_type", [
  "sole_proprietorship", "partnership", "llp", "private_limited", "public_limited", "huf",
]);

export const stateEnum = pgEnum("state", [
  "andhra_pradesh", "arunachal_pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
  "haryana", "himachal_pradesh", "jharkhand", "karnataka", "kerala", "madhya_pradesh",
  "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
  "rajasthan", "sikkim", "tamil_nadu", "telangana", "tripura", "uttar_pradesh",
  "uttarakhand", "west_bengal", "andaman_nicobar", "chandigarh",
  "dadra_nagar_haveli_daman_diu", "delhi", "jammu_kashmir", "ladakh",
  "lakshadweep", "puducherry",
]);

export const industryEnum = pgEnum("industry", [
  "retail_trading", "manufacturing", "services_professional", "freelancer_consultant",
  "regulated_professional",
]);

export const gstRegistrationEnum = pgEnum("gst_registration", ["regular", "composition", "none"]);

export const roleEnum = pgEnum("role", ["owner", "accountant", "manager", "employee"]);

export const moduleEnum = pgEnum("module", [
  "accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr",
]);

export const setByEnum = pgEnum("set_by", ["auto", "manual"]);

export const accountKindEnum = pgEnum("account_kind", [
  "Asset", "Liability", "Equity", "Revenue", "Expense",
]);

export const accountSubTypeEnum = pgEnum("account_sub_type", [
  "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
  "CurrentLiability", "LongTermLiability",
  "Capital", "Drawing", "Reserves",
  "OperatingRevenue", "OtherRevenue",
  "DirectExpense", "IndirectExpense",
]);

export const tagEnum = pgEnum("tag", [
  "trade_receivable", "trade_payable", "gst", "tds", "tds_payable",
  "finance_cost", "depreciation", "tax", "employee_benefits", "manufacturing",
  "inventory_adjustment", "trading", "returns", "opening_balance",
]);

export const reconciliationAccountEnum = pgEnum("reconciliation_account", ["bank", "none"]);

export const referenceTypeEnum = pgEnum("reference_type", [
  "invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual",
]);

export const jeStatusEnum = pgEnum("je_status", ["draft", "posted", "voided"]);

export const aggregateTypeEnum = pgEnum("aggregate_type", [
  "journal_entry", "account", "fiscal_year", "invoice", "credit_note", "payment",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "journal_entry_created", "journal_entry_modified", "journal_entry_deleted",
  "journal_entry_posted", "journal_entry_voided", "journal_entry_reversed",
  "account_created", "account_modified", "account_deactivated",
  "fiscal_year_created", "fiscal_year_closed",
  "narration_corrected",
  "invoice_created", "invoice_modified", "invoice_deleted",
  "invoice_posted", "invoice_voided", "invoice_sent",
  "credit_note_created", "credit_note_modified", "credit_note_issued", "credit_note_voided",
  "payment_recorded", "payment_voided",
]);

export const cashFlowCategoryEnum = pgEnum("cash_flow_category", [
  "operating", "investing", "financing",
]);

export const fyStatusEnum = pgEnum("fy_status", ["open", "closed"]);

export const ocrScanTypeEnum = pgEnum("ocr_scan_type", ["invoice", "receipt"]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "sent", "partially_paid", "paid", "voided",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash", "bank", "online", "cheque",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["recorded", "voided"]);

export const creditNoteStatusEnum = pgEnum("credit_note_status", [
  "draft", "issued", "voided",
]);

export const ocrStatusEnum = pgEnum("ocr_status", ["pending", "processing", "completed", "failed", "converted"]);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "purchase_receipt",
  "sales_delivery",
  "stock_adjustment",
  "warehouse_transfer",
  "opening_balance",
]);

export const valuationMethodEnum = pgEnum("valuation_method", ["fifo", "weighted_average"]);
