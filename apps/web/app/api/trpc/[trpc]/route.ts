import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@complianceos/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      db: {} as any,
      session: null,
      tenantId: "",
    }),
  });

export { handler as GET, handler as POST };
