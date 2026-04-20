import type { Database } from "@complianceos/db";
import { tenants, userTenants, tenantModuleConfig, moduleEnum } from "@complianceos/db";
import type { BusinessProfileInput } from "@complianceos/shared";

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
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    throw new Error("PAN must match AAAAA9999A format");
  }
}

function validateGstin(gstin: string): void {
  if (!/^[0-9]{2}[A-Z]{4}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/.test(gstin)) {
    throw new Error("GSTIN must be 15 characters in format 11AAAAA1111A1Z1A");
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
      pan: input.pan,
      gstin: input.gstin || null,
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
