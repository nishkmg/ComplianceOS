// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { accounts } = _db;
import { appendEvent } from "../lib/event-store";

export async function deactivateAccount(
  db: Database,
  tenantId: string,
  accountId: string,
  actorId: string,
): Promise<void> {
  const account = await db.select().from(accounts).where(
    and(eq(accounts.id, accountId), eq(accounts.tenantId, tenantId)),
  );

  if (account.length === 0) throw new Error("Account not found");
  if (!account[0].isActive) throw new Error("Account is already inactive");

  await db.transaction(async (tx) => {
    await tx.update(accounts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(accounts.id, accountId));

    await appendEvent(tx, tenantId, "account", accountId, "account_deactivated", {
      accountId,
    }, actorId);
  });
}
