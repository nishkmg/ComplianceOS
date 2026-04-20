import { z } from "zod";
import { router, publicProcedure } from "../index";
import { createAccount } from "../commands/create-account";
import { modifyAccount } from "../commands/modify-account";
import { deactivateAccount } from "../commands/deactivate-account";
import { eq, and } from "drizzle-orm";
import { accounts } from "@complianceos/db";

export const accountsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(accounts).where(eq(accounts.tenantId, ctx.tenantId));
  }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(accounts).where(
      and(eq(accounts.id, input.id), eq(accounts.tenantId, ctx.tenantId)),
    );
    return result[0] ?? null;
  }),

  create: publicProcedure
    .input(z.object({
      code: z.string(),
      name: z.string(),
      kind: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
      subType: z.string(),
      parentId: z.string().uuid().optional(),
      reconciliationAccount: z.enum(["bank", "none"]).default("none"),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return createAccount(ctx.db, ctx.tenantId, ctx.session!.user.id, input);
    }),

  modify: publicProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().optional(), parentId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      return modifyAccount(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id, input);
    }),

  deactivate: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return deactivateAccount(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),
});
