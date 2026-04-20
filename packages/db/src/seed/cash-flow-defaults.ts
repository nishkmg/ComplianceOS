import { db } from "../index";
import { cashFlowDefaultMapping } from "../schema";

export async function seedCashFlowDefaults(): Promise<void> {
  const defaults = [
    { subType: "CurrentAsset" as const, cashFlowCategory: "operating" as const },
    { subType: "FixedAsset" as const, cashFlowCategory: "investing" as const },
    { subType: "Bank" as const, cashFlowCategory: "operating" as const },
    { subType: "Cash" as const, cashFlowCategory: "operating" as const },
    { subType: "Inventory" as const, cashFlowCategory: "operating" as const },
    { subType: "CurrentLiability" as const, cashFlowCategory: "operating" as const },
    { subType: "LongTermLiability" as const, cashFlowCategory: "financing" as const },
    { subType: "Capital" as const, cashFlowCategory: "financing" as const },
    { subType: "Drawing" as const, cashFlowCategory: "financing" as const },
    { subType: "Reserves" as const, cashFlowCategory: "financing" as const },
    { subType: "OperatingRevenue" as const, cashFlowCategory: "operating" as const },
    { subType: "OtherRevenue" as const, cashFlowCategory: "operating" as const },
    { subType: "DirectExpense" as const, cashFlowCategory: "operating" as const },
    { subType: "IndirectExpense" as const, cashFlowCategory: "operating" as const },
  ];

  await db.insert(cashFlowDefaultMapping).values(defaults).onConflictDoNothing();
}
