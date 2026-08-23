import type { Database } from "../../../db/src/index";
import * as _db from "../../../db/src/index";
const { tenants, userTenants, tenantModuleConfig, moduleEnum } = _db;

import { isValidPAN, isValidGSTIN } from "@complianceos/shared";

export interface BusinessProfileInput {
  name: string;
  legalName: string;
  businessType: string;
  industry: string;
  pan: string;
  gstin?: string;
  address: string;
  state: string;
  dateOfIncorporation?: string;
}

// Module activation matrix: businessType -> industry -> enabled modules
function getModuleActivationMatrix(businessType: string, industry: string): Record<string, boolean> {
  const allModules = ["accounting", "invoicing", "inventory", "payroll", "gst", "ocr", "itr"];

  const matrix: Record<string, string[]> = {
    "sole_proprietorship:trading": ["accounting", "invoicing", "inventory", "gst"],
    "sole_proprietorship:services": ["accounting", "invoicing", "gst"],
    "partnership:trading": ["accounting", "invoicing", "inventory", "gst"],
    "partnership:services": ["accounting", "invoicing", "gst"],
    "llp:services": ["accounting", "gst"],
    "private_limited:trading": ["accounting", "invoicing", "inventory", "payroll", "gst", "itr"],
    "private_limited:services": ["accounting", "invoicing", "inventory", "payroll", "gst", "itr"],
    "private_limited:manufacturing": ["accounting", "invoicing", "inventory", "payroll", "gst", "itr"],
    "huf:trading": ["accounting", "gst"],
    "regulated_professional:services": ["accounting", "gst"],
    "regulated_professional:retail_trading": ["accounting", "gst"],
    "regulated_professional:manufacturing": ["accounting", "gst"],
  };

  const key = `${businessType}:${industry}`;
  const enabledModules = new Set(matrix[key] ?? ["accounting"]);

  return Object.fromEntries(
    allModules.map((m) => [m, enabledModules.has(m)]),
  );
}

function validatePan(pan: string): void {
  const normalized = pan.trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized)) {
    throw new Error("Invalid PAN format: must match AAAAA9999A");
  }
  if (!isValidPAN(normalized)) {
    throw new Error("Invalid PAN entity type: 4th character must be one of P, C, H, F, A, T, B, L, J, G");
  }
}

function validateGstin(gstin: string): void {
  const normalized = gstin.trim().toUpperCase();
  if (!/^[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9A-Z]{1}$/.test(normalized)) {
    throw new Error("Invalid GSTIN format: must be 15 characters in format 11AAAAA1111A1Z1");
  }
  if (!isValidGSTIN(normalized)) {
    throw new Error("Invalid GSTIN checksum");
  }
}

export async function createTenant(
  db: Database,
  actorId: string,
  input: BusinessProfileInput,
): Promise<{ tenantId: string }> {
  // 1. Validate PAN format
  validatePan(input.pan);

  // 2. Validate GSTIN format if provided
  if (input.gstin && input.gstin !== "") {
    validateGstin(input.gstin);
  }

  // 3. Create tenant, link user, and set up modules in a transaction
  const result = await db.transaction(async (tx) => {
    const [tenant] = await tx.insert(tenants).values({
      name: input.name,
      legalName: input.legalName,
      businessType: input.businessType as "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf",
      pan: input.pan.trim().toUpperCase(),
      gstin: (input.gstin || "").trim().toUpperCase() || null,
      address: input.address,
      state: input.state as "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chhattisgarh" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jharkhand" | "karnataka" | "kerala" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal" | "andaman_nicobar" | "chandigarh" | "dadra_nagar_haveli_daman_diu" | "delhi" | "jammu_kashmir" | "ladakh" | "lakshadweep" | "puducherry",
      industry: input.industry as "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional",
      dateOfIncorporation: input.dateOfIncorporation ?? null,
      gstRegistration: "none",
      onboardingStatus: "in_progress",
      onboardingData: { businessProfile: input },
      gstConfig: {},
    }).returning({ id: tenants.id });

    const tenantId = tenant.id;

    // 4. Link user to tenant with 'owner' role
    await tx.insert(userTenants).values({
      userId: actorId,
      tenantId,
      role: "owner",
    });

    // 5. Set up module config for all modules
    const moduleActivation = getModuleActivationMatrix(input.businessType, input.industry);

    const moduleConfigs = Object.entries(moduleActivation).map(([mod, enabled]) => ({
      tenantId,
      module: mod as (typeof moduleEnum.enumValues)[number],
      enabled: enabled ? "true" : "false",
      setBy: "auto" as const,
    }));

    await tx.insert(tenantModuleConfig).values(moduleConfigs);

    return { tenantId };
  });

  return result;
}
