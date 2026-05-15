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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, tenantId, data } = body;

    if (!tenantId || !step) {
      return Response.json({ error: "Missing tenantId or step" }, { status: 400 });
    }

    if (!data) {
      return Response.json({ error: "Missing data payload" }, { status: 400 });
    }

    switch (step) {
      case 1: {
        // PATCH existing tenant with business profile data
        const fields: Record<string, unknown> = {
          name: data.name,
          legal_name: data.legalName || data.name,
          business_type: data.businessType,
          pan: data.pan,
          gstin: data.gstin || null,
          address: data.address,
          state: mapState(data.state),
          industry: data.industry,
          date_of_incorporation: data.dateOfIncorporation || null,
        };

        const res = await supabaseRest(`tenants?id=eq.${tenantId}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: fields,
        });

        if (!res.ok) {
          throw new Error(`Failed to update tenant: ${res.status} ${res.text.slice(0, 200)}`);
        }

        return Response.json({ success: true, tenantId });
      }

      case 2: {
        // Save module selections: delete existing, insert new
        const modules: Array<{ module: string; enabled: boolean }> = data.modules || data.moduleActivation;
        if (!Array.isArray(modules)) {
          return Response.json({ error: "Module data must be an array" }, { status: 400 });
        }

        // Delete existing module configs for this tenant
        await supabaseRest(`tenant_module_config?tenant_id=eq.${tenantId}`, {
          method: "DELETE",
          headers: { Prefer: "return=minimal" },
        });

        // Insert each module individually
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
            throw new Error(`Failed to save module ${m.module}: ${ins.status}`);
          }
        }

        return Response.json({ success: true });
      }

      case 3: {
        // Save CoA template selection into onboarding_data
        const patchRes = await supabaseRest(`tenants?id=eq.${tenantId}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: {
            onboarding_data: { coa_template: data.templateId || data.template },
          },
        });

        if (!patchRes.ok) {
          throw new Error(`Failed to save CoA template: ${patchRes.text.slice(0, 200)}`);
        }

        return Response.json({ success: true });
      }

      case 4: {
        // Save CoA review selections into onboarding_data
        const coaRes = await supabaseRest(`tenants?id=eq.${tenantId}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: {
            onboarding_data: {
              coa_review: {
                reviewed: true,
                selectedIds: data.selectedIds,
              },
            },
          },
        });

        if (!coaRes.ok) {
          throw new Error(`Failed to save CoA review: ${coaRes.text.slice(0, 200)}`);
        }

        return Response.json({ success: true });
      }

      case 5: {
        // Save FY/GST settings
        const fyRes = await supabaseRest(`tenants?id=eq.${tenantId}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: {
            gst_registration: data.gstRegistration || null,
            gstin: data.gstin || null,
            gst_config: {
              itc_eligible: data.itcEligible ?? true,
              tds_applicable: data.tdsApplicable ?? false,
            },
            onboarding_data: {
              fiscal_year_start: data.fiscalYearStart,
            },
          },
        });

        if (!fyRes.ok) {
          throw new Error(`Failed to save FY/GST settings: ${fyRes.text.slice(0, 200)}`);
        }

        return Response.json({ success: true });
      }

      case 6: {
        const mode: string = data.mode || "fresh_start";

        if (mode !== "fresh_start" && mode !== "migration") {
          return Response.json({ error: "Invalid mode" }, { status: 400 });
        }

        // PATCH onboarding data + mark onboarding complete
        const obRes = await supabaseRest(`tenants?id=eq.${tenantId}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: {
            onboarding_data: { opening_balances_mode: mode },
            onboarding_status: "complete",
          },
        });

        if (!obRes.ok) {
          throw new Error(`Failed to finalize onboarding: ${obRes.text.slice(0, 200)}`);
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
