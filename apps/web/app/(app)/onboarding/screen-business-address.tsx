"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { BusinessAddressInputSchema, type BusinessAddressInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { STATES } from "@/lib/constants";

interface ScreenBusinessAddressProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenBusinessAddress({ tenantId, onComplete, onBack }: ScreenBusinessAddressProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessAddressInput>({
    resolver: zodResolver(BusinessAddressInputSchema),
    defaultValues: {
      state: "maharashtra",
    },
  });

  const onSubmit = async (data: BusinessAddressInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 4,
        data: { businessAddress: data },
      });
      showToast.success("Address saved");
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
          Business Address
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Your registered office address for statutory communications.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          {/* Address Line 1 */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="addressLine1">
              Address Line 1
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="addressLine1"
              placeholder="Building name, floor, unit"
              {...register("addressLine1")}
            />
            {errors.addressLine1 && (
              <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
                {errors.addressLine1.message}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="addressLine2">
              Address Line 2
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="addressLine2"
              placeholder="Street, locality"
              {...register("addressLine2")}
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="state">
              State
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
                id="state"
                {...register("state")}
              >
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-text-mid pointer-events-none" />
            </div>
          </div>

          {/* District */}
          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="district">
              District
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="district"
              placeholder="e.g. Mumbai Suburban"
              {...register("district")}
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="city">
              City
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm font-medium text-ui-md text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light"
              id="city"
              placeholder="e.g. Mumbai"
              {...register("city")}
            />
            {errors.city && (
              <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Pincode */}
          <div className="flex flex-col gap-2">
            <label className="font-ui text-ui-xs text-ui-xs uppercase tracking-widest text-text-mid" htmlFor="pincode">
              Pincode
            </label>
            <input
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-ui-md text-on-surface tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors placeholder:text-text-light placeholder:normal-case placeholder:tracking-normal max-w-[200px]"
              id="pincode"
              maxLength={6}
              placeholder="400001"
              {...register("pincode")}
            />
            {errors.pincode && (
              <p className="text-danger text-ui-2xs uppercase font-bold tracking-wider mt-1">
                {errors.pincode.message}
              </p>
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
            <Icon name="arrow_forward" className="text-ui-xl group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}
