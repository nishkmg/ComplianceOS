import { z } from "zod";
import { router, publicProcedure } from "../index";
import { createFiscalYear } from "../commands/create-fiscal-year";

export const onboardingRouter = router({
  seedBusiness: publicProcedure
    .input(z.object({
      businessName: z.string(),
      businessType: z.string(),
      pan: z.string(),
      gstin: z.string().optional(),
      state: z.string(),
      industry: z.string(),
      fiscalYearStart: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, tenantId: ctx.tenantId };
    }),
});
