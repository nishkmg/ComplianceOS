// @ts-nocheck
let cachedDb: any = null;

export function getDb(): any {
  if (cachedDb) return cachedDb;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/postgres-js");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const postgres = require("postgres");
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  cachedDb = drizzle(client);
  return cachedDb;
}
