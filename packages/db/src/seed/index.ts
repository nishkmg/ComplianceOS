import { seedCashFlowDefaults } from "./cash-flow-defaults";
import { seedDemoData } from "./demo-data";

function assertSeedAllowed(): void {
  const env = process.env.NODE_ENV;
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbName = (() => {
    try {
      return new URL(dbUrl).pathname.replace(/^\//, "");
    } catch {
      return dbUrl;
    }
  })();

  const isProdDb = /(^|[_-])(prod|production)([_-]|$)/i.test(dbName);
  if (isProdDb && !(process.env.ALLOW_SEED === "1" && process.env.ALLOW_PROD_SEED === "1")) {
    throw new Error(
      `Refusing to seed: DATABASE_URL points to a production-named DB ("${dbName}"). ` +
        `Set ALLOW_SEED=1 AND ALLOW_PROD_SEED=1 to override.`,
    );
  }

  if (env === "production" && process.env.ALLOW_SEED !== "1") {
    throw new Error(
      "Refusing to seed in production. Set NODE_ENV=development or ALLOW_SEED=1 to override.",
    );
  }
  if (env !== "development" && env !== "test" && process.env.ALLOW_SEED !== "1") {
    throw new Error(
      `Refusing to seed in env="${env}". Use dev/test or set ALLOW_SEED=1.`,
    );
  }
}

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

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  try {
    assertSeedAllowed();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
  if (process.env.SEED_DEMO === "true") {
    seedDemo().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    seed().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}
