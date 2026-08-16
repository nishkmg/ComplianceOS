import { eq, and, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";
const { entryNumberCounters } = _db;
import type { DbOrTx } from "./event-store";

export async function getNextEntryNumber(
  db: DbOrTx,
  tenantId: string,
  fiscalYear: string,
): Promise<string> {
  const allocate = async (executor: DbOrTx) => {
    const counter = await executor.select()
      .from(entryNumberCounters)
      .where(and(
        eq(entryNumberCounters.tenantId, tenantId),
        eq(entryNumberCounters.fiscalYear, fiscalYear),
      ))
      .for("update");

    if (counter.length === 0) {
      await executor.insert(entryNumberCounters).values({
        tenantId,
        fiscalYear,
        nextVal: "2",
      });
      return `JE-${fiscalYear}-001`;
    }

    const current = counter[0];
    const currentNum = parseInt(current.nextVal, 10);
    const nextNum = currentNum + 1;

    await executor.update(entryNumberCounters)
      .set({ nextVal: String(nextNum) })
      .where(eq(entryNumberCounters.id, current.id));

    return `JE-${fiscalYear}-${String(currentNum).padStart(3, "0")}`;
  };

  if (!("$client" in db)) {
    // Already inside a caller-owned transaction — reuse it (no nesting).
    return allocate(db);
  }
  return db.transaction((tx) => allocate(tx));
}
