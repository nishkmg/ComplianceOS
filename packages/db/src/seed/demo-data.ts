// packages/db/src/seed/demo-data.ts
import { db } from "../index";
import { users, userTenants } from "../schema/users";
import { tenants } from "../schema/tenants";
import { fiscalYears } from "../schema/fiscal-years";
import { products } from "../schema/products";
import { accounts } from "../schema/accounts";
import { journalEntries, journalEntryLines } from "../schema/journal";
import { invoices, invoiceLines } from "../schema/invoices";
import { employees, salaryComponents, employeeSalaryStructures } from "../schema/employees";
import { payrollRuns, payrollLines } from "../schema/payroll";
import { gstConfig } from "../schema/gst-config";
import { itrConfig } from "../schema/itr-config";
import { eq, sql } from "drizzle-orm";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function cleanDemoData() {
  console.log("🧹 Cleaning existing demo data...");
  
  // Delete in reverse order of dependencies
  await db.delete(payrollLines).where(sql`true`);
  await db.delete(payrollRuns).where(sql`true`);
  await db.delete(invoiceLines).where(sql`true`);
  await db.delete(invoices).where(sql`true`);
  await db.delete(journalEntryLines).where(sql`true`);
  await db.delete(journalEntries).where(sql`true`);
  await db.delete(stockMovements).where(sql`true`);
  await db.delete(inventoryLayers).where(sql`true`);
  await db.delete(warehouseStock).where(sql`true`);
  await db.delete(products).where(sql`true`);
  await db.delete(employees).where(sql`true`);
  await db.delete(salaryComponents).where(sql`true`);
  await db.delete(employeeSalaryStructures).where(sql`true`);
  await db.delete(accounts).where(eq(accounts.tenantId, DEMO_TENANT_ID));
  await db.delete(fiscalYears).where(eq(fiscalYears.tenantId, DEMO_TENANT_ID));
  await db.delete(gstConfig).where(eq(gstConfig.tenantId, DEMO_TENANT_ID));
  await db.delete(itrConfig).where(eq(itrConfig.tenantId, DEMO_TENANT_ID));
  await db.delete(userTenants).where(eq(userTenants.tenantId, DEMO_TENANT_ID));
  await db.delete(userTenants).where(eq(userTenants.userId, DEMO_USER_ID));
  await db.delete(tenants).where(eq(tenants.id, DEMO_TENANT_ID));
  await db.delete(users).where(eq(users.id, DEMO_USER_ID));
  
  console.log("✅ Demo data cleaned");
}

export async function seedDemoData() {
  const shouldClean = process.env.CLEAN_DEMO === "true";
  if (shouldClean) {
    await cleanDemoData();
  }

  console.log("🌱 Seeding demo data for ComplianceOS...");

  // 1. Create demo user
  await db.insert(users).values({
    id: DEMO_USER_ID,
    email: "demo@complianceos.test",
    name: "Demo User",
  });

  // 2. Create demo tenant
  await db.insert(tenants).values({
    id: DEMO_TENANT_ID,
    name: "Demo Business Pvt Ltd",
    legalName: "Demo Business Private Limited",
    businessType: "private_limited",
    pan: "ABCDE1234F",
    gstin: "27ABCDE1234F1Z5",
    address: "123 Business Street, Mumbai, Maharashtra 400001",
    state: "maharashtra",
    industry: "services_professional",
    gstRegistration: "regular",
    onboardingStatus: "complete",
    onboardingData: {
      businessProfile: { businessType: "private_limited", industry: "services_professional" },
      moduleActivation: { accounting: true, invoicing: true, inventory: true, payroll: true, gst: true, itr: true },
      fyGst: { fiscalYear: "2026-27", gstRegistration: "regular" },
    },
  });

  // 3. Link user to tenant
  await db.insert(userTenants).values({
    userId: DEMO_USER_ID,
    tenantId: DEMO_TENANT_ID,
    role: "owner",
  });

  // 4. Create fiscal year
  await db.insert(fiscalYears).values({
    tenantId: DEMO_TENANT_ID,
    year: "2026-27",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
    status: "open",
  });

  // 5. Create GST config
  await db.insert(gstConfig).values({
    tenantId: DEMO_TENANT_ID,
    gstRegistration: "regular",
    itcEligible: true,
    tdsApplicable: true,
    applicableGstRates: [5, 12, 18, 28],
  });

  // 6. Create ITR config
  await db.insert(itrConfig).values({
    tenantId: DEMO_TENANT_ID,
    taxRegime: "new",
    presumptiveScheme: "none",
    tdsApplicable: true,
    advanceTaxApplicable: true,
  });

  // 7. Create sample products
  await db.insert(products).values([
    {
      id: "00000000-0000-0000-0000-000000000101",
      tenantId: DEMO_TENANT_ID,
      name: "Consulting Services",
      sku: "SVC-001",
      description: "Professional consulting services",
      hsnCode: "9983111",
      gstRate: 18,
      isService: true,
    },
    {
      id: "00000000-0000-0000-0000-000000000102",
      tenantId: DEMO_TENANT_ID,
      name: "Software License",
      sku: "SVC-002",
      description: "Annual software license",
      hsnCode: "9973310",
      gstRate: 18,
      isService: true,
    },
  ]);

  // 8. Create sample employee
  await db.insert(employees).values({
    id: "00000000-0000-0000-0000-000000000201",
    tenantId: DEMO_TENANT_ID,
    employeeCode: "EMP001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@demobusiness.test",
    phone: "+91 98765 43210",
    dateOfBirth: "1990-01-15",
    dateOfJoining: "2024-04-01",
    designation: "Senior Consultant",
    department: "Operations",
    pan: "ABCPD1234E",
    aadhaar: "1234 5678 9012",
    bankName: "HDFC Bank",
    bankAccount: "50200012345678",
    bankIfsc: "HDFC0001234",
    isActive: true,
  });

  console.log("✅ Demo tenant created: Demo Business Pvt Ltd");
  console.log("📧 Login: demo@complianceos.test");
  console.log("📊 FY: 2026-27 (Apr 2026 - Mar 2027)");
  console.log("📦 Products: 2 services created");
  console.log("👤 Employee: John Doe (EMP001) created");
}

// Run if called directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log("\n✅ Demo data seeded successfully!");
      console.log("\n🔐 To remove demo data, run:");
      console.log("   pnpm --filter @complianceos/db db:seed:demo:clean\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error seeding demo data:", err);
      process.exit(1);
    });
}
