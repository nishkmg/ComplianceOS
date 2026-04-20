import { z } from "zod";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../index";
import { tenants } from "@complianceos/db";
import {
  BusinessProfileInputSchema,
  CoARefinementsInputSchema,
  OpeningBalancesInputSchema,
} from "@complianceos/shared";
import { createTenant } from "../commands/create-tenant";
import { seedCoa } from "../commands/seed-coa";
import { setupOpeningBalances } from "../commands/setup-opening-balances";

export const onboardingRouter = router({
  /**
   * Step 1 – Create the tenant record.
   * Requires an authenticated user.
   */
  createTenant: protectedProcedure
    .input(BusinessProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { tenantId } = await createTenant(ctx.db, ctx.session.user.id, input);
      return { tenantId };
    }),

  /**
   * Step 2 – Seed the Chart of Accounts from the default template,
   * optionally customized via refinements.
   */
  seedCoa: protectedProcedure
    .input(z.object({
      tenantId: z.string().uuid(),
      businessType: z.string(),
      industry: z.string(),
      refinements: CoARefinementsInputSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { accountCount } = await seedCoa(
        input.tenantId,
        input.businessType,
        input.industry,
        input.refinements,
      );
      return { accountCount };
    }),

  /**
   * Step 3 – Set up opening balances (fresh_start or migration mode).
   * Creates a posted journal entry with the balance lines.
   */
  setupOpeningBalances: protectedProcedure
    .input(z.object({
      tenantId: z.string().uuid(),
      fiscalYear: z.string(),
      input: OpeningBalancesInputSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await setupOpeningBalances(
        input.tenantId,
        ctx.session.user.id,
        input.fiscalYear,
        input.input,
      );
      return result;
    }),

  /**
   * Save incremental onboarding progress to tenants.onboarding_data (JSONB).
   * Merges the step payload into the existing JSON.
   */
  saveProgress: protectedProcedure
    .input(z.object({
      tenantId: z.string().uuid(),
      step: z.number().int().min(1).max(5),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ onboardingData: tenants.onboardingData })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId));

      const current = existing[0]?.onboardingData ?? {};

      await ctx.db
        .update(tenants)
        .set({ onboardingData: { ...current, ...input.data } })
        .where(eq(tenants.id, input.tenantId));

      return { success: true };
    }),

  /**
   * Read back the full onboarding state for a tenant.
   */
  getProgress: protectedProcedure
    .input(z.object({ tenantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db
        .select({
          onboardingStatus: tenants.onboardingStatus,
          onboardingData: tenants.onboardingData,
          gstConfig: tenants.gstConfig,
        })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId));

      if (!row[0]) {
        return {
          currentStep: 1,
          completedSteps: [] as number[],
          data: {} as Record<string, unknown>,
          onboardingStatus: "in_progress",
          gstConfig: {} as Record<string, unknown>,
        };
      }

      const data = (row[0].onboardingData ?? {}) as Record<string, unknown>;
      const completedSteps: number[] = [];
      if (data.businessProfile) completedSteps.push(1);
      if (data.coa) completedSteps.push(2);
      if (data.openingBalances) completedSteps.push(3);
      if (data.fyGst) completedSteps.push(4);
      if (data.moduleActivation) completedSteps.push(5);

      const currentStep = completedSteps.length === 5
        ? 5
        : ([1, 2, 3, 4, 5].find((s) => !completedSteps.includes(s)) ?? 1);

      return {
        currentStep,
        completedSteps,
        data,
        onboardingStatus: (row[0].onboardingStatus ?? "in_progress") as string,
        gstConfig: (row[0].gstConfig ?? {}) as Record<string, unknown>,
      };
    }),

  /**
   * Mark onboarding as complete and persist GST config.
   */
  completeOnboarding: protectedProcedure
    .input(z.object({ tenantId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db
        .select({ onboardingData: tenants.onboardingData })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId));

      const onboardingData = (row[0]?.onboardingData ?? {}) as Record<string, unknown>;
      const gstConfig = (onboardingData.fyGst ?? {}) as Record<string, unknown>;

      await ctx.db
        .update(tenants)
        .set({
          onboardingStatus: "complete",
          gstConfig,
        })
        .where(eq(tenants.id, input.tenantId));

      return { success: true };
    }),
});
