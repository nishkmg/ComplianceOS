import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, desc } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { eventStore } = _db;

export const auditLogRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(500).default(100) }).optional())
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.select()
        .from(eventStore)
        .where(eq(eventStore.tenantId, ctx.tenantId))
        .orderBy(desc(eventStore.createdAt))
        .limit(input?.limit ?? 100);
      return rows;
    }),

  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db.select()
        .from(eventStore)
        .where(and(eq(eventStore.id, input), eq(eventStore.tenantId, ctx.tenantId)))
        .limit(1);
      if (!row) throw new Error("Audit entry not found");
      return row;
    }),
});
