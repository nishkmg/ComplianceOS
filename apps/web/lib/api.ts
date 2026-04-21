import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@complianceos/server";

export const api: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();
