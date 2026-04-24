// @ts-nocheck - tRPC v11 type generation collision workaround
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { BusinessProfileInputSchema, type BusinessProfileInput } from "@complianceos/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { showToast } from "@/lib/toast";

const BUSINESS_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP (Limited Liability Partnership)" },
  { value: "private_limited", label: "Private Limited Company" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "huf", label: "HUF (Hindu Undivided Family)" },
];

const INDUSTRIES = [
  { value: "retail_trading", label: "Retail / Trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services_professional", label: "Services / Professional" },
  { value: "freelancer_consultant", label: "Freelancer / Consultant" },
  { value: "regulated_professional", label: "Regulated Professional (CA/CS/Law)" },
];

const STATES = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
  { value: "assam", label: "Assam" },
  { value: "bihar", label: "Bihar" },
  { value: "chhattisgarh", label: "Chhattisgarh" },
  { value: "goa", label: "Goa" },
  { value: "gujarat", label: "Gujarat" },
  { value: "haryana", label: "Haryana" },
  { value: "himachal_pradesh", label: "Himachal Pradesh" },
  { value: "jharkhand", label: "Jharkhand" },
  { value: "karnataka", label: "Karnataka" },
  { value: "kerala", label: "Kerala" },
  { value: "madhya_pradesh", label: "Madhya Pradesh" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "manipur", label: "Manipur" },
  { value: "meghalaya", label: "Meghalaya" },
  { value: "mizoram", label: "Mizoram" },
  { value: "nagaland", label: "Nagaland" },
  { value: "odisha", label: "Odisha" },
  { value: "punjab", label: "Punjab" },
  { value: "rajasthan", label: "Rajasthan" },
  { value: "sikkim", label: "Sikkim" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "tripura", label: "Tripura" },
  { value: "uttar_pradesh", label: "Uttar Pradesh" },
  { value: "uttarakhand", label: "Uttarakhand" },
  { value: "west_bengal", label: "West Bengal" },
  { value: "delhi", label: "Delhi" },
  { value: "jammu_kashmir", label: "Jammu & Kashmir" },
  { value: "ladakh", label: "Ladakh" },
  { value: "chandigarh", label: "Chandigarh" },
  { value: "puducherry", label: "Puducherry" },
  { value: "andaman_nicobar", label: "Andaman & Nicobar Islands" },
  { value: "dadra_nagar_haveli_daman_diu", label: "Dadra & Nagar Haveli, Daman & Diu" },
  { value: "lakshadweep", label: "Lakshadweep" },
];

interface StepBusinessProfileProps {
  onTenantCreated: (tenantId: string) => void;
}

export function StepBusinessProfile({ onTenantCreated }: StepBusinessProfileProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTenant = api.onboarding.createTenant.useMutation({
    onSuccess: (data) => {
      showToast.success('Business profile created successfully');
      onTenantCreated(data.tenantId);
    },
    onError: (error) => {
      showToast.error(error.message || 'Failed to create business profile');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(BusinessProfileInputSchema),
    defaultValues: {
      name: "",
      legalName: "",
      businessType: "sole_proprietorship",
      pan: "",
      gstin: "",
      address: "",
      state: "karnataka",
      industry: "services_professional",
      dateOfIncorporation: "",
    },
  });

  const businessType = watch("businessType");
  const gstRegistration = watch("gstin");

  const onSubmit = async (data: BusinessProfileInput) => {
    setIsSubmitting(true);
    try {
      await createTenant.mutateAsync(data as any);
    } catch (error) {
      showToast.error('Failed to create business profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="font-display text-[20px] font-normal text-dark">Business Profile</h2>
        <p className="font-ui text-[13px] text-light mt-1">
          Tell us about your business structure and location
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              Business Name *
            </Label>
            <input
              id="name"
              type="text"
              placeholder="Your business name"
              className="input-field w-full font-ui"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="legalName" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              Legal Name <span className="text-light">(optional)</span>
            </Label>
            <input
              id="legalName"
              type="text"
              placeholder="As per registration documents"
              className="input-field w-full font-ui"
              {...register("legalName")}
            />
          </div>

          <div>
            <Label htmlFor="businessType" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              Business Type *
            </Label>
            <select
              id="businessType"
              className="input-field w-full font-ui"
              {...register("businessType")}
              onChange={(e) => setValue("businessType", e.target.value)}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.businessType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="industry" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              Industry *
            </Label>
            <select
              id="industry"
              className="input-field w-full font-ui"
              {...register("industry")}
              onChange={(e) => setValue("industry", e.target.value)}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))}
            </select>
            {errors.industry && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.industry.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pan" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              PAN *
            </Label>
            <input
              id="pan"
              type="text"
              placeholder="AAAAA9999A"
              className="input-field w-full font-ui uppercase"
              maxLength={10}
              {...register("pan")}
            />
            {errors.pan && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.pan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gstin" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              GSTIN <span className="text-light">(optional)</span>
            </Label>
            <input
              id="gstin"
              type="text"
              placeholder="27AABCU9603R1ZM"
              className="input-field w-full font-ui uppercase"
              maxLength={15}
              {...register("gstin")}
            />
            {errors.gstin && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.gstin.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="state" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              State *
            </Label>
            <select
              id="state"
              className="input-field w-full font-ui"
              {...register("state")}
              onChange={(e) => setValue("state", e.target.value)}
            >
              {STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.state.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address" className="block font-ui text-[10px] uppercase tracking-wide text-light mb-2">
              Registered Address *
            </Label>
            <input
              id="address"
              type="text"
              placeholder="Full address with PIN code"
              className="input-field w-full font-ui"
              {...register("address")}
            />
            {errors.address && (
              <p className="mt-1 font-ui text-[11px] text-danger">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-hairline">
          <button
            type="submit"
            disabled={isSubmitting || createTenant.isPending}
            className="filter-tab active disabled:opacity-50"
          >
            {isSubmitting || createTenant.isPending ? "Creating..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
