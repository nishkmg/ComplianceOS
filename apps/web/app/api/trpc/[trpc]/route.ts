import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@complianceos/server";
import { db } from "@complianceos/db";
import { auth } from "@/lib/auth";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const session = await auth();
      
      if (!session?.user) {
        return { db, session: null, tenantId: "" };
      }

      return {
        db,
        session: {
          user: {
            id: session.user.id,
            tenantId: (session.user as any).tenantId ?? "",
          },
        },
        tenantId: (session.user as any).tenantId ?? "",
      };
    },
  });

export { handler as GET, handler as POST };
