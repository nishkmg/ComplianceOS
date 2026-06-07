import type { Database } from "@complianceos/db";
import { validateEnv } from "@complianceos/shared/lib/env";

validateEnv();

export { uploadFile, getFilePath } from "./services/file-upload";
export { appRouter } from "./routers/index";
export type { AppRouter } from "./routers/index";
export { router, publicProcedure, protectedProcedure, t } from "./trpc";
export type { Context } from "./trpc";
