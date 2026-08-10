#!/usr/bin/env node
/**
 * Page-coverage audit — static analysis of apps/web app pages.
 *
 * Truth ledger for the page rework: every route gets scored on data source
 * (tRPC procedure / legacy fetch / none), fabrication risk (hardcoded
 * financial-looking literals), design-canon conformance (PageHeader,
 * banned utilities), and verification coverage (a11y sweep, loading/error
 * boundaries, nav reachability).
 *
 * Usage: node scripts/page-audit.mjs            # writes PAGE-AUDIT.md
 *        node scripts/page-audit.mjs --json    # prints PAGE-AUDIT.json
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "..");
const web = join(root, "apps/web");
const app = join(web, "app");
const outMd = join(root, "PAGE-AUDIT.md");
const outJson = join(root, "PAGE-AUDIT.json");

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith("._")) continue;
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

const allFiles = walk(app);
const pages = allFiles.filter((f) => f.endsWith("/page.tsx"));
const route = (f) => {
  let r = "/" + relative(app, f).replace(/\/page\.tsx$/, "").replace(/\/\([^)]+\)/g, "");
  r = r.replace(/^\/\([^)]+\)/, "");
  return r === "" ? "/" : r;
};

// a11y sweep coverage
const a11ySpec = readFileSync(join(web, "e2e/a11y.spec.ts"), "utf8");
const swept = new Set(
  [...a11ySpec.matchAll(/(?:APP_ROUTES|PUBLIC_ROUTES)\s*=\s*\[([\s\S]*?)\]/g)]
    .flatMap((m) => [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]))
    .filter((r) => r.startsWith("/")),
);

// nav reachability
let navSrc = "";
for (const f of walk(join(web, "components"))) {
  if (/nav|sidebar/i.test(f)) navSrc += readFileSync(f, "utf8");
}
const navRoutes = new Set(
  [...navSrc.matchAll(/href[:=]\s*["'`](\/[^"'`#?]*)/g)].map((m) => m[1]).filter((r) => !r.startsWith("//")),
);

// boundaries present per route dir
const dirs = new Set(allFiles.map((f) => join(join(f, "..", ".."), "")));
function hasBoundary(pagePath, name) {
  return readdirSync(join(pagePath, "..")).includes(name);
}

// banned raw palette + hex + hardcoded literals
const bannedColor = /(?:bg|text|border|ring|divide|from|to|via)-(?:gray|slate|zinc|neutral|stone|red|green|blue|yellow|indigo|purple|pink|orange|emerald|amber|teal|cyan|rose|lime|violet|sky|fuchsia)-\d{2,3}|#[0-9a-fA-F]{6}\b|bg-white\b|text-black\b/g;
const moneyLit = /[:=]\s*["']?₹?[\d]{1,3}(?:,\d{3}){1,4}(?:\.\d{2})?["']?/g;

const rows = [];
for (const f of pages) {
  const s = readFileSync(f, "utf8");
  const r = route(f);
  const trpcProcs = [...s.matchAll(/api\.([a-zA-Z]+)\.([a-zA-Z]+)\.(useQuery|useMutation|useSuspenseQuery)/g)].map((m) => `${m[1]}.${m[2]}`);
  const fetches = [...s.matchAll(/fetch\(\s*[`'"]([^`'"?]+)/g)].map((m) => m[1]);
  const hasData = trpcProcs.length > 0 || fetches.length > 0;
  // financial-looking hardcoded literals outside className (string or = NNN,NNN)
  const fake = (s.match(moneyLit) || []).filter((x) => !x.includes("className"));
  // inline arrays of objects that look like mock rows
  const mockArrays = [...s.matchAll(/const (\w+)\s*(?::[^=]+)?=\s*\[\s*\{[\s\S]{0,600}?\}\s*\]/g)].map((m) => m[1]).filter((n) => /mock|sample|dummy|demo/i.test(n));
  const placeholder = /fully implemented|coming soon|not yet available|will be available|expiryMockData|placeholder|TODO|FIXME/i.test(s);
  rows.push({
    route: r,
    loc: s.split("\n").length,
    data: trpcProcs.length ? `trpc:${trpcProcs.join(",")}` : fetches.length ? `fetch:${fetches.map((x) => x.split("/").slice(0, 4).join("/")).join(",")}` : "none",
    wired: hasData,
    fakeCount: fake.length,
    mockArrays: mockArrays,
    placeholder,
    pageHeader: /PageHeader/.test(s) || /<PageHeader/.test(s),
    h1: /<h1/.test(s),
    bannedColors: (s.match(bannedColor) || []).length,
    inNav: navRoutes.has(r),
    inA11y: swept.has(r),
    loading: hasBoundary(f, "loading.tsx"),
    error: hasBoundary(f, "error.tsx"),
  });
}

const counts = {
  total: rows.length,
  unwired: rows.filter((r) => !r.wired).length,
  fabricated: rows.filter((r) => r.fakeCount > 0 || r.mockArrays.length > 0 || r.placeholder).length,
  noPageHeader: rows.filter((r) => !r.pageHeader).length,
  bannedColors: rows.filter((r) => r.bannedColors > 0).length,
  notSwept: rows.filter((r) => !r.inA11y).length,
  notInNav: rows.filter((r) => !r.inNav).length,
  noLoading: rows.filter((r) => !r.loading).length,
  noError: rows.filter((r) => !r.error).length,
};

writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), counts, rows }, null, 2));

let md = `# PAGE-AUDIT — app route truth ledger\n\nGenerated: ${new Date().toISOString().slice(0, 10)} — re-run: \`node scripts/page-audit.mjs\`\n\n## Totals\n\n| metric | count |\n|---|---|\n`;
md += Object.entries(counts).map(([k, v]) => `| ${k} | ${v} |`).join("\n");
md += `\n\n## Routes\n\n| route | loc | data | wired | fake# | mockArr | placeholder | PageHeader | banned# | nav | a11y | loading | error |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const r of [...rows].sort((a, b) => a.route.localeCompare(b.route))) {
  md += `| ${r.route} | ${r.loc} | ${r.data} | ${r.wired ? "Y" : ""} | ${r.fakeCount} | ${r.mockArrays.join("/")} | ${r.placeholder ? "Y" : ""} | ${r.pageHeader ? "Y" : ""} | ${r.bannedColors} | ${r.inNav ? "Y" : ""} | ${r.inA11y ? "Y" : ""} | ${r.loading ? "Y" : ""} | ${r.error ? "Y" : ""} |\n`;
}
writeFileSync(outMd, md);

console.log(`page-audit: ${rows.length} routes, ${counts.unwired} unwired, ${counts.fabricated} fabricated, ${counts.notSwept} not in a11y sweep`);
console.log(process.argv.includes("--json") ? JSON.stringify(counts) : `wrote ${relative(root, outMd)}`);
