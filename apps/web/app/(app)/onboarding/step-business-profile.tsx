"use client";

import { useState, useEffect } from "react";
import { BusinessProfileInputSchema, type BusinessProfileInput } from "@complianceos/shared";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────────

type BusinessTypeValue = "sole_proprietorship" | "partnership" | "llp" | "private_limited" | "public_limited" | "huf";
type StateValue = "andaman_and_nicobar_islands" | "andhra_pradesh" | "arunachal_pradesh" | "assam" | "bihar" | "chandigarh" | "chhattisgarh" | "dadra_and_nagar_haveli" | "daman_and_diu" | "delhi" | "goa" | "gujarat" | "haryana" | "himachal_pradesh" | "jammu_and_kashmir" | "jharkhand" | "karnataka" | "kerala" | "ladakh" | "lakshadweep" | "madhya_pradesh" | "maharashtra" | "manipur" | "meghalaya" | "mizoram" | "nagaland" | "odisha" | "puducherry" | "punjab" | "rajasthan" | "sikkim" | "tamil_nadu" | "telangana" | "tripura" | "uttar_pradesh" | "uttarakhand" | "west_bengal";
type IndustryValue = "retail_trading" | "manufacturing" | "services_professional" | "freelancer_consultant" | "regulated_professional";

interface FormData {
  name: string;
  legalName: string;
  businessType: BusinessTypeValue;
  pan: string;
  gstin: string;
  address: string;
  state: StateValue;
  industry: IndustryValue;
  dateOfIncorporation: string;
}

interface FormErrors {
  name?: string;
  legalName?: string;
  businessType?: string;
  pan?: string;
  gstin?: string;
  address?: string;
  state?: string;
  industry?: string;
  dateOfIncorporation?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BUSINESS_TYPES: { value: BusinessTypeValue; label: string }[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "huf", label: "HUF" },
];

const INDUSTRIES: { value: IndustryValue; label: string }[] = [
  { value: "retail_trading", label: "Retail/Trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services_professional", label: "Services/Professional" },
  { value: "freelancer_consultant", label: "Freelancer/Consultant" },
  { value: "regulated_professional", label: "Regulated Professional" },
];

const STATES: { value: StateValue; label: string }[] = [
  { value: "andaman_and_nicobar_islands", label: "Andaman & Nicobar Islands" },
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "dadra_and_nagar_haveli", label: "Dadra & Nagar Haveli" },
  { value: "daman_and_diu", label: "Daman & Diu" },
  { value: "delhi", label: "Delhi" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jammu_and_kashmir", label: "Jammu & Kashmir" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "ladakh", label: "Ladakh" },
  { value: "lakshadweep", label: "Lakshadweep" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "puducherry", label: "Puducherry" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
];

// Business types that require date of incorporation
const REQUIRES_INCORPORATION_DATE: BusinessTypeValue[] = ["private_limited", "public_limited", "llp", "huf"];

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCreateTenant(input: BusinessProfileInput): Promise<{ tenantId: string }> {
  const response = await fetch("/api/trpc/onboarding.createTenant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    throw new Error(`Create tenant failed: ${response.statusText}`);
  }
  const json = await response.json();
  return json.result?.data ?? { tenantId: "" };
}

async function fetchSaveProgress(input: {
  tenantId: string;
  step: number;
  data: Record<string, unknown>;
}): Promise<void> {
  const response = await fetch("/api/trpc/onboarding.saveProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    throw new Error(`Save failed: ${response.statusText}`);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface BusinessProfileStepProps {
  onNext: (tenantId: string) => void;
  savedData?: Record<string, unknown>;
  tenantId?: string;
}

export default function BusinessProfileStep({ onNext, savedData, tenantId }: BusinessProfileStepProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    legalName: "",
    businessType: "sole_proprietorship",
    pan: "",
    gstin: "",
    address: "",
    state: "maharashtra",
    industry: "services_professional",
    dateOfIncorporation: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load saved data on mount
  useEffect(() => {
    if (savedData && typeof savedData === "object") {
      const bp = (savedData as { businessProfile?: Partial<FormData> }).businessProfile;
      if (bp) {
        setFormData((prev) => ({
          ...prev,
          name: bp.name ?? prev.name,
          legalName: bp.legalName ?? prev.legalName,
          businessType: bp.businessType ?? prev.businessType,
          pan: bp.pan ?? prev.pan,
          gstin: bp.gstin ?? prev.gstin,
          address: bp.address ?? prev.address,
          state: bp.state ?? prev.state,
          industry: bp.industry ?? prev.industry,
          dateOfIncorporation: bp.dateOfIncorporation ?? prev.dateOfIncorporation,
        }));
      }
    }
  }, [savedData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const result = BusinessProfileInputSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Call createTenant mutation
      const { tenantId: newTenantId } = await fetchCreateTenant({
        name: formData.name,
        legalName: formData.legalName || undefined,
        businessType: formData.businessType,
        pan: formData.pan,
        gstin: formData.gstin || undefined,
        address: formData.address,
        state: formData.state,
        industry: formData.industry,
        dateOfIncorporation: formData.dateOfIncorporation || undefined,
      });

      // Save progress
      if (newTenantId) {
        await fetchSaveProgress({
          tenantId: newTenantId,
          step: 1,
          data: { businessProfile: formData },
        });
        onNext(newTenantId);
      } else {
        setServerError("Failed to create tenant. Please try again.");
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDateOfIncorporation = REQUIRES_INCORPORATION_DATE.includes(formData.businessType);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Business Profile</h2>

      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Business Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Business Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            maxLength={100}
            placeholder="My Business"
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Legal Name */}
        <div>
          <label htmlFor="legalName" className="block text-sm font-medium mb-1">
            Legal Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="legalName"
            name="legalName"
            type="text"
            value={formData.legalName}
            onChange={handleChange}
            maxLength={100}
            placeholder="If different from trading name"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium mb-1">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.businessType ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          >
            {BUSINESS_TYPES.map((bt) => (
              <option key={bt.value} value={bt.value}>
                {bt.label}
              </option>
            ))}
          </select>
          {errors.businessType && <p className="mt-1 text-xs text-red-500">{errors.businessType}</p>}
        </div>

        {/* PAN */}
        <div>
          <label htmlFor="pan" className="block text-sm font-medium mb-1">
            PAN <span className="text-red-500">*</span>
          </label>
          <input
            id="pan"
            name="pan"
            type="text"
            value={formData.pan}
            onChange={handleChange}
            placeholder="AAAAA9999A"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded text-sm uppercase ${
              errors.pan ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.pan && <p className="mt-1 text-xs text-red-500">{errors.pan}</p>}
        </div>

        {/* GSTIN */}
        <div>
          <label htmlFor="gstin" className="block text-sm font-medium mb-1">
            GSTIN <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="gstin"
            name="gstin"
            type="text"
            value={formData.gstin}
            onChange={handleChange}
            placeholder="27AAAAA9999Z1A1"
            maxLength={15}
            className={`w-full px-3 py-2 border rounded text-sm uppercase ${
              errors.gstin ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          />
          {errors.gstin && <p className="mt-1 text-xs text-red-500">{errors.gstin}</p>}
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.state ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          >
            {STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-1">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.industry ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
        </div>

        {/* Date of Incorporation */}
        {showDateOfIncorporation && (
          <div>
            <label htmlFor="dateOfIncorporation" className="block text-sm font-medium mb-1">
              Date of Incorporation
            </label>
            <input
              id="dateOfIncorporation"
              name="dateOfIncorporation"
              type="date"
              value={formData.dateOfIncorporation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded text-sm ${
                errors.dateOfIncorporation ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.dateOfIncorporation && (
              <p className="mt-1 text-xs text-red-500">{errors.dateOfIncorporation}</p>
            )}
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          placeholder="Business address"
          className={`w-full px-3 py-2 border rounded text-sm resize-none ${
            errors.address ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
        />
        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Continue →"}
        </button>
      </div>
    </form>
  );
}
