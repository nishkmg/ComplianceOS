"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";

const TEMPLATES = [
  { id: "trading", name: "Trading & Retail", desc: "For wholesale and retail firms managing physical stock.", icon: "shopping_cart", recommended: true },
  { id: "services", name: "Professional Services", desc: "Designed for CA firms, IT consultants, and agencies.", icon: "account_balance" },
  { id: "manufacturing", name: "Manufacturing", desc: "Includes Raw Materials, WIP, and Finished Goods.", icon: "factory" },
];

interface ScreenAccountingTemplateProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenAccountingTemplate({ tenantId, onComplete, onBack }: ScreenAccountingTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("trading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const handleSelect = async () => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 10,
        data: { accountingTemplate: { templateId: selectedTemplate } },
      });
      showToast.success("Chart of accounts template selected");
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
          Accounting Template
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Choose a baseline Chart of Accounts tailored to your business. You can customize accounts after onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`group border-[0.5px] border-border p-8 flex flex-col relative transition-colors transition-shadow duration-300 cursor-pointer ${
              selectedTemplate === t.id ? "bg-amber-50 border-amber shadow-sm" : "bg-surface hover:bg-surface-muted"
            }`}
          >
            {selectedTemplate === t.id && <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>}
            <div className="flex justify-between items-start mb-6">
              <Icon name={t.icon} className={`text-3xl ${selectedTemplate === t.id ? "text-amber" : "text-stone-300"}`} />
              {t.recommended && (
                <span className="font-ui text-[9px] uppercase tracking-widest bg-stone-900 text-white px-2 py-0.5 rounded-md">
                  Recommended
                </span>
              )}
            </div>
            <h3 className="font-ui text-lg font-bold text-on-surface mb-3">{t.name}</h3>
            <p className="font-ui text-[13px] text-text-mid leading-relaxed flex-1">{t.desc}</p>
            {selectedTemplate === t.id && (
              <div className="mt-6 flex items-center gap-2 text-primary font-ui text-[11px] uppercase tracking-widest font-bold">
                <Icon name="check_circle" className="text-sm" />
                Selected
              </div>
            )}
          </div>
        ))}
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
          onClick={handleSelect}
          disabled={isSubmitting}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Generating..." : "Initialize Ledgers"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
