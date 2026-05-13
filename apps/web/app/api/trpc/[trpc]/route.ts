export const runtime = "nodejs";

const handler = async (req: Request) => {
  const { fetchRequestHandler } = await import("@trpc/server/adapters/fetch");
  const { appRouter } = await import("@complianceos/server");
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      db: {} as any,
      session: null,
      tenantId: "",
    }),
  });
};

export { handler as GET, handler as POST };
