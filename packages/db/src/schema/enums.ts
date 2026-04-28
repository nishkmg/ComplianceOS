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
  "payroll_run", "salary_structure", "employee_advance",
  "gst_challan", "gst_payment", "gst_return", "itr_return",
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
  "employee_created", "employee_updated", "employee_deactivated",
  "salary_structure_created", "salary_structure_updated",
  "payroll_processed", "payroll_finalized", "payroll_voided",
  "payslip_generated",
  "advance_given", "advance_recovered",
  "gst_challan_created", "gst_payment_made", "itc_reconciled", "itc_utilized",
  "purchase_posted", "purchase_voided", "itc_reversed", "gst_refund_claimed", "gstr3b_generated",
  "income_computed", "tax_computed", "itr_generated",
]);

export const cashFlowCategoryEnum = pgEnum("cash_flow_category", [
  "operating", "investing", "financing",
]);

export const fyStatusEnum = pgEnum("fy_status", ["open", "pending_close", "closed"]);

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

export const payrollRunStatusEnum = pgEnum("payroll_run_status", [
  "draft", "processing", "calculated", "finalized", "voided", "failed",
]);

export const payrollComponentTypeEnum = pgEnum("payroll_component_type", [
  "earning", "deduction", "statutory", "advance", "arrears",
]);

export const tdsRegimeEnum = pgEnum("tds_regime", ["old", "new"]);

export const advanceStatusEnum = pgEnum("advance_status", [
  "active", "fully_recovered", "cancelled",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "active", "inactive", "exited",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const documentTypeEnum = pgEnum("document_type", [
  "pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card",
  "address_proof", "qualification_certificate", "experience_letter",
]);

export const gstReturnTypeEnum = pgEnum("gst_return_type", ["gstr1", "gstr2b", "gstr3b", "gstr9", "gstr4", "itc_reconciliation"]);
export const gstReturnStatusEnum = pgEnum("gst_return_status", ["draft", "generated", "filed", "amended", "completed"]);
export const gstTaxTypeEnum = pgEnum("gst_tax_type", ["igst", "cgst", "sgst", "cess"]);
export const gstTransactionTypeEnum = pgEnum("gst_transaction_type", ["payment", "interest", "penalty", "refund", "itc_utilization"]);

export const itrReturnTypeEnum = pgEnum("itr_return_type", ["itr3", "itr4", "itr5", "itr1", "itr2"]);
export const itrReturnStatusEnum = pgEnum("itr_return_status", ["draft", "computed", "generated", "filed", "verified", "voided"]);
export const incomeHeadEnum = pgEnum("income_head", ["salary", "house_property", "business_profit", "capital_gains", "other_sources"]);
export const taxRegimeEnum = pgEnum("tax_regime", ["old", "new"]);
export const presumptiveSchemeEnum = pgEnum("presumptive_scheme", ["44ad", "44ada", "44ae", "none"]);
