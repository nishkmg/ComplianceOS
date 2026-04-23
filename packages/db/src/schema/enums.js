"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presumptiveSchemeEnum = exports.taxRegimeEnum = exports.incomeHeadEnum = exports.itrReturnStatusEnum = exports.itrReturnTypeEnum = exports.gstTransactionTypeEnum = exports.gstTaxTypeEnum = exports.gstReturnStatusEnum = exports.gstReturnTypeEnum = exports.documentTypeEnum = exports.genderEnum = exports.employeeStatusEnum = exports.advanceStatusEnum = exports.tdsRegimeEnum = exports.payrollComponentTypeEnum = exports.payrollRunStatusEnum = exports.valuationMethodEnum = exports.stockMovementTypeEnum = exports.ocrStatusEnum = exports.creditNoteStatusEnum = exports.paymentStatusEnum = exports.paymentMethodEnum = exports.invoiceStatusEnum = exports.ocrScanTypeEnum = exports.fyStatusEnum = exports.cashFlowCategoryEnum = exports.eventTypeEnum = exports.aggregateTypeEnum = exports.jeStatusEnum = exports.referenceTypeEnum = exports.reconciliationAccountEnum = exports.tagEnum = exports.accountSubTypeEnum = exports.accountKindEnum = exports.setByEnum = exports.moduleEnum = exports.roleEnum = exports.gstRegistrationEnum = exports.industryEnum = exports.stateEnum = exports.businessTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.businessTypeEnum = (0, pg_core_1.pgEnum)("business_type", [
    "sole_proprietorship", "partnership", "llp", "private_limited", "public_limited", "huf",
]);
exports.stateEnum = (0, pg_core_1.pgEnum)("state", [
    "andhra_pradesh", "arunachal_pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat",
    "haryana", "himachal_pradesh", "jharkhand", "karnataka", "kerala", "madhya_pradesh",
    "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
    "rajasthan", "sikkim", "tamil_nadu", "telangana", "tripura", "uttar_pradesh",
    "uttarakhand", "west_bengal", "andaman_nicobar", "chandigarh",
    "dadra_nagar_haveli_daman_diu", "delhi", "jammu_kashmir", "ladakh",
    "lakshadweep", "puducherry",
]);
exports.industryEnum = (0, pg_core_1.pgEnum)("industry", [
    "retail_trading", "manufacturing", "services_professional", "freelancer_consultant",
    "regulated_professional",
]);
exports.gstRegistrationEnum = (0, pg_core_1.pgEnum)("gst_registration", ["regular", "composition", "none"]);
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["owner", "accountant", "manager", "employee"]);
exports.moduleEnum = (0, pg_core_1.pgEnum)("module", [
    "accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr",
]);
exports.setByEnum = (0, pg_core_1.pgEnum)("set_by", ["auto", "manual"]);
exports.accountKindEnum = (0, pg_core_1.pgEnum)("account_kind", [
    "Asset", "Liability", "Equity", "Revenue", "Expense",
]);
exports.accountSubTypeEnum = (0, pg_core_1.pgEnum)("account_sub_type", [
    "CurrentAsset", "FixedAsset", "Bank", "Cash", "Inventory",
    "CurrentLiability", "LongTermLiability",
    "Capital", "Drawing", "Reserves",
    "OperatingRevenue", "OtherRevenue",
    "DirectExpense", "IndirectExpense",
]);
exports.tagEnum = (0, pg_core_1.pgEnum)("tag", [
    "trade_receivable", "trade_payable", "gst", "tds", "tds_payable",
    "finance_cost", "depreciation", "tax", "employee_benefits", "manufacturing",
    "inventory_adjustment", "trading", "returns", "opening_balance",
]);
exports.reconciliationAccountEnum = (0, pg_core_1.pgEnum)("reconciliation_account", ["bank", "none"]);
exports.referenceTypeEnum = (0, pg_core_1.pgEnum)("reference_type", [
    "invoice", "payment", "receipt", "journal", "payroll", "inventory", "opening_balance", "manual",
]);
exports.jeStatusEnum = (0, pg_core_1.pgEnum)("je_status", ["draft", "posted", "voided"]);
exports.aggregateTypeEnum = (0, pg_core_1.pgEnum)("aggregate_type", [
    "journal_entry", "account", "fiscal_year", "invoice", "credit_note", "payment",
    "payroll_run", "salary_structure", "employee_advance",
    "gst_challan", "gst_payment", "gst_return", "itr_return",
]);
exports.eventTypeEnum = (0, pg_core_1.pgEnum)("event_type", [
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
exports.cashFlowCategoryEnum = (0, pg_core_1.pgEnum)("cash_flow_category", [
    "operating", "investing", "financing",
]);
exports.fyStatusEnum = (0, pg_core_1.pgEnum)("fy_status", ["open", "closed"]);
exports.ocrScanTypeEnum = (0, pg_core_1.pgEnum)("ocr_scan_type", ["invoice", "receipt"]);
exports.invoiceStatusEnum = (0, pg_core_1.pgEnum)("invoice_status", [
    "draft", "sent", "partially_paid", "paid", "voided",
]);
exports.paymentMethodEnum = (0, pg_core_1.pgEnum)("payment_method", [
    "cash", "bank", "online", "cheque",
]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)("payment_status", ["recorded", "voided"]);
exports.creditNoteStatusEnum = (0, pg_core_1.pgEnum)("credit_note_status", [
    "draft", "issued", "voided",
]);
exports.ocrStatusEnum = (0, pg_core_1.pgEnum)("ocr_status", ["pending", "processing", "completed", "failed", "converted"]);
exports.stockMovementTypeEnum = (0, pg_core_1.pgEnum)("stock_movement_type", [
    "purchase_receipt",
    "sales_delivery",
    "stock_adjustment",
    "warehouse_transfer",
    "opening_balance",
]);
exports.valuationMethodEnum = (0, pg_core_1.pgEnum)("valuation_method", ["fifo", "weighted_average"]);
exports.payrollRunStatusEnum = (0, pg_core_1.pgEnum)("payroll_run_status", [
    "draft", "processing", "calculated", "finalized", "voided", "failed",
]);
exports.payrollComponentTypeEnum = (0, pg_core_1.pgEnum)("payroll_component_type", [
    "earning", "deduction", "statutory", "advance", "arrears",
]);
exports.tdsRegimeEnum = (0, pg_core_1.pgEnum)("tds_regime", ["old", "new"]);
exports.advanceStatusEnum = (0, pg_core_1.pgEnum)("advance_status", [
    "active", "fully_recovered", "cancelled",
]);
exports.employeeStatusEnum = (0, pg_core_1.pgEnum)("employee_status", [
    "active", "inactive", "exited",
]);
exports.genderEnum = (0, pg_core_1.pgEnum)("gender", ["male", "female", "other"]);
exports.documentTypeEnum = (0, pg_core_1.pgEnum)("document_type", [
    "pan_card", "aadhaar_card", "photo", "bank_proof", "uan_card", "esi_card",
    "address_proof", "qualification_certificate", "experience_letter",
]);
exports.gstReturnTypeEnum = (0, pg_core_1.pgEnum)("gst_return_type", ["gstr1", "gstr2b", "gstr3b", "gstr9", "gstr4", "itc_reconciliation"]);
exports.gstReturnStatusEnum = (0, pg_core_1.pgEnum)("gst_return_status", ["draft", "generated", "filed", "amended", "completed"]);
exports.gstTaxTypeEnum = (0, pg_core_1.pgEnum)("gst_tax_type", ["igst", "cgst", "sgst", "cess"]);
exports.gstTransactionTypeEnum = (0, pg_core_1.pgEnum)("gst_transaction_type", ["payment", "interest", "penalty", "refund", "itc_utilization"]);
exports.itrReturnTypeEnum = (0, pg_core_1.pgEnum)("itr_return_type", ["itr3", "itr4", "itr5", "itr1", "itr2"]);
exports.itrReturnStatusEnum = (0, pg_core_1.pgEnum)("itr_return_status", ["draft", "computed", "generated", "filed", "verified", "voided"]);
exports.incomeHeadEnum = (0, pg_core_1.pgEnum)("income_head", ["salary", "house_property", "business_profit", "capital_gains", "other_sources"]);
exports.taxRegimeEnum = (0, pg_core_1.pgEnum)("tax_regime", ["old", "new"]);
exports.presumptiveSchemeEnum = (0, pg_core_1.pgEnum)("presumptive_scheme", ["44ad", "44ada", "44ae", "none"]);
//# sourceMappingURL=enums.js.map