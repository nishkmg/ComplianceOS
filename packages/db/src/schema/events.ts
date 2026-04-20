import {
  pgTable, uuid, text, jsonb, bigint, timestamp,
  uniqueIndex, index,
} from "drizzle-orm/pg-core";
import { aggregateTypeEnum, eventTypeEnum } from "./enums.js";
import { users } from "./users.js";

export const eventStore = pgTable("event_store", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  aggregateType: aggregateTypeEnum("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  sequence: bigint("sequence", { mode: "bigint" }).notNull(),
  actorId: uuid("actor_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("event_store_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
  index("event_store_tenant_id_idx").on(table.tenantId),
  index("event_store_sequence_idx").on(table.sequence),
]);

export const snapshots = pgTable("snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  aggregateType: aggregateTypeEnum("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  sequence: bigint("sequence", { mode: "bigint" }).notNull(),
  state: jsonb("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("snapshots_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
]);
