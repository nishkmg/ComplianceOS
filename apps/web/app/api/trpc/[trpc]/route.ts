import { auth } from "@/lib/auth";

export const runtime = "nodejs";

let db: any = null;

function getDb() {
  if (!db && process.env.DATABASE_URL) {
    // Dynamically import to avoid build-time evaluation
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { drizzle } = require("drizzle-orm/postgres-js");
    const postgres = require("postgres");
    const queryClient = postgres(process.env.DATABASE_URL, { prepare: false });
    db = drizzle(queryClient);
  }
  return db;
}

const handler = async (req: Request) => {
  const { fetchRequestHandler } = await import("@trpc/server/adapters/fetch");
  const { appRouter } = await import("@complianceos/server");
  const session = await auth();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      db: getDb() || ({} as any),
      session: session
        ? { user: { id: session.user?.id || "", tenantId: "" } }
        : null,
      tenantId: "",
    }),
  });
};

export { handler as GET, handler as POST };
