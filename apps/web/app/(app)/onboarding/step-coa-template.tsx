"use client";

import { useMemo } from "react";

export interface CoATemplateData {
  templateName: string;
  templateKey: string;
}

interface StepCoATemplateProps {
  businessType: string;
  industry: string;
  onNext: (data: CoATemplateData) => void;
  onBack: () => void;
}

// Template metadata: name, key, description, root account tags to show
const TEMPLATE_METADATA: Record<string, { name: string; description: string; tags: string[] }> = {
  sole_proprietorship_trading: {
    name: "Sole Proprietorship (Trading)",
    description: "Capital, Drawings, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Inventory, Rent, Salaries",
    tags: ["trading", "gst", "inventory", "payroll"],
  },
  sole_proprietorship_services: {
    name: "Sole Proprietorship (Services)",
    description: "Capital, Drawings, Bank, Cash, Debtors, Creditors, Professional Fees, GST, Rent, Salaries, Telephone",
    tags: ["services", "gst", "professional", "payroll"],
  },
  partnership_trading: {
    name: "Partnership (Trading)",
    description: "Partners' Capital, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Inventory, Freight, Rent, Salaries",
    tags: ["trading", "gst", "inventory", "payroll", "partnership"],
  },
  partnership_services: {
    name: "Partnership (Services)",
    description: "Partners' Capital, Bank, Cash, Debtors, Creditors, Professional Fees, GST, Rent, Salaries, Telephone",
    tags: ["services", "gst", "professional", "payroll", "partnership"],
  },
  private_limited_trading: {
    name: "Private Limited (Trading)",
    description: "Share Capital, Reserves, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Inventory, Freight, Salaries, Fixed Assets",
    tags: ["trading", "gst", "inventory", "payroll", "corporate"],
  },
  private_limited_services: {
    name: "Private Limited (Services)",
    description: "Share Capital, Reserves, Bank, Cash, Debtors, Creditors, Professional Fees, GST, Director Remuneration, Rent, Salaries",
    tags: ["services", "gst", "professional", "payroll", "corporate"],
  },
  private_limited_manufacturing: {
    name: "Private Limited (Manufacturing)",
    description: "Share Capital, Reserves, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Inventory, BOM, WIP, Finished Goods, Salaries",
    tags: ["manufacturing", "gst", "inventory", "bom", "payroll", "corporate"],
  },
  llp_services: {
    name: "LLP (Services)",
    description: "Partners' Capital, Designated Partner Remuneration, Bank, Cash, Debtors, Creditors, Professional Fees, GST, Rent, Salaries",
    tags: ["services", "gst", "professional", "payroll", "llp"],
  },
  huf_trading: {
    name: "HUF (Trading)",
    description: "HUF Capital, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Inventory, Rent, Kartha Remuneration",
    tags: ["trading", "gst", "inventory", "huf"],
  },
  regulated_professional: {
    name: "Regulated Professional",
    description: "Capital, Bank, Cash, Debtors, Creditors, Professional Fees, GST, Statutory Dues, Rent, Salaries, CPE Expenses",
    tags: ["professional", "gst", "statutory", "cpe"],
  },
};

// Map (businessType, industry) -> available template keys
function getTemplateKeysForContext(
  businessType: string,
  industry: string
): string[] {
  const bt = businessType.toLowerCase();
  const ind = industry.toLowerCase();

  if (bt.includes("sole") || bt.includes("proprietorship")) {
    if (ind.includes("trading") || ind.includes("retail") || ind.includes("wholesale") || ind.includes("ecommerce")) {
      return ["sole_proprietorship_trading"];
    }
    return ["sole_proprietorship_services"];
  }

  if (bt.includes("partnership")) {
    if (ind.includes("trading") || ind.includes("retail") || ind.includes("wholesale")) {
      return ["partnership_trading", "sole_proprietorship_trading"];
    }
    return ["partnership_services", "sole_proprietorship_services"];
  }

  if (bt.includes("private") || bt.includes("ltd") || bt.includes("company")) {
    if (ind.includes("manufacturing") || ind.includes("factory") || ind.includes("production")) {
      return ["private_limited_manufacturing", "private_limited_trading"];
    }
    if (ind.includes("trading") || ind.includes("retail") || ind.includes("wholesale") || ind.includes("ecommerce")) {
      return ["private_limited_trading"];
    }
    return ["private_limited_services", "private_limited_trading"];
  }

  if (bt.includes("llp")) {
    return ["llp_services", "partnership_services"];
  }

  if (bt.includes("huf")) {
    return ["huf_trading", "sole_proprietorship_trading"];
  }

  if (bt.includes("regulated") || bt.includes("professional") || ind.includes("consultancy") || ind.includes("legal") || ind.includes("ca") || ind.includes("cs")) {
    return ["regulated_professional"];
  }

  // Fallback: return relevant templates based on business type only
  if (bt.includes("partnership")) return ["partnership_trading", "partnership_services"];
  if (bt.includes("llp")) return ["llp_services"];
  if (bt.includes("huf")) return ["huf_trading"];
  return ["private_limited_trading", "private_limited_services"];
}

// Count root + all descendants in a template
function countAccounts(accounts: { children?: unknown[] }[]): number {
  let total = 0;
  for (const acc of accounts) {
    total += 1 + countAccounts((acc.children as typeof accounts) ?? []);
  }
  return total;
}

export default function StepCoATemplate({
  businessType,
  industry,
  onNext,
  onBack,
}: StepCoATemplateProps) {
  const templateKeys = useMemo(
    () => getTemplateKeysForContext(businessType, industry),
    [businessType, industry]
  );

  // Deduplicate while preserving order
  const uniqueKeys = [...new Set(templateKeys)];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Choose a Template</h2>
          <p className="text-sm text-gray-500 mt-1">
            Based on your business type — select a chart of accounts template
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {uniqueKeys.map((key) => {
          const meta = TEMPLATE_METADATA[key];
          if (!meta) return null;
          return (
            <TemplateCard
              key={key}
              templateKey={key}
              templateName={meta.name}
              description={meta.description}
              onSelect={() => onNext({ templateName: meta.name, templateKey: key })}
            />
          );
        })}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  templateKey: string;
  templateName: string;
  description: string;
  onSelect: () => void;
}

function TemplateCard({ templateName, description, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 group-hover:text-blue-700">
            {templateName}
          </p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="ml-3">
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}