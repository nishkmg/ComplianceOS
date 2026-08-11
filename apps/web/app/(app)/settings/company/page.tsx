"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Icon } from "@/components/ui/icon";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

interface CompanyForm {
  stateCode: string;
  bankAccount: string;
  bankIfsc: string;
  bsrCode: string;
}

export default function CompanySettingsPage() {
  const { data: company, isLoading } = api.tenantConfig.get.useQuery(undefined, { staleTime: 30_000 });
  const { data: states } = api.tenantConfig.listStates.useQuery(undefined, { staleTime: 60 * 60_000 });

  const [form, setForm] = useState<CompanyForm | null>(null);
  const [busy, setBusy] = useState(false);

  const utils = api.useUtils();
  const updateMutation = api.tenantConfig.update.useMutation({
    onSuccess: () => {
      showToast.success("Company details saved.");
      setBusy(false);
      void utils.tenantConfig.get.invalidate();
    },
    onError: (e) => {
      showToast.error(e.message);
      setBusy(false);
    },
  });

  // Hydrate the form once company data arrives
  const current = form ?? {
    stateCode: company?.stateCode ?? "",
    bankAccount: company?.bankAccount ?? "",
    bankIfsc: company?.bankIfsc ?? "",
    bsrCode: company?.bsrCode ?? "",
  };

  const save = () => {
    if (!current.stateCode) {
      showToast.error("Select your registered state.");
      return;
    }
    setBusy(true);
    updateMutation.mutate({
      stateCode: current.stateCode,
      bankAccount: current.bankAccount || undefined,
      bankIfsc: current.bankIfsc || undefined,
      bsrCode: current.bsrCode || undefined,
    });
  };

  return (
    <div className="space-y-10 text-left">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="text-left">
          <PageHeader
            eyebrow="Settings · Company"
            title="Company Profile"
            description="Legal identity used on invoices, GST returns, challans and payslips."
          />
        </div>
        <button onClick={save} disabled={busy || isLoading} className="btn btn-primary flex items-center gap-2">
          Save Changes
        </button>
      </header>

      {isLoading ? (
        <div className="bg-surface border border-border rounded-md shadow-sm p-8 text-mid font-ui text-ui-sm">
          Loading company details…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Identity (read-only — set at onboarding) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
              <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
                <h3 className="font-ui text-lg font-bold text-dark">Registered Identity</h3>
                <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Managed during onboarding</p>
              </div>
              <dl className="p-6 space-y-4 font-ui text-ui-sm">
                <div>
                  <dt className="text-ui-2xs uppercase tracking-widest text-light font-bold">Legal name</dt>
                  <dd className="mt-1 text-dark font-medium">{company?.legalName ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-ui-2xs uppercase tracking-widest text-light font-bold">Workspace name</dt>
                  <dd className="mt-1 text-dark font-medium">{company?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-ui-2xs uppercase tracking-widest text-light font-bold">PAN</dt>
                  <dd className="mt-1 font-mono text-dark">{company?.pan ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-ui-2xs uppercase tracking-widest text-light font-bold">GSTIN</dt>
                  <dd className="mt-1 font-mono text-dark">{company?.gstin ?? "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-sidebar text-white p-8 shadow-sm relative overflow-hidden">
              <div className="relative z-10 text-left">
                <h4 className="text-amber-bright font-ui text-lg font-bold mb-3">Statutory Identity</h4>
                <p className="text-sidebar-muted text-sm leading-relaxed">
                  PAN and GSTIN are locked to the values verified during onboarding. To correct them,
                  contact support — changing statutory identifiers invalidates historical documents.
                </p>
                <div className="mt-4 flex items-center gap-2 text-ui-2xs uppercase font-bold tracking-widest text-amber-bright">
                  <Icon name="verified_user" className="text-sm" />
                  Verified
                </div>
              </div>
            </div>
          </div>

          {/* Editable config */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface border border-border rounded-md overflow-hidden shadow-sm relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber" />
              <div className="p-6 border-b border-border-subtle bg-surface-muted/50">
                <h3 className="font-ui text-lg font-bold text-dark">State & Banking</h3>
                <p className="font-ui text-ui-2xs text-light uppercase tracking-widest mt-1">Used in GST returns, challans and refunds</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label htmlFor="company-state" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">
                    Registered state {company?.stateName ? `(${company.stateName} · ${company.stateType === "ut" ? "Union Territory" : "State"})` : ""}
                  </label>
                  <select
                    id="company-state"
                    value={current.stateCode}
                    onChange={(e) => setForm({ ...current, stateCode: e.target.value })}
                    className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <option value="">Select state…</option>
                    {(states ?? []).map((s: { code: string; name: string }) => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="company-bank" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">Bank account number</label>
                  <input
                    id="company-bank"
                    value={current.bankAccount}
                    onChange={(e) => setForm({ ...current, bankAccount: e.target.value })}
                    placeholder="9–18 digits"
                    className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company-ifsc" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">IFSC</label>
                    <input
                      id="company-ifsc"
                      value={current.bankIfsc}
                      onChange={(e) => setForm({ ...current, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="HDFC0001234"
                      className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </div>
                  <div>
                    <label htmlFor="company-bsr" className="mb-1.5 block font-ui text-ui-xs font-medium text-dark">BSR code (challans)</label>
                    <input
                      id="company-bsr"
                      value={current.bsrCode}
                      onChange={(e) => setForm({ ...current, bsrCode: e.target.value })}
                      placeholder="7 digits"
                      className="w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
