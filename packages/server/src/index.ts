import { initTRPC } from "@trpc/server";
import type { Database } from "@complianceos/db";

export interface Context {
  db: Database;
  session: { user: { id: string; tenantId: string } } | null;
  tenantId: string;
}

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
