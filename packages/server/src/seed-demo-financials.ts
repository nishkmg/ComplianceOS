/**
 * Demo financial seed — chart of accounts + journal entries + invoices +
 * payments for the demo tenant, then a full projector replay.
 *
 * Run: NODE_ENV=development SEED_DEMO=true pnpm exec tsx src/seed-demo-financials.ts
 * Idempotent: skips if the demo tenant already has accounts.
 *
 * Everything goes through the command layer (event store is the sole write
 * path) and the projector pass — views (account_balances, journal_entry_view,
 * invoice_view, receivables_summary, gst ledgers, fy_summaries) are built by
 * replay, never hand-written.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { db, accounts, accountTags, journalEntries, invoiceView, receivablesSummary, projectorState } from "@complianceos/db";
import { sql } from "drizzle-orm";
import { createJournalEntry } from "./commands/create-journal-entry.js";
import { postJournalEntry } from "./commands/post-journal-entry.js";
import { createInvoice } from "./commands/create-invoice.js";
import { recordPayment } from "./commands/record-payment.js";
import { postInvoice } from "./commands/post-invoice.js";
import { runProjectorsForTenant } from "./projectors/worker.js";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";
const FY = "2026-27";

function guard(): void {
  if (process.env.SEED_DEMO !== "true") {
    throw new Error("Set SEED_DEMO=true to seed demo financials");
  }
  const env = process.env.NODE_ENV;
  if (env !== "development" && env !== "test" && process.env.ALLOW_SEED !== "1") {
    throw new Error(`Refusing to seed in env="${env}". Use dev/test or set ALLOW_SEED=1.`);
  }
}

type TemplateNode = {
  code: string;
  name: string;
  kind: string;
  subType: string;
  tags?: string[];
  isSystem?: boolean;
  children?: TemplateNode[];
};

interface FlatAccount {
  id: string;
  code: string;
  name: string;
  kind: string;
  subType: string;
  parentId: string | null;
  isLeaf: boolean;
}

function flattenTemplate(nodes: TemplateNode[], parentId: string | null, out: FlatAccount[]): void {
  for (const n of nodes) {
    const id = `00000000-0000-0000-0000-${String(100 + out.length).padStart(12, "0")}`;
    const children = n.children ?? [];
    out.push({
      id,
      code: n.code,
      name: n.name,
      kind: n.kind,
      subType: n.subType,
      parentId,
      isLeaf: children.length === 0,
    });
    for (const child of children) {
      flattenTemplate([child], id, out);
    }
  }
}

async function findAccount(tenantId: string, pattern: RegExp): Promise<string | null> {
  const rows = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
  // journal lines must reference leaf accounts
  const hit = rows.find((a) => a.isLeaf && pattern.test(a.name));
  return hit?.id ?? null;
}

async function seedChartOfAccounts(): Promise<number> {
  const existing = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.tenantId, DEMO_TENANT_ID)).limit(1);
  if (existing.length > 0) {
    console.log("⏭️  Demo CoA already present — skipping");
    return 0;
  }

  const templatePath = fileURLToPath(
    new URL("../../db/src/seed/coa-templates/llp_services.json", import.meta.url),
  );
  const template = JSON.parse(readFileSync(templatePath, "utf8")) as TemplateNode[];
  const flat: FlatAccount[] = [];
  flattenTemplate(template, null, flat);

  for (const a of flat) {
    await db.insert(accounts).values({
      id: a.id,
      tenantId: DEMO_TENANT_ID,
      code: a.code,
      name: a.name,
      kind: a.kind as never,
      subType: a.subType as never,
      parentId: a.parentId ?? undefined,
      isSystem: false,
      isActive: true,
      isLeaf: a.isLeaf,
    });
  }
  // account_tags: recordPayment requires a leaf account tagged trade_receivable
  const receivable = flat.find((a) => /Sundry Debtors/i.test(a.name));
  if (receivable) {
    await db.insert(accountTags).values({
      accountId: receivable.id,
      tag: "trade_receivable",
    });
  }
  console.log(`✅ Chart of accounts: ${flat.length} accounts (+ trade_receivable tag)`);
  return flat.length;
}

async function postEntry(date: string, narration: string, lines: Array<{ accountId: string; debit?: string; credit?: string }>): Promise<void> {
  const { entryId } = await createJournalEntry(db, DEMO_TENANT_ID, DEMO_USER_ID, FY, {
    date,
    narration,
    referenceType: "manual",
    lines: lines.map((l) => ({
      accountId: l.accountId,
      debit: l.debit ?? "0",
      credit: l.credit ?? "0",
    })),
  });
  await postJournalEntry(db, DEMO_TENANT_ID, entryId, DEMO_USER_ID);
}

async function seedJournalAndInvoices(): Promise<void> {
  const existing = await db.select({ id: journalEntries.id }).from(journalEntries).where(eq(journalEntries.tenantId, DEMO_TENANT_ID)).limit(1);
  if (existing.length > 0) {
    console.log("⏭️  Demo journal/invoices already present — skipping");
    return;
  }
  const bank = await findAccount(DEMO_TENANT_ID, /HDFC Bank/i);
  const capital = await findAccount(DEMO_TENANT_ID, /Partner 1 - Capital Account/i);
  const rent = await findAccount(DEMO_TENANT_ID, /Rent - Office/i);
  const salaries = await findAccount(DEMO_TENANT_ID, /Salaries - Staff/i);
  const fees = await findAccount(DEMO_TENANT_ID, /Professional Fees - Legal/i);
  const serviceRevenue = await findAccount(DEMO_TENANT_ID, /Professional Services Revenue/i);
  const softwareRevenue = await findAccount(DEMO_TENANT_ID, /Software Licenses/i);
  const outputGst = await findAccount(DEMO_TENANT_ID, /CGST Output/i);
  const inputGst = await findAccount(DEMO_TENANT_ID, /CGST Input/i);

  if (!bank || !capital || !rent || !salaries || !serviceRevenue || !outputGst) {
    throw new Error(
      `Missing template accounts: bank=${!!bank} capital=${!!capital} rent=${!!rent} salaries=${!!salaries} revenue=${!!serviceRevenue} outputGst=${!!outputGst}`,
    );
  }

  // 1. Capital infusion
  await postEntry("2026-04-02", "Capital contribution — Partner 1", [
    { accountId: bank, debit: "500000.00" },
    { accountId: capital, credit: "500000.00" },
  ]);
  console.log("✅ JE-1 Capital infusion ₹5,00,000");

  // 2. Office rent
  await postEntry("2026-05-01", "Office rent — May 2026", [
    { accountId: rent ?? fees!, debit: "40000.00" },
    { accountId: bank, credit: "40000.00" },
  ]);
  console.log("✅ JE-2 Rent ₹40,000");

  // 3. Salaries
  await postEntry("2026-05-31", "Salaries — May 2026", [
    { accountId: salaries ?? fees!, debit: "240000.00" },
    { accountId: bank, credit: "240000.00" },
  ]);
  console.log("✅ JE-3 Salaries ₹2,40,000");

  // 4. Professional fees
  if (fees) {
    await postEntry("2026-06-15", "Professional fees — legal retainer", [
      { accountId: fees, debit: "25000.00" },
      { accountId: bank, credit: "25000.00" },
    ]);
    console.log("✅ JE-4 Professional fees ₹25,000");
  }

  // 5-6. Invoices (each posts its own journal entry with GST)
  const inv1 = await createInvoice(db, DEMO_TENANT_ID, DEMO_USER_ID, {
    date: "2026-07-03",
    dueDate: "2026-08-02",
    customerName: "Acme Traders Pvt Ltd",
    customerEmail: "accounts@acmetraders.in",
    customerGstin: "27AACCA1234F1Z2",
    customerState: "Maharashtra",
    lines: [
      {
        accountId: serviceRevenue,
        description: "Management consulting services — Q2 engagement",
        quantity: 1,
        unitPrice: 350000,
        gstRate: 18,
      },
    ],
    notes: "Payment due within 30 days",
  });
  await postInvoice(db, DEMO_TENANT_ID, DEMO_USER_ID, inv1.invoiceId);
  console.log(`✅ INV-1 ${inv1.invoiceNumber} ₹3,50,000 + GST (posted)`);

  const inv2 = await createInvoice(db, DEMO_TENANT_ID, DEMO_USER_ID, {
    date: "2026-08-07",
    dueDate: "2026-09-06",
    customerName: "Zenith Retail LLP",
    customerEmail: "payments@zenithretail.in",
    customerGstin: "27AAJZZ1234F1Z8",
    customerState: "Maharashtra",
    lines: [
      {
        accountId: serviceRevenue,
        description: "Annual software license — Pro plan",
        quantity: 1,
        unitPrice: 120000,
        gstRate: 18,
      },
    ],
    notes: "Annual license, payable on receipt",
  });
  await postInvoice(db, DEMO_TENANT_ID, DEMO_USER_ID, inv2.invoiceId);
  console.log(`✅ INV-2 ${inv2.invoiceNumber} ₹1,20,000 + GST (posted)`);

  // 7. Partial payment on INV-1
  await recordPayment(db, DEMO_TENANT_ID, DEMO_USER_ID, FY, {
    date: "2026-08-10",
    customerName: "Acme Traders Pvt Ltd",
    amount: 200000,
    paymentMethod: "bank",
    referenceNumber: "NEFT-882133",
    allocations: [{ invoiceId: inv1.invoiceId, allocatedAmount: 200000 }],
    notes: "Partial payment against consulting invoice",
  });
  console.log("✅ PMT-1 ₹2,00,000 partial payment (NEFT)");
}

async function main(): Promise<void> {
  guard();
  await seedChartOfAccounts();
  await seedJournalAndInvoices();

  console.log("⚙️  Replaying projectors…");
  await runProjectorsForTenant(DEMO_TENANT_ID);
  // Self-heal: replay is idempotent; if a projector batch raced the write
  // path in this process, a second pass catches it up (verified by view rows).
  const check = await db.select({ id: invoiceView.id }).from(invoiceView).where(eq(invoiceView.tenantId, DEMO_TENANT_ID)).limit(1);
  const checkR = await db.select({ id: receivablesSummary.id }).from(receivablesSummary).where(eq(receivablesSummary.tenantId, DEMO_TENANT_ID)).limit(1);
  if (check.length === 0 || checkR.length === 0) {
    await db.delete(projectorState).where(eq(projectorState.tenantId, DEMO_TENANT_ID));
    await runProjectorsForTenant(DEMO_TENANT_ID);
    console.log("⚠️  Second projector pass applied (first pass raced)");
  }

  const total = await db.execute(sql`SELECT count(*)::int AS n FROM event_store WHERE tenant_id = ${DEMO_TENANT_ID}`);
  const n = (total as unknown as Array<{ n: number }>)[0]?.n ?? 0;
  console.log(`✅ Projectors caught up (event count: ${n})`);
  console.log("🎉 Demo financials seed complete — log in and explore.");
}

main().catch((err) => {
  console.error("❌ Demo financial seed failed:", err);
  process.exit(1);
});
