"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTenants = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const enums_1 = require("./enums");
const tenants_1 = require("./tenants");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    name: (0, pg_core_1.text)("name"),
    imageUrl: (0, pg_core_1.text)("image_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
});
exports.userTenants = (0, pg_core_1.pgTable)("user_tenants", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(() => exports.users.id),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull().references(() => tenants_1.tenants.id),
    role: (0, enums_1.roleEnum)("role").notNull().default("owner"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    userTenantUnique: { fields: [table.userId, table.tenantId], name: "user_tenants_user_id_tenant_id_unique" },
}));
//# sourceMappingURL=users.js.map