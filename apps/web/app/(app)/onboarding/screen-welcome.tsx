"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { WelcomeInputSchema, type WelcomeInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { ONBOARDING_ROLES, INDUSTRIES, EMPLOYEE_COUNT_OPTIONS, CURRENT_TOOLS } from "@/lib/constants";

interface ScreenWelcomeProps {
  tenantId: string;
  onComplete: () => void;
}

export function ScreenWelcome({ tenantId, onComplete }: ScreenWelcomeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveProgress = api.onboarding.saveProgress.useMutation();
  const extractDocument = api.onboarding.extractDocument.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WelcomeInput>({
    resolver: zodResolver(WelcomeInputSchema),
    defaultValues: {
      role: "business_owner",
      industry: "services",
    },
  });

  const selectedRole = watch("role");

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { fileUrl } = await uploadRes.json();

      // Extract data
      const result = await extractDocument.mutateAsync({
        documentType: "gst_certificate",
        fileUrl,
      });

      if (result.success && result.confidence > 30) {
        const extracted = result.extracted as Record<string, any>;
        setExtractedData(extracted);
        // Auto-fill business name from extracted data
        if (extracted.legalName) {
          setValue("businessName", extracted.legalName);
        }
        showToast.success(`Document extracted (${result.confidence}% confidence)`);
      } else {
        showToast.info(result.message || "Could not extract data — please enter manually");
      }
    } catch (error: any) {
      showToast.error(error?.message || "Extraction failed");
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: WelcomeInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 1,
        data: { welcome: data },
      });
      showToast.success("Welcome details saved");
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-3">
          Welcome to Arthvahi
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Let&apos;s set up your accounting system. A few quick questions to
          tailor the experience to your business.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* Role Selection */}
        <section className="space-y-4">
          <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid">
            Your Role
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ONBOARDING_ROLES.map((r) => (
              <label
                key={r.value}
                className={`p-6 border-[0.5px] rounded-md transition-colors cursor-pointer ${
                  selectedRole === r.value
                    ? "bg-amber-50 border-amber shadow-sm"
                    : "bg-surface border-border hover:bg-surface-muted"
                }`}
              >
                <input
                  type="radio"
                  value={r.value}
                  className="sr-only"
                  {...register("role")}
                />
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedRole === r.value ? "border-amber" : "border-stone-300"
                    }`}
                  >
                    {selectedRole === r.value && (
                      <div className="w-2 h-2 rounded-full bg-amber" />
                    )}
                  </div>
                  <h3 className="font-ui text-[13px] font-bold text-on-surface">
                    {r.label}
                  </h3>
                </div>
                <p className="font-ui text-[11px] text-text-mid leading-relaxed">
                  {r.desc}
                </p>
              </label>
            ))}
          </div>
        </section>

        {/* Document Upload for Auto-fill */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-ui text-[13px] font-bold text-on-surface">
                Auto-fill from Documents
              </p>
              <p className="font-ui text-[11px] text-text-mid">
                Upload GST Certificate, PAN Card, or Incorporation Certificate to auto-fill details
              </p>
            </div>
            <label className="bg-surface border border-border rounded-md px-4 py-2 font-ui text-[12px] font-bold text-on-surface hover:bg-surface-muted transition-colors flex items-center gap-2 cursor-pointer">
              <Icon name="upload_file" className="text-[16px]" />
              {extracting ? "Extracting..." : "Upload Document"}
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleDocumentUpload}
                disabled={extracting}
              />
            </label>
          </div>

          {extractedData && (
            <div className="bg-success-subtle border border-success/20 rounded-md p-4">
              <p className="font-ui text-[12px] font-bold text-success mb-2">
                <Icon name="check_circle" className="inline mr-1" />
                Document Extracted
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-success">
                {extractedData.legalName && <p>Legal Name: {extractedData.legalName}</p>}
                {extractedData.gstin && <p>GSTIN: {extractedData.gstin}</p>}
                {extractedData.pan && <p>PAN: {extractedData.pan}</p>}
                {extractedData.address && <p>Address: {extractedData.address}</p>}
              </div>
            </div>
          )}
        </section>

        {/* Business Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <div className="flex flex-col gap-2">
            <label
              className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid"
              htmlFor="businessName"
            >
              Business Name
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="businessName"
              placeholder="e.g. Acme Technologies"
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="text-danger text-[10px] uppercase font-bold tracking-wider mt-1">
                {errors.businessName.message}
              </p>
            )}
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2">
            <label
              className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid"
              htmlFor="industry"
            >
              Industry
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                id="industry"
                {...register("industry")}
              >
                {INDUSTRIES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none"
              />
            </div>
          </div>

          {/* Number of Employees */}
          <div className="flex flex-col gap-2">
            <label
              className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid"
              htmlFor="numberOfEmployees"
            >
              Number of Employees
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                id="numberOfEmployees"
                {...register("numberOfEmployees")}
              >
                <option value="">Select...</option>
                {EMPLOYEE_COUNT_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none"
              />
            </div>
          </div>

          {/* Current Tool */}
          <div className="flex flex-col gap-2">
            <label
              className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid"
              htmlFor="currentTool"
            >
              Current Accounting Tool
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                id="currentTool"
                {...register("currentTool")}
              >
                <option value="">Select...</option>
                {CURRENT_TOOLS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center mt-6 pt-8 border-t border-border">
          <button
            className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
            <Icon
              name="arrow_forward"
              className="text-[18px] group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
      </form>
    </div>
  );
}
