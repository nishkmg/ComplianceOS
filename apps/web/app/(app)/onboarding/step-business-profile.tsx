"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { BusinessProfileInputSchema, type BusinessProfileInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from '@/components/ui/icon';
import { submitStep } from "@/lib/mock-mutation";
import { BUSINESS_TYPES, INDUSTRIES, STATES } from "@/lib/constants";

export function StepBusinessProfile({ tenantId, initialData, onComplete }: { tenantId: string; initialData?: Record<string, string>; onComplete: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BusinessProfileInput>({
    resolver: zodResolver(BusinessProfileInputSchema),
    defaultValues: {
      businessType: "private_limited",
      industry: "services_professional",
      state: "maharashtra",
    }
  });

  // Pre-fill form from saved onboarding state
  useEffect(() => {
    if (!initialData) return;
    if (initialData.name) setValue("name", initialData.name as any);
    if (initialData.legalName) setValue("legalName", initialData.legalName as any);
    if (initialData.businessType) setValue("businessType", initialData.businessType as any);
    if (initialData.pan) setValue("pan", initialData.pan as any);
    if (initialData.gstin) setValue("gstin", initialData.gstin as any);
    if (initialData.address) setValue("address", initialData.address as any);
    if (initialData.state) setValue("state", initialData.state as any);
    if (initialData.industry) setValue("industry", initialData.industry as any);
    if (initialData.dateOfIncorporation) setValue("dateOfIncorporation", initialData.dateOfIncorporation as any);
  }, [initialData, setValue]);

  const onSubmit = async (data: BusinessProfileInput) => {
    setIsSubmitting(true);
    try {
      if (!data.legalName || data.legalName.trim() === "") {
        data.legalName = data.name;
      }
      await submitStep(1, { tenantId, data: { ...(data as any) } });
      showToast.success('Business profile established successfully');
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || 'Failed to establish business profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-3">Business Profile</h1>
        <p className="font-ui text-sm font-medium text-ui-md text-mid max-w-2xl leading-relaxed">
          Establish your organizational identity. This information ensures your ledgers and regulatory filings are accurately attributed under Indian corporate framework.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
        {/* Business Name */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="name">Operating Name</label>
          <input 
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light" 
            id="name" 
            placeholder="e.g. Acme Technologies" 
            {...register("name")}
          />
          {errors.name && <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">{errors.name.message}</p>}
        </div>

        {/* Legal Name */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid flex items-center gap-1" htmlFor="legalName">
            Individual / Legal Name
            <Icon name="info" className="text-ui-md text-light cursor-help" />
          </label>
          <input 
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light" 
            id="legalName" 
            placeholder="Leave blank to use operating name" 
            {...register("legalName")}
          />
        </div>

        {/* Business Type */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="businessType">Entity Type</label>
          <div className="relative">
            <select 
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors" 
              id="businessType"
              {...register("businessType")}
              onChange={(e) => setValue("businessType", e.target.value as any)}
            >
              <option disabled value="">Select structure...</option>
              {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-mid pointer-events-none" />
          </div>
          <p className="font-ui text-ui-xs text-ui-xs text-mid/70 leading-relaxed">
            Select <strong>Sole Proprietorship</strong> if you are an individual freelancer, consultant, or professional without a registered business entity.
          </p>
        </div>

        {/* Industry */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="industry">Primary Sector</label>
          <div className="relative">
            <select 
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors" 
              id="industry"
              {...register("industry")}
              onChange={(e) => setValue("industry", e.target.value as any)}
            >
              <option disabled value="">Select industry...</option>
              {INDUSTRIES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-mid pointer-events-none" />
          </div>
        </div>

        {/* PAN Number */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="pan">Permanent Account Number (PAN)</label>
          <input 
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light placeholder:normal-case placeholder:tracking-normal" 
            id="pan" 
            maxLength={10} 
            placeholder="ABCDE1234F" 
            {...register("pan")}
          />
          {errors.pan && <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">{errors.pan.message}</p>}
        </div>

        {/* GSTIN */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid flex items-center gap-1" htmlFor="gstin">
            GST Identification Number
            <Icon name="info" className="text-ui-md text-light cursor-help" />
          </label>
          <input 
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-light placeholder:normal-case placeholder:tracking-normal" 
            id="gstin" 
            maxLength={15} 
            placeholder="22AAAAA0000A1Z5" 
            {...register("gstin")}
          />
        </div>

        {/* State */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="state">State of Registration</label>
          <div className="relative">
            <select 
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors" 
              id="state"
              {...register("state")}
              onChange={(e) => setValue("state", e.target.value as any)}
            >
              <option disabled value="">Select state...</option>
              {STATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-mid pointer-events-none" />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-mid" htmlFor="address">Registered Office Address</label>
          <textarea 
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors resize-none placeholder:text-light" 
            id="address" 
            placeholder="Enter complete building name, street, and PIN code..." 
            rows={3}
            {...register("address")}
          ></textarea>
          {errors.address && <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">{errors.address.message}</p>}
        </div>

        {/* Footer Actions */}
        <div className="md:col-span-2 flex justify-between items-center mt-6 pt-8 border-t border-border">
          <button className="font-ui text-ui-sm text-ui-sm text-mid hover:text-on-surface transition-colors py-2 px-4 -ml-4 border-none bg-transparent cursor-pointer" type="button">
            Save as Draft
          </button>
          <button className="bg-amber text-white dark:text-amber-ink font-ui text-ui-sm text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Establishing Profile..." : "Continue to Setup"}
            <Icon name="arrow_forward" className="text-ui-xl group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
