"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { TaxProfileInputSchema, type TaxProfileInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ScreenTaxProfileProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenTaxProfile({ tenantId, onComplete, onBack }: ScreenTaxProfileProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TaxProfileInput>({
    resolver: zodResolver(TaxProfileInputSchema),
    defaultValues: {
      gstRegistered: false,
      tanAvailable: false,
    },
  });

  const gstRegistered = watch("gstRegistered");
  const tanAvailable = watch("tanAvailable");

  const onSubmit = async (data: TaxProfileInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 3,
        data: { taxProfile: data },
      });
      showToast.success("Tax profile saved");
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
          Tax Profile
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Configure your tax registration details for automated compliance.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* PAN */}
        <div className="flex flex-col gap-2">
          <label
            className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid"
            htmlFor="pan"
          >
            Permanent Account Number (PAN)
          </label>
          <input
            className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-xs"
            id="pan"
            maxLength={10}
            placeholder="ABCDE1234F"
            {...register("pan")}
          />
          {errors.pan && (
            <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
              {errors.pan.message}
            </p>
          )}
        </div>

        {/* GST Registered Toggle */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-ui text-ui-sm font-bold text-on-surface">
                GST Registered?
              </p>
              <p className="font-ui text-ui-xs text-text-mid">
                Is your business registered under GST?
              </p>
            </div>
            <input type="checkbox" className="sr-only" {...register("gstRegistered")} />
            <button
              type="button"
              onClick={() => setValue("gstRegistered", !gstRegistered)}
              className={`w-10 h-6 rounded-full transition-colors relative border-none cursor-pointer ${
                gstRegistered ? "bg-amber" : "bg-lighter"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform ${
                  gstRegistered ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* GSTIN Field */}
          {gstRegistered && (
            <div className="flex flex-col gap-2">
              <label
                className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid"
                htmlFor="gstin"
              >
                GST Identification Number (GSTIN)
              </label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-sm"
                id="gstin"
                maxLength={15}
                placeholder="22AAAAA0000A1Z5"
                {...register("gstin")}
              />
              {errors.gstin && (
                <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
                  {errors.gstin.message}
                </p>
              )}
            </div>
          )}
        </section>

        {/* TAN Available Toggle */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-ui text-ui-sm font-bold text-on-surface">
                TAN Available?
              </p>
              <p className="font-ui text-ui-xs text-text-mid">
                Do you have a Tax Deduction Account Number?
              </p>
            </div>
            <input type="checkbox" className="sr-only" {...register("tanAvailable")} />
            <button
              type="button"
              onClick={() => setValue("tanAvailable", !tanAvailable)}
              className={`w-10 h-6 rounded-full transition-colors relative border-none cursor-pointer ${
                tanAvailable ? "bg-amber" : "bg-lighter"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-surface transition-transform ${
                  tanAvailable ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          {tanAvailable && (
            <div className="flex flex-col gap-2">
              <label
                className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid"
                htmlFor="tan"
              >
                TAN Number
              </label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-sm"
                id="tan"
                maxLength={10}
                placeholder="ABCD12345E"
                {...register("tan")}
              />
              {errors.tan && (
                <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
                  {errors.tan.message}
                </p>
              )}
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
                className="font-ui text-ui-sm text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
              >
                <Icon name="arrow_back" className="text-ui-xl" />
                Back
              </button>
            )}
          </div>
          <button
            className="bg-amber text-white font-ui text-ui-sm text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue"}
            <Icon
              name="arrow_forward"
              className="text-ui-xl group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
      </form>
    </div>
  );
}
