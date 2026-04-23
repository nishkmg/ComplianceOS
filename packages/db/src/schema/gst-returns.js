"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gstReturnLines = exports.gstReturns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
exports.gstReturns = (0, pg_core_1.pgTable)("gst_returns", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    returnNumber: (0, pg_core_1.text)("return_number").notNull(),
    returnType: (0, enums_1.gstReturnTypeEnum)("return_type").notNull(),
    taxPeriodMonth: (0, pg_core_1.text)("tax_period_month").notNull(),
    taxPeriodYear: (0, pg_core_1.text)("tax_period_year").notNull(),
    fiscalYear: (0, pg_core_1.text)("fiscal_year").notNull(),
    status: (0, enums_1.gstReturnStatusEnum)("status").notNull().default("draft"),
    filingDate: (0, pg_core_1.date)("filing_date"),
    dueDate: (0, pg_core_1.date)("due_date").notNull(),
    totalOutwardSupplies: (0, pg_core_1.numeric)("total_outward_supplies", { precision: 18, scale: 2 }).default("0"),
    totalEligibleItc: (0, pg_core_1.numeric)("total_eligible_itc", { precision: 18, scale: 2 }).default("0"),
    totalTaxPayable: (0, pg_core_1.numeric)("total_tax_payable", { precision: 18, scale: 2 }).default("0"),
    totalTaxPaid: (0, pg_core_1.numeric)("total_tax_paid", { precision: 18, scale: 2 }).default("0"),
    interestAmount: (0, pg_core_1.numeric)("interest_amount", { precision: 18, scale: 2 }).default("0"),
    penaltyAmount: (0, pg_core_1.numeric)("penalty_amount", { precision: 18, scale: 2 }).default("0"),
    lateFeeAmount: (0, pg_core_1.numeric)("late_fee_amount", { precision: 18, scale: 2 }).default("0"),
    arn: (0, pg_core_1.text)("arn"),
    remarks: (0, pg_core_1.text)("remarks"),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    filedBy: (0, pg_core_1.uuid)("filed_by").references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("gst_returns_tenant_return_type_period_unique").on(table.tenantId, table.returnType, table.taxPeriodMonth, table.taxPeriodYear),
    (0, pg_core_1.index)("gst_returns_tenant_id_status_idx").on(table.tenantId, table.status),
    (0, pg_core_1.index)("gst_returns_tenant_id_fiscal_year_idx").on(table.tenantId, table.fiscalYear),
    (0, pg_core_1.index)("gst_returns_tax_period_idx").on(table.taxPeriodYear, table.taxPeriodMonth),
]);
exports.gstReturnLines = (0, pg_core_1.pgTable)("gst_return_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    gstReturnId: (0, pg_core_1.uuid)("gst_return_id").notNull().references(() => exports.gstReturns.id),
    tableNumber: (0, pg_core_1.text)("table_number").notNull(),
    tableDescription: (0, pg_core_1.text)("table_description").notNull(),
    transactionType: (0, pg_core_1.text)("transaction_type").notNull(),
    placeOfSupply: (0, pg_core_1.text)("place_of_supply").notNull(),
    taxableValue: (0, pg_core_1.numeric)("taxable_value", { precision: 18, scale: 2 }).notNull().default("0"),
    igstAmount: (0, pg_core_1.numeric)("igst_amount", { precision: 18, scale: 2 }).default("0"),
    cgstAmount: (0, pg_core_1.numeric)("cgst_amount", { precision: 18, scale: 2 }).default("0"),
    sgstAmount: (0, pg_core_1.numeric)("sgst_amount", { precision: 18, scale: 2 }).default("0"),
    cessAmount: (0, pg_core_1.numeric)("cess_amount", { precision: 18, scale: 2 }).default("0"),
    totalTaxAmount: (0, pg_core_1.numeric)("total_tax_amount", { precision: 18, scale: 2 }).default("0"),
    sourceDocumentId: (0, pg_core_1.uuid)("source_document_id"),
    sourceDocumentType: (0, pg_core_1.text)("source_document_type"),
    sourceDocumentNumber: (0, pg_core_1.text)("source_document_number"),
    sourceDocumentDate: (0, pg_core_1.date)("source_document_date"),
    gstin: (0, pg_core_1.text)("gstin"),
    partyName: (0, pg_core_1.text)("party_name"),
    remarks: (0, pg_core_1.text)("remarks"),
}, (table) => [
    (0, pg_core_1.index)("gst_return_lines_gst_return_id_idx").on(table.gstReturnId),
    (0, pg_core_1.index)("gst_return_lines_table_number_idx").on(table.tableNumber),
    (0, pg_core_1.index)("gst_return_lines_source_document_idx").on(table.sourceDocumentId, table.sourceDocumentType),
]);
//# sourceMappingURL=gst-returns.js.map