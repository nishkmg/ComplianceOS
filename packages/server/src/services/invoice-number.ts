import { eq } from "drizzle-orm";
import type { Database } from "@complianceos/db";
import { invoiceConfig } from "@complianceos/db";

export async function getNextInvoiceNumber(
  db: Database,
  tenantId: string,
  fiscalYear: string,
): Promise<string> {
  return await db.transaction(async (tx) => {
    const config = await tx.select()
      .from(invoiceConfig)
      .where(eq(invoiceConfig.tenantId, tenantId))
      .for("update");

    if (config.length === 0) {
      // Create default config if not exists
      await tx.insert(invoiceConfig).values({
        tenantId,
        prefix: "INV",
        nextNumber: 2,
      });
      return `INV-${fiscalYear}-001`;
    }

    const current = config[0];
    const currentNum = Number(current.nextNumber);
    const nextNum = currentNum + 1;

    await tx.update(invoiceConfig)
      .set({ nextNumber: nextNum })
      .where(eq(invoiceConfig.id, current.id));

    return `${current.prefix}-${fiscalYear}-${String(currentNum).padStart(3, "0")}`;
  });
}