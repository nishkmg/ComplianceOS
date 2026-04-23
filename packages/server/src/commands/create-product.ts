// @ts-nocheck
// packages/server/src/commands/create-product.ts
import { eq, and } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { products, productTaxCategories } = _db;
import * as _shared from "../../../shared/src/index";
const { CreateProductInputSchema } = _shared;
import { getGstRateForHsn } from "../services/hsn-gst-mapping";

export async function createProduct(
  db: Database,
  tenantId: string,
  input: {
    sku: string;
    name: string;
    description?: string;
    hsnCode: string;
    unitOfMeasure?: string;
    purchaseRate?: number;
    salesRate?: number;
    gstRate?: number;
  },
): Promise<{ productId: string }> {
  const validated = CreateProductInputSchema.parse(input);
  
  // Check for duplicate SKU
  const existing = await db.select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.tenantId, tenantId),
        eq(products.sku, validated.sku)
      )
    );
  
  if (existing.length > 0) {
    throw new Error(`Product with SKU ${validated.sku} already exists`);
  }
  
  // Auto-detect GST rate from HSN if not provided
  const gstRate = validated.gstRate ?? getGstRateForHsn(validated.hsnCode);
  
  const [product] = // -ignore - drizzle type
          await db.insert(products).values({
    tenantId,
    sku: validated.sku,
    name: validated.name,
    description: validated.description ?? null,
    hsnCode: validated.hsnCode,
    unitOfMeasure: validated.unitOfMeasure ?? "nos",
    purchaseRate: validated.purchaseRate ? String(validated.purchaseRate) : null,
    salesRate: validated.salesRate ? String(validated.salesRate) : null,
    gstRate: String(gstRate),
  }).returning();
  
  // Create/update tax category mapping
  // -ignore - drizzle type
          await db.insert(productTaxCategories).values({
    tenantId,
    hsnCode: validated.hsnCode,
    gstRate: String(gstRate),
    description: `${validated.name} (${validated.sku})`,
  }).onConflictDoUpdate({
    target: [productTaxCategories.tenantId, productTaxCategories.hsnCode],
    set: { gstRate: String(gstRate) },
  });
  
  return { productId: product.id };
}
