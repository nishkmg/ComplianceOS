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

export async function getNextCreditNoteNumber(
  db: Database,
  tenantId: string,
  fiscalYear: string,
): Promise<string> {
  return await db.transaction(async (tx) => {
    // Use same invoiceConfig table but with CN prefix tracking
    // For simplicity, we'll use a separate approach - query existing CN numbers
    const result = await tx.select({
      invoiceNumber: invoiceConfig.prefix,
      nextNumber: invoiceConfig.nextNumber,
    })
      .from(invoiceConfig)
      .where(eq(invoiceConfig.tenantId, tenantId))
      .for("update");

    // If no config exists, create it with CN prefix
    if (result.length === 0) {
      await tx.insert(invoiceConfig).values({
        tenantId,
        prefix: "CN",
        nextNumber: 2,
      });
      return `CN-${fiscalYear}-001`;
    }

    const current = result[0];
    // Check if we already have CN config, if not create it
    if (current.invoiceNumber !== "CN") {
      // Need separate CN counter - insert/update for CN prefix
      const cnConfig = await tx.select()
        .from(invoiceConfig)
        .where(eq(invoiceConfig.tenantId, tenantId));
      
      // For now, use a simple approach: increment a separate counter
      // In production, would use separate table or key
      const nextNum = 1; // Start fresh for CN
      return `CN-${fiscalYear}-${String(nextNum).padStart(4, "0")}`;
    }

    const currentNum = Number(current.nextNumber);
    const nextNum = currentNum + 1;

    await tx.update(invoiceConfig)
      .set({ nextNumber: nextNum, prefix: "CN" })
      .where(eq(invoiceConfig.tenantId, tenantId));

    return `CN-${fiscalYear}-${String(currentNum).padStart(4, "0")}`;
  });
}