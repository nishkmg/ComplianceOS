import { sql } from "drizzle-orm";
import type { Database } from "@complianceos/db";

/**
 * Row-Level Security policies for payroll tables
 * Ensures multi-tenant isolation at database level
 */
export async function applyPayrollRLS(db: Database, tenantId: string) {
  // Enable RLS on payroll tables
  await db.execute(sql`ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE payroll_lines ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE payroll_advances ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE payslips ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE employee_salary_structures ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE payroll_config ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE statutory_liabilities ENABLE ROW LEVEL SECURITY`);
  await db.execute(sql`ALTER TABLE payroll_summary ENABLE ROW LEVEL SECURITY`);

  // Drop existing policies if any (idempotent migration)
  const policies = [
    "payroll_runs_tenant_isolation",
    "payroll_lines_tenant_isolation",
    "payroll_advances_tenant_isolation",
    "payslips_tenant_isolation",
    "salary_structures_tenant_isolation",
    "payroll_config_tenant_isolation",
    "statutory_liabilities_tenant_isolation",
    "payroll_summary_tenant_isolation",
  ];

  for (const policy of policies) {
    try {
      await db.execute(sql`DROP POLICY IF EXISTS ${sql.identifier(policy)}`);
    } catch {
      // Policy may not exist, continue
    }
  }

  // Apply tenant isolation policies
  await db.execute(sql`
    CREATE POLICY payroll_runs_tenant_isolation ON payroll_runs
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY payroll_lines_tenant_isolation ON payroll_lines
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY payroll_advances_tenant_isolation ON payroll_advances
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY payslips_tenant_isolation ON payslips
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY salary_structures_tenant_isolation ON employee_salary_structures
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY payroll_config_tenant_isolation ON payroll_config
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY statutory_liabilities_tenant_isolation ON statutory_liabilities
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);

  await db.execute(sql`
    CREATE POLICY payroll_summary_tenant_isolation ON payroll_summary
    FOR ALL
    USING (tenant_id = ${tenantId})
    WITH CHECK (tenant_id = ${tenantId})
  `);
}
