"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshots = exports.eventStore = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const users_1 = require("./users");
exports.eventStore = (0, pg_core_1.pgTable)("event_store", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    aggregateType: (0, enums_1.aggregateTypeEnum)("aggregate_type").notNull(),
    aggregateId: (0, pg_core_1.uuid)("aggregate_id").notNull(),
    eventType: (0, enums_1.eventTypeEnum)("event_type").notNull(),
    payload: (0, pg_core_1.jsonb)("payload").notNull(),
    sequence: (0, pg_core_1.bigint)("sequence", { mode: "bigint" }).notNull(),
    actorId: (0, pg_core_1.uuid)("actor_id").notNull().references(() => users_1.users.id),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("event_store_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
    (0, pg_core_1.index)("event_store_tenant_id_idx").on(table.tenantId),
    (0, pg_core_1.index)("event_store_sequence_idx").on(table.sequence),
]);
exports.snapshots = (0, pg_core_1.pgTable)("snapshots", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    aggregateType: (0, enums_1.aggregateTypeEnum)("aggregate_type").notNull(),
    aggregateId: (0, pg_core_1.uuid)("aggregate_id").notNull(),
    sequence: (0, pg_core_1.bigint)("sequence", { mode: "bigint" }).notNull(),
    state: (0, pg_core_1.jsonb)("state").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("snapshots_aggregate_id_sequence_unique").on(table.aggregateId, table.sequence),
]);
//# sourceMappingURL=events.js.map