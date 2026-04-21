import {
  pgTable, uuid, text, numeric, date, timestamp, boolean, integer,
  uniqueIndex, index, foreignKey,
} from "drizzle-orm/pg-core";
import { payrollComponentTypeEnum } from "./enums";
import { tenants } from "./tenants";
import { employees } from "./employees";

export const salaryComponents = pgTable("salary_components", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  componentCode: text("component_code").notNull(),
  componentName: text("component_name").notNull(),
  componentType: payrollComponentTypeEnum("component_type").notNull(),
  isTaxable: boolean("is_taxable").default(true),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("salary_components_tenant_id_component_code_unique").on(
    table.tenantId, table.componentCode
  ),
  index("salary_components_tenant_id_type_idx").on(table.tenantId, table.componentType),
]);

export const employeeSalaryStructures = pgTable("employee_salary_structures", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  employeeId: uuid("employee_id").notNull().references(() => employees.id),
  componentId: uuid("component_id").notNull().references(() => salaryComponents.id),
  version: integer("version").notNull().default(1),
  amount: numeric("amount", { precision: 18, scale: 2 }),
  percentageOfBasic: numeric("percentage_of_basic", { precision: 5, scale: 2 }),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("employee_salary_structures_tenant_employee_component_version_unique").on(
    table.tenantId, table.employeeId, table.componentId, table.version
  ),
  index("employee_salary_structures_employee_id_idx").on(table.employeeId),
  index("employee_salary_structures_active_idx").on(table.employeeId, table.isActive),
]);
