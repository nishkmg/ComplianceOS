# Design Audit — SUPERSEDED

The one-off audit report (2026-06-14) is superseded by the living, scripted gate:

- **`scripts/design-audit.mjs`** — contrast matrix (both themes), token discipline
  (raw palette = 0, unpaired outline-none = 0), loading-state coverage, client/server
  split. Writes `DESIGN-AUDIT.json` and exits non-zero on any failed verdict.
  Runs in CI (`design-audit` job).
- **`apps/web/e2e/a11y.spec.ts`** — full-surface axe sweep (31 routes), zero
  critical/serious violations. Runs in CI (`e2e-a11y` job).
- **`DESIGN.md`** — the enforceable design canon.

Baseline at the time of supersession (2026-08-10): all six audit verdicts ✅,
axe 0 violations across app + marketing + auth + legal.
