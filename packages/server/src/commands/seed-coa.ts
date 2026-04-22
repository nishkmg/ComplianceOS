import { db } from "@complianceos/db";
import { accounts } from "@complianceos/db";
import type { CoARefinementsInput } from "@complianceos/shared";
import soleProprietorshipTrading from "@complianceos/db/seed/coa-templates/sole_proprietorship_trading.json";
import soleProprietorshipServices from "@complianceos/db/seed/coa-templates/sole_proprietorship_services.json";
import partnershipTrading from "@complianceos/db/seed/coa-templates/partnership_trading.json";
import partnershipServices from "@complianceos/db/seed/coa-templates/partnership_services.json";
import llpServices from "@complianceos/db/seed/coa-templates/llp_services.json";
import hufTrading from "@complianceos/db/seed/coa-templates/huf_trading.json";
import privateLimitedTrading from "@complianceos/db/seed/coa-templates/private_limited_trading.json";
import privateLimitedServices from "@complianceos/db/seed/coa-templates/private_limited_services.json";
import privateLimitedManufacturing from "@complianceos/db/seed/coa-templates/private_limited_manufacturing.json";
import regulatedProfessional from "@complianceos/db/seed/coa-templates/regulated_professional.json";

type CoATemplateAccount = {
  code: string;
  name: string;
  kind: string;
  subType: string;
  tags?: string[];
  isSystem?: boolean;
  children?: CoATemplateAccount[];
};

type FlattenedAccount = {
  code: string;
  name: string;
  kind: string;
  subType: string;
  tags?: string[];
  isEnabled: boolean;
  children: FlattenedAccount[];
  parentCode: string | undefined;
};

function flattenTemplate(roots: CoATemplateAccount[], parentCode?: string): Map<string, FlattenedAccount> {
  const map = new Map<string, FlattenedAccount>();

  for (const account of roots) {
    const entry: FlattenedAccount = {
      code: account.code,
      name: account.name,
      kind: account.kind,
      subType: account.subType,
      tags: account.tags,
      isEnabled: true,
      children: [],
      parentCode,
    };
    map.set(account.code, entry);

    if (account.children && account.children.length > 0) {
      const childMap = flattenTemplate(account.children, account.code);
      for (const [childCode, childEntry] of childMap) {
        map.set(childCode, childEntry);
      }
      // Update children reference on parent
      entry.children = Array.from(childMap.values()).filter((c) => c.parentCode === account.code);
    }
  }

  return map;
}

function applyRefinements(
  map: Map<string, FlattenedAccount>,
  refinements: CoARefinementsInput,
): void {
  for (const refinement of refinements.accounts) {
    const existing = map.get(refinement.code);
    if (existing) {
      existing.name = refinement.name;
      existing.isEnabled = refinement.isEnabled;
    }

    if (refinement.children) {
      for (const childRef of refinement.children) {
        const existingChild = map.get(childRef.code);
        if (existingChild) {
          existingChild.name = childRef.name;
          existingChild.isEnabled = childRef.isEnabled;
        }
      }
    }
  }
}

export async function seedCoa(
  tenantId: string,
  businessType: string,
  industry: string,
  refinements?: CoARefinementsInput,
): Promise<{ accountCount: number }> {
  // 1. Load appropriate template
  const templateKey = `${businessType}_${industry}`;
  let template: CoATemplateAccount[];

  switch (templateKey) {
    case "sole_proprietorship_trading":
      template = soleProprietorshipTrading as CoATemplateAccount[];
      break;
    case "sole_proprietorship_services":
      template = soleProprietorshipServices as CoATemplateAccount[];
      break;
    case "partnership_trading":
      template = partnershipTrading as CoATemplateAccount[];
      break;
    case "partnership_services":
      template = partnershipServices as CoATemplateAccount[];
      break;
    case "llp_services":
      template = llpServices as CoATemplateAccount[];
      break;
    case "huf_trading":
      template = hufTrading as CoATemplateAccount[];
      break;
    case "private_limited_trading":
      template = privateLimitedTrading as CoATemplateAccount[];
      break;
    case "private_limited_services":
      template = privateLimitedServices as CoATemplateAccount[];
      break;
    case "private_limited_manufacturing":
      template = privateLimitedManufacturing as CoATemplateAccount[];
      break;
    case "regulated_professional_services":
    case "regulated_professional_retail_trading":
    case "regulated_professional_manufacturing":
      template = regulatedProfessional as CoATemplateAccount[];
      break;
    default:
      template = soleProprietorshipTrading as CoATemplateAccount[];
  }

  // 2. Flatten template into map
  const map = flattenTemplate(template);

  // 3. Apply refinements if provided
  if (refinements) {
    applyRefinements(map, refinements);
  }

  // 4. Generate IDs and resolve parent references
  const codeToId = new Map<string, string>();
  const parentCodes = new Map<string, string | undefined>();

  for (const code of map.keys()) {
    codeToId.set(code, crypto.randomUUID());
  }

  for (const [code, entry] of map) {
    parentCodes.set(code, entry.parentCode);
  }

  // 5. Insert all accounts in a transaction
  await db.transaction(async (tx) => {
    for (const [code, entry] of map) {
      const parentId = entry.parentCode ? codeToId.get(entry.parentCode) ?? null : null;

      await tx.insert(accounts).values({
        tenantId,
        code: entry.code,
        name: entry.name,
        kind: entry.kind as "Asset" | "Liability" | "Equity" | "Revenue" | "Expense",
        subType: entry.subType as any,
        parentId,
        isSystem: false,
        isActive: entry.isEnabled,
        isLeaf: entry.children.length === 0,
      });
    }
  });

  return { accountCount: map.size };
}
