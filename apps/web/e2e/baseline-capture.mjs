#!/usr/bin/env node
/**
 * Baseline screenshot capture — full-page shots of key routes at 3 viewports.
 * The repo's visual baseline for UI work (Phase 1+ diffs are reviewed against it).
 *
 * Usage: pnpm --filter @complianceos/web exec node e2e/baseline-capture.mjs [--desktop-only]
 * Requires: dev server on :3000, seeded demo tenant (demo@complianceos.test / demo123)
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const OUT = join(import.meta.dirname, "__baseline__");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

// Static routes only — dynamic ([id]) surfaces get captured per-phase with real ids.
const ROUTES = [
  { path: "/login", label: "login", auth: false },
  { path: "/", label: "marketing", auth: false },
  { path: "/dashboard", label: "dashboard", auth: true },
  { path: "/journal", label: "journal", auth: true },
  { path: "/journal/new", label: "journal-new", auth: true },
  { path: "/coa", label: "chart-of-accounts", auth: true },
  { path: "/accounts", label: "accounts", auth: true },
  { path: "/invoices", label: "invoices", auth: true },
  { path: "/payments", label: "payments", auth: true },
  { path: "/receivables", label: "receivables", auth: true },
  { path: "/inventory", label: "inventory", auth: true },
  { path: "/gst/returns", label: "gst-returns", auth: true },
  { path: "/itr/returns", label: "itr-returns", auth: true },
  { path: "/payroll", label: "payroll", auth: true },
  { path: "/employees", label: "employees", auth: true },
  { path: "/reports", label: "reports", auth: true },
  { path: "/settings", label: "settings", auth: true },
  { path: "/support", label: "support", auth: true },
  { path: "/audit-log", label: "audit-log", auth: true },
  { path: "/onboarding", label: "onboarding", auth: true },
];

const viewports = process.argv.includes("--desktop-only")
  ? VIEWPORTS.filter((v) => v.name === "desktop")
  : VIEWPORTS;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const ok = [];
const failed = [];
for (const v of viewports) {
  await page.setViewportSize({ width: v.width, height: v.height });

  // Fresh login per viewport (session cookies are viewport-independent but keep it simple)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill("demo@complianceos.test");
  await page.getByLabel("Password").fill("demo123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20000 }).catch(() => {});

  for (const route of ROUTES) {
    if (route.auth && !page.url().includes("/dashboard") && !page.url().includes("/onboarding")) {
      failed.push(`${route.label}:login-not-established`);
      continue;
    }
    try {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 25000 });
      await page.waitForTimeout(600); // let client-side fetch settle
      const file = join(OUT, `${route.label}-${v.name}.png`);
      await page.screenshot({ path: file, fullPage: true });
      ok.push(`${route.label}@${v.name}`);
    } catch (e) {
      failed.push(`${route.label}@${v.name}:${e.message.split("\n")[0].slice(0, 80)}`);
    }
  }
}

await browser.close();
console.log(`✓ ${ok.length} screenshots -> ${OUT}`);
if (failed.length) {
  console.log(`✗ ${failed.length} failures:`);
  for (const f of failed) console.log(`  ${f}`);
  process.exitCode = 1;
}
