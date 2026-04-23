// @ts-nocheck
import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as db from "../../../db/src/index";
const { accounts, accountTags } = db;
import { appendEvent } from "../lib/event-store";
import * as shared from "../../../shared/src/index";
const { CreateAccountInputSchema } = shared;

export async function createAccount(
  db: Database,
  tenantId: string,
  actorId: string,
  input: {
    code: string;
    name: string;
    kind: string;
    subType: string;
    parentId?: string;
    reconciliationAccount?: string;
    tags?: string[];
  },
): Promise<{ accountId: string }> {
  const validated = CreateAccountInputSchema.parse(input);

  const existing = await db.select({ id: accounts.id }).from(accounts).where(
    eq(accounts.code, validated.code),
  );
  if (existing.length > 0) {
    throw new Error(`Account code ${validated.code} already exists`);
  }

  const result = await db.transaction(async (tx) => {
    const account = await tx.insert(accounts).values({
      tenantId,
      code: validated.code,
      name: validated.name,
      kind: validated.kind,
      subType: validated.subType,
      parentId: validated.parentId,
      reconciliationAccount: validated.reconciliationAccount ?? "none",
    }).returning({ id: accounts.id });

    if (validated.tags && validated.tags.length > 0) {
      await tx.insert(accountTags).values(
        validated.tags.map((tag) => ({
          accountId: account[0].id,
          tag,
        })),
      );
    }

    await appendEvent(tx, tenantId, "account", account[0].id, "account_created", {
      accountId: account[0].id,
      code: validated.code,
      name: validated.name,
    }, actorId);

    return { accountId: account[0].id };
  });

  return result;
}
