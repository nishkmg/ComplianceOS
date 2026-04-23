"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itrFieldMappings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
exports.itrFieldMappings = (0, pg_core_1.pgTable)("itr_field_mappings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    returnType: (0, enums_1.itrReturnTypeEnum)("return_type").notNull(),
    fieldCode: (0, pg_core_1.text)("field_code").notNull(),
    fieldName: (0, pg_core_1.text)("field_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    sourceTable: (0, pg_core_1.text)("source_table"),
    sourceField: (0, pg_core_1.text)("source_field"),
    calculationLogic: (0, pg_core_1.jsonb)("calculation_logic").default({}),
}, (table) => [
    (0, pg_core_1.index)("itr_field_mappings_return_type_idx").on(table.returnType),
    (0, pg_core_1.index)("itr_field_mappings_field_code_idx").on(table.fieldCode),
]);
//# sourceMappingURL=itr-mappings.js.map