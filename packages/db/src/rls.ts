import { sql } from "drizzle-orm";
import type { Database } from "./index";

export async function setTenantContext(db: Database, tenantId: string): Promise<void> {
  await db.execute(sql`SET LOCAL app.tenant_id = ${tenantId}`);
}

export async function withTenantContext<R>(
  db: Database,
  tenantId: string,
  fn: () => Promise<R>,
): Promise<R> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.tenant_id = ${tenantId}`);
    return fn();
  });
}
