"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { TdsSetupInputSchema, type TdsSetupInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { DEDUCTOR_CATEGORIES } from "@/lib/constants";

interface ScreenTdsSetupProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenTdsSetup({ tenantId, onComplete, onBack }: ScreenTdsSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<TdsSetupInput>({
    resolver: zodResolver(TdsSetupInputSchema),
    defaultValues: {
      tdsApplicable: false,
    },
  });

  const tdsApplicable = watch("tdsApplicable");

  const onSubmit = async (data: TdsSetupInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 8,
        data: { tdsSetup: data },
      });
      showToast.success("TDS setup saved");
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
          TDS Setup
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Tax Deducted at Source configuration for compliant payments.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* TDS Toggle */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-ui text-[13px] font-bold text-on-surface">
                Do you deduct TDS?
              </p>
              <p className="font-ui text-[11px] text-text-mid">
                Enable if your business is required to deduct tax at source
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register("tdsApplicable")} />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-amber"></div>
            </label>
          </div>

          {tdsApplicable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 animate-in">
              <div className="flex flex-col gap-2">
                <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="tan">
                  TAN Number
                </label>
                <input
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-xs"
                  id="tan"
                  maxLength={10}
                  placeholder="ABCD12345E"
                  {...register("tan")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="deductorCategory">
                  Deductor Category
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                    id="deductorCategory"
                    {...register("deductorCategory")}
                  >
                    <option value="">Select...</option>
                    {DEDUCTOR_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </section>

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
            <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
