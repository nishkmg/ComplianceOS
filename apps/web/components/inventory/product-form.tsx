// @ts-nocheck
"use client";
import { useState, useCallback } from "react";

interface ProductFormProps {
  onSubmit: (data: {
    sku: string;
    name: string;
    description?: string;
    hsnCode: string;
    unitOfMeasure?: string;
    purchaseRate?: number;
    salesRate?: number;
    gstRate?: number;
  }) => Promise<void>;
}

interface HsnSuggestion {
  hsnCode: string;
  description: string;
  gstRate: number;
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [gstRate, setGstRate] = useState<number | undefined>();
  const [purchaseRate, setPurchaseRate] = useState<number | undefined>();
  const [salesRate, setSalesRate] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsnSuggestions, setHsnSuggestions] = useState<HsnSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleHsnSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setHsnSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const response = await fetch(`/api/trpc/products.suggestHsn?input=${encodeURIComponent(JSON.stringify({ searchTerm: term }))}`);
    const json = await response.json();
    const suggestions: HsnSuggestion[] = json.result?.data ?? [];
    setHsnSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  }, []);

  const handleSelectHsn = useCallback((suggestion: HsnSuggestion) => {
    setHsnCode(suggestion.hsnCode);
    setGstRate(suggestion.gstRate);
    setShowSuggestions(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !hsnCode.trim()) {
      setError("SKU, Name, and HSN Code are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        sku: sku.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        hsnCode: hsnCode.trim(),
        unitOfMeasure: "nos",
        purchaseRate,
        salesRate,
        gstRate,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [sku, name, description, hsnCode, gstRate, purchaseRate, salesRate, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="e.g. PROD-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Product name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
          <input
            type="text"
            value={hsnCode}
            onChange={(e) => {
              setHsnCode(e.target.value);
              handleHsnSearch(e.target.value);
            }}
            onFocus={() => handleHsnSearch(hsnCode)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="e.g. 610910"
          />
          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
              {hsnSuggestions.map((s) => (
                <button
                  key={s.hsnCode}
                  type="button"
                  onClick={() => handleSelectHsn(s)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <div className="font-mono">{s.hsnCode}</div>
                  <div className="text-gray-600">{s.description}</div>
                  <div className="text-xs text-gray-500">GST: {s.gstRate}%</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
          <input
            type="number"
            value={gstRate ?? ""}
            onChange={(e) => setGstRate(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Auto-detected from HSN"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Rate (₹)</label>
          <input
            type="number"
            value={purchaseRate ?? ""}
            onChange={(e) => setPurchaseRate(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sales Rate (₹)</label>
          <input
            type="number"
            value={salesRate ?? ""}
            onChange={(e) => setSalesRate(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Product"}
        </button>
      </div>
    </form>
  );
}
