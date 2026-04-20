import {
  pgTable, uuid, text, date, numeric, timestamp,
  index, uniqueIndex,
} from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentStatusEnum } from "./enums.js";
import { users } from "./users.js";
import { invoices } from "./invoices.js";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  paymentNumber: text("payment_number").notNull(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: text("reference_number"),
  customerName: text("customer_name").notNull(),
  notes: text("notes"),
  status: paymentStatusEnum("status").notNull().default("recorded"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("payments_tenant_id_payment_number_unique").on(table.tenantId, table.paymentNumber),
  index("payments_tenant_id_customer_name_idx").on(table.tenantId, table.customerName),
  index("payments_tenant_id_date_idx").on(table.tenantId, table.date),
]);

export const paymentAllocations = pgTable("payment_allocations", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id").notNull().references(() => payments.id),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
  allocatedAmount: numeric("allocated_amount", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("payment_allocations_payment_id_invoice_id_unique").on(table.paymentId, table.invoiceId),
]);
