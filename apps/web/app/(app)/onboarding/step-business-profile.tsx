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
      onTenantCreated(data.tenantId);
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
      console.error("Failed to create tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us about your business structure and location
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              placeholder="Your business name"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="legalName">Legal Name (optional)</Label>
            <Input
              id="legalName"
              placeholder="As per registration documents"
              {...register("legalName")}
            />
          </div>

          <div>
            <Label htmlFor="businessType">Business Type *</Label>
            <Select
              onValueChange={(value) => setValue("businessType", value)}
              defaultValue={businessType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="industry">Industry *</Label>
            <Select
              onValueChange={(value) => setValue("industry", value)}
              defaultValue={watch("industry")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind.value} value={ind.value}>
                    {ind.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pan">PAN *</Label>
            <Input
              id="pan"
              placeholder="AAAAA9999A"
              className="uppercase"
              maxLength={10}
              {...register("pan")}
            />
            {errors.pan && (
              <p className="mt-1 text-sm text-red-600">{errors.pan.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gstin">GSTIN (optional)</Label>
            <Input
              id="gstin"
              placeholder="27AABCU9603R1ZM"
              className="uppercase"
              maxLength={15}
              {...register("gstin")}
            />
            {errors.gstin && (
              <p className="mt-1 text-sm text-red-600">{errors.gstin.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="state">State *</Label>
            <Select
              onValueChange={(value) => setValue("state", value)}
              defaultValue={watch("state")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address">Registered Address *</Label>
            <Input
              id="address"
              placeholder="Full address with PIN code"
              {...register("address")}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || createTenant.isPending}>
            {isSubmitting ? "Creating..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}
