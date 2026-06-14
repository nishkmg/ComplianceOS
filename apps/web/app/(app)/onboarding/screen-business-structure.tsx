"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { BusinessStructureInputSchema, type BusinessStructureInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { BUSINESS_TYPES } from "@/lib/constants";

interface ScreenBusinessStructureProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenBusinessStructure({ tenantId, onComplete, onBack }: ScreenBusinessStructureProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BusinessStructureInput>({
    resolver: zodResolver(BusinessStructureInputSchema),
    defaultValues: {
      businessType: "private_limited",
    },
  });

  const selectedType = watch("businessType");

  const onSubmit = async (data: BusinessStructureInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 2,
        data: { businessStructure: data },
      });
      showToast.success("Business structure saved");
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
          Business Structure
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Select your entity type. This determines your compliance obligations and
          financial reporting requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_TYPES.map((t) => (
            <label
              key={t.value}
              className={`p-6 border-[0.5px] rounded-md transition-colors cursor-pointer ${
                selectedType === t.value
                  ? "bg-amber-50 border-amber shadow-sm"
                  : "bg-surface border-border hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                value={t.value}
                className="sr-only"
                {...register("businessType")}
              />
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedType === t.value ? "border-amber" : "border-stone-300"
                  }`}
                >
                  {selectedType === t.value && (
                    <div className="w-2 h-2 rounded-full bg-amber" />
                  )}
                </div>
                <h3 className="font-ui text-[13px] font-bold text-on-surface">
                  {t.label}
                </h3>
              </div>
            </label>
          ))}
        </div>

        {errors.businessType && (
          <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider">
            {errors.businessType.message}
          </p>
        )}

        {/* Skip Logic Info */}
        {(selectedType === "sole_proprietorship" || selectedType === "huf") && (
          <div className="bg-amber-50 border border-amber/30 rounded-md p-4">
            <p className="font-ui text-[12px] text-text-mid">
              <Icon name="info" className="inline text-amber mr-1" />
              Sole proprietorship and HUF entities have simplified compliance. Some
              steps will be skipped automatically.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="font-ui text-[13px] text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <Icon name="arrow_back" className="text-[18px]" />
                Back
              </button>
            )}
          </div>
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
