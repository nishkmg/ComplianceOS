"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Chart of Accounts</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select a template that matches your business type
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-colors ${
              selectedTemplate === template.id
                ? "border-amber-500 bg-amber-50"
                : "hover:border-gray-300"
            }`}
            onClick={() => handleSelect(template.id)}
          >
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                Business: {template.businessType.replace("_", " ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {seedCoa.isPending && (
        <div className="mt-6 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Setting up your chart of accounts...</p>
        </div>
      )}
    </div>
  );
}
