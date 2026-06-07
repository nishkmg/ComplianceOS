// @ts-nocheck - RLS integration test
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../schema';
import { sql } from 'drizzle-orm';

describe('Row Level Security (RLS)', () => {
  let sqlTenant1: postgres.Sql;
  let sqlTenant2: postgres.Sql;
  let sqlSuperuser: postgres.Sql;
  let dbTenant1: ReturnType<typeof drizzle>;
  let dbTenant2: ReturnType<typeof drizzle>;
  let dbSuperuser: ReturnType<typeof drizzle>;

  const TENANT_1_ID = '00000000-0000-0000-0000-000000000001';
  const TENANT_2_ID = '00000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/complianceos_test';
    
    // Create connections for different tenants
    sqlTenant1 = postgres(connectionString, {
      prepare: false,
      onconnect: async (conn) => {
        await conn`SET LOCAL app.tenant_id = '${TENANT_1_ID}'`;
      },
    });
    
    sqlTenant2 = postgres(connectionString, {
      prepare: false,
      onconnect: async (conn) => {
        await conn`SET LOCAL app.tenant_id = '${TENANT_2_ID}'`;
      },
    });
    
    // Superuser connection (bypasses RLS)
    sqlSuperuser = postgres(connectionString, { prepare: false });
    
    dbTenant1 = drizzle(sqlTenant1, { schema });
    dbTenant2 = drizzle(sqlTenant2, { schema });
    dbSuperuser = drizzle(sqlSuperuser, { schema });

    // Seed tenant fixtures (idempotent). Required for FK constraints in PII-table tests.
    await dbSuperuser.execute(sql`
      INSERT INTO tenants (id, name, pan, address, state, onboarding_status)
      VALUES
        (${TENANT_1_ID}, 'RLS Test Tenant 1', 'AAAAA0000A', '1 Test St', 'karnataka', 'complete'),
        (${TENANT_2_ID}, 'RLS Test Tenant 2', 'BBBBB0000B', '2 Test St', 'maharashtra', 'complete')
      ON CONFLICT (id) DO NOTHING
    `);
  });

  afterAll(async () => {
    await sqlTenant1.end();
    await sqlTenant2.end();
    await sqlSuperuser.end();
  });

  describe('tenant_isolation policy', () => {
    it('should allow tenant 1 to see only their own accounts', async () => {
      // Create test data for tenant 1
      await dbSuperuser.insert(schema.accounts).values({
        id: 'acc-tenant1-001',
        tenantId: TENANT_1_ID,
        code: '1000',
        name: 'Tenant 1 Cash',
        kind: 'Asset',
        subType: 'cash',
        isLeaf: true,
        isActive: true,
      });

      // Create test data for tenant 2
      await dbSuperuser.insert(schema.accounts).values({
        id: 'acc-tenant2-001',
        tenantId: TENANT_2_ID,
        code: '1000',
        name: 'Tenant 2 Cash',
        kind: 'Asset',
        subType: 'cash',
        isLeaf: true,
        isActive: true,
      });

      // Query as tenant 1
      const tenant1Accounts = await dbTenant1.select().from(schema.accounts);
      
      expect(tenant1Accounts.length).toBe(1);
      expect(tenant1Accounts[0].id).toBe('acc-tenant1-001');
      expect(tenant1Accounts[0].tenantId).toBe(TENANT_1_ID);
    });

    it('should prevent tenant 1 from seeing tenant 2 data', async () => {
      const tenant1Accounts = await dbTenant1.select().from(schema.accounts);
      const tenant2AccountIds = tenant1Accounts.map(a => a.id);
      
      expect(tenant2AccountIds).not.toContain('acc-tenant2-001');
    });

    it('should allow tenant 2 to see only their own accounts', async () => {
      const tenant2Accounts = await dbTenant2.select().from(schema.accounts);
      
      expect(tenant2Accounts.length).toBe(1);
      expect(tenant2Accounts[0].id).toBe('acc-tenant2-001');
      expect(tenant2Accounts[0].tenantId).toBe(TENANT_2_ID);
    });

    it('should prevent cross-tenant inserts', async () => {
      // Try to insert data with wrong tenant ID (should be blocked by RLS)
      try {
        await dbTenant1.insert(schema.accounts).values({
          id: 'acc-tenant1-fake',
          tenantId: TENANT_2_ID, // Wrong tenant!
          code: '9999',
          name: 'Should Fail',
          kind: 'Asset',
          subType: 'cash',
          isLeaf: true,
          isActive: true,
        });
        
        // If we get here, RLS is not working
        expect.fail('RLS should have prevented cross-tenant insert');
      } catch (error: any) {
        // Expected: new row violates row-level security policy
        expect(error.message).toContain('row-level security');
      }
    });

    it('should allow superuser to see all data', async () => {
      const allAccounts = await dbSuperuser.select().from(schema.accounts);
      
      expect(allAccounts.length).toBeGreaterThanOrEqual(2);
      const accountIds = allAccounts.map(a => a.id);
      expect(accountIds).toContain('acc-tenant1-001');
      expect(accountIds).toContain('acc-tenant2-001');
    });

    it('should prevent tenant 1 from updating tenant 2 data', async () => {
      try {
        await dbTenant1
          .update(schema.accounts)
          .set({ name: 'Hacked by Tenant 1' })
          .where(sql`id = 'acc-tenant2-001'`);
        
        expect.fail('RLS should have prevented cross-tenant update');
      } catch (error: any) {
        expect(error.message).toContain('row-level security');
      }
    });

    it('should prevent tenant 1 from deleting tenant 2 data', async () => {
      try {
        await dbTenant1
          .delete(schema.accounts)
          .where(sql`id = 'acc-tenant2-001'`);
        
        expect.fail('RLS should have prevented cross-tenant delete');
      } catch (error: any) {
        expect(error.message).toContain('row-level security');
      }
    });
  });

  describe('journal entries isolation', () => {
    it('should isolate journal entries by tenant', async () => {
      // Create journal entry for tenant 1
      await dbSuperuser.insert(schema.journalEntries).values({
        id: 'je-tenant1-001',
        tenantId: TENANT_1_ID,
        entryNumber: 'JE-2026-27-001',
        date: new Date().toISOString(),
        narration: 'Tenant 1 entry',
        status: 'draft',
        fiscalYear: '2026-27',
        createdBy: 'user-001',
      });

      // Create journal entry for tenant 2
      await dbSuperuser.insert(schema.journalEntries).values({
        id: 'je-tenant2-001',
        tenantId: TENANT_2_ID,
        entryNumber: 'JE-2026-27-001',
        date: new Date().toISOString(),
        narration: 'Tenant 2 entry',
        status: 'draft',
        fiscalYear: '2026-27',
        createdBy: 'user-002',
      });

      // Query as tenant 1
      const tenant1Entries = await dbTenant1.select().from(schema.journalEntries);
      
      expect(tenant1Entries.length).toBe(1);
      expect(tenant1Entries[0].id).toBe('je-tenant1-001');
    });

    it('should isolate journal entry lines by tenant', async () => {
      // Create journal entry line for tenant 1
      await dbSuperuser.insert(schema.journalEntryLines).values({
        id: 'jel-tenant1-001',
        journalEntryId: 'je-tenant1-001',
        accountId: 'acc-tenant1-001',
        debit: '1000.00',
        credit: '0.00',
      });

      // Query as tenant 2 (should not see tenant 1 lines)
      const tenant2Lines = await dbTenant2.select().from(schema.journalEntryLines);
      
      // Should be empty or only contain tenant 2's own lines
      const tenant1LineIds = tenant2Lines.map(l => l.id);
      expect(tenant1LineIds).not.toContain('jel-tenant1-001');
    });
  });

  describe('event store isolation', () => {
    it('should isolate events by tenant', async () => {
      // Create event for tenant 1
      await dbSuperuser.insert(schema.eventStore).values({
        id: 'event-tenant1-001',
        tenantId: TENANT_1_ID,
        aggregateType: 'journal_entry',
        aggregateId: 'je-tenant1-001',
        eventType: 'journal_entry_created',
        payload: { entryNumber: 'JE-2026-27-001' },
        sequence: 1n,
        actorId: 'user-001',
      });

      // Query as tenant 2 (should not see tenant 1 events)
      const tenant2Events = await dbTenant2.select().from(schema.eventStore);

      const tenant1EventIds = tenant2Events.map(e => e.id);
      expect(tenant1EventIds).not.toContain('event-tenant1-001');
    });

    it('should prevent cross-tenant event inserts', async () => {
      try {
        await dbTenant1.insert(schema.eventStore).values({
          id: 'event-tenant1-leak',
          tenantId: TENANT_2_ID,
          aggregateType: 'journal_entry',
          aggregateId: 'je-tenant2-001',
          eventType: 'journal_entry_created',
          payload: {},
          sequence: 2n,
          actorId: 'user-001',
        });
        expect.fail('RLS should have prevented cross-tenant event insert');
      } catch (error: any) {
        expect(error.message).toContain('row-level security');
      }
    });
  });

  describe('email queue isolation (PII table)', () => {
    it('should isolate emails by tenant', async () => {
      await dbSuperuser.execute(sql`
        INSERT INTO email_queue (id, tenant_id, to_email, subject, body, scheduled_at)
        VALUES ('aaaa1111-aaaa-aaaa-aaaa-000000000001', ${TENANT_1_ID}, 't1@example.com', 'T1', 'PII body 1', now())
        ON CONFLICT (id) DO NOTHING
      `);
      await dbSuperuser.execute(sql`
        INSERT INTO email_queue (id, tenant_id, to_email, subject, body, scheduled_at)
        VALUES ('aaaa1111-aaaa-aaaa-aaaa-000000000002', ${TENANT_2_ID}, 't2@example.com', 'T2', 'PII body 2', now())
        ON CONFLICT (id) DO NOTHING
      `);

      const tenant1Emails = await dbTenant1.execute(sql`SELECT id FROM email_queue WHERE id IN ('aaaa1111-aaaa-aaaa-aaaa-000000000001', 'aaaa1111-aaaa-aaaa-aaaa-000000000002')`);
      const tenant2Emails = await dbTenant2.execute(sql`SELECT id FROM email_queue WHERE id IN ('aaaa1111-aaaa-aaaa-aaaa-000000000001', 'aaaa1111-aaaa-aaaa-aaaa-000000000002')`);

      const t1Ids = tenant1Emails.map((r: any) => r.id);
      const t2Ids = tenant2Emails.map((r: any) => r.id);

      expect(t1Ids).toContain('aaaa1111-aaaa-aaaa-aaaa-000000000001');
      expect(t1Ids).not.toContain('aaaa1111-aaaa-aaaa-aaaa-000000000002');
      expect(t2Ids).toContain('aaaa1111-aaaa-aaaa-aaaa-000000000002');
      expect(t2Ids).not.toContain('aaaa1111-aaaa-aaaa-aaaa-000000000001');
    });
  });

  describe('ocr scan results isolation (PII table)', () => {
    it('should isolate ocr scans by tenant', async () => {
      await dbSuperuser.execute(sql`
        INSERT INTO users (id, email, name) VALUES ('99999999-9999-9999-9999-999999999991', 'ocr1@example.com', 'OCR1')
        ON CONFLICT (id) DO NOTHING
      `);

      await dbSuperuser.execute(sql`
        INSERT INTO ocr_scan_results (id, tenant_id, uploaded_by, file_name, file_url, status)
        VALUES ('bbbb1111-bbbb-bbbb-bbbb-000000000001', ${TENANT_1_ID}, '99999999-9999-9999-9999-999999999991', 'inv1.pdf', 's3://inv1', 'pending')
        ON CONFLICT (id) DO NOTHING
      `);
      await dbSuperuser.execute(sql`
        INSERT INTO ocr_scan_results (id, tenant_id, uploaded_by, file_name, file_url, status)
        VALUES ('bbbb1111-bbbb-bbbb-bbbb-000000000002', ${TENANT_2_ID}, '99999999-9999-9999-9999-999999999991', 'inv2.pdf', 's3://inv2', 'pending')
        ON CONFLICT (id) DO NOTHING
      `);

      const tenant1Scans = await dbTenant1.execute(sql`SELECT id FROM ocr_scan_results WHERE id IN ('bbbb1111-bbbb-bbbb-bbbb-000000000001', 'bbbb1111-bbbb-bbbb-bbbb-000000000002')`);
      const tenant2Scans = await dbTenant2.execute(sql`SELECT id FROM ocr_scan_results WHERE id IN ('bbbb1111-bbbb-bbbb-bbbb-000000000001', 'bbbb1111-bbbb-bbbb-bbbb-000000000002')`);

      const t1Ids = tenant1Scans.map((r: any) => r.id);
      const t2Ids = tenant2Scans.map((r: any) => r.id);

      expect(t1Ids).toContain('bbbb1111-bbbb-bbbb-bbbb-000000000001');
      expect(t1Ids).not.toContain('bbbb1111-bbbb-bbbb-bbbb-000000000002');
      expect(t2Ids).toContain('bbbb1111-bbbb-bbbb-bbbb-000000000002');
      expect(t2Ids).not.toContain('bbbb1111-bbbb-bbbb-bbbb-000000000001');
    });
  });

  describe('onboarding audit log isolation (PII table)', () => {
    it('should isolate onboarding audit entries by tenant', async () => {
      await dbSuperuser.execute(sql`
        INSERT INTO onboarding_audit_log (id, tenant_id, user_id, step_number, step_key, action)
        VALUES ('cccc1111-cccc-cccc-cccc-000000000001', ${TENANT_1_ID}, '99999999-9999-9999-9999-999999999991', 1, 'business', 'save')
        ON CONFLICT (id) DO NOTHING
      `);
      await dbSuperuser.execute(sql`
        INSERT INTO onboarding_audit_log (id, tenant_id, user_id, step_number, step_key, action)
        VALUES ('cccc1111-cccc-cccc-cccc-000000000002', ${TENANT_2_ID}, '99999999-9999-9999-9999-999999999991', 1, 'business', 'save')
        ON CONFLICT (id) DO NOTHING
      `);

      const tenant1Audits = await dbTenant1.execute(sql`SELECT id FROM onboarding_audit_log WHERE id IN ('cccc1111-cccc-cccc-cccc-000000000001', 'cccc1111-cccc-cccc-cccc-000000000002')`);
      const tenant2Audits = await dbTenant2.execute(sql`SELECT id FROM onboarding_audit_log WHERE id IN ('cccc1111-cccc-cccc-cccc-000000000001', 'cccc1111-cccc-cccc-cccc-000000000002')`);

      const t1Ids = tenant1Audits.map((r: any) => r.id);
      const t2Ids = tenant2Audits.map((r: any) => r.id);

      expect(t1Ids).toContain('cccc1111-cccc-cccc-cccc-000000000001');
      expect(t1Ids).not.toContain('cccc1111-cccc-cccc-cccc-000000000002');
      expect(t2Ids).toContain('cccc1111-cccc-cccc-cccc-000000000002');
      expect(t2Ids).not.toContain('cccc1111-cccc-cccc-cccc-000000000001');
    });
  });
});
