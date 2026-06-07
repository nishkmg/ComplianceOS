import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { users, tenants, userTenants } = _db;
import { randomUUID } from "crypto";

type BootstrapTenantInput = {
  email: string;
  passwordHash: string;
  name: string;
};

export async function bootstrapTenant(
  db: Database,
  input: BootstrapTenantInput,
): Promise<{ userId: string; tenantId: string }> {
  const emailNorm = input.email.toLowerCase().trim();

  const existing = await db.select({ id: users.id }).from(users).where(
    eq(users.email, emailNorm),
  ).limit(1);

  if (existing.length > 0) {
    throw new Error("An account with this email already exists");
  }

  const userId = randomUUID();
  const tenantId = randomUUID();
  const displayName = input.name || emailNorm.split("@")[0];

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id: userId,
      email: emailNorm,
      name: displayName,
      passwordHash: input.passwordHash,
    });

    await tx.insert(tenants).values({
      id: tenantId,
      name: `${displayName}'s Company`,
      pan: "TEMP-PAN",
      address: "To be updated",
      state: "maharashtra",
    });

    await tx.insert(userTenants).values({
      userId,
      tenantId,
      role: "owner",
    });
  });

  return { userId, tenantId };
}
