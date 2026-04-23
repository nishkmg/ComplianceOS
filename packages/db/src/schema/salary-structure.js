"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeSalaryStructures = exports.salaryComponents = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const employees_1 = require("./employees");
exports.salaryComponents = (0, pg_core_1.pgTable)("salary_components", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    componentCode: (0, pg_core_1.text)("component_code").notNull(),
    componentName: (0, pg_core_1.text)("component_name").notNull(),
    componentType: (0, enums_1.payrollComponentTypeEnum)("component_type").notNull(),
    isTaxable: (0, pg_core_1.boolean)("is_taxable").default(true),
    displayOrder: (0, pg_core_1.integer)("display_order").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("salary_components_tenant_id_component_code_unique").on(table.tenantId, table.componentCode),
    (0, pg_core_1.index)("salary_components_tenant_id_type_idx").on(table.tenantId, table.componentType),
]);
exports.employeeSalaryStructures = (0, pg_core_1.pgTable)("employee_salary_structures", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    employeeId: (0, pg_core_1.uuid)("employee_id").notNull().references(() => employees_1.employees.id),
    componentId: (0, pg_core_1.uuid)("component_id").notNull().references(() => exports.salaryComponents.id),
    version: (0, pg_core_1.integer)("version").notNull().default(1),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }),
    percentageOfBasic: (0, pg_core_1.numeric)("percentage_of_basic", { precision: 5, scale: 2 }),
    effectiveFrom: (0, pg_core_1.date)("effective_from").notNull(),
    effectiveTo: (0, pg_core_1.date)("effective_to"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("employee_salary_structures_tenant_employee_component_version_unique").on(table.tenantId, table.employeeId, table.componentId, table.version),
    (0, pg_core_1.index)("employee_salary_structures_employee_id_idx").on(table.employeeId),
    (0, pg_core_1.index)("employee_salary_structures_active_idx").on(table.employeeId, table.isActive),
]);
//# sourceMappingURL=salary-structure.js.map