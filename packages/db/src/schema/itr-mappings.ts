import {
  pgTable, uuid, text, jsonb,
  index,
} from "drizzle-orm/pg-core";
import { itrReturnTypeEnum } from "./enums";

export const itrFieldMappings = pgTable("itr_field_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  returnType: itrReturnTypeEnum("return_type").notNull(),
  fieldCode: text("field_code").notNull(),
  fieldName: text("field_name").notNull(),
  description: text("description"),
  sourceTable: text("source_table"),
  sourceField: text("source_field"),
  calculationLogic: jsonb("calculation_logic").default({}),
}, (table) => [
  index("itr_field_mappings_return_type_idx").on(table.returnType),
  index("itr_field_mappings_field_code_idx").on(table.fieldCode),
]);
