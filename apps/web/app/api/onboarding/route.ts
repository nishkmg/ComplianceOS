import { eq, sql } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import { db, tenants, accounts, userTenants, tenantModuleConfig } from "@complianceos/db";

export const runtime = "nodejs";

const STATE_MAP: Record<string, string> = {
  jammu_and_kashmir: "jammu_kashmir",
  ladakh: "ladakh",
  andaman_and_nicobar_islands: "andaman_nicobar",
  dadra_and_nagar_haveli: "dadra_nagar_haveli_daman_diu",
  daman_and_diu: "dadra_nagar_haveli_daman_diu",
};

function mapState(s: string): string {
  return STATE_MAP[s] || s;
}

async function mergeOnboardingData(tenantId: string, updates: Record<string, unknown>): Promise<void> {
  const [t] = await db
    .select({ onboardingData: tenants.onboardingData })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  if (!t) throw new Error("Tenant not found");
  const merged = { ...(t.onboardingData as Record<string, unknown>), ...updates };
  await db.update(tenants).set({ onboardingData: merged }).where(eq(tenants.id, tenantId));
}

// Module activation shape the client expects: array of { module, enabled: "true"|"false" }
function moduleActivationFromData(data: Record<string, unknown>): Array<{ module: string; enabled: string }> {
  const raw = data.moduleActivation;
  if (Array.isArray(raw)) return raw as Array<{ module: string; enabled: string }>;
  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([module, enabled]) => ({
      module,
      enabled: enabled ? "true" : "false",
    }));
  }
  return [];
}

// ─── GET: fetch onboarding state ──────────────────────────────────────
async function requireMembership(req: Request, tenantId: string | null): Promise<{ userId: string; tenantId: string }> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) throw new Error("Unauthorized");
  if (!tenantId) throw new Error("tenantId is required");
  const [membership] = await db
    .select({ userId: userTenants.userId })
    .from(userTenants)
    .where(sql`${userTenants.userId} = ${token.sub}::uuid AND ${userTenants.tenantId} = ${tenantId}::uuid`)
    .limit(1);
  if (!membership) throw new Error("Unauthorized");
  return { userId: token.sub, tenantId };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tenantId = url.searchParams.get("tenantId");
    if (!tenantId) {
      return Response.json({ error: "tenantId query param required" }, { status: 400 });
    }
    try {
      await requireMembership(req, tenantId);
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [t] = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        legalName: tenants.legalName,
        businessType: tenants.businessType,
        pan: tenants.pan,
        gstin: tenants.gstin,
        address: tenants.address,
        state: tenants.state,
        industry: tenants.industry,
        dateOfIncorporation: tenants.dateOfIncorporation,
        onboardingStatus: tenants.onboardingStatus,
        onboardingData: tenants.onboardingData,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);
    if (!t) {
      return Response.json({ error: "Tenant not found" }, { status: 404 });
    }

    const onboardingData: Record<string, unknown> = (t.onboardingData as Record<string, unknown>) || {};

    // Prefer explicit tenant_module_config rows; fall back to onboarding_data.moduleActivation
    const moduleRows = await db
      .select({ module: tenantModuleConfig.module, enabled: tenantModuleConfig.enabled })
      .from(tenantModuleConfig)
      .where(eq(tenantModuleConfig.tenantId, tenantId));
    const modules =
      moduleRows.length > 0
        ? moduleRows.map((r) => ({ module: r.module, enabled: r.enabled }))
        : moduleActivationFromData(onboardingData);

    // Real chart of accounts for steps 4 (review) + 6 (opening balances) —
    // the wizard was rendering hardcoded trees against an empty ledger.
    const accountRows = await db
      .select({ id: accounts.id, code: accounts.code, name: accounts.name, kind: accounts.kind, subType: accounts.subType, isLeaf: accounts.isLeaf })
      .from(accounts)
      .where(eq(accounts.tenantId, tenantId))
      .orderBy(accounts.code);

    return Response.json({
      tenantId: t.id,
      accounts: accountRows,
      onboardingStatus: t.onboardingStatus || "in_progress",
      currentStep: (onboardingData.current_step as number) || 1,
      businessProfile: {
        name: t.name || "",
        legalName: t.legalName || "",
        businessType: t.businessType || "",
        pan: t.pan || "",
        gstin: t.gstin || "",
        address: t.address || "",
        state: t.state || "",
        industry: t.industry || "",
        dateOfIncorporation: t.dateOfIncorporation || "",
      },
      moduleActivation: modules,
      onboardingData,
    });
  } catch (err: any) {
    console.error("[onboarding] GET error:", err.message);
    return Response.json({ error: err.message || "Failed to fetch state" }, { status: 500 });
  }
}

// ─── POST: submit step data or save progress ──────────────────────────
export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { step, tenantId, data } = body;
    if (typeof tenantId !== "string" || tenantId.length < 1) {
      return Response.json({ error: "tenantId is required" }, { status: 400 });
    }
    if (typeof step !== "number") {
      return Response.json({ error: "step is required" }, { status: 400 });
    }
    try {
      await requireMembership(req, tenantId);
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const d = (data as Record<string, unknown>) || {};

    if (step === 0) {
      await mergeOnboardingData(tenantId, { current_step: (d.currentStep as number) || 1 });
      return Response.json({ success: true });
    }

    if (step < 1 || step > 6) {
      return Response.json({ error: "step must be 0-6" }, { status: 400 });
    }

    switch (step) {
      case 1: {
        if (!d.name || !d.pan || !d.address || !d.state || !d.industry || !d.businessType) {
          return Response.json(
            { error: "Missing required fields: name, pan, address, state, industry, businessType" },
            { status: 400 }
          );
        }
        await db
          .update(tenants)
          .set({
            name: String(d.name),
            legalName: (d.legalName as string) || String(d.name),
            businessType: sql`${String(d.businessType)}`,
            pan: String(d.pan).toUpperCase(),
            gstin: d.gstin ? String(d.gstin).toUpperCase() : null,
            address: String(d.address),
            state: sql`${mapState(String(d.state))}`,
            industry: sql`${String(d.industry)}`,
            dateOfIncorporation: d.dateOfIncorporation ? String(d.dateOfIncorporation) : null,
          })
          .where(eq(tenants.id, tenantId));
        return Response.json({ success: true, tenantId });
      }

      case 2: {
        const modules: Array<{ module: string; enabled: boolean }> = Array.isArray(d.modules)
          ? (d.modules as Array<{ module: string; enabled: boolean }>)
          : Array.isArray(d.moduleActivation)
            ? (d.moduleActivation as Array<{ module: string; enabled: boolean }>)
            : [];
        if (modules.length === 0) {
          return Response.json({ error: "At least one module must be selected" }, { status: 400 });
        }
        await db.delete(tenantModuleConfig).where(eq(tenantModuleConfig.tenantId, tenantId));
        for (const m of modules) {
          if (!m.module) continue;
          await db.insert(tenantModuleConfig).values({
            tenantId,
            module: sql`${m.module}`,
            enabled: m.enabled ? "true" : "false",
            setBy: sql`'manual'`,
          });
        }
        // Mirror into onboarding_data for the fallback path
        const activation: Record<string, boolean> = {};
        for (const m of modules) activation[m.module] = !!m.enabled;
        await mergeOnboardingData(tenantId, { moduleActivation: activation });
        return Response.json({ success: true });
      }

      case 3: {
        const templateId: string = (d.templateId as string) || (d.template as string);
        if (!templateId) {
          return Response.json({ error: "templateId is required" }, { status: 400 });
        }
        await mergeOnboardingData(tenantId, { coa_template: templateId });
        // Seed the chart of accounts NOW (was cosmetic — accounts page was empty
        // after the wizard). Idempotent: skips tenants that already have accounts.
        try {
          const [tenantRow] = await db
            .select({ businessType: tenants.businessType, industry: tenants.industry })
            .from(tenants)
            .where(eq(tenants.id, tenantId))
            .limit(1);
          if (tenantRow?.businessType && tenantRow.industry) {
            const existing = await db
              .select({ id: accounts.id })
              .from(accounts)
              .where(eq(accounts.tenantId, tenantId))
              .limit(1);
            if (!existing.length) {
              const { seedCoa } = await import("@complianceos/server");
              await seedCoa(tenantId, String(tenantRow.businessType), String(tenantRow.industry), undefined);
            }
          }
        } catch (seedErr: any) {
          console.error("[onboarding] CoA seed failed:", seedErr.message);
        }
        return Response.json({ success: true });
      }

      case 4: {
        const selectedIds: string[] = d.selectedIds as string[];
        if (!Array.isArray(selectedIds)) {
          return Response.json({ error: "selectedIds must be an array" }, { status: 400 });
        }
        await mergeOnboardingData(tenantId, { coa_review: { reviewed: true, selectedIds } });
        return Response.json({ success: true });
      }

      case 5: {
        const fyStart = d.fiscalYearStart as string | undefined;
        const gstReg = d.gstRegistration as string | undefined;
        const gstin = d.gstin as string | undefined;
        const itcEligible = d.itcEligible as boolean | undefined;
        const tdsApplicable = d.tdsApplicable as boolean | undefined;

        await mergeOnboardingData(tenantId, {
          fiscal_year_start: fyStart || null,
          gst_registration: gstReg || null,
          gstin: gstin || null,
          itc_eligible: itcEligible ?? true,
          tds_applicable: tdsApplicable ?? false,
        });

        await db
          .update(tenants)
          .set({
            gstin: gstin || null,
            gstConfig: {
              itc_eligible: itcEligible ?? true,
              tds_applicable: tdsApplicable ?? false,
            },
          })
          .where(eq(tenants.id, tenantId));
        return Response.json({ success: true });
      }

      case 6: {
        const mode: string = (d.mode as string) || "fresh_start";
        if (mode !== "fresh_start" && mode !== "migration") {
          return Response.json({ error: "Invalid mode" }, { status: 400 });
        }
        await mergeOnboardingData(tenantId, {
          opening_balances_mode: mode,
          ...(mode === "migration" && d.balances ? { opening_balances: d.balances } : {}),
        });
        // Create opening-balance JEs for migration mode (was cosmetic).
        if (mode === "migration" && Array.isArray(d.balances) && d.balances.length) {
          try {
            const [tenantRow] = await db
              .select({ onboardingData: tenants.onboardingData })
              .from(tenants)
              .where(eq(tenants.id, tenantId))
              .limit(1);
            const od = (tenantRow?.onboardingData ?? {}) as Record<string, unknown>;
            const fyStart = od.fiscal_year_start as string | undefined;
            const fyYear = fyStart ? new Date(fyStart).getFullYear() : new Date().getFullYear();
            const fiscalYear = `${fyYear}-${String(fyYear + 1).slice(-2)}`;
            const { setupOpeningBalances } = await import("@complianceos/server");
            const membership = await requireMembership(req, tenantId);
            // Wizard sends {accountId, debit, credit} — normalize to the command input.
            const balances = (d.balances as Array<{ accountId: string; debit?: number; credit?: number }>)
              .filter((b) => (b.debit ?? 0) !== 0 || (b.credit ?? 0) !== 0)
              .map((b) => ({ ...b, openingBalance: (b.debit ?? 0) - (b.credit ?? 0) }));
            if (balances.length) {
              await setupOpeningBalances(tenantId, membership.userId, fiscalYear, {
                mode: "migration",
                balances: balances as never,
              });
            }
          } catch (obErr: any) {
            console.error("[onboarding] opening balances failed:", obErr.message);
          }
        }
        await db
          .update(tenants)
          .set({ onboardingStatus: "complete" })
          .where(eq(tenants.id, tenantId));
        return Response.json({ success: true, redirect: "/dashboard" });
      }

      default:
        return Response.json({ error: `Unknown step: ${step}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[onboarding] error:", err.message);
    return Response.json({ error: err.message || "Onboarding step failed" }, { status: 500 });
  }
}
