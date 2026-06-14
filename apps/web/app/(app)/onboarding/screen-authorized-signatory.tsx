"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { AuthorizedSignatoryInputSchema, type AuthorizedSignatoryInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ScreenAuthorizedSignatoryProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenAuthorizedSignatory({ tenantId, onComplete, onBack }: ScreenAuthorizedSignatoryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthorizedSignatoryInput>({
    resolver: zodResolver(AuthorizedSignatoryInputSchema),
  });

  const onSubmit = async (data: AuthorizedSignatoryInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 5,
        data: { authorizedSignatory: data },
      });
      showToast.success("Signatory details saved");
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
          Authorized Signatory
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          The person authorized to sign statutory filings and compliance documents.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <div className="flex flex-col gap-2">
            <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="fullName"
              placeholder="As per PAN"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="designation">
              Designation
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="designation"
              placeholder="e.g. Director, Partner, Proprietor"
              {...register("designation")}
            />
            {errors.designation && (
              <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.designation.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="mobile">
              Mobile Number
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="mobile"
              placeholder="9876543210"
              maxLength={10}
              {...register("mobile")}
            />
            {errors.mobile && (
              <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.mobile.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-[11px] text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="email"
              type="email"
              placeholder="signatory@company.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

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
