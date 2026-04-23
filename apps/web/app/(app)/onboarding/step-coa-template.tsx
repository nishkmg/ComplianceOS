"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";

const TEMPLATES = [
  {
    id: "sole_proprietorship_trading",
    name: "Trading Business",
    description: "Buy-sell businesses, wholesale, retail",
    businessType: "sole_proprietorship",
  },
  {
    id: "sole_proprietorship_services",
    name: "Services Business",
    description: "Consulting, professional services",
    businessType: "sole_proprietorship",
  },
  {
    id: "partnership_trading",
    name: "Partnership Trading",
    description: "Partnership firm engaged in trading",
    businessType: "partnership",
  },
  {
    id: "private_limited_services",
    name: "Private Limited (Services)",
    description: "Pvt Ltd company providing services",
    businessType: "private_limited",
  },
  {
    id: "regulated_professional",
    name: "Regulated Professional",
    description: "CA, CS, Lawyers, Architects",
    businessType: "sole_proprietorship",
  },
];

interface StepCoaTemplateProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepCoaTemplate({ tenantId, onComplete }: StepCoaTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const seedCoa = api.onboarding.seedCoa.useMutation({
    onSuccess: () => {
      onComplete();
    },
  });

  const handleSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    const [businessType, industry] = templateId.split("_");
    await seedCoa.mutateAsync({
      tenantId,
      businessType: businessType || "sole_proprietorship",
      industry: industry || "trading",
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-[20px] font-normal text-dark">Chart of Accounts</h2>
        <p className="font-ui text-[13px] text-light mt-1">
          Select a template that matches your business type
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`card p-5 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "border-amber bg-surface-muted"
                : "hover:border-lighter"
            }`}
            onClick={() => handleSelect(template.id)}
          >
            <h3 className="font-ui text-[15px] font-medium text-dark mb-1">
              {template.name}
            </h3>
            <p className="font-ui text-[12px] text-light mb-3">
              {template.description}
            </p>
            <p className="font-ui text-[10px] uppercase tracking-wide text-light">
              Business: {template.businessType.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>

      {seedCoa.isPending && (
        <div className="mt-6 text-center">
          <p className="font-ui text-mid">Setting up your Chart of Accounts...</p>
        </div>
      )}
    </div>
  );
}
