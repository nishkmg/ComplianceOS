import { supabaseRest } from "@/lib/supabase-rest";

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

// Read current onboarding_data, merge updates, PATCH back
// Prevents step N from overwriting step N-1 data stored in the JSONB column
async function mergeOnboardingData(
  tenantId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const readRes = await supabaseRest(
    `tenants?id=eq.${encodeURIComponent(tenantId)}&select=onboarding_data`,
    { method: "GET" }
  );
  if (!readRes.ok) throw new Error("Failed to read tenant onboarding data");
  const rows = Array.isArray(readRes.json) ? (readRes.json as any[]) : [];
  const current: Record<string, unknown> =
    (rows[0]?.onboarding_data as Record<string, unknown>) || {};
  const merged = { ...current, ...updates };

  const patchRes = await supabaseRest(
    `tenants?id=eq.${encodeURIComponent(tenantId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: { onboarding_data: merged },
    }
  );
  if (!patchRes.ok)
    throw new Error(
      `Failed to save onboarding data: ${patchRes.text.slice(0, 200)}`
    );
}

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
    if (typeof step !== "number" || step < 1 || step > 6) {
      return Response.json({ error: "step must be 1-6" }, { status: 400 });
    }
    const d = data as Record<string, unknown>;

    switch (step) {
      case 1: {
        if (!d.name || !d.pan || !d.address || !d.state || !d.industry || !d.businessType) {
          return Response.json(
            { error: "Missing required fields: name, pan, address, state, industry, businessType" },
            { status: 400 }
          );
        }

        const fields: Record<string, unknown> = {
          name: d.name,
          legal_name: d.legalName || d.name,
          business_type: d.businessType,
          pan: d.pan,
          gstin: d.gstin || null,
          address: d.address,
          state: mapState(d.state as string),
          industry: d.industry,
          date_of_incorporation: d.dateOfIncorporation || null,
        };

        const res = await supabaseRest(
          `tenants?id=eq.${encodeURIComponent(tenantId)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: fields,
          }
        );

        if (!res.ok) {
          throw new Error(
            `Failed to update tenant: ${res.status} ${res.text.slice(0, 200)}`
          );
        }

        return Response.json({ success: true, tenantId });
      }

      case 2: {
        const modules: Array<{ module: string; enabled: boolean }> =
          (d.modules as any) || (d.moduleActivation as any);
        if (!Array.isArray(modules)) {
          return Response.json(
            { error: "Module data must be an array" },
            { status: 400 }
          );
        }

        if (modules.length === 0) {
          return Response.json(
            { error: "At least one module must be selected" },
            { status: 400 }
          );
        }

        await supabaseRest(
          `tenant_module_config?tenant_id=eq.${encodeURIComponent(tenantId)}`,
          {
            method: "DELETE",
            headers: { Prefer: "return=minimal" },
          }
        );

        for (const m of modules) {
          if (!m.module) continue;
          const ins = await supabaseRest("tenant_module_config", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: {
              tenant_id: tenantId,
              module: m.module,
              enabled: m.enabled ? "true" : "false",
              set_by: "manual",
            },
          });
          if (!ins.ok) {
            throw new Error(
              `Failed to save module ${m.module}: ${ins.status}`
            );
          }
        }

        return Response.json({ success: true });
      }

      case 3: {
        const templateId: string = (d.templateId as string) || (d.template as string);
        if (!templateId) {
          return Response.json(
            { error: "templateId is required" },
            { status: 400 }
          );
        }

        await mergeOnboardingData(tenantId, {
          coa_template: templateId,
        });

        return Response.json({ success: true });
      }

      case 4: {
        const selectedIds: string[] = d.selectedIds as string[];
        if (!Array.isArray(selectedIds)) {
          return Response.json(
            { error: "selectedIds must be an array" },
            { status: 400 }
          );
        }

        await mergeOnboardingData(tenantId, {
          coa_review: { reviewed: true, selectedIds },
        });

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

        const gstRes = await supabaseRest(
          `tenants?id=eq.${encodeURIComponent(tenantId)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: {
              gst_registration: gstReg || null,
              gstin: gstin || null,
              gst_config: {
                itc_eligible: itcEligible ?? true,
                tds_applicable: tdsApplicable ?? false,
              },
            },
          }
        );

        if (!gstRes.ok) {
          throw new Error(
            `Failed to save GST settings: ${gstRes.text.slice(0, 200)}`
          );
        }

        return Response.json({ success: true });
      }

      case 6: {
        const mode: string = (d.mode as string) || "fresh_start";
        if (mode !== "fresh_start" && mode !== "migration") {
          return Response.json({ error: "Invalid mode" }, { status: 400 });
        }

        await mergeOnboardingData(tenantId, {
          opening_balances_mode: mode,
          ...(mode === "migration" && d.balances
            ? { opening_balances: d.balances }
            : {}),
        });

        const obRes = await supabaseRest(
          `tenants?id=eq.${encodeURIComponent(tenantId)}`,
          {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: { onboarding_status: "complete" },
          }
        );

        if (!obRes.ok) {
          throw new Error(
            `Failed to finalize onboarding: ${obRes.text.slice(0, 200)}`
          );
        }

        return Response.json({ success: true, redirect: "/dashboard" });
      }

      default:
        return Response.json({ error: `Unknown step: ${step}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[onboarding] error:", err.message);
    return Response.json(
      { error: err.message || "Onboarding step failed" },
      { status: 500 }
    );
  }
}
