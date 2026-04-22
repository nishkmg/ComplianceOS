import { seedCashFlowDefaults } from "./cash-flow-defaults";
import { seedDemoData } from "./demo-data";

export async function seed(): Promise<void> {
  console.log("Seeding cash flow defaults...");
  await seedCashFlowDefaults();
  console.log("Seed complete.");
}

export async function seedDemo(): Promise<void> {
  console.log("Seeding demo data...");
  await seedDemoData();
  console.log("Demo seed complete.");
}

// Default seed (cash flow only)
if (process.env.SEED_DEMO === "true") {
  seedDemo().catch(console.error);
} else {
  seed().catch(console.error);
}
