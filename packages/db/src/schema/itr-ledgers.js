"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selfAssessmentLedger = exports.advanceTaxLedger = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.advanceTaxLedger = (0, pg_core_1.pgTable)("advance_tax_ledger", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assessmentYear: (0, pg_core_1.text)("assessment_year").notNull(),
    installmentNumber: (0, pg_core_1.text)("installment_number").notNull(),
    dueDate: (0, pg_core_1.date)("due_date").notNull(),
    payableAmount: (0, pg_core_1.numeric)("payable_amount", { precision: 18, scale: 2 }).default("0"),
    paidAmount: (0, pg_core_1.numeric)("paid_amount", { precision: 18, scale: 2 }).default("0"),
    paidDate: (0, pg_core_1.date)("paid_date"),
    challanNumber: (0, pg_core_1.text)("challan_number"),
    challanDate: (0, pg_core_1.date)("challan_date"),
    interest234b: (0, pg_core_1.numeric)("interest_234b", { precision: 18, scale: 2 }).default("0"),
    interest234c: (0, pg_core_1.numeric)("interest_234c", { precision: 18, scale: 2 }).default("0"),
    balance: (0, pg_core_1.numeric)("balance", { precision: 18, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("advance_tax_ledger_tenant_ay_installment_unique").on(table.tenantId, table.assessmentYear, table.installmentNumber),
    (0, pg_core_1.index)("advance_tax_ledger_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);
exports.selfAssessmentLedger = (0, pg_core_1.pgTable)("self_assessment_ledger", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    assessmentYear: (0, pg_core_1.text)("assessment_year").notNull(),
    taxPayable: (0, pg_core_1.numeric)("tax_payable", { precision: 18, scale: 2 }).default("0"),
    advanceTaxPaid: (0, pg_core_1.numeric)("advance_tax_paid", { precision: 18, scale: 2 }).default("0"),
    tdsTcsCredit: (0, pg_core_1.numeric)("tds_tcs_credit", { precision: 18, scale: 2 }).default("0"),
    balancePayable: (0, pg_core_1.numeric)("balance_payable", { precision: 18, scale: 2 }).default("0"),
    paidAmount: (0, pg_core_1.numeric)("paid_amount", { precision: 18, scale: 2 }).default("0"),
    challanNumber: (0, pg_core_1.text)("challan_number"),
    challanDate: (0, pg_core_1.date)("challan_date"),
    paidDate: (0, pg_core_1.date)("paid_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("self_assessment_ledger_tenant_id_ay_idx").on(table.tenantId, table.assessmentYear),
]);
//# sourceMappingURL=itr-ledgers.js.map