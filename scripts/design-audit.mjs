#!/usr/bin/env node
/**
 * Design-system audit — static analysis of apps/web against the DESIGN.md canon.
 *
 * Re-runnable gate for UI work. Phase 7 wires this into CI with thresholds.
 * Output: DESIGN-AUDIT.json (metrics + per-rule verdicts) at repo root.
 *
 * Usage: node scripts/design-audit.mjs [--json-only]
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const web = join(root, "apps/web");
const out = join(root, "DESIGN-AUDIT.json");

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name.startsWith("._")) continue;
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, acc) : acc.push(p);
  }
  return acc;
}

const files = walk(web).filter((f) => /\.(tsx|ts|css)$/.test(f));
const rel = (f) => f.replace(web + "/", "");
const src = new Map(files.map((f) => [f, readFileSync(f, "utf8")]));
const all = [...src.entries()].filter(([f]) => /\.tsx?$/.test(f));

// ── WCAG contrast matrix from token pairs ─────────────────────────────────
function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16));
}
function lum(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
};

// Pull hex values from tokens.css (@theme = light, [data-theme="dark"] = dark)
const css = readFileSync(join(web, "app/globals.css"), "utf8");
const tokensCss = readFileSync(join(web, "styles/tokens.css"), "utf8");
const themeBlock = (tokensCss.match(/@theme\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
const darkBlock = (tokensCss.match(/\[data-theme="dark"\]\s*\{([\s\S]*?)\n\}/) || [])[1] || "";
const parse = (block) => {
  const out = {};
  for (const m of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})/g))
    out[m[1].replace(/^color-/, "")] = m[2];
  return out;
};
const tokens = parse(themeBlock);
const darkTokens = parse(darkBlock);

// Canonical AA checks (fg token name or literal, bg token name or literal)
const checks = [
  ["action text on surface", "amber", "surface", "body"],
  ["action text on page bg", "amber", "lightest", "body"],
  ["white on action CTA", "#FFFFFF", "amber", "body"],
  ["white on action hover", "#FFFFFF", "amber-hover", "body"],
  ["success on white", "success", "surface", "body"],
  ["success on success-bg", "success-deep", "success-bg", "body"],
  ["danger on white", "danger", "surface", "body"],
  ["danger on danger-bg", "danger-deep", "danger-bg", "body"],
  ["mid text on surface", "mid", "surface", "body"],
  ["light text on surface", "light", "surface", "body"],
  ["input border vs surface (UI)", "border-strong", "surface", "ui"],
  ["sidebar-muted on sidebar (UI)", "sidebar-muted", "sidebar", "ui"],
];
const resolveColor = (v, palette) => (v.startsWith("#") ? v : palette[v]);
const matrix = checks.map(([label, fg, bg, kind]) => {
  const ratio = contrast(resolveColor(fg, tokens), resolveColor(bg, tokens));
  const pass = kind === "body" ? ratio >= 4.5 : ratio >= 3;
  return { label, fg, bg, ratio, pass, missing: !resolveColor(fg, tokens) || !resolveColor(bg, tokens) };
});
const darkChecks = checks.map((c) =>
  c[0].startsWith("white on action") ? [c[0].replace("white", "ink"), "#1C1917", c[2], "body"] : c
);
const darkMatrix = darkChecks.map(([label, fg, bg, kind]) => {
  const f = resolveColor(fg, darkTokens);
  const b = resolveColor(bg, darkTokens);
  if (!f || !b) return { label, fg, bg, ratio: 0, pass: false, missing: true };
  const ratio = contrast(f, b);
  const pass = kind === "body" ? ratio >= 4.5 : ratio >= 3;
  return { label, fg, bg, ratio, pass, missing: false };
});
const darkPassing = darkMatrix.filter((c) => c.pass && !c.missing).length;
const darkTotal = darkMatrix.filter((c) => !c.missing).length;

// ── Token discipline ──────────────────────────────────────────────────────
const count = (re) =>
  all.reduce((n, [, c]) => n + (c.match(re) || []).length, 0);
const filesWith = (re) => new Set(all.filter(([, c]) => re.test(c)).map(([f]) => rel(f))).size;

const arbitraryValues = count(/\[[0-9]+(?:\.[0-9]+)?(?:px|rem|vh|vw|%|ch|em)\]/g);
const rawPalette = count(/\b(?:bg|text|border|ring|from|to|via|divide|outline)-(?:zinc|slate|gray|neutral|stone)-\d{2,3}\b/g);
// outline-none is only a violation when the same className lacks a
// focus-visible alternative (the paired pattern — outline-none +
// focus-visible:ring-* — is the sanctioned focus treatment)
let outlineNone = 0;
let focusVisible = 0;
for (const [, c] of all) {
  for (const m of c.matchAll(/className=\{?([`"'])([^`"'\n]*?outline-none[^`"'\n]*?)\1\}?/g)) {
    if (/\bfocus-visible:/.test(m[2])) focusVisible++;
    else outlineNone++;
  }
}
const hexLiterals = count(/#[0-9a-fA-F]{3,8}\b/g);
const darkClasses = count(/\bdark:/g);
const radii = new Set();
for (const [, c] of all)
  for (const m of c.matchAll(/\brounded-(\[?[0-9a-z.\]]+\]?)/g)) radii.add(m[1]);

// ── State coverage ────────────────────────────────────────────────────────
const pages = files.filter((f) => /\/page\.tsx$/.test(f));
const pageSrc = (f) => src.get(f) || "";
const loadingFiles = files.filter((f) => /loading\.tsx$/.test(f));
const hasLoading = (f) => /is(Loading|Pending)|Loading\.\.\.|skeleton/i.test(pageSrc(f));
const hasError = (f) => /isError|error &&|ErrorBoundary|error\.tsx/i.test(pageSrc(f));
const emptyCopy = (f) => /No .{0,24}(found|yet)|Nothing here|empty/i.test(pageSrc(f));
const ariaLive = count(/aria-live|role="status"/g);
const clientPages = pages.filter((f) => /^["']use client["']/m.test(pageSrc(f))).length;

// ── Fonts / layout ────────────────────────────────────────────────────────
const fontsourceImports = (css.match(/@import '@fontsource[^']+'/g) || []).length;
const nextFont = /next\/font/.test(css) || /next\/font/.test(readFileSync(join(web, "app/layout.tsx"), "utf8"));

const lightPassing = matrix.filter((c) => c.pass && !c.missing).length;
const lightTotal = matrix.filter((c) => !c.missing).length;
const metrics = {
  contrast: { passing: lightPassing, total: lightTotal, matrix, darkPassing: { count: darkPassing, total: darkTotal, matrix: darkMatrix } },
  tokens: {
    arbitraryValues,
    rawPaletteUtilities: rawPalette,
    hexLiterals,
    unpairedOutlineNone: outlineNone,
    focusVisible,
    darkClasses,
    distinctRadii: radii.size,
  },
  states: {
    routes: pages.length,
    loadingFiles: loadingFiles.length,
    pagesWithLoading: pages.filter(hasLoading).length,
    pagesWithErrorHandling: pages.filter(hasError).length,
    pagesWithEmptyState: pages.filter(emptyCopy).length,
    ariaLiveAnnouncers: ariaLive,
    clientPages,
    serverPages: pages.length - clientPages,
  },
  fonts: { fontsourceImports, usesNextFont: nextFont },
};

const verdicts = {
  contrastBodyTextAA: metrics.contrast.passing === metrics.contrast.total && metrics.contrast.darkPassing.count === metrics.contrast.darkPassing.total,
  noRawPalette: metrics.tokens.rawPaletteUtilities === 0,
  noUnpairedOutlineNone: metrics.tokens.unpairedOutlineNone === 0,
  routeLoadingStates: metrics.states.loadingFiles === metrics.states.routes,
  asyncAnnounced: metrics.states.ariaLiveAnnouncers > 0,
  fontPipeline: metrics.fonts.usesNextFont,
};

writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), metrics, verdicts }, null, 2));

// ── Human summary ─────────────────────────────────────────────────────────
const fail = (c) => (c.pass ? "PASS" : c.missing ? "MISSING-TOKEN" : "FAIL");
console.log("── DESIGN AUDIT ─────────────────────────────────────");
console.log("Contrast (light):");
for (const c of matrix) console.log(`  ${fail(c).padEnd(13)} ${String(c.ratio).padStart(5)}  ${c.label}`);
console.log("Contrast (dark):");
for (const c of darkMatrix) console.log(`  ${fail(c).padEnd(13)} ${String(c.ratio).padStart(5)}  ${c.label}`);
console.log("\nTokens:");
for (const [k, v] of Object.entries(metrics.tokens)) console.log(`  ${k.padEnd(22)} ${v}`);
console.log("\nStates:");
for (const [k, v] of Object.entries(metrics.states)) console.log(`  ${k.padEnd(22)} ${v}`);
console.log("\nFonts:", JSON.stringify(metrics.fonts));
console.log("\nVerdicts:");
for (const [k, v] of Object.entries(verdicts)) console.log(`  ${v ? "✅" : "❌"} ${k}`);
console.log(`\nWrote ${out}`);
