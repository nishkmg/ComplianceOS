// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";

interface BankDetails {
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

interface InvoiceConfig {
  prefix: string;
  nextNumber: number;
  logoUrl: string | null;
  companyName: string | null;
  companyAddress: string | null;
  companyGstin: string | null;
  paymentTerms: string | null;
  bankDetails: BankDetails | null;
  notes: string | null;
  terms: string | null;
}

async function fetchConfig(): Promise<InvoiceConfig> {
  const response = await fetch("/api/trpc/invoiceConfig.get");
  if (!response.ok) throw new Error("Failed to load config");
  const json = await response.json();
  return json.result?.data ?? { prefix: "INV", nextNumber: 1, logoUrl: null, companyName: null, companyAddress: null, companyGstin: null, paymentTerms: null, bankDetails: null, notes: null, terms: null };
}

async function saveConfig(data: InvoiceConfig): Promise<void> {
  const response = await fetch("/api/trpc/invoiceConfig.save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: data }),
  });
  if (!response.ok) throw new Error("Failed to save config");
}

export default function InvoiceSettingsPage() {
  const [config, setConfig] = useState<InvoiceConfig>({ prefix: "INV", nextNumber: 1, logoUrl: null, companyName: null, companyAddress: null, companyGstin: null, paymentTerms: null, bankDetails: null, notes: null, terms: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig()
      .then((data) => {
        setConfig(data);
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setConfig((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    sessionStorage.setItem("invoicePreviewConfig", JSON.stringify(config));
    window.open("/invoices/preview", "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Invoice Settings</h1>
          <p className="font-ui text-[12px] text-light mt-1">Configure invoice defaults and branding</p>
        </div>
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-muted rounded w-1/4" />
            <div className="h-10 bg-surface-muted rounded" />
            <div className="h-10 bg-surface-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Invoice Settings</h1>
          <p className="font-ui text-[12px] text-light mt-1">Configure invoice defaults and branding</p>
        </div>
        <button onClick={handlePreview} className="filter-tab">Preview Invoice</button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="card p-4 border-l-4 border-l-danger bg-danger/5">
          <p className="font-ui text-[13px] text-danger">{error}</p>
        </div>
      )}
      {saved && (
        <div className="card p-4 border-l-4 border-l-success bg-success/5">
          <p className="font-ui text-[13px] text-success">Settings saved successfully</p>
        </div>
      )}

      {/* Invoice Numbering */}
      <div className="card p-6">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Invoice Numbering</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Prefix</label>
            <input
              type="text"
              value={config.prefix}
              onChange={(e) => setConfig((prev) => ({ ...prev, prefix: e.target.value }))}
              className="input-field font-ui"
              placeholder="INV"
            />
            <p className="font-ui text-[10px] text-light mt-1">Changing prefix doesn&apos;t affect existing numbers</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Next Number</label>
            <input
              type="text"
              value={`${config.prefix}-${config.nextNumber}`}
              readOnly
              className="input-field font-mono bg-surface-muted text-light"
            />
            <p className="font-ui text-[10px] text-light mt-1">Next invoice number that will be used</p>
          </div>
        </div>
      </div>

      {/* Company Branding */}
      <div className="card p-6">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Company Branding</h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="font-ui text-[13px] text-mid" />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo preview" className="h-20 w-auto object-contain border border-hairline rounded" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Company Name</label>
            <input
              type="text"
              value={config.companyName ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyName: e.target.value || null }))}
              className="input-field font-ui"
              placeholder="Your Company Name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Company Address</label>
            <textarea
              value={config.companyAddress ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyAddress: e.target.value || null }))}
              rows={3}
              className="input-field font-ui"
              placeholder="Your Address"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">GSTIN</label>
            <input
              type="text"
              value={config.companyGstin ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyGstin: e.target.value || null }))}
              className="input-field font-mono"
              placeholder="22AAAAA0000A1ZA"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="card p-6">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Bank Details</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Account Name</label>
            <input
              type="text"
              value={config.bankDetails?.accountName ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, accountName: e.target.value || undefined } }))}
              className="input-field font-ui"
              placeholder="Account Name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Account Number</label>
            <input
              type="text"
              value={config.bankDetails?.accountNumber ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, accountNumber: e.target.value || undefined } }))}
              className="input-field font-mono"
              placeholder="Account Number"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">IFSC Code</label>
            <input
              type="text"
              value={config.bankDetails?.ifscCode ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ifscCode: e.target.value || undefined } }))}
              className="input-field font-mono"
              placeholder="SBIN0001234"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Bank Name</label>
            <input
              type="text"
              value={config.bankDetails?.bankName ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, bankName: e.target.value || undefined } }))}
              className="input-field font-ui"
              placeholder="State Bank of India"
            />
          </div>
        </div>
      </div>

      {/* Defaults */}
      <div className="card p-6">
        <h2 className="font-display text-[16px] font-normal text-dark mb-4">Defaults</h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Default Payment Terms</label>
            <textarea
              value={config.paymentTerms ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, paymentTerms: e.target.value || null }))}
              rows={2}
              className="input-field font-ui"
              placeholder="Payment due within 30 days"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Default Notes</label>
            <textarea
              value={config.notes ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, notes: e.target.value || null }))}
              rows={2}
              className="input-field font-ui"
              placeholder="Thank you for your business"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] uppercase tracking-wide text-light">Default Terms & Conditions</label>
            <textarea
              value={config.terms ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, terms: e.target.value || null }))}
              rows={3}
              className="input-field font-ui"
              placeholder="Terms and conditions"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="filter-tab active disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
