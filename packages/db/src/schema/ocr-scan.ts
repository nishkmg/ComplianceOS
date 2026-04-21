import {
  pgTable, uuid, text, numeric, timestamp,
  index,
} from "drizzle-orm/pg-core";
import { ocrStatusEnum, ocrScanTypeEnum } from "./enums";
import { users } from "./users";

export const ocrScanResults = pgTable("ocr_scan_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),

  // File info
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: numeric("file_size", { precision: 18, scale: 0 }),

  // Scan type
  scanType: ocrScanTypeEnum("scan_type").notNull().default("invoice"),

  // OCR raw output
  rawText: text("raw_text"),

  // Parsed fields (shared: vendor/customer name)
  parsedVendorName: text("parsed_vendor_name"),

  // Invoice-specific fields
  parsedInvoiceNumber: text("parsed_invoice_number"),
  parsedInvoiceDate: text("parsed_invoice_date"),
  parsedDueDate: text("parsed_due_date"),
  parsedSubtotal: numeric("parsed_subtotal", { precision: 18, scale: 2 }),
  parsedCgstTotal: numeric("parsed_cgst_total", { precision: 18, scale: 2 }),
  parsedSgstTotal: numeric("parsed_sgst_total", { precision: 18, scale: 2 }),
  parsedIgstTotal: numeric("parsed_igst_total", { precision: 18, scale: 2 }),
  parsedTotal: numeric("parsed_total", { precision: 18, scale: 2 }),

  // Line items as JSON string (invoice mode)
  parsedLineItems: text("parsed_line_items"),

  // Receipt-specific fields
  parsedVendorAddress: text("parsed_vendor_address"),
  parsedVendorGstin: text("parsed_vendor_gstin"),
  parsedExpenseCategory: text("parsed_expense_category"),

  // Confidence
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),

  // Status
  status: ocrStatusEnum("status").notNull().default("pending"),

  // Linked records
  linkedInvoiceId: uuid("linked_invoice_id"),
  linkedJournalEntryId: uuid("linked_journal_entry_id"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("ocr_scan_results_tenant_id_idx").on(table.tenantId),
  index("ocr_scan_results_status_idx").on(table.status),
  index("ocr_scan_results_scan_type_idx").on(table.scanType),
]);
