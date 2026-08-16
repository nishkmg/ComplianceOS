import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { tenants } = _db;
import { updateTenantConfig } from "../commands/update-tenant-config";
import { INDIAN_STATES, getStateName, isUT } from "@complianceos/shared";

const UpdateConfigSchema = z.object({
  stateCode: z.string().length(2).optional(),
  bankAccount: z.string().regex(/^\d{9,18}$/).optional(),
  bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(),
  bsrCode: z.string().regex(/^\d{7}$/).optional(),
});

export const tenantConfigRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const [t] = await ctx.db.select({
      id: tenants.id,
      name: tenants.name,
      legalName: tenants.legalName,
      stateCode: tenants.stateCode,
      bankAccount: tenants.bankAccount,
      bankIfsc: tenants.bankIfsc,
      bsrCode: tenants.bsrCode,
      pan: tenants.pan,
      gstin: tenants.gstin,
      plan: tenants.plan,
      planStatus: tenants.planStatus,
    }).from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1);

    if (!t) {
      throw new Error("Tenant not found");
    }

    return {
      ...t,
      stateName: t.stateCode ? getStateName(t.stateCode) ?? null : null,
      stateType: t.stateCode ? (isUT(t.stateCode) ? "ut" : "state") : null,
    };
  }),

  update: protectedProcedure
    .input(UpdateConfigSchema)
    .mutation(async ({ ctx, input }) => {
      return updateTenantConfig(ctx.db, ctx.tenantId, input);
    }),

  listStates: protectedProcedure.query(() => {
    return INDIAN_STATES;
  }),
});
