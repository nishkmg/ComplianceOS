"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxPreferences = exports.employeeDocuments = exports.employees = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.employees = (0, pg_core_1.pgTable)("employees", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeCode: (0, pg_core_1.text)("employee_code").notNull(),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name"),
    email: (0, pg_core_1.text)("email"),
    phone: (0, pg_core_1.text)("phone"),
    dateOfBirth: (0, pg_core_1.date)("date_of_birth"),
    gender: (0, enums_1.genderEnum)("gender"),
    pan: (0, pg_core_1.text)("pan").notNull(),
    aadhaar: (0, pg_core_1.text)("aadhaar"),
    uan: (0, pg_core_1.text)("uan"),
    esiNumber: (0, pg_core_1.text)("esi_number"),
    bankName: (0, pg_core_1.text)("bank_name"),
    bankAccountNumber: (0, pg_core_1.text)("bank_account_number"),
    bankIfsc: (0, pg_core_1.text)("bank_ifsc"),
    address: (0, pg_core_1.text)("address"),
    city: (0, pg_core_1.text)("city"),
    state: (0, pg_core_1.text)("state"),
    pincode: (0, pg_core_1.text)("pincode"),
    dateOfJoining: (0, pg_core_1.date)("date_of_joining").notNull(),
    dateOfExit: (0, pg_core_1.date)("date_of_exit"),
    designation: (0, pg_core_1.text)("designation"),
    department: (0, pg_core_1.text)("department"),
    status: (0, enums_1.employeeStatusEnum)("status").notNull().default("active"),
    userId: (0, pg_core_1.uuid)("user_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("employees_tenant_id_employee_code_unique").on(table.tenantId, table.employeeCode),
    (0, pg_core_1.index)("employees_tenant_id_status_idx").on(table.tenantId, table.status),
    (0, pg_core_1.index)("employees_tenant_id_pan_idx").on(table.tenantId, table.pan),
    (0, pg_core_1.index)("employees_tenant_id_uan_idx").on(table.tenantId, table.uan),
    (0, pg_core_1.index)("employees_user_id_idx").on(table.userId),
]);
exports.employeeDocuments = (0, pg_core_1.pgTable)("employee_documents", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => exports.employees.id),
    documentType: (0, enums_1.documentTypeEnum)("document_type").notNull(),
    fileUrl: (0, pg_core_1.text)("file_url").notNull(),
    verified: (0, pg_core_1.boolean)("verified").default(false),
    uploadedAt: (0, pg_core_1.timestamp)("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.index)("employee_documents_employee_id_idx").on(table.employeeId),
    (0, pg_core_1.index)("employee_documents_tenant_id_idx").on(table.tenantId),
]);
exports.taxPreferences = (0, pg_core_1.pgTable)("tax_preferences", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => exports.employees.id),
    financialYear: (0, pg_core_1.text)("financial_year").notNull(),
    regime: (0, pg_core_1.text)("regime").notNull().default("new"),
    declarations: (0, pg_core_1.jsonb)("declarations").default({}),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("tax_preferences_tenant_employee_fy_unique").on(table.tenantId, table.employeeId, table.financialYear),
]);
//# sourceMappingURL=employees.js.map