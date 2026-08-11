import { randomUUID } from "crypto";
import { db, tenants, users, userTenants, accounts, invoices, invoiceLines } from "../../db/src/index";
import { eq } from "drizzle-orm";
import { createInvoice } from "./commands/create-invoice";
import { postInvoice } from "./commands/post-invoice";
import { createAccount } from "./commands/create-account";

(async () => {
  const tenantId = randomUUID();
  const actorId = randomUUID();
  const stamp = randomUUID().slice(0, 8);
  await db.insert(tenants).values({ id: tenantId, name: `DBG ${stamp}`, pan: `AAADT${stamp.toUpperCase()}P`, address: "x", state: "karnataka", stateCode: "ka" });
  await db.insert(users).values({ id: actorId, email: `dbg-${stamp}@example.com` });
  await db.insert(userTenants).values({ userId: actorId, tenantId, role: "owner" });
  const revenue = await createAccount(db, tenantId, actorId, { code: `REV-${stamp}`, name: "Sales Revenue", kind: "Revenue", subType: "OperatingRevenue" });
  await createAccount(db, tenantId, actorId, { code: `AR-${stamp}`, name: "Accounts Receivable", kind: "Asset", subType: "CurrentAsset" });
  await createAccount(db, tenantId, actorId, { code: `CGO-${stamp}`, name: "CGST Output", kind: "Liability", subType: "CurrentLiability" });
  await createAccount(db, tenantId, actorId, { code: `SGO-${stamp}`, name: "SGST Output", kind: "Liability", subType: "CurrentLiability" });

  const inv = await createInvoice(db, tenantId, actorId, {
    date: "2026-04-10", dueDate: "2026-05-10", customerName: "Acme Traders", customerState: "IN-ka",
    lines: [{ accountId: revenue.accountId, description: "Widgets", quantity: 2, unitPrice: 500, gstRate: 18 }],
    notes: "test",
  });
  const [invRow] = await db.select().from(invoices).where(eq(invoices.id, inv.invoiceId));
  console.log("invoice:", JSON.stringify({ gt: invRow.grandTotal, cgst: invRow.cgstTotal, sgst: invRow.sgstTotal, igst: invRow.igstTotal }));
  await postInvoice(db, tenantId, actorId, inv.invoiceId);
  console.log("postInvoice OK");
  process.exit(0);
})().catch((e: any) => { console.log("FATAL:", e.stack ?? e.message); process.exit(1); });
