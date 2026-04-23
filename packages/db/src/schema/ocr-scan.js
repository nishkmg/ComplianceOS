"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrScanResults = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
exports.ocrScanResults = (0, pg_core_1.pgTable)("ocr_scan_results", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    uploadedBy: (0, pg_core_1.uuid)("uploaded_by").notNull().references(() => users_1.users.id),
    // File info
    fileName: (0, pg_core_1.text)("file_name").notNull(),
    fileUrl: (0, pg_core_1.text)("file_url").notNull(),
    fileSize: (0, pg_core_1.numeric)("file_size", { precision: 18, scale: 0 }),
    // Scan type
    scanType: (0, enums_1.ocrScanTypeEnum)("scan_type").notNull().default("invoice"),
    // OCR raw output
    rawText: (0, pg_core_1.text)("raw_text"),
    // Parsed fields (shared: vendor/customer name)
    parsedVendorName: (0, pg_core_1.text)("parsed_vendor_name"),
    // Invoice-specific fields
    parsedInvoiceNumber: (0, pg_core_1.text)("parsed_invoice_number"),
    parsedInvoiceDate: (0, pg_core_1.text)("parsed_invoice_date"),
    parsedDueDate: (0, pg_core_1.text)("parsed_due_date"),
    parsedSubtotal: (0, pg_core_1.numeric)("parsed_subtotal", { precision: 18, scale: 2 }),
    parsedCgstTotal: (0, pg_core_1.numeric)("parsed_cgst_total", { precision: 18, scale: 2 }),
    parsedSgstTotal: (0, pg_core_1.numeric)("parsed_sgst_total", { precision: 18, scale: 2 }),
    parsedIgstTotal: (0, pg_core_1.numeric)("parsed_igst_total", { precision: 18, scale: 2 }),
    parsedTotal: (0, pg_core_1.numeric)("parsed_total", { precision: 18, scale: 2 }),
    // Line items as JSON string (invoice mode)
    parsedLineItems: (0, pg_core_1.text)("parsed_line_items"),
    // Receipt-specific fields
    parsedVendorAddress: (0, pg_core_1.text)("parsed_vendor_address"),
    parsedVendorGstin: (0, pg_core_1.text)("parsed_vendor_gstin"),
    parsedExpenseCategory: (0, pg_core_1.text)("parsed_expense_category"),
    // Confidence
    confidenceScore: (0, pg_core_1.numeric)("confidence_score", { precision: 5, scale: 2 }),
    // Status
    status: (0, enums_1.ocrStatusEnum)("status").notNull().default("pending"),
    // Linked records
    linkedInvoiceId: (0, pg_core_1.uuid)("linked_invoice_id"),
    linkedJournalEntryId: (0, pg_core_1.uuid)("linked_journal_entry_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("ocr_scan_results_tenant_id_idx").on(table.tenantId),
    (0, pg_core_1.index)("ocr_scan_results_status_idx").on(table.status),
    (0, pg_core_1.index)("ocr_scan_results_scan_type_idx").on(table.scanType),
]);
//# sourceMappingURL=ocr-scan.js.map