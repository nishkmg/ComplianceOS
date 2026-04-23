// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { accounts } = _db;
import { appendEvent } from "../lib/event-store";

export async function modifyAccount(
  db: Database,
  tenantId: string,
  accountId: string,
  actorId: string,
  input: { name?: string; parentId?: string },
): Promise<void> {
  const account = await db.select().from(accounts).where(
    and(eq(accounts.id, accountId), eq(accounts.tenantId, tenantId)),
  );

  if (account.length === 0) throw new Error("Account not found");

  await db.transaction(async (tx) => {
    await tx.update(accounts)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(accounts.id, accountId));

    await appendEvent(tx, tenantId, "account", accountId, "account_modified", {
      accountId,
      ...input,
    }, actorId);
  });
}
