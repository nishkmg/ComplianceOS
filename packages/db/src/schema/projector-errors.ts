import {
  pgTable, uuid, text, integer, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";

export const projectorErrors = pgTable("projector_errors", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectorName: text("projector_name").notNull(),
  tenantId: uuid("tenant_id").notNull(),
  eventId: uuid("event_id").notNull(),
  error: text("error"),
  attempts: integer("attempts").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("projector_errors_unique").on(table.projectorName, table.tenantId, table.eventId),
  index("projector_errors_tenant_idx").on(table.tenantId),
]);
