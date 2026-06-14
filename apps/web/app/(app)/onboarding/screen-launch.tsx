"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

interface ScreenLaunchProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenLaunch({ tenantId, onComplete, onBack }: ScreenLaunchProps) {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const completeOnboarding = api.onboarding.completeOnboarding.useMutation();

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding.mutateAsync();
      showToast.success("Onboarding complete! Welcome to Arthvahi.");
      try {
        await refreshSession();
      } catch {}
      router.push("/dashboard");
    } catch (error: any) {
      showToast.error(error?.message || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-3">
          You&apos;re All Set!
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Your accounting system is configured and ready. Choose your first action to get started.
        </p>
      </div>

      {/* Progress Summary */}
      <section className="space-y-4">
        <div className="bg-amber-50 border border-amber/30 rounded-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="check_circle" className="text-amber text-2xl" />
            <h2 className="font-ui text-lg font-bold text-on-surface">Onboarding Complete</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Business Profile", icon: "business" },
              { label: "Tax Configuration", icon: "gavel" },
              { label: "Chart of Accounts", icon: "account_balance" },
              { label: "Compliance Ready", icon: "verified" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <Icon name="check" className="text-success text-[16px]" />
                <span className="font-ui text-[12px] text-text-mid">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First Action Cards */}
      <section className="space-y-4">
        <div className="border-b-[0.5px] border-border pb-2">
          <h2 className="font-ui text-lg font-bold text-on-surface">Your First Action</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push("/invoices/new")}
            className="group p-8 border-[0.5px] border-border rounded-md transition-colors cursor-pointer bg-surface hover:bg-amber-50 hover:border-amber hover:shadow-sm"
          >
            <Icon name="receipt_long" className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-[13px] font-bold text-on-surface mb-2">Create First Invoice</h3>
            <p className="font-ui text-[11px] text-text-mid leading-relaxed">
              Generate a compliant tax invoice for your first customer
            </p>
          </div>

          <div
            onClick={() => router.push("/expenses/new")}
            className="group p-8 border-[0.5px] border-border rounded-md transition-colors cursor-pointer bg-surface hover:bg-amber-50 hover:border-amber hover:shadow-sm"
          >
            <Icon name="payment" className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-[13px] font-bold text-on-surface mb-2">Record an Expense</h3>
            <p className="font-ui text-[11px] text-text-mid leading-relaxed">
              Track a business expense with GST input credit
            </p>
          </div>

          <div
            onClick={() => router.push("/banking")}
            className="group p-8 border-[0.5px] border-border rounded-md transition-colors cursor-pointer bg-surface hover:bg-amber-50 hover:border-amber hover:shadow-sm"
          >
            <Icon name="account_balance" className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-[13px] font-bold text-on-surface mb-2">Connect Bank</h3>
            <p className="font-ui text-[11px] text-text-mid leading-relaxed">
              Set up bank reconciliation for automatic matching
            </p>
          </div>
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
          onClick={handleLaunch}
          disabled={isSubmitting}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Launching..." : "Launch Dashboard"}
          <Icon name="rocket_launch" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
