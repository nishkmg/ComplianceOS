import { eq, and } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { payrollAdvances } from "@complianceos/db";
import { appendEvent } from "../lib/event-store";

export async function cancelAdvance(
  db: Database,
  tenantId: string,
  actorId: string,
  advanceId: string,
): Promise<{ advanceId: string }> {
  const [advance] = await db.select()
    .from(payrollAdvances)
    .where(
      and(
        eq(payrollAdvances.tenantId, tenantId),
        eq(payrollAdvances.id, advanceId)
      )
    );

  if (!advance) {
    throw new Error("Advance not found");
  }

  if (advance.status === "fully_recovered") {
    throw new Error("Cannot cancel a fully recovered advance");
  }

  if (advance.status === "cancelled") {
    throw new Error("Advance is already cancelled");
  }

  if ((advance.deductedInstallments ?? 0) > 0) {
    throw new Error("Cannot cancel advance with recoveries already made");
  }

  await db.update(payrollAdvances)
    .set({
      status: "cancelled",
    })
    .where(eq(payrollAdvances.id, advanceId));

  await appendEvent(
    db,
    tenantId,
    "employee_advance",
    advanceId,
    "advance_cancelled",
    {
      advanceId,
      cancelledAt: new Date(),
    },
    actorId,
  );

  return { advanceId };
}
