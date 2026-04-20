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
  return json.result?.data ?? {
    prefix: "INV",
    nextNumber: 1,
    logoUrl: null,
    companyName: null,
    companyAddress: null,
    companyGstin: null,
    paymentTerms: null,
    bankDetails: null,
    notes: null,
    terms: null,
  };
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
  const [config, setConfig] = useState<InvoiceConfig>({
    prefix: "INV",
    nextNumber: 1,
    logoUrl: null,
    companyName: null,
    companyAddress: null,
    companyGstin: null,
    paymentTerms: null,
    bankDetails: null,
    notes: null,
    terms: null,
  });
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
    // Store config in sessionStorage and navigate to preview
    sessionStorage.setItem("invoicePreviewConfig", JSON.stringify(config));
    window.open("/invoices/preview", "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Invoice Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice Settings</h1>
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded border hover:bg-gray-200"
        >
          Preview Invoice
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">Settings saved successfully</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Invoice Numbering</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prefix
              </label>
              <input
                type="text"
                value={config.prefix}
                onChange={(e) => setConfig((prev) => ({ ...prev, prefix: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="INV"
              />
              <p className="mt-1 text-xs text-gray-500">
                Changing prefix doesn&apos;t affect existing numbers
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Number
              </label>
              <input
                type="text"
                value={`${config.prefix}-${config.nextNumber}`}
                readOnly
                className="w-full px-3 py-2 border rounded text-sm bg-gray-50 text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Next invoice number that will be used
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Company Branding</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="text-sm text-gray-600"
            />
            {logoPreview && (
              <div className="mt-2">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-auto object-contain border rounded"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={config.companyName ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyName: e.target.value || null }))}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address
            </label>
            <textarea
              value={config.companyAddress ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyAddress: e.target.value || null }))}
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Your Address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GSTIN
            </label>
            <input
              type="text"
              value={config.companyGstin ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, companyGstin: e.target.value || null }))}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="22AAAAA0000A1ZA"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Bank Details</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={config.bankDetails?.accountName ?? ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    bankDetails: { ...prev.bankDetails, accountName: e.target.value || undefined },
                  }))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Account Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={config.bankDetails?.accountNumber ?? ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    bankDetails: { ...prev.bankDetails, accountNumber: e.target.value || undefined },
                  }))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Account Number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={config.bankDetails?.ifscCode ?? ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    bankDetails: { ...prev.bankDetails, ifscCode: e.target.value || undefined },
                  }))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="SBIN0001234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={config.bankDetails?.bankName ?? ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    bankDetails: { ...prev.bankDetails, bankName: e.target.value || undefined },
                  }))
                }
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="State Bank of India"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Defaults</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Payment Terms
            </label>
            <textarea
              value={config.paymentTerms ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, paymentTerms: e.target.value || null }))}
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Payment due within 30 days"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Notes
            </label>
            <textarea
              value={config.notes ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, notes: e.target.value || null }))}
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Thank you for your business"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Terms &amp; Conditions
            </label>
            <textarea
              value={config.terms ?? ""}
              onChange={(e) => setConfig((prev) => ({ ...prev, terms: e.target.value || null }))}
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Terms and conditions"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
