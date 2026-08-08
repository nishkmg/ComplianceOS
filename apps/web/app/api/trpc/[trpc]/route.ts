import { auth } from "@/lib/auth";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const runtime = "nodejs";

let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db && process.env.DATABASE_URL) {
    db = drizzle(postgres(process.env.DATABASE_URL, { prepare: false }));
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
