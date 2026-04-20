import { seedCashFlowDefaults } from "./cash-flow-defaults";

export async function seed(): Promise<void> {
  console.log("Seeding cash flow defaults...");
  await seedCashFlowDefaults();
  console.log("Seed complete.");
}

seed().catch(console.error);
