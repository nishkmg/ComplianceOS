"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { BankSetupInputSchema, type BankSetupInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ScreenBankSetupProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenBankSetup({ tenantId, onComplete, onBack }: ScreenBankSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<BankSetupInput>({
    resolver: zodResolver(BankSetupInputSchema),
    defaultValues: {
      connectBank: false,
    },
  });

  const connectBank = watch("connectBank");

  const onSubmit = async (data: BankSetupInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 11,
        data: { bankSetup: data },
      });
      showToast.success("Bank setup saved");
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
          Bank Account
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Connect your primary business bank account for reconciliation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        {/* Connect vs Skip */}
        <div className="bg-surface border-[0.5px] border-border shadow-sm flex flex-col overflow-hidden">
          <div className="h-[2px] w-full bg-amber"></div>

          <div
            onClick={() => setValue("connectBank", true)}
            className={`p-8 border-b-[0.5px] border-border transition-colors cursor-pointer ${
              connectBank ? "bg-amber-50" : "bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-colors ${
                connectBank ? "bg-amber border-amber" : "border-stone-300"
              }`}>
                {connectBank && <Icon name="check" className="text-white text-[16px]" />}
              </div>
              <div className="flex flex-col">
                <span className={`font-ui text-lg font-bold ${connectBank ? "text-primary" : "text-on-surface"}`}>Add Bank Account</span>
                <span className="font-ui text-[13px] text-text-mid mt-1">
                  Enter your bank details manually for reconciliation
                </span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setValue("connectBank", false)}
            className={`p-8 transition-colors cursor-pointer ${
              !connectBank ? "bg-amber-50" : "bg-surface hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-1 transition-colors ${
                !connectBank ? "bg-amber border-amber" : "border-stone-300"
              }`}>
                {!connectBank && <Icon name="check" className="text-white text-[16px]" />}
              </div>
              <div className="flex flex-col">
                <span className={`font-ui text-lg font-bold ${!connectBank ? "text-primary" : "text-on-surface"}`}>Add Later</span>
                <span className="font-ui text-[13px] text-text-mid mt-1">
                  Skip bank setup for now — configure in Settings when ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {connectBank && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 animate-in">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="bankName">
                Bank Name
              </label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
                id="bankName"
                placeholder="e.g. HDFC Bank"
                {...register("bankName")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="accountNumber">
                Account Number
              </label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
                id="accountNumber"
                placeholder="Enter account number"
                {...register("accountNumber")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="ifsc">
                IFSC Code
              </label>
              <input
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-[14px] text-on-surface uppercase tracking-widest focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-[200px]"
                id="ifsc"
                maxLength={11}
                placeholder="HDFC0001234"
                {...register("ifsc")}
              />
            </div>
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
            <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
