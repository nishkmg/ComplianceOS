"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
// @ts-ignore
import { BusinessProfileInputSchema, type BusinessProfileInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from '@/components/ui/icon';

const BUSINESS_TYPES = [
  { value: "pvt_ltd", label: "Private Limited Company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership Firm" },
  { value: "public_ltd", label: "Public Limited Company" },
];

const INDUSTRIES = [
  { value: "it_services", label: "Information Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

const STATES = [
  { value: "MH", label: "Maharashtra" },
  { value: "KA", label: "Karnataka" },
  { value: "DL", label: "Delhi" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "GJ", label: "Gujarat" },
];

export function StepBusinessProfile({ onTenantCreated }: { onTenantCreated: (id: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // @ts-ignore
  const createTenant: any = api.tenants.create.useMutation({
    onSuccess: (data: any) => {
      onTenantCreated(data.id);
      showToast.success('Business profile established successfully');
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(BusinessProfileInputSchema),
    defaultValues: {
      businessType: "pvt_ltd",
      industry: "it_services",
      state: "MH",
    }
  });

  const onSubmit = async (data: BusinessProfileInput) => {
    setIsSubmitting(true);
    try {
      await createTenant.mutateAsync(data as any);
    } catch (error) {
      showToast.error('Failed to establish business profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-display-xl text-display-xl text-on-surface mb-3">Business Profile</h1>
        <p className="font-ui-md text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Establish your organizational identity. This information ensures your ledgers and regulatory filings are accurately attributed under Indian corporate framework.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {/* Business Name */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="name">Operating Name</label>
          <input 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-text-light" 
            id="name" 
            placeholder="e.g. Acme Technologies" 
            {...register("name")}
          />
          {errors.name && <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.name.message}</p>}
        </div>

        {/* Legal Name */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid flex items-center gap-1" htmlFor="legalName">
            Registered Legal Name
            <Icon name="info" className="text-[14px] text-text-light cursor-help" />
          </label>
          <input 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-text-light" 
            id="legalName" 
            placeholder="e.g. Acme Technologies Private Limited" 
            {...register("legalName")}
          />
        </div>

        {/* Business Type */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="businessType">Entity Type</label>
          <div className="relative">
            <select 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface appearance-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
              id="businessType"
              {...register("businessType")}
              onChange={(e) => setValue("businessType", e.target.value)}
            >
              <option disabled value="">Select structure...</option>
              {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
          </div>
        </div>

        {/* Industry */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="industry">Primary Sector</label>
          <div className="relative">
            <select 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface appearance-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
              id="industry"
              {...register("industry")}
              onChange={(e) => setValue("industry", e.target.value)}
            >
              <option disabled value="">Select industry...</option>
              {INDUSTRIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
          </div>
        </div>

        {/* PAN Number */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="pan">Permanent Account Number</label>
          <input 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-[14px] text-on-surface uppercase tracking-widest focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal" 
            id="pan" 
            maxLength={10} 
            placeholder="ABCDE1234F" 
            {...register("pan")}
          />
          {errors.pan && <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.pan.message}</p>}
        </div>

        {/* GSTIN */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid flex items-center gap-1" htmlFor="gstin">
            GST Identification Number
            <Icon name="info" className="text-[14px] text-text-light cursor-help" />
          </label>
          <input 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-mono text-[14px] text-on-surface uppercase tracking-widest focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal" 
            id="gstin" 
            maxLength={15} 
            placeholder="22AAAAA0000A1Z5" 
            {...register("gstin")}
          />
        </div>

        {/* State */}
        <div className="flex flex-col gap-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="state">State of Registration</label>
          <div className="relative">
            <select 
              className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface appearance-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors" 
              id="state"
              {...register("state")}
              onChange={(e) => setValue("state", e.target.value)}
            >
              <option disabled value="">Select state...</option>
              {STATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="address">Registered Office Address</label>
          <textarea 
            className="w-full bg-white border border-border-subtle rounded-sm px-4 py-3 font-ui-md text-ui-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors resize-none placeholder:text-text-light" 
            id="address" 
            placeholder="Enter complete building name, street, and PIN code..." 
            rows={3}
            {...register("address")}
          ></textarea>
          {errors.address && <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.address.message}</p>}
        </div>

        {/* Footer Actions */}
        <div className="md:col-span-2 flex justify-between items-center mt-6 pt-8 border-t border-border-subtle">
          <button className="font-ui-sm text-ui-sm text-text-mid hover:text-on-surface transition-colors py-2 px-4 -ml-4 border-none bg-transparent cursor-pointer" type="button">
            Save as Draft
          </button>
          <button className="bg-primary-container text-white font-ui-sm text-ui-sm py-3 px-8 rounded-sm hover:bg-primary transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer" type="submit" disabled={isSubmitting || createTenant.isPending}>
            {isSubmitting || createTenant.isPending ? "Establishing Profile..." : "Continue to Setup"}
            <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
