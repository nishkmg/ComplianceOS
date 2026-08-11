// packages/server/src/routers/hsn-master.ts
// HSN master is a GLOBAL reference table (shared GSTN-style master, no
// tenant_id) — reads are open to all tenants; writes add to the shared
// catalog (unique code).
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, desc, like, or } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { hsnMaster } = _db;

export const hsnMasterRouter = router({
  list: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const conditions: ReturnType<typeof eq>[] = [];
      if (input.search) {
        conditions.push(or(
          like(hsnMaster.code, `%${input.search}%`),
          like(hsnMaster.description, `%${input.search}%`),
        ) as never);
      }
      const rows = await ctx.db
        .select()
        .from(hsnMaster)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(hsnMaster.effectiveFrom))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);
      return rows;
    }),

  create: protectedProcedure
    .input(z.object({
      code: z.string().min(2).max(8),
      description: z.string().min(1),
      gstRate: z.number().min(0).max(100).optional(),
      effectiveFrom: z.string().date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db.insert(hsnMaster).values({
        code: input.code,
        description: input.description,
        gstRate: input.gstRate != null ? String(input.gstRate) : null,
        effectiveFrom: input.effectiveFrom,
      }).returning();
      return row;
    }),

  deactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid(), effectiveTo: z.string().date() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .update(hsnMaster)
        .set({ effectiveTo: input.effectiveTo })
        .where(eq(hsnMaster.id, input.id))
        .returning();
      return row;
    }),
});
