"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { Icon } from '@/components/ui/icon';

const TEMPLATES = [
  { id: "trading", name: "Trading & Retail", desc: "For wholesale and retail firms managing physical stock. Includes Inventory, COGS, and standard GST tax ledgers.", icon: "shopping_cart", recommended: true },
  { id: "services", name: "Professional Services", desc: "Designed for CA firms, IT consultants, and agencies. Focus on service revenue and recurring expense tracking.", icon: "account_balance" },
  { id: "manufacturing", name: "Manufacturing Entity", desc: "Complex structure including Raw Materials, Work-in-Progress (WIP), and Finished Goods with statutory audit readiness.", icon: "factory" },
  { id: "proprietorship", name: "Sole Proprietorship", desc: "Simplified structure with Drawals and Capital accounts mapped to Income Tax reporting standards.", icon: "person" },
  { id: "pvt_ltd", name: "Private Limited", desc: "MCA-compliant structure with Share Capital, Reserves & Surplus, and Schedule III reporting defaults.", icon: "corporate_fare" },
  { id: "llp", name: "Partnership / LLP", desc: "Multi-partner capital tracking with distribution-ready expense ledgers and GST readiness.", icon: "groups" },
];

interface StepCoaTemplateProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepCoaTemplate({ tenantId, onComplete }: StepCoaTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("trading");

  // @ts-ignore
  const seedCoa: any = api.onboarding.seedChartOfAccounts.useMutation({
    onSuccess: () => {
      showToast.success('Chart of accounts initialized');
      onComplete();
    },
    onError: (error: any) => {
      showToast.error(error.message || 'Failed to initialize CoA');
    },
  });

  const handleSelect = async () => {
    await seedCoa.mutateAsync({
      tenantId,
      templateId: selectedTemplate,
    });
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      {/* Section Header */}
      <div>
        <h1 className="font-display text-display-xl text-on-surface mb-6">Select CoA Template</h1>
        <p className="font-ui text-ui-lg text-text-mid max-w-3xl leading-relaxed">
          Choose a baseline structure tailored to your business operations. These templates are strictly aligned with standard Indian accounting practices and statutory compliance requirements.
        </p>
      </div>

      {/* 3-Column Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            className={`group border-[0.5px] border-border p-8 flex flex-col relative transition-all duration-300 cursor-pointer ${
              selectedTemplate === t.id ? "bg-amber-50 border-amber shadow-sm" : "bg-surface hover:bg-surface-muted"
            }`}
          >
            {selectedTemplate === t.id && <div className="absolute top-0 left-0 w-full h-[2px] bg-amber"></div>}
            <div className="flex justify-between items-start mb-6">
              <Icon name={t.icon} className={`text-3xl ${selectedTemplate === t.id ? "text-amber" : "text-stone-300"}`} />
              {t.recommended && <span className="font-ui text-[11px] text-[9px] uppercase tracking-widest bg-stone-900 text-white px-2 py-0.5 rounded-md">Recommended</span>}
            </div>
            <h3 className="font-display text-lg text-lg font-bold text-on-surface mb-3">{t.name}</h3>
            <p className="font-ui text-[13px] text-ui-sm text-text-mid leading-relaxed flex-1">
              {t.desc}
            </p>
            {selectedTemplate === t.id && (
              <div className="mt-6 flex items-center gap-2 text-primary font-ui text-[11px] text-[11px] uppercase tracking-widest font-bold">
                <Icon name="check_circle" className="text-sm" />
                Selection Confirmed
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <p className="font-ui text-[11px] text-[11px] text-text-light uppercase tracking-wider italic">
          You can modify, merge, or add individual ledgers after this step.
        </p>
        <button
          onClick={handleSelect}
          disabled={seedCoa.isPending}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer"
        >
          {seedCoa.isPending ? "Generating Ledgers..." : "Initialise Ledgers"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
