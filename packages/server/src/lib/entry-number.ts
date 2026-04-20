import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { entryNumberCounters } from "@complianceos/db";
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
      const nextVal = 1n;
      await tx.insert(entryNumberCounters).values({
        tenantId,
        fiscalYear,
        nextVal: nextVal + 1n,
      });
      return `JE-${fiscalYear}-${String(nextVal).padStart(3, "0")}`;
    }

    const current = counter[0];
    await tx.update(entryNumberCounters)
      .set({ nextVal: sql`${entryNumberCounters.nextVal} + 1` })
      .where(eq(entryNumberCounters.id, current.id));

    const num = current.nextVal;
    return `JE-${fiscalYear}-${String(num).padStart(3, "0")}`;
  });
}
