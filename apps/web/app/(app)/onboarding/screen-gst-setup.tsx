"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { GstSetupInputSchema, type GstSetupInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ScreenGstSetupProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenGstSetup({ tenantId, onComplete, onBack }: ScreenGstSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<GstSetupInput>({
    resolver: zodResolver(GstSetupInputSchema),
    defaultValues: {
      gstFilingFrequency: "monthly",
      compositionScheme: false,
      enableGstReconciliation: true,
    },
  });

  const compositionScheme = watch("compositionScheme");

  const onSubmit = async (data: GstSetupInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 7,
        data: { gstSetup: data },
      });
      showToast.success("GST setup saved");
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
          GST Setup
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Configure your GST filing preferences and compliance settings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* Filing Frequency */}
        <section className="space-y-4">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">Filing Frequency</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`p-6 border-[0.5px] rounded-md transition-colors cursor-pointer ${
              watch("gstFilingFrequency") === "monthly" ? "bg-amber-50 border-amber shadow-sm" : "bg-surface border-border hover:bg-surface-muted"
            }`}>
              <input type="radio" value="monthly" className="sr-only" {...register("gstFilingFrequency")} />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${watch("gstFilingFrequency") === "monthly" ? "border-amber" : "border-stone-300"}`}>
                  {watch("gstFilingFrequency") === "monthly" && <div className="w-2 h-2 rounded-full bg-amber" />}
                </div>
                <div>
                  <h3 className="font-ui text-[13px] font-bold text-on-surface">Monthly</h3>
                  <p className="font-ui text-[11px] text-text-mid">GSTR-1 and GSTR-3B filed monthly</p>
                </div>
              </div>
            </label>
            <label className={`p-6 border-[0.5px] rounded-md transition-colors cursor-pointer ${
              watch("gstFilingFrequency") === "quarterly" ? "bg-amber-50 border-amber shadow-sm" : "bg-surface border-border hover:bg-surface-muted"
            }`}>
              <input type="radio" value="quarterly" className="sr-only" {...register("gstFilingFrequency")} />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${watch("gstFilingFrequency") === "quarterly" ? "border-amber" : "border-stone-300"}`}>
                  {watch("gstFilingFrequency") === "quarterly" && <div className="w-2 h-2 rounded-full bg-amber" />}
                </div>
                <div>
                  <h3 className="font-ui text-[13px] font-bold text-on-surface">Quarterly</h3>
                  <p className="font-ui text-[11px] text-text-mid">QRMP scheme — quarterly filing</p>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Composition Scheme */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="font-ui text-[13px] font-bold text-on-surface">Composition Scheme?</p>
              <p className="font-ui text-[11px] text-text-mid">
                Simplified scheme for small businesses (turnover up to ₹1.5 Cr)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register("compositionScheme")} />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-amber"></div>
            </label>
          </div>

          {compositionScheme && (
            <div className="bg-amber-50 border border-amber/30 rounded-md p-4">
              <p className="font-ui text-[12px] text-text-mid">
                <Icon name="info" className="inline text-amber mr-1" />
                Composition scheme businesses cannot claim Input Tax Credit (ITC) and cannot collect tax from customers.
              </p>
            </div>
          )}
        </section>

        {/* GST Reconciliation */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="font-ui text-[13px] font-bold text-on-surface">Enable GST Reconciliation</p>
              <p className="font-ui text-[11px] text-text-mid">
                Auto-match purchase invoices with GSTR-2B data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register("enableGstReconciliation")} />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-amber"></div>
            </label>
          </div>
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
