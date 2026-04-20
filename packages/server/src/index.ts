import { initTRPC, TRPCError } from "@trpc/server";
import type { Database } from "@complianceos/db";
export { uploadFile, getFilePath } from "./services/file-upload";

export interface Context {
  db: Database;
  session: { user: { id: string; tenantId: string } } | null;
  tenantId: string;
}

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

/** Protected procedure — requires authenticated session */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as { user: { id: string; tenantId: string } },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
