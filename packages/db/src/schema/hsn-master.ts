import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const hsnMaster = pgTable(
  "hsn_master",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 8 }).notNull(),
    description: text("description").notNull(),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("hsn_master_code_unique").on(table.code),
    index("hsn_master_effective_from_idx").on(table.effectiveFrom),
  ],
);
