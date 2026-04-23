// @ts-nocheck
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { entryNumberCounters } = _db;
import { sql } from "drizzle-orm";

export async function getNextEntryNumber(
  db: Database,
  tenantId: string,
  fiscalYear: string,
): Promise<string> {
  return await db.transaction(async (tx) => {
    const counter = await tx.select()
      .from(entryNumberCounters)
      .where(and(
        eq(entryNumberCounters.tenantId, tenantId),
        eq(entryNumberCounters.fiscalYear, fiscalYear),
      ))
      .for("update");

    if (counter.length === 0) {
      await tx.insert(entryNumberCounters).values({
        tenantId,
        fiscalYear,
        nextVal: "2",
      });
      return `JE-${fiscalYear}-001`;
    }

    const current = counter[0];
    const currentNum = parseInt(current.nextVal, 10);
    const nextNum = currentNum + 1;

    await tx.update(entryNumberCounters)
      .set({ nextVal: String(nextNum) })
      .where(eq(entryNumberCounters.id, current.id));

    return `JE-${fiscalYear}-${String(currentNum).padStart(3, "0")}`;
  });
}
