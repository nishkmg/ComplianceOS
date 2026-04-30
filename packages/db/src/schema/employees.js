import { pgTable, uuid, text, date, timestamp, boolean, jsonb, uniqueIndex, index, } from "drizzle-orm/pg-core";
import { employeeStatusEnum, genderEnum, documentTypeEnum } from "./enums";
export const employees = pgTable("employees", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    employeeCode: text("employee_code").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender"),
    pan: text("pan").notNull(),
    aadhaar: text("aadhaar"),
    uan: text("uan"),
    esiNumber: text("esi_number"),
    bankName: text("bank_name"),
    bankAccountNumber: text("bank_account_number"),
    bankIfsc: text("bank_ifsc"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    pincode: text("pincode"),
    dateOfJoining: date("date_of_joining").notNull(),
    dateOfExit: date("date_of_exit"),
    designation: text("designation"),
    department: text("department"),
    status: employeeStatusEnum("status").notNull().default("active"),
    userId: uuid("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("employees_tenant_id_employee_code_unique").on(table.tenantId, table.employeeCode),
    index("employees_tenant_id_status_idx").on(table.tenantId, table.status),
    index("employees_tenant_id_pan_idx").on(table.tenantId, table.pan),
    index("employees_tenant_id_uan_idx").on(table.tenantId, table.uan),
    index("employees_user_id_idx").on(table.userId),
]);
export const employeeDocuments = pgTable("employee_documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    employeeId: uuid("employee_id").notNull().references(() => employees.id),
    documentType: documentTypeEnum("document_type").notNull(),
    fileUrl: text("file_url").notNull(),
    verified: boolean("verified").default(false),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    index("employee_documents_employee_id_idx").on(table.employeeId),
    index("employee_documents_tenant_id_idx").on(table.tenantId),
]);
export const taxPreferences = pgTable("tax_preferences", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    employeeId: uuid("employee_id").notNull().references(() => employees.id),
    financialYear: text("financial_year").notNull(),
    regime: text("regime").notNull().default("new"),
    declarations: jsonb("declarations").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    uniqueIndex("tax_preferences_tenant_employee_fy_unique").on(table.tenantId, table.employeeId, table.financialYear),
]);
//# sourceMappingURL=employees.js.map