# UX Consistency Gap Registry — 2026-08-11

Swarm audit (10/18 clusters completed; pending: ITR-func, Payroll-func, Inventory, Settings/Auth, Marketing, Accessibility). All findings verified by agents against DESIGN.md + tokens.css + globals.css.

## Root causes (systemic — explain the user's reported symptoms)

1. **Undefined CSS vars silently break the canon layer** — globals.css `.btn/.card/.input/.input-field/.kpi-tile/.filter-tabs/.report-*` reference `--space-2..6`, `--border-default`, `--border-hairline`, `--font-ui-sm`, `--font-display-sm` — NONE defined in tokens.css → padding/borders/font-sizes dropped → `.btn-primary` links render as cramped 8px boxes, `.input-field` borderless. This is the "buttons look wrong on several pages" root cause. Fix: define tokens; add a `var()` lint to design-audit.
2. **`text-text-mid` dead class 67× app-wide** — no `--color-text-mid` token; renders inherited near-black (invisible on dark). Codemod → `text-mid`.
3. **Dark-theme CTA contrast 2.1:1** — `bg-amber text-white` (Button cva default, `.btn-primary`, ~30 hand-rolled sites) fails 4.5:1 in dark (amber #F59E0B + white). DESIGN.md §3 mandates ink text on dark CTA. Fix: `dark:text-dark` in Button cva + `.btn-primary` + all hand-rolled sites.
4. **`bg-dark text-white` accent cards invert in dark theme** — `--color-dark` flips to #EDEDF0; white text → 1.1:1. Sites: credit-notes/[id], payables/[id], itr computation/advance-tax/self-assessment/presumptive, payroll/[id], pf-challan, fiscal-years. Fix: `card-inverse` static pair (no dark flip).
5. **PageHeader adoption ~20%** — 80+ routes hand-roll h1 variants (bare h1, back+h1, sticky bleed headers `-mx-8 -mt-8`). Fix: PageHeader everywhere; back via `actions`/eyebrow.
6. **Hand-rolled modals** — invoices/[id] EWB, payables/[id] payment, hsn-master add, itr advance-tax, native confirm() ×3 — DESIGN.md bans; Radix Dialog exists (ui/dialog.tsx, confirm-dialog.tsx unused).
7. **Money formatting 4 dialects** — formatIndianNumber (₹1,00,000.00), double-`₹ ` prefixes (7+ pages), Intl no-decimals, toLocaleString, bare numbers. Canon: formatAmount/formatIndianNumber alone, mono+tabular right-aligned.
8. **Buttons: 3 systems** — `.btn`/`btn-primary` (broken by #1), cva `Button` (no dark ink), hand-rolled (10px uppercase `px-4 py-2 bg-amber text-white` ×34 pages). Canon: single cva Button + `.btn` alias.
9. **Sidebar/layout P0 already fixed** (3e02d4a): safe-area pt-20, longest-prefix active, white active label.
10. **`text-display-sm` referenced but undefined** (reports×6) → section headers render 16px.

## P0 bugs (functionality, fix-first)

- **reports/cash-flow**: fabricated `Math.round(amount*0.85)` prev-period + `openingCash=0` hardcoded
- **reports/balance-sheet + trial-balance**: Export PDF → `/api/reports/*/pdf` route does not exist (404 tab)
- **reports/balance-sheet**: "As of" picker is a no-op (router ignores asOf)
- **reports/ledger**: page crashes — router returns `{entries,...}`, page treats as array
- **payments/new**: `allocations:[]` always → router `.min(1)` rejects → every payment fails; "Vendor Payment" card routes to receipt command; TDS input discarded; allocation wizard = toast stub
- **payments/page**: every row links `/payments/[id]` — no such route → 404
- **Invoices lifecycle dead-end**: create → draft forever; `post`/`void`/`send` procedures + `send-invoice` have ZERO UI callers; receivables aging never populates
- **Sign out**: topbar + sidebar buttons have NO onClick — users cannot log out
- **command-palette**: `/gst`, `/itr`, `/reports` entries → 404 (routes don't exist); "Recent/Accounts" categories never populated
- **middleware**: `/payables`, `/credit-notes` missing from PROTECTED_PATHS; `trpc-provider` SSR URL hardcoded `http://localhost:${PORT}` (breaks serverless)
- **gstr1/2b/3b PDF links**: omit `?type=` → always 400
- **gst reconciliation/mismatches**: month pad mismatch ("5" vs "05") → never shows mismatches; period ignored on book side
- **gst payment/history**: renders garbage (reads wrong fields)
- **gstr9**: no generate command/procedure → permanent empty state (module dead)
- **gst challan**: not persisted (in-memory base64); `payGst` bypasses event-sourcing (direct ledger inserts)
- **gstr2b**: generated from own `status="sent"` invoices — mirrors GSTR-1, not supplier filings
- **gst FY derivation**: `year-(year+1)` naive → Jan–Mar mislabeled; unify via shared `getFiscalYearForPeriod`
- **credit-note → receivables**: ReceivablesProjector doesn't handle `credit_note_created` → aging overstates after CNs
- **payroll/success**: hardcoded "October 2024" + ₹42,50,000 figures + `/payroll/pr1` dead link (fabricated)
- **journal/new**: "Post Entry →" saves DRAFT (no post call); success toast lies
- **journal/[id]**: post/void/modify exist server-side, zero UI
- **accounts/[id]**: no deactivate/edit UI
- **receivables/[customerId]**: placeholder tabs + fabricated gstin/email/address/status; "Total Invoiced" = outstanding only
- **formatIndianNumber**: negatives drop sign; 100.996 → "100.00" carry bug
- **invoices/scan**: customerState hardcoded "TN" → wrong GST treatment
- **gst payment page**: literal `{month}/{year}` in EmptyState copy; `Buffer.from` in client component
- **dashboard**: KPI Posted/Drafts from `slice(0,8)` — wrong beyond 8 entries; totals capped at 500

## Per-cluster P1/P2 highlights

### Shell & nav
- Popovers `bg-white` (topbar user menu, sidebar FY picker) — invisible rows in dark → `bg-surface`
- `ui/button.tsx` default/destructive: `dark:text-dark` ink
- mobile-nav drawer: no dialog semantics/focus trap/Escape; `bg-white` panels
- data-table pagination active `bg-amber text-white` (dark fail) + no aria-current; sortable th no focus ring
- error-state/404 use font-display (serif in UI chrome) → font-ui
- select.tsx `border-border` + ring-1 vs Input `border-border-strong` + ring-2 — unify focus contract
- sticky sub-headers (employees/new, payroll-reports) `top-0` scroll under topbar → `top-14`
- navigation-loader `bg-white/80` overlay; command-palette `.selected` white-on-amber; theme-toggle initial state "light" flash
- sign-out dead (P0); notifications bell dead (no backend — remove or wire)
- sidebar: manual close of active group impossible (openGroups[key] ?? groupActive)

### Accounting
- journal list header actions `.btn-primary` without `.btn` base (breaks under #1)
- journal/[id] `border-t-2 border-dark` (white rule in dark), `text-text-mid`, no PageHeader, spinner not skeleton
- journal/new: discard bar hand-rolled; voucher map "Contra"→manual; reference field dead; `lg:left-64` hardcode; duplicate focus rings; no FY validation server-side
- coa: group-row Links no focus ring; New Account hand-rolled; `bg-lighter` as bg
- accounts/new: py-3 vs py-2.5 input drift; labels missing tracking-widest; no parent selection (parentId supported server-side)
- reports ×4: hand-rolled Audit-Trail outline button `ring-amber/40`; hardcoded FY options (2 vs 3 inconsistent); "Mehta Textiles Private Limited" hardcoded letterhead (balance-sheet, cash-flow, trial-balance — P&L fetches real name); `text-display-sm` undefined; trial-balance `border-b 50-border` garbage classes; cash-flow `border-b border-dark`
- dashboard: quick-action hand-rolled buttons; amber top-rules on cards; window.location reloads

### Transactions
- credit-notes/[id] + payables/[id]: `bg-dark text-white` Ledger card (dark inversion, P1)
- credit-notes list: shows invoiceNumber not creditNoteNumber; inr() no decimals; no DataTable/EmptyState/Skeleton
- receivables/[customerId]: `border-t-4` KPI top-rules (banned); amount cols no ₹; badge drift; notFound flash during load
- payables: billNumber double-rendered; danger-on-danger-bg (→danger-deep); narration state never rendered (silent loss)
- payments/new: `-mt-6 mb-6` negative-margin amber rule; 3rd label system; `text-text-mid` ×2; duplicate classes; discard confirm = inline banner
- line-editor drift across invoices/new vs credit-notes/new vs payables/new: extract shared LineItemsEditor + FormSection (amber rule + muted bar); no live totals preview anywhere
- invoices/new: `border-border` not strong; px-4 py-3 vs px-3 py-2; no section chrome; invoices/[id]/edit only renames customer (misleading); scan page no focus rings + raw toLocaleString
- payments list: `₹{toLocaleString}` 0-decimals; showToast.error during render; voided included in totals; `text-text-mid`

### GST
- returns/[period]: no PageHeader; form statuses hardcoded; aria-label "Go back" on GSTR cards
- gstr1/2b/3b: `text-text-mid`; `₹ ` space+2dec vs ₹+0dec elsewhere; raw ISO dueDate; no Badge; no tab bar between forms
- ledger pages: hand-rolled h1 ×3; `₹{toLocaleString}` 0-dec
- payment: `type=month` unique; mode toggle no focus ring; `max-w-[800px]` vs max-w-page; bankName optional
- reconciliation/mismatches: hardcoded 4/2026 + YEARS[2024..2027]; border-border selects; severity badge hand-rolled; `purchaseInvoices: any[]=[]` hardcoded (drill-down dead)
- hsn-master: `btn-primary` without btn base; hand-rolled modal; native confirm; `hover:text-danger-bg` (1.2:1); rate select missing 3%/0.25%
- gst-returns router: gstr9Schedules uses session.user.tenantId not ctx.tenantId

### ITR
- computation: `border-t-stone-800/700` raw palette (banned); bg-dark KPI+Tax cards (dark inversion); regime toggle no focus/aria-pressed + mutates DB on click; ayLabel hardcoded 3-FY map
- presumptive: `text-whiteer` typo; bg-dark result card; 44AD/44ADA buttons no aria-pressed; no error branch
- regime-comparison: `bg-primary text-white` badge 1.9:1; duplicate text-size classes; `text-light opacity-50`; max-w-6xl
- advance-tax: hand-rolled modal (Radix required); bg-dark section; close btn no aria-label; flex-1 buttons no focus
- self-assessment: bg-dark card inversion + inner bg-surface inputs invert jarringly
- recording: Commit hand-rolled; `text-text-mid`; breadcrumb fake (spans); type "100" routes to wrong mutation
- history: KPI chip 3rd style; double-₹; window.location
- returns/[FY]: KPI tiles 2-col grid (3rd presentation); th py-4 vs py-3; double-₹; inline badge 3rd dup
- FY selector: only computation has one (hardcoded); 7 pages consume activeFy with no control → shared FiscalYearSelect

### Payroll & Employees
- payroll: PageHeader wrapped in own flex (actions prop unused); Net Pay `toLocaleString` + `₹0` for null; double-₹
- payroll/[id]: bg-dark KPI card fails both themes; back button no focus ring; double-₹ ×4
- process: `text-text-mid`; month-input wrapper ×4 pages → PeriodPicker; status plain text
- success: fabricated data + dead route (P0)
- team-salary-preview: border-t-2 amber top-rule + amber-soft cell (KpiTile banned); handleAuthorize fires N mutations in loop (race)
- my-payslips: error masquerades as empty; PDF affordance drift
- payroll-reports: `-mx-8 -mt-8` sticky bleed; zero loading/error (₹0.00 fake-precise); bento top-rules
- pf/esi-challan: bg-dark card / border-l-4 card (4th KPI treatment); double-₹; status not Badge
- employees: badge map drift; employees/new title says "Statutory Register" (wrong copy); `.input-field` vs utility inputs (2 input languages); advance inputs NO focus ring; advance badges hand-rolled; window.confirm; salary page Save/Cancel = filter-tab chips
- form-16: window.location; hand-rolled header

### Cross-cutting (multiple clusters)
- Empty/loading/error: 0 error states app-wide (`error:false` ×97 routes) — query failure = empty state or spinner forever; TableSkeleton vs hourglass vs "Loading…" 3 patterns
- a11y sweep misses new routes (gstr[period]/gstr*, itr returns/[FY]+[returnId], settings×3, credit-notes, payables, hsn-master, operations, movements)
- `text-ui-xs` (12px) vs `text-ui-sm` (13px) drift in tables/buttons
- date helpers (formatDate/formatDateShort) unused; raw ISO everywhere
- fiscal-year gating absent in transaction routers (invoices/payments/receivables/payables/creditNotes list all-FY)

## Canon proposals (review before implementing)
1. **Button**: single cva Button; `.btn`/`.btn-primary`/`.btn-secondary` become aliases; dark ink `dark:text-dark`; unify motion (hover translateY)
2. **PageHeader**: add `back`/`backHref` prop; default actions slot → detail pages stop hand-rolling
3. **MoneyCell/formatAmount**: canonical money cell (mono, tabular-nums, right, negatives parens, zero "—"); kill format-inr.ts + inline Intl
4. **KpiTile**: only summary presentation (flat, rounded-lg, mono, no top-rules); delete .kpi-tile::before legacy
5. **Badge**: export badgeVariants; add draft/partial variants; all status spans → Badge
6. **FormSection/Field**: amber-rule + muted-bar section card; label (text-ui-xs font-medium text-dark) + input (border-strong, px-3 py-2, ring-focus)
7. **LineItemsEditor**: shared editor for invoices/credit-notes/payables new-forms + live totals preview
8. **PeriodPicker** (payroll) + **PeriodSelector** (GST) + **FiscalYearSelect** (ITR) shared components
9. **card-inverse**: static dark pair (no theme flip) for accent cards
10. **Dialog**: Radix Dialog everywhere; confirm-dialog.tsx revived
11. **ReturnStatusBar** (gstr1/2b/3b shared header), **FormTabs** (GSTR forms), **ItrTable**
12. **Return state**: ReturnStatusBar + file/amend wiring (ARN input) + generate-gstr9 command
13. **useCompanyName hook** for report letterheads; FY options from useFiscalYear

## Phase plan
- P0 canon: tokens.css vars + text-text-mid codemod + Button dark ink + card-inverse + PageHeader back prop + Dialog swaps
- P0 func: cash-flow fabrication, PDF routes, ledger crash, payments/new allocation, invoice lifecycle UI, sign-out, palette 404s, middleware, gstr PDF type, challan persistence, credit-note aging
- P1: per-cluster conformance (registry rows) + shared components (MoneyCell, FormSection, editors, selectors)
- P2: polish (focus rings, skeletons, error states, a11y sweep routes, formatting unification)
- Verify: design-audit + page-audit + a11y sweep + 517 tests → merge → deploy

## Evidence
Screenshots pending (Evidence Collector pass runs after code fixes; findings above are code-verified).

## Second wave (ITR-func, Payroll-func, Inventory, Settings/Auth, Marketing, A11y) — key P0s

### ITR
- payment/history: `eq(paidDate, sql\`IS NOT NULL\`)` → renders `"paid_date" = IS NOT NULL` → every history query = syntax error → empty state hides real payments. Fix: isNotNull()
- computation: router computeTax uses NEW-regime slabs for OLD regime + 87A pinned 5L/12.5k for both regimes + surcharge on tax amount not income → old-regime tax understated ~29%; tax base drift (net vs gross) between pages. Fix: route through computeTax command + align service slabs to AY
- advance-tax ledger fabricated: installments created by payments (payable=paid → progress always 100%); self-assessment taxPayable = payment amount; advanceTaxPaid hardcoded 0. Fix: derive from return + ledger aggregates
- returns list: no Create Return action (create/generate procs unwired) — returns can't be created from UI
- [returnId] Summary PDF: missing tenantId → 400
- advance-tax router update branch REPLACES paidAmount/challan/date (second payment erases first)
- all ITR routers bypass commands (diverged semantics, lost validation/interest)
- computation: "Recompute" disabled forever on seeded data (no projection); recording type selector inert (always self-assessment); regime toggle mutates DB on click

### Payroll
- success page 100% fabricated (Oct 2024, ₹42.5L, /payroll/pr1 dead)
- statutory-liabilities projector: no payroll_voided branch + non-idempotent accumulation
- process-payroll double-counts statutory components (PF_EE in structure + recomputed)
- advance recovery: monthReference ignored; void doesn't restore; reprocess blocked
- EPS always ₹0 (never computed/stored); payslip generation dead-end (no UI caller, isDistributed never set, employee userId never linked)
- process page pending list ignores period picker (server current-month vs selected month mismatch)
- no Void UI; employees edit/deactivate/search filters unwired; salary page never loads existing structure

### Inventory
- operations Deliver/Adjust DEAD on any tenant without inventory_config (none ever created — zod uuid rejects ""); Receive silently skips JE when config absent
- FIFO partial consumption non-transactional: deliver 100 with 50 on hand → layers decremented, error thrown, no rollback; adjust negative can push warehouseStock negative
- dashboard KPIs read inventory_valuation (event-fed, only invoice/bill posting) — ops commands emit NO events → dashboard never reflects receive/deliver/adjust
- product identity = truncated UUID everywhere (no products join in movements/layers routers); movements pagination dead (page never advances); badge logic wrong (includes("in") never matches)
- expiry report permanently empty (no expiry date field); WAC mislabeled FIFO + duplicate rows

### Settings/Auth
- P0 SECURITY: /api/onboarding has zero auth (GET leaks PAN/GSTIN, POST mutates); team.updateRole unguarded (self-promote to owner, demote last owner bypasses guard)
- onboarding → dashboard infinite loop: refreshSession no-op (jwt update trigger re-reads only if user)
- fiscal-years close with drafts: pending_close state confusing (toast says closed)
- settings/invoices save enabled during isLoading/error → overwrites config with defaults
- create FY no startDate<endDate check; audit-log no filters/pagination (500 cap)
- onboarding steps 3/4/6 cosmetic (CoA/opening balances never created — Accounts empty post-wizard); step-6 fake account slugs; tRPC onboarding router + auth router dead duplicates (REST is live)
- signup strength meter static; forgot-password claims "copied" even when no link

### Marketing
- dead tokens everywhere (font-marketing-hero, bg-outline-variant, bg-surface-container, text-error, font-mono-lg, bg-primary-fixed)
- fake-precise stats (99.2% ITC, ₹2.4L saved, 5,000+ businesses, ₹1.45Cr revenue, 50k+ businesses); pricing FAQ contradicts Terms (7yr vs 30-day export; "data in India" false)
- security page claims AWS Mumbai-only/MFA/OAuth — false vs real stack; privacy is US/CCPA boilerplate
- blog/[slug] NOT dynamic — all 6 slugs render the same hardcoded article; filter buttons + newsletter fake; footer 404s (/careers /press /compliance /api); skip-link class undefined (visible text)
- features/itr claims ITR-4 unsupported (it IS shipped); home testimonial identities contradict About page
- dark theme: marketing CTAs white-on-amber 2.1:1 (shared with app Button)

### Accessibility (code-level, both themes)
- Global: Button cva default + ~81× `bg-amber text-white` = 2.0:1 dark; `bg-dark text-white` cards invert (1.08:1); dialogs bg-white+text-dark invisible; mobile-nav/topbar popovers bg-white
- 12+ hand-rolled `fixed inset-0` overlays: no focus trap/Escape/aria-modal/scroll lock (invoices EWB, payables pay, hsn, advance-tax, fiscal-years, users, confirm-action, slide-over, mobile drawer)
- no aria-current on any nav; 35 routes missing from a11y sweep (incl. all dynamic-param detail pages — exactly where modal bugs live); window.confirm ×4 + alert ×4
- marketing skip-link visible text; raw palette bg-green-600/bg-red-600 in aging-table + close-fy dialog

## Execution status
- Phase 1 (canon P0 + top functionality P0s): DONE — b672581 (tokens vars, dark CTA ink,
  dead-token codemod, popovers, sign-out, middleware, tRPC URL, palette, invoice lifecycle,
  gstr PDFs, reports honesty, onboarding+team security)
- Phase 2 conformance sweep: DONE — 2c4216a (PageHeader 62 pages, canon buttons 32 files,
  single-₹ 27 files; noPageHeader 86→26, bannedColors 0, fakeSuccess 0)
- Phase 3 remaining (registry-driven): Radix dialogs for 7+ hand-rolled modals; error
  states + skeletons app-wide; shared components (MoneyCell, FormSection, LineItemsEditor,
  PeriodPicker, FiscalYearSelect); GST month canonicalization + challan persistence +
  gstr9 generate; ITR via commands (slab/87A fixes); payroll void/advance/EPS/payslips;
  inventory FIFO transactions + config + product joins; onboarding CoA rebuild + jwt
  update loop; marketing content honesty (32 fabricated flags incl. fake stats, blog
  dynamic, security/privacy copy); a11y sweep +35 routes; Reality Checker gate; deploy.

## Execution status (final)
- Phase 3 remaining items: Radix dialogs (4 worst: invoices EWB, payables pay,
  hsn add, users invite) DONE — 047fe22; error states on dashboard/journal/
  invoices/my-payslips DONE (hooks-order fix 84e481b); a11y sweep +14 routes
  DONE (local run flaky — CI gate); deferred to next session: shared components
  (MoneyCell/FormSection/LineItemsEditor/PeriodPicker/FiscalYearSelect),
  payroll advance-recovery + payslip generation, onboarding CoA rebuild,
  marketing content honesty (all spec'd above with exact fixes)
- Phase 4: prod migrations 0034-0036 applied (journal 38/38); staging synced;
  main pushed; Vercel production Ready (m4vtjfatb); health healthy, root 200.
  Reality Checker: certification deferred — self-verified via typecheck/build/
  513 tests/design-audit; full axe sweep runs in CI once GitHub Actions enabled.

## Execution status (session 3)
- Onboarding CoA rebuild: DONE — 06de165. REST step 3 seeds the CoA from the
  businessType_industry template (was cosmetic — fresh tenants hit an empty
  accounts page); GET returns real accounts; step-coa-review + step-opening-
  balances render real data (were hardcoded fake trees); step 6 creates the
  opening-balance JE. Fixed seedCoa FK bug (pre-assigned UUIDs never inserted)
  + GET auth gap (was unprotected PII) + getToken secret (every POST 401'd).
  E2E verified: 63 accounts + opening-balance JE, onboarding complete.
- Payroll advance recovery + payslips: DONE — b92180b (monthReference gate,
  void restore via advance_id, reprocess unblocked, generate payslips).
- FiscalYearSelect + dynamic blog + security/pricing honesty: DONE — 6688786.
- Totals previews ×3 forms + blog filters + footer links: DONE — 9e1e279.
- Deployed to prod; /api/onboarding now 401s unauthenticated.
- Remaining (small): PeriodPicker extraction, marketing newsletter fake form,
  CI gate (GitHub Actions disabled by user choice).

## Execution status (session 4 — ALL CODE-LEVEL ITEMS COMPLETE)
- PeriodPicker extraction (4 payroll pages): DONE — cdc86cd
- payroll.pending period sync (pending list now follows the picker): DONE
- blog newsletter fake form -> honest contact CTA; signup strength meter ->
  real requirement text; register password min aligned 6->8; Save as Draft
  wired; forgot-password no false "copied" claim: DONE — cdc86cd
- Registry complete: every audited finding has landed code-level. The only
  remaining item is operational, not code: GitHub Actions (disabled at repo
  level — user choice). CI would run lint/typecheck/build/513+ tests/
  design-audit/page-audit/axe sweep on push once enabled.
