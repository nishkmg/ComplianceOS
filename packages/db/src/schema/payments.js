"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentAllocations = exports.payments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
const invoices_1 = require("./invoices");
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    paymentNumber: (0, pg_core_1.text)("payment_number").notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    paymentMethod: (0, enums_1.paymentMethodEnum)("payment_method").notNull(),
    referenceNumber: (0, pg_core_1.text)("reference_number"),
    customerName: (0, pg_core_1.text)("customer_name").notNull(),
    notes: (0, pg_core_1.text)("notes"),
    status: (0, enums_1.paymentStatusEnum)("status").notNull().default("recorded"),
    createdBy: (0, pg_core_1.uuid)("created_by").notNull().references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payments_tenant_id_payment_number_unique").on(table.tenantId, table.paymentNumber),
    (0, pg_core_1.index)("payments_tenant_id_customer_name_idx").on(table.tenantId, table.customerName),
    (0, pg_core_1.index)("payments_tenant_id_date_idx").on(table.tenantId, table.date),
]);
exports.paymentAllocations = (0, pg_core_1.pgTable)("payment_allocations", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    paymentId: (0, pg_core_1.uuid)("payment_id").notNull().references(() => exports.payments.id),
    invoiceId: (0, pg_core_1.uuid)("invoice_id").notNull().references(() => invoices_1.invoices.id),
    allocatedAmount: (0, pg_core_1.numeric)("allocated_amount", { precision: 18, scale: 2 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("payment_allocations_payment_id_invoice_id_unique").on(table.paymentId, table.invoiceId),
]);
//# sourceMappingURL=payments.js.map