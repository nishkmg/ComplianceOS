"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { FinancialYearInputSchema, type FinancialYearInput } from "@complianceos/shared";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

function getIndianFY(): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const fyStartYear = now.getMonth() >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;
  const start = `${fyStartYear}-04-01`;
  const end = `${fyEndYear}-03-31`;
  const label = `FY ${fyStartYear}-${String(fyEndYear).slice(2)}`;
  return { start, end, label };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

interface ScreenFinancialYearProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenFinancialYear({ tenantId, onComplete, onBack }: ScreenFinancialYearProps) {
  const fy = useMemo(() => getIndianFY(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const { register, handleSubmit } = useForm<FinancialYearInput>({
    resolver: zodResolver(FinancialYearInputSchema),
    defaultValues: {
      fiscalYearStart: fy.start,
      booksBeginningDate: fy.start,
      importPreviousYearBalances: false,
    },
  });

  const onSubmit = async (data: FinancialYearInput) => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 6,
        data: { financialYear: data },
      });
      showToast.success("Fiscal year configured");
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
          Financial Year
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Indian fiscal year follows April–March per the Income Tax Act.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="bg-amber-50 border border-amber/30 rounded-md p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Icon name="calendar_month" className="text-amber text-2xl" />
            <div>
              <p className="font-ui text-lg font-bold text-on-surface">{fy.label}</p>
              <p className="font-ui text-sm text-text-mid">
                {formatDate(fy.start)} → {formatDate(fy.end)}
              </p>
            </div>
          </div>
          <p className="font-ui text-ui-xs text-text-mid/70 mt-1">
            Fixed Indian fiscal year (April–March). Not configurable.
          </p>
        </div>

        <div className="flex items-center justify-between py-4 border-t border-border">
          <div>
            <p className="font-ui text-ui-sm font-bold text-on-surface">
              Import Previous Year Balances?
            </p>
            <p className="font-ui text-ui-xs text-text-mid">
              Carry forward balances from your previous accounting system
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register("importPreviousYearBalances")} />
            <div className="w-10 h-6 bg-lighter peer-focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:bg-amber"></div>
          </label>
        </div>

        {/* Books Beginning Date */}
        <section className="space-y-4">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">Books Beginning Date</h2>
          </div>
          <p className="font-ui text-ui-sm text-text-mid">
            The date from which you start recording transactions. Usually the same as FY start, but can be later if you onboard mid-year.
          </p>
          <div className="flex flex-col gap-2 max-w-xs">
            <input
              type="date"
              className="w-full bg-surface border border-border rounded-md px-4 py-3 font-ui text-sm text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus:border-amber focus:ring-1 focus:ring-amber transition-colors"
              {...register("booksBeginningDate")}
            />
          </div>
        </section>

        <input type="hidden" {...register("fiscalYearStart")} />

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
