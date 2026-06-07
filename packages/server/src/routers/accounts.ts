import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { createAccount } from "../commands/create-account";
import { modifyAccount } from "../commands/modify-account";
import { deactivateAccount } from "../commands/deactivate-account";
import { eq, and } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { accounts } = _db;
import * as shared from "../../../shared/src/index";
const { CreateAccountInputSchema } = shared;

export const accountsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(accounts).where(eq(accounts.tenantId, ctx.tenantId));
  }),

  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.select().from(accounts).where(
      and(eq(accounts.id, input.id), eq(accounts.tenantId, ctx.tenantId)),
    );
    return result[0] ?? null;
  }),

  create: protectedProcedure
    .input(CreateAccountInputSchema)
    .mutation(async ({ ctx, input }) => {
      return createAccount(ctx.db, ctx.tenantId, ctx.session!.user.id, input as Parameters<typeof createAccount>[3]);
    }),

  modify: protectedProcedure
    .input(z.object({ id: z.string().uuid(), name: z.string().optional(), parentId: z.string().uuid().optional() }))
    .mutation(async ({ ctx, input }) => {
      return modifyAccount(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id, input);
    }),

  deactivate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return deactivateAccount(ctx.db, ctx.tenantId, input.id, ctx.session!.user.id);
    }),
});
