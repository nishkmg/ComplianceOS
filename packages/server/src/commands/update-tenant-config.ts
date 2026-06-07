import { eq } from "drizzle-orm";
import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { tenants } = _db;
import { INDIAN_STATES, getStateName } from "@complianceos/shared";

export type UpdateTenantConfigInput = {
  stateCode?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bsrCode?: string;
};

export async function updateTenantConfig(
  db: Database,
  tenantId: string,
  input: UpdateTenantConfigInput,
): Promise<{ tenantId: string; stateCode: string | null; bankAccount: string | null; bsrCode: string | null }> {
  if (input.stateCode !== undefined) {
    if (!getStateName(input.stateCode)) {
      throw new Error(`Invalid state code: ${input.stateCode}. Must be one of: ${INDIAN_STATES.map((s) => s.code).join(", ")}`);
    }
  }
  if (input.bankAccount !== undefined && input.bankAccount !== null && input.bankAccount !== "") {
    if (!/^\d{9,18}$/.test(input.bankAccount)) {
      throw new Error("bankAccount must be 9-18 digits");
    }
  }
  if (input.bsrCode !== undefined && input.bsrCode !== null && input.bsrCode !== "") {
    if (!/^\d{7}$/.test(input.bsrCode)) {
      throw new Error("bsrCode must be 7 digits");
    }
  }
  if (input.bankIfsc !== undefined && input.bankIfsc !== null && input.bankIfsc !== "") {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(input.bankIfsc)) {
      throw new Error("bankIfsc must match AAAA0XXXXXX format");
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.stateCode !== undefined) updateData.stateCode = input.stateCode;
  if (input.bankAccount !== undefined) updateData.bankAccount = input.bankAccount || null;
  if (input.bankIfsc !== undefined) updateData.bankIfsc = input.bankIfsc || null;
  if (input.bsrCode !== undefined) updateData.bsrCode = input.bsrCode || null;

  const [updated] = await db.update(tenants).set(updateData).where(eq(tenants.id, tenantId)).returning({
    id: tenants.id,
    stateCode: tenants.stateCode,
    bankAccount: tenants.bankAccount,
    bsrCode: tenants.bsrCode,
  });

  if (!updated) {
    throw new Error("Tenant not found");
  }

  return {
    tenantId: updated.id,
    stateCode: updated.stateCode,
    bankAccount: updated.bankAccount,
    bsrCode: updated.bsrCode,
  };
}

export async function getTenantStateCode(db: Database, tenantId: string): Promise<string> {
  const [t] = await db.select({ stateCode: tenants.stateCode }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!t?.stateCode) {
    throw new Error("Tenant state code not configured. Set via updateTenantConfig.");
  }
  return t.stateCode;
}
