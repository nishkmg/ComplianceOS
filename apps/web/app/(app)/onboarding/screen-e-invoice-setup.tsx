"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { EInvoiceSetupInputSchema, type EInvoiceSetupInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { IRP_PROVIDERS } from "@/lib/constants";

interface ScreenEInvoiceSetupProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenEInvoiceSetup({ tenantId, onComplete, onBack }: ScreenEInvoiceSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<EInvoiceSetupInput>({
    resolver: zodResolver(EInvoiceSetupInputSchema),
    defaultValues: {
      eInvoiceEnabled: false,
    },
  });

  const eInvoiceEnabled = watch("eInvoiceEnabled");

  const onSubmit = async (data: EInvoiceSetupInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 9,
        data: { eInvoiceSetup: data },
      });
      showToast.success("E-Invoice setup saved");
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
          E-Invoice Setup
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Configure e-invoicing for B2B transactions (mandatory for turnover above ₹5 Cr).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* E-Invoice Toggle */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-ui text-[13px] font-bold text-on-surface">
                Do you generate e-Invoices?
              </p>
              <p className="font-ui text-[11px] text-text-mid">
                Enable if your business needs to generate IRN-registered invoices
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register("eInvoiceEnabled")} />
              <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-amber"></div>
            </label>
          </div>

          {eInvoiceEnabled && (
            <div className="flex flex-col gap-8 animate-in">
              {/* IRP Provider */}
              <div className="flex flex-col gap-2">
                <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid">
                  IRP Provider
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {IRP_PROVIDERS.map((p) => (
                    <label
                      key={p.value}
                      className={`p-4 border-[0.5px] rounded-md transition-colors cursor-pointer ${
                        watch("irpProvider") === p.value
                          ? "bg-amber-50 border-amber shadow-sm"
                          : "bg-surface border-border hover:bg-surface-muted"
                      }`}
                    >
                      <input type="radio" value={p.value} className="sr-only" {...register("irpProvider")} />
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${watch("irpProvider") === p.value ? "border-amber" : "border-stone-300"}`}>
                          {watch("irpProvider") === p.value && <div className="w-1.5 h-1.5 rounded-full bg-amber" />}
                        </div>
                        <span className="font-ui text-[12px] font-bold text-on-surface">{p.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Credentials */}
              <div className="flex flex-col gap-2">
                <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="apiCredentials">
                  API Credentials / Client ID
                </label>
                <input
                  className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
                  id="apiCredentials"
                  placeholder="Enter your IRP API credentials (or skip to configure later)"
                  {...register("apiCredentials")}
                />
                <p className="font-ui text-[10px] text-text-light">
                  You can configure API credentials later in Settings → E-Invoice
                </p>
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
