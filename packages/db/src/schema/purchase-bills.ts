import { pgTable, uuid, text, date, numeric, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";

export const purchaseBills = pgTable("purchase_bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  billNumber: text("bill_number").notNull(),
  vendorAccountId: uuid("vendor_account_id").notNull(),
  vendorName: text("vendor_name").notNull(),
  vendorGstin: text("vendor_gstin"),
  vendorState: text("vendor_state"),
  billDate: date("bill_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 18, scale: 2 }).notNull(),
  cgstTotal: numeric("cgst_total", { precision: 18, scale: 2 }).default("0").notNull(),
  sgstTotal: numeric("sgst_total", { precision: 18, scale: 2 }).default("0").notNull(),
  igstTotal: numeric("igst_total", { precision: 18, scale: 2 }).default("0").notNull(),
  grandTotal: numeric("grand_total", { precision: 18, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  status: text("status").default("open").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  narration: text("narration"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("purchase_bills_tenant_status_idx").on(table.tenantId, table.status),
  index("purchase_bills_tenant_due_date_idx").on(table.tenantId, table.dueDate),
  uniqueIndex("purchase_bills_tenant_vendor_number_unique").on(table.tenantId, table.vendorAccountId, table.billNumber),
]);

export const purchaseBillLines = pgTable("purchase_bill_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  billId: uuid("bill_id").notNull().references(() => purchaseBills.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 18, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull(),
  cgstAmount: numeric("cgst_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  sgstAmount: numeric("sgst_amount", { precision: 18, scale: 2 }).default("0").notNull(),
  igstAmount: numeric("igst_amount", { precision: 18, scale: 2 }).default("0").notNull(),
});
