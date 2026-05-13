// @ts-nocheck
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { createFiscalYear } from "../commands/create-fiscal-year";
import { closeFiscalYear } from "../commands/close-fiscal-year";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { fiscalYears } = _db;

export const fiscalYearsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(fiscalYears).where(eq(fiscalYears.tenantId, ctx.tenantId));
  }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(fiscalYears).where(
      and(eq(fiscalYears.id, input.id), eq(fiscalYears.tenantId, ctx.tenantId)),
    );
    return result[0] ?? null;
  }),

  create: protectedProcedure
    .input(z.object({ year: z.string(), startDate: z.string(), endDate: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return createFiscalYear(ctx.db, ctx.tenantId, ctx.session.user.id, input.year, input.startDate, input.endDate);
    }),

  close: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return closeFiscalYear(ctx.db, ctx.tenantId, input.id, ctx.session.user.id);
    }),
});
