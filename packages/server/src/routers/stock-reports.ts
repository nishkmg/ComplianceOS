// @ts-nocheck
// packages/server/src/routers/stock-reports.ts
import { z } from "zod";
import { router, protectedProcedure } from "../index";
import { getStockSummary } from "../services/fifo-valuation";

export const stockReportsRouter = router({
  stockSummary: protectedProcedure
    .input(z.object({
      productId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { tenantId } = ctx.session!.user;
      return getStockSummary(ctx.db, tenantId, input.productId);
    }),
  
  valuationReport: protectedProcedure
    .query(async ({ ctx }) => {
      const { tenantId } = ctx.session!.user;
      return getStockSummary(ctx.db, tenantId);
    }),
  
  agingReport: protectedProcedure
    .query(async ({ ctx }) => {
      // V2: Implement slow-moving stock aging
      // For now, return empty array
      return { items: [] };
    }),
});
