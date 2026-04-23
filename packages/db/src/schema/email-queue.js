"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.emailQueue = (0, pg_core_1.pgTable)("email_queue", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenantId: (0, pg_core_1.uuid)("tenant_id").notNull(),
    to: (0, pg_core_1.text)("to").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    body: (0, pg_core_1.text)("body").notNull(),
    attachments: (0, pg_core_1.jsonb)("attachments").$type().default([]),
    status: (0, pg_core_1.text)("status", { enum: ["pending", "sent", "failed"] }).notNull().default("pending"),
    retryCount: (0, pg_core_1.integer)("retry_count").notNull().default(0),
    errorMessage: (0, pg_core_1.text)("error_message"),
    scheduledAt: (0, pg_core_1.timestamp)("scheduled_at", { withTimezone: true }).notNull(),
    sentAt: (0, pg_core_1.timestamp)("sent_at", { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
});
//# sourceMappingURL=email-queue.js.map