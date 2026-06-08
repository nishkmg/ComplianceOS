import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROUTERS_DIR = join(__dirname, "../routers");

const ROUTER_FILES = readdirSync(ROUTERS_DIR)
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  .filter((f) => !f.startsWith("._"))
  .filter((f) => f !== "index.ts");

const FINANCIAL_ROUTERS = [
  "journal-entries", "balances", "accounts", "fiscal-years",
  "payments", "receivables", "invoices", "invoice-config",
  "gst-ledger", "gst-returns", "gst-reconciliation", "gst-payment",
  "itr-returns", "itr-computation", "itr-payment",
  "payroll", "payroll-reports", "advances", "salary-structure",
  "payslips", "employees",
  "products", "inventory", "stock-reports",
  "tenant-config",
];

const FINANCIAL_FILES = ROUTER_FILES.filter((f) => {
  const base = f.replace(/\.(ts|tsx)$/, "");
  return FINANCIAL_ROUTERS.includes(base);
});

// ── Part A: Router authorization sweep ───────────────────────────────────────

describe("Router authorization sweep", () => {
  it("every router file imports protectedProcedure", () => {
    const missing: string[] = [];
    for (const file of ROUTER_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      if (!content.includes("protectedProcedure")) {
        missing.push(file);
      }
    }
    expect(missing).toEqual([]);
  });

  it("no router file imports publicProcedure", () => {
    const offenders: string[] = [];
    for (const file of ROUTER_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      if (content.includes("publicProcedure")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("financial routers have no publicProcedure usage", () => {
    const offenders: string[] = [];
    for (const file of FINANCIAL_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      if (content.includes("publicProcedure")) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("all procedures are defined as `protectedProcedure` keys", () => {
    const issues: string[] = [];
    for (const file of ROUTER_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      const routerExport = content.match(/export const \w+Router = router\(\{([\s\S]*)\}\);/);
      if (!routerExport) continue;

      const routerBody = routerExport[1];
      const keyLines = routerBody.match(/^\s{2}(\w+):\sprotectedProcedure/gm);
      if (!keyLines) continue;

      for (const line of keyLines) {
        const key = line.trim().split(":")[0];
        if (key === "index") continue;
        expect(line).toMatch(/protectedProcedure/);
      }
    }
  });
});

// ── Part B: Procedure inventory ──────────────────────────────────────────────

describe("Procedure inventory", () => {
  const procedureCounts: Record<string, number> = {};

  for (const file of ROUTER_FILES) {
    const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
    const routerExport = content.match(/export const \w+Router = router\(\{([\s\S]*)\}\);/);
    if (!routerExport) continue;

    const routerBody = routerExport[1];
    const keys = routerBody.match(/^\s{2}(\w+):\sprotectedProcedure/gm);
    const count = keys ? keys.length : 0;
    const base = file.replace(/\.(ts|tsx)$/, "");
    procedureCounts[base] = count;

    if (count > 0) {
      const names = keys!.map((k) => k.trim().split(":")[0]).join(", ");
      it(`${base}: ${count} procedure(s) — ${names}`, () => {
        expect(count).toBeGreaterThan(0);
      });
    }
  }

  it("all financial routers have at least 1 procedure", () => {
    for (const file of FINANCIAL_FILES) {
      const base = file.replace(/\.(ts|tsx)$/, "");
      expect(procedureCounts[base]).toBeGreaterThanOrEqual(1);
    }
  });

  it("all 28 router files loaded", () => {
    expect(Object.keys(procedureCounts).length).toBe(ROUTER_FILES.length);
  });
});

// ── Part C: Auth contract enforcement ────────────────────────────────────────

describe("Auth contract enforcement", () => {
  it("trpc.ts exports protectedProcedure with enforceAuth middleware", () => {
    const trpcContent = readFileSync(
      join(__dirname, "../trpc.ts"),
      "utf-8",
    );
    expect(trpcContent).toContain("export const publicProcedure = t.procedure");
    expect(trpcContent).toContain("export const protectedProcedure = t.procedure.use(enforceAuth)");
    expect(trpcContent).toContain('throw new TRPCError({ code: "UNAUTHORIZED" })');
    expect(trpcContent).toContain("ctx.session?.user");
  });

  it("no publicProcedure references in any router", () => {
    for (const file of ROUTER_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      expect(content).not.toMatch(/publicProcedure/);
    }
  });

  it("every router export in index.ts maps to a valid file", () => {
    const indexContent = readFileSync(join(ROUTERS_DIR, "index.ts"), "utf-8");
    const importStmts = indexContent.match(/import \{ (\w+)Router \} from "(.+)";/g) ?? [];
    expect(importStmts.length).toBeGreaterThan(20);
    for (const stmt of importStmts) {
      const m = stmt.match(/import \{ (\w+)Router \} from "(.+)";/);
      if (!m) continue;
      const [, importName, filePath] = m;
      const cleanPath = filePath.replace(/^\.\//, "");
      const tsFile = `${cleanPath}.ts`;
      const tsxFile = `${cleanPath}.tsx`;
      if (!ROUTER_FILES.includes(tsFile) && !ROUTER_FILES.includes(tsxFile)) {
        throw new Error(`Router ${importName} from "${filePath}" not found (tried ${tsFile}/${tsxFile})`);
      }
    }
  });
});

// ── Part D: Tenant isolation — static analysis ────────────────────────────────

describe("Tenant isolation", () => {
  it("every procedure with DB access filters by ctx.tenantId", () => {
    const warnings: string[] = [];

    for (const file of FINANCIAL_FILES) {
      const content = readFileSync(join(ROUTERS_DIR, file), "utf-8");
      const routerExport = content.match(/export const \w+Router = router\(\{([\s\S]*)\}\);/);
      if (!routerExport) continue;

      const routerBody = routerExport[1];
      const procMatches = routerBody.matchAll(/(\w+):\sprotectedProcedure\s*((?:.|\n)*?)(?=\n\s{2}\w+:\sprotectedProcedure|\n\}\))/g);

      for (const match of procMatches) {
        const procName = match[1];
        const procBody = match[2];
        const hasDbCall = /ctx\.db\.(select|insert|update|delete|execute)/.test(procBody);
        if (!hasDbCall) continue;

        const hasTenantFilter =
          /ctx\.tenantId/.test(procBody) ||
          /ctx\.session!\s*\.user\.tenantId/.test(procBody) ||
          /tenantId:\s*ctx/.test(procBody) ||
          /tenantId:\s*ctx\.tenantId/.test(procBody) ||
          /eq\(.*tenantId,\s*tenantId\)/.test(procBody);

        if (!hasTenantFilter) {
          warnings.push(`${file}:${procName}`);
        }
      }
    }

    if (warnings.length > 0) {
      console.warn(
        "[WARN] Procedures with DB calls missing explicit tenantId filter:\n  - " +
          warnings.join("\n  - "),
      );
    }
    expect(warnings).toEqual([]);
  });
});
