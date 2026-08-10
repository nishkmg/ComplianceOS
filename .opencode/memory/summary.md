# Project Memory Summary
Last Updated: 2026-06-14T12:10:50.939Z
Total Compactions: 46

## Latest Session
## Session Summary (Compaction #46)
Generated: 2026-06-14T12:10:50.939Z

### This compaction captures:
- Current task state and progress
- Key decisions made
- Files being worked on
- Any blockers or pending items

### Context from previous sessions:
Previous session files available in this directory for reference.


## Session History
All session files are preserved in this directory:
- session-2026-05-12T16-13-14-311Z-compaction1.md
- session-2026-05-15T06-41-01-774Z-compaction2.md
- session-2026-06-06T14-49-37-522Z-compaction3.md
- session-2026-06-06T14-50-01-500Z-compaction4.md
- session-2026-06-06T16-13-02-120Z-compaction5.md
- session-2026-06-06T17-03-42-206Z-compaction6.md
- session-2026-06-06T17-16-11-559Z-compaction7.md
- session-2026-06-06T17-50-17-257Z-compaction8.md
- session-2026-06-07T03-50-50-725Z-compaction9.md
- session-2026-06-07T04-39-14-146Z-compaction10.md
- session-2026-06-07T05-15-02-850Z-compaction11.md
- session-2026-06-07T06-53-20-154Z-compaction12.md
- session-2026-06-07T06-58-32-707Z-compaction13.md
- session-2026-06-07T07-12-49-145Z-compaction14.md
- session-2026-06-07T07-45-32-129Z-compaction15.md
- session-2026-06-08T03-29-33-205Z-compaction16.md
- session-2026-06-08T03-54-05-111Z-compaction17.md
- session-2026-06-08T03-54-49-807Z.md
- session-2026-06-08T04-01-57-689Z.md
- session-2026-06-08T04-02-27-283Z-compaction20.md
- session-2026-06-08T04-05-13-060Z.md
- session-2026-06-08T04-14-38-438Z-compaction22.md
- session-2026-06-08T04-40-32-724Z-compaction23.md
- session-2026-06-08T04-48-20-773Z.md
- session-2026-06-08T04-56-13-140Z-compaction25.md
- session-2026-06-08T04-56-23-612Z-compaction26.md
- session-2026-06-08T04-56-55-419Z-compaction27.md
- session-2026-06-08T05-01-40-691Z.md
- session-2026-06-08T05-05-21-734Z-compaction29.md
- session-2026-06-08T05-29-41-472Z-compaction30.md
- session-2026-06-08T05-40-40-247Z-compaction31.md
- session-2026-06-08T05-46-01-090Z-compaction32.md
- session-2026-06-08T06-05-33-439Z-compaction33.md
- session-2026-06-08T06-13-30-064Z-compaction34.md
- session-2026-06-08T07-42-16-269Z-compaction35.md
- session-2026-06-14T07-29-25-940Z-compaction36.md
- session-2026-06-14T07-45-28-164Z-compaction37.md
- session-2026-06-14T10-42-29-802Z-compaction38.md
- session-2026-06-14T10-45-33-439Z-compaction39.md
- session-2026-06-14T11-31-12-377Z-compaction40.md
- session-2026-06-14T11-38-51-843Z-compaction41.md
- session-2026-06-14T11-44-09-717Z-compaction42.md
- session-2026-06-14T11-48-12-833Z-compaction43.md
- session-2026-06-14T11-57-08-081Z-compaction44.md
- session-2026-06-14T12-05-22-256Z-compaction45.md
session-2026-06-14T12-10-50-939Z-compaction46.md

## 2026-08-10 — server test suite green (481/481) + PDF engine fixes

- Income-computation tests fixed (25/25): mocks wrapped for the new innerJoin from→{innerJoin:{where}} chain shape; zero-salary mock restored to plain where. Service already had 44AD 6%-digital/8%-cash logic (uncommitted prior work) — kept, tests now validate it.
- Payroll-integration tests fixed (2/2): tenant fixture gets explicit id (DB-generated id ≠ test's randomUUID), salary-components seeded (createSalaryStructure validates against salary_components), payroll_config + 6 accounts seeded, month "4"→"04" (MM regex), payslip filename assertion updated to zero-padded month.
- REAL BUGS FOUND + fixed: (1) `MAX(CAST(SUBSTRING(payroll_number FROM 'PAY-...') AS INTEGER))` malformed parens in create-payroll-run.ts + process-payroll.ts — syntax error; (2) finalize-payroll journal omitted EMPLOYER PF/ESI share from salary-expense debit — unbalanced journal whenever pfEr/esiEr > 0.
- payslip-pdf.ts: puppeteer now falls back to system Chrome (PUPPETEER_EXECUTABLE_PATH / CHROME_PATH / /Applications/Google Chrome.app) when the bundled browser is absent.
- PDF ENGINE ROOT CAUSE (blank PDFs everywhere): @react-pdf/renderer 4.5.1 silently drops ALL text runs when (a) no real font registered (Helvetica unsupported in v4) or (b) registerHyphenationCallback(() => []) called. Fixed pdf-engine.tsx: bundled Inter-Regular/Bold + NotoSansDevanagari TTFs in packages/server/assets/fonts (local-path registration, CDN fallback kept), hyphenation callback removed. Snapshot tests now hash extracted text via pdfTextDigest (zlib inflate + ToUnicode cmap decode) — deterministic across runs AND node versions (was byte-hash: broken by pdfkit random subset tags + /ID + object-order variance).
- pdf-snapshots suite: 5/5 green ×3 consecutive runs, node 20 + 26. Full server suite: 24 files, 481 tests green.
- Gotchas added to AGENTS.md (pdf snapshot strategy, blank-PDF traps).
