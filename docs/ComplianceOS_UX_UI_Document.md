# ComplianceOS — Comprehensive UX/UI Document

**Version:** 1.1  
**Date:** April 2026  
**Scope:** All 124 screens (96 pages · 12 dialogs · 5 wizards · 8 popovers) · 3 sub-screens added  
**Product:** Core Accounting Engine — Sub-project #1 of 8

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Global Interaction Patterns](#2-global-interaction-patterns)
3. [Authentication Screens](#3-authentication-screens)
4. [Onboarding Wizard](#4-onboarding-wizard)
5. [Dashboard & Navigation](#5-dashboard--navigation)
6. [Core Accounting Module](#6-core-accounting-module)
7. [Invoicing & Receivables Module](#7-invoicing--receivables-module)
8. [Payments Module](#8-payments-module)
9. [Financial Reports Module](#9-financial-reports-module)
10. [GST Module](#10-gst-module)
11. [ITR Module](#11-itr-module)
12. [Payroll Module](#12-payroll-module)
13. [Inventory Module](#13-inventory-module)
14. [Settings Module](#14-settings-module)
15. [Global UI Elements](#15-global-ui-elements)
16. [State Design Patterns](#16-state-design-patterns)
17. [Accessibility Standards](#17-accessibility-standards)

---

## 1. Design System Foundation

### 1.1 Typeface System

Three fonts. Each has exactly one role and does not appear outside of it.

| Token | Font | Weights | Role |
|-------|------|---------|------|
| `font-display` | Playfair Display | 400, 400-italic | Screen headings, report section titles, company name, wordmark |
| `font-ui` | Syne | 400, 500 | Navigation labels, filter tabs, buttons, form labels, badges, body text |
| `font-mono` | DM Mono | 400 | Every rupee amount, every entry code, account codes, date values in tables, keyboard hints |

**Loading:** All three via `@fontsource` packages (not Google Fonts CDN). Subset to Latin only. Never load weights not listed above.

### 1.2 Typography Scale

| Token | Font | Size | Weight | Use |
|-------|------|------|--------|-----|
| `display-xl` | Playfair Display | 38px | 400 | Wordmark, cover/splash headings |
| `display-lg` | Playfair Display | 26px | 400 | Screen h1, report company name |
| `display-md` | Playfair Display | 20px | 400 | Report section headers, major sub-headings |
| `display-sm` | Playfair Display | 16px | 400 | Report line-item group headers |
| `ui-lg` | Syne | 15px | 500 | Topbar screen title |
| `ui-md` | Syne | 13px | 400 | Nav items, table body, descriptions |
| `ui-sm` | Syne | 12px | 400 | Form labels, filter tabs, button text |
| `ui-xs` | Syne | 10px | 500 | Section labels (uppercase, tracked) |
| `mono-lg` | DM Mono | 15px | 400 | KPI tile amounts |
| `mono-md` | DM Mono | 13px | 400 | Table amounts, entry codes |
| `mono-sm` | DM Mono | 11px | 400 | Muted codes, metadata, keyboard hints |

### 1.3 Colour System

One accent colour. No exceptions.

| Token | Hex | Appears only on |
|-------|-----|-----------------|
| `amber` | `#C8860A` | Primary CTA buttons · Active nav state · Draft badges · Entry codes |
| `green` | System green | Posted badges · Balance confirmed state · Profit row backgrounds |
| `red` | System red | Error states · Unbalanced entry · Validation failures |
| `dark` | `#1A1A1A` | Primary text: headings, amounts, narrations |
| `mid` | `#555555` | Body text: descriptions, secondary labels, table cells |
| `light` | `#888888` | Tertiary: hints, metadata, section labels, muted codes |
| `surface` | CSS var | Cards, main content area |
| `muted` | CSS var | KPI tiles, table headers, FY progress block |
| `sidebar` | CSS var | Navigation background |

**Rule:** Amber is never decorative. When amber appears, the user's attention should go directly to it. Green means done. Red means wrong. Nothing else gets colour.

**WCAG AA compliance:** Amber on white must use `#B47500` (not `#C8860A`) for text — this passes 4.5:1. Light grey text must use `#767676` minimum on white.

### 1.4 Spacing Scale

| Value | Use |
|-------|-----|
| 4px | Icon gap, badge internal padding |
| 8px | Button icon-to-label gap |
| 12px | Cell padding, form field gap |
| 16px | Card padding, section padding |
| 24px | Between components |
| 32px | Between sections |

### 1.5 Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 4px | Badges, pills, keyboard shortcut chips |
| `radius-md` | 8px | Form inputs, filter tabs, KPI tiles, buttons |
| `radius-lg` | 12px | Cards, modals, app chrome |

### 1.6 Border Style

**0.5px hairline borders only.** Never 1px, never bold, never coloured except for semantic top-borders on KPI tiles. Financial data lives in columns — borders guide the eye without interrupting it. No drop shadows. No gradients. No blur effects. Flat surfaces only; typographic hierarchy does all visual work.

### 1.7 Layout Philosophy

**Density over whitespace.** The target user is a working accountant who spends 6–8 hours daily in this product. Default row height must show 10 entries without scrolling. Column widths are sized to data, not to fill available space. Negative space is used for section hierarchy (group headers, section breaks), never for aesthetic padding between rows.

This is a deliberate counter-position to Zoho Books, QuickBooks, and most modern SaaS tools, which inflate padding for marketing screenshots at the cost of daily usability.

---

## 2. Global Interaction Patterns

### 2.1 Keyboard Shortcuts (Application-wide)

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette from any screen |
| `N` | New journal entry (any screen outside the entry form) |
| `/` | Focus search/filter input on list screens |
| `Tab / Shift+Tab` | Navigate form fields in logical order |
| `⌘S` | Save current entry as draft |
| `⌘↵` | Post current entry (only active when balanced) |
| `Esc` | Discard form state (with confirmation if unsaved changes) |

Shortcuts are discoverable inline — shown in the relevant UI context in `mono-sm` muted text, not buried in a help page.

### 2.2 Navigation Rules

- Active route: amber left border (`border-left: 2px solid #C8860A`) + amber text + amber tinted background
- Inactive routes: `mid` text, no border
- Topbar title mirrors the active screen name in `display-lg` Playfair Display
- Skip-to-main-content link at top of every page (visually hidden until focused)

### 2.3 Fiscal Year Scope

Every list, every balance, every report is implicitly scoped to the active fiscal year. The active FY is always visible in the sidebar footer. Every screen that shows financial data should surface the active FY label somewhere in the header or topbar subtitle so there is never ambiguity.

### 2.4 Indian Number Formatting

All monetary values throughout the entire product must use:
- Indian numbering system: `1,00,000` not `100,000`
- Rupee prefix: `₹` (not `Rs`, not `INR`)
- Exactly 2 decimal places enforced everywhere
- DM Mono font, right-aligned in all table columns
- `Dr` / `Cr` labels in contexts where both debit and credit amounts appear

Implement a single `formatINR(value: number): string` utility in `packages/shared`. Never format amounts ad-hoc in components.

### 2.5 Status Badge System

| State | Label | Colour |
|-------|-------|--------|
| Draft | Draft | Amber background, amber text |
| Posted | Posted | Green background, green text |
| Voided | Voided | Muted background, light text |
| Pending | Pending | Muted background, mid text |
| Filed | Filed | Green background, green text |
| Overdue | Overdue | Red background, red text |
| Processing | Processing | Muted background, amber text |

Badges use `radius-sm`, `ui-xs` Syne, and a 4px leading dot matching badge text colour.

### 2.6 Toast Notifications

- Appear bottom-right, stack vertically
- Auto-dismiss after 4 seconds (success), persist until dismissed (error)
- Use semantic colours: green (success), red (error), amber (warning), muted (info)
- Max 3 simultaneous toasts
- `role="alert"` for errors, `aria-live="polite"` for success

### 2.7 Loading States

- Skeleton loaders (not spinners) for table/list screens — match the row count of a typical result set
- Spinner only for action buttons (`⟳` inline) while a mutation is in flight
- Never block the full screen for loading — show skeleton in the content area while the shell remains interactive

### 2.8 Empty States

Every list screen has an empty state. Empty states include:
- An illustrative label (e.g. "No journal entries yet")
- A single primary CTA that creates the first item
- Contextual explanation of what this list will show

Empty states do not use generic copy like "Nothing here." They are specific to the data type.

### 2.9 Error States

- Inline validation: shown below the field, in red, `ui-sm` Syne
- Form-level errors: shown in an error summary above the submit button
- 404 / Not found: dedicated screen with a back navigation CTA
- Server errors: toast with a retry action

---

## 3. Authentication Screens

### 3.1 Login — `/login`

**Purpose:** Authenticate existing users via email/password.

**Layout:** Centered card on a muted background. Card uses `radius-lg`, surface white, no shadow. ComplianceOS wordmark above the form in `display-lg` Playfair Display.

**Components:**
- Email input: type=email, autocomplete=email, `ui-sm` label
- Password input: type=password, autocomplete=current-password, show/hide toggle
- Login button: full-width, amber fill, `ui-sm` Syne, `radius-md`
- "Forgot password" link: `mid` text, below the button
- "Create account" link: below the card, less visually prominent than the login button

**States:**
- **Loading:** Login button shows inline spinner, text changes to "Signing in…", button disabled
- **Error (invalid credentials):** Inline error below the password field in red. Do not specify which field was wrong (security). Error text: "Incorrect email or password."
- **Error (rate-limited):** Inline message: "Too many attempts. Try again in 30 seconds."
- **Success:** Redirect to `/dashboard` (or the pre-login destination if a redirect was stored)

**A11y:**
- `htmlFor`/`id` linkage on all inputs
- Error messages use `role="alert"`
- Keyboard tab order: email → password → login button → forgot password
- On error, focus returns to the email field

---

### 3.2 Signup — `/signup`

**Purpose:** Register a new account and begin onboarding.

**Layout:** Same centered card as Login. Progress hint: "Step 1 of 7 — Account setup" in muted `ui-xs` above the form.

**Components:**
- Business name input
- Email input
- Password input with inline strength indicator (weak / fair / strong — no colour, just text label)
- Confirm password input
- Signup button: amber fill, full-width
- "Already have an account? Log in" link below

**States:**
- **Loading:** Button text: "Creating account…"
- **Error (email exists):** Inline below email field: "An account with this email already exists."
- **Error (weak password):** Inline below password: "Password must be at least 8 characters."
- **Error (passwords don't match):** Inline below confirm field: "Passwords do not match."
- **Success:** Redirect to `/onboarding`

**A11y:**
- Password strength indicator uses `aria-live="polite"` so screen readers announce strength changes
- Confirm password validated on blur, not on keystroke

---

## 4. Onboarding Wizard

### 4.0 Wizard Shell — `/onboarding`

**Purpose:** Linear 5-step setup. Cannot skip ahead. Cannot access main app until complete. This is intentional — the CoA, FY, and opening balances are foundational; a misconfigured CoA cannot be easily undone.

**Layout:** Full-screen (no sidebar). Progress stepper at the top. Step content fills the centre. Back/Next buttons fixed at bottom-right. No sidebar, no topbar, no global nav during onboarding.

**Stepper:**
- 5 numbered steps in a horizontal stepper
- Active step: amber fill circle + amber label
- Completed steps: green check circle + muted label
- Incomplete future steps: muted outline circle + muted label
- `aria-current="step"` on active step indicator

**Navigation:**
- Back: ghost button, returns to previous step (does not lose saved data)
- Next / Continue: amber fill button, validates current step before proceeding
- Skip (only on opening balances step): ghost button, explicitly labelled "Skip — start with zero balances"

---

### 4.1 Step 1: Business Profile

**Purpose:** Collect the business entity information that drives all downstream defaults.

**Fields (8 total):**

| Field | Input type | Validation |
|-------|-----------|------------|
| Business name | Text | Required |
| Legal name | Text | Optional, shown only if "Different from trading name?" checked |
| Business type | Select | Required — drives CoA template and P&L format |
| Industry | Select | Required — drives module activation defaults |
| PAN | Text | Required · Regex: `[A-Z]{5}[0-9]{4}[A-Z]` · Validated on blur |
| GSTIN | Text | Conditional — shown only when GST registration is indicated · 15-char format |
| State | Select | Required — 28 states + 8 UTs · drives GST place of supply |
| Address | Textarea | Required |

**PAN validation:** Validates on blur with a live check. Invalid format shows inline error immediately; do not wait for form submit.

**GSTIN:** Conditionally shown via a toggle "Are you GST registered?" Default off. When toggled on, GSTIN field appears with animation.

**A11y:**
- `htmlFor`/`id` on all inputs
- Dropdown `aria-label` includes field purpose, e.g. `aria-label="Select business type"`
- PAN format hint shown as `ui-xs` muted text below the field: "Format: AAAAA9999A"

---

### 4.2 Step 2: Module Activation

**Purpose:** Confirm which compliance modules to activate. Defaults are pre-set from business type and industry. User can override any toggle.

**Layout:** Grid of module cards (2×2 on desktop, 1-col on tablet). Each card shows:
- Module name in `ui-md` Syne
- One-line description in `ui-xs` muted
- Toggle switch (right-aligned)
- `?` icon that reveals a tooltip: "Why is this on?" with a brief explanation

**Modules:** GST · ITR · Payroll · Inventory · Invoicing

**States:**
- Toggle on: card gets a subtle amber left border
- Toggle off: card is neutral
- "Required" modules (Accounting, Invoicing for trading): toggle is locked on, tooltip explains why

**A11y:**
- Each toggle has an `aria-label`: "Enable [Module Name]"
- Tooltip on `?` icon triggered by hover and focus
- `role="group"` with `aria-labelledby` on the module card grid

---

### 4.3 Step 3: Chart of Accounts Template

**Purpose:** Select the CoA template that will be seeded for this business.

**Layout:** Card grid of 5 template options:
- Trading / Retail
- Manufacturing
- Services / Professional
- Freelancer / Consultant
- CA / CS (Regulated Professional)

Each card includes: Template name, key account types included (3 bullet points), "Preview" link.

**Selection:** Radio-pattern card selection. Selected card gets amber border. Only one selectable at a time.

**Preview:** Opens a slide-over panel (not a modal) showing the full account tree that will be seeded. User can browse but not edit here.

**Seeding:** When Next is clicked, the system seeds the CoA in the background. Shows a skeleton loader with "Setting up your accounts…" while seeding completes before proceeding to step 3b.

**A11y:**
- Cards use `role="radio"` and `aria-checked`
- Preview button does not submit the step

---

### 4.4 Step 3b: CoA Review (Conditional)

**Purpose:** Review and customise the seeded CoA before it is locked.

**Trigger:** Only shown if the user selected a template and wants to customise. Otherwise the wizard skips directly to Step 4.

**Layout:** Full tree view of the seeded accounts. Same visual as the main CoA screen (section 6.3 below) but with editing affordances visible.

**Controls:**
- Add account: inline `+ Add` link at the bottom of each account group
- Edit account: pencil icon appears on row hover
- Delete account: × icon appears on row hover (only on non-system accounts)
- "Reset to template" button in the top-right resets all changes

**Warning banner:** "Once you confirm and continue, your chart of accounts cannot be reset. Accounts can be added or renamed later, but the structure is permanent."

**A11y:**
- Tree view ARIA: `role="tree"`, `role="treeitem"`, `aria-expanded`
- Arrow keys navigate the tree (↑↓ between siblings, → expand, ← collapse)

---

### 4.5 Step 4: Fiscal Year & GST Configuration

**Purpose:** Set the first fiscal year and GST filing type.

**Fields:**

| Field | Input | Default | Notes |
|-------|-------|---------|-------|
| FY start date | Date picker | 01 April of current year | User can change if migrating mid-year |
| GST type | Radio (Regular / Composition / None) | Based on Step 1 GSTIN | Auto-set but overridable |
| Applicable GST rates | Multi-select chips | 18%, 5% | Common rates pre-selected |
| TDS applicable | Toggle | Off | When on, expands TDS section rate configuration |
| TDS section rates | JSON-like table (Section, Rate%) | Empty | Rows: 194C, 194J, 194A, etc. |

**FY overlap validation:** If the user enters a start date that would create a conflicting FY, show an inline warning before allowing Next.

---

### 4.6 Step 5: Opening Balances

**Purpose:** Import opening balances for migrating businesses, or skip for fresh starts.

**Two modes:**

**Fresh start (default):** Checkbox "This is a new business — start with zero balances." When checked, the table is hidden and Skip/Continue button is shown.

**Migration mode (when unchecked):**
- Upload zone for CSV or XLSX with a downloadable template link
- Or: Manual entry table — rows for each balance-sheet account with Debit and Credit columns
- Live balance checker at the bottom: Total Dr / Total Cr / Difference (must be ₹0.00 before Confirm is enabled)
- Confirm button is disabled until difference = ₹0.00

**Error states:**
- Upload parse error: "Could not read file. Download the template and try again."
- Unbalanced: Confirm button remains disabled. Difference shown in red.
- Row-level error: individual row highlighted with error reason in a tooltip

**Post-completion banner:** After the wizard completes, the dashboard shows a dismissible banner: "Review your opening balances — corrections are only possible before your first posted entry."

---

## 5. Dashboard & Navigation

### 5.1 Main Dashboard — `/dashboard`

**Purpose:** The first screen every morning. Answers three questions immediately: how is the business doing this month, what needs attention, what was I last working on.

**Layout:** Greeting header + 4 KPI tiles (full width) + 2-column body.

**Greeting header:**
- `display-lg` Playfair Display: "Good morning, [Business Name]"
- Subtitle in `ui-sm` Syne: "[Day, DD Month YYYY] · FY [year]"
- Uses the company name from onboarding, not "User"

**KPI tiles (4, full-width grid):**

| Tile | Source | Top border colour |
|------|--------|-------------------|
| Revenue MTD | account_balances · Revenue accounts | Amber |
| Expenses MTD | account_balances · Expense accounts | Red |
| Net Profit MTD | Revenue − Expenses | Green |
| Cash & Bank | account_balances · Cash + Bank sub-types | Neutral/mid |

Each tile shows:
- Label in `ui-xs` Syne (uppercase, tracked)
- Amount in `mono-lg` DM Mono
- Delta indicator (↑ X% vs last month) in `ui-sm` Syne, coloured green/red

**Left column (wider):** Recent entries table — last 5 entries. Columns: Entry # (mono amber), Narration (truncated), Amount (mono right-aligned), Status (badge).

**Right column:** FY progress bar (Apr–Mar, current month highlighted) + Quick action buttons (New entry — amber, View P&L — outlined).

**Empty state:** If no entries exist, the recent entries section shows: "No entries yet. Create your first journal entry." with a primary CTA.

**Loading state:** KPI tiles show number skeletons (animated shimmer). Table shows 5 skeleton rows.

**A11y:**
- KPI tiles use `<h2>` headings
- Table has `aria-label="Recent journal entries"`
- KPI delta indicators have screen-reader text: "Up 8.2% versus last month"

---

### 5.2 Command Palette — Global overlay (⌘K)

**Purpose:** Power-user keyboard navigation and action execution.

**Trigger:** `⌘K` from any screen except during active text input.

**Layout:** Centered modal with dark overlay. Search input at top. Command list below, max-height 400px, scrollable.

**Command categories (in order):**
1. Pages — Jump to any screen
2. Entries — Recent journal entries (searchable by narration/entry#)
3. Accounts — Search CoA accounts
4. Actions — "New journal entry", "New invoice", "Run payroll"
5. Reports — "Open P&L", "Open Trial Balance"

**Interaction:**
- Typing filters all categories simultaneously
- ↑↓ navigate items
- Enter executes the highlighted command
- Esc closes the palette
- Each command shows a `mono-sm` keyboard shortcut hint on the right if one exists

**Empty state:** "No results for '[query]'" — no secondary suggestions, no noise.

**A11y:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Command palette"`
- Focus trap: Tab cycles only within the palette while open
- `aria-activedescendant` on the list container tracks the highlighted item
- On close, focus returns to the element that triggered the palette

---

## 6. Core Accounting Module

### 6.1 Journal Entry List — `/journal`

**Purpose:** The primary working screen. All journal entries for the active FY, filterable and searchable.

**Layout:** Screen heading + filter bar + table + footer.

**Filter bar:**
- Status filter tabs: All · Posted · Draft · Voided — pill-style, amber active state. Client-side filter (no page reload).
- Date range picker (start/end) — DM Mono dates
- Account filter — dropdown autocomplete
- Search input (right-aligned): searches narration and entry number. `/` shortcut focuses it.
- Export button (outlined, right-most)

**Table columns:**

| Column | Font/Style | Notes |
|--------|-----------|-------|
| Entry # | `mono-md`, amber | Clickable link to detail |
| Date | `mono-md`, muted | DD MMM (no year — implied by FY) |
| Narration | `ui-md`, truncated | Max ~40 chars, ellipsis, full narration on row hover via tooltip |
| Type | `ui-xs`, muted | invoice / manual / payroll / system — lowercase |
| Debit | `mono-md`, right-aligned | ₹ Indian format |
| Credit | `mono-md`, right-aligned | ₹ Indian format |
| Status | Badge | Posted / Draft / Voided |

**Row hover:** subtle muted background. Row click opens entry detail.

**Footer (persistent):**
- Left: "Showing N of N entries" in `ui-xs` muted
- Right: "Posted: ₹X Dr / ₹X Cr" in `mono-sm` — running totals, constant sanity check

**Pagination:** Shown only when > 50 entries. Simple prev/next with page numbers. Keyboard navigable.

**Empty state:** "No journal entries yet. Your books start here." + "New entry" CTA.

---

### 6.2 New Journal Entry — `/journal/new`

**Purpose:** The most critical screen in the product. Must support both fast keyboard-driven entry (experienced accountant) and guided entry (new user).

**Layout:** Three zones: Header metadata → Lines table → Balance bar + actions.

**Header zone (top section):**
3-column grid row 1:
- Entry number: `mono-md`, read-only, auto-assigned, muted background
- Date: datepicker, defaults to today
- Narration: text input, full remaining width

2-column grid row 2:
- Reference type: select (Manual / Invoice / Payment / Receipt)
- Reference ID: text input, optional

**Lines table:**
Fixed-layout table. Columns: `#` (index, mono muted) · Account · Description · Debit (₹) · Credit (₹) · Remove (×)

- **Account field:** Autocomplete from full CoA (leaf accounts only). Loads full CoA into client-side state on mount — no API call per keystroke. Typing "1" shows all 1xxx accounts. Typing "trade" shows Trade Receivables, Trade Payables.
- **Debit/Credit inputs:** DM Mono, right-aligned. Indian thousands separator applied on blur. Entering a value in Debit clears Credit (XOR constraint). Entering a value in Credit clears Debit.
- **Tab order:** Account → Description → Debit or Credit → next row Account. No mouse required.
- **N key:** Adds a new line from anywhere in the form (when keyboard focus is within the table).
- **+ Add line:** Text link in amber at the bottom of the table. Same action as N key.
- **Remove:** × icon, only visible on rows 3+. Rows 1 and 2 cannot be removed (minimum 2 lines enforced).

**Balance bar (pinned to bottom of lines table):**
Shows: Total Debit · separator · Total Credit · separator · Difference

- Updates in real time as amounts are typed — not on submit
- **Balanced (difference = ₹0.00):** Difference cell shows `₹0.00 ✓` in green. "Post entry" button becomes full amber, fully interactive.
- **Unbalanced (difference ≠ ₹0.00):** Difference cell shows `₹X.XX` in red. "Post entry" button is visually dimmed (opacity 40%), has `disabled` attribute removed but a tooltip on hover/focus: "Entry must balance before posting." This allows keyboard users to discover the constraint without being silently blocked.

The balance bar is a standalone shared component (`packages/shared/components/balance-bar`). Future modules (Invoicing, Payroll) will reuse it.

**Action row:**
Right-aligned: Keyboard hints in `mono-sm` muted (`⌘S to save · ⌘↵ to post · N to add line`) → Discard (ghost) → Save draft (outlined) → Post entry (amber fill)

The three buttons communicate risk ordering visually: ghost (destructive-ish) → outlined (safe) → amber fill (primary).

**A11y:**
- Balance bar is an `aria-live="polite"` region
- Account autocomplete follows ARIA combobox pattern
- Arrow key navigation within the grid (↑↓←→ between cells)

---

### 6.3 Journal Entry Detail — `/journal/[id]`

**Purpose:** Read-only view of a posted or voided entry. Editable view for drafts.

**Layout:** Entry header → Narration → Lines table → Audit trail → Actions.

**Entry header:**
- Entry # in `mono-lg` amber
- Status badge (Posted / Draft / Voided)
- Date in `mono-md`
- Reference type + ID if present

**Lines table:** Same columns as new entry form, read-only. Amounts in DM Mono right-aligned. Balance confirmed row at the bottom: "Total: ₹X Dr / ₹X Cr — Balanced ✓" in green.

**Audit trail (collapsed by default):**
Expandable section showing event history: Created, Modified (with narration diff), Posted, Voided. Each event shows: timestamp in DM Mono · actor name · event type.

If narration was corrected after posting, shows the correction with a "Corrected" badge and the old narration struck through.

**Actions:**
- **Draft entries:** Edit (amber) · Delete (red ghost) · Post (amber fill, only if balanced)
- **Posted entries:** Void (red ghost)
- **Voided entries:** No actions. "This entry was voided on [date] for: [reason]" shown in a muted info band.

**Void action (inline — no modal):**
Clicking Void expands an inline form below the action row:
- Reason input (required, min 10 chars)
- "Confirm void" button (red fill)
- "Cancel" link

The reason is stored in the event store and shown in the audit trail.

**Not found state:** "Entry not found" with a back-to-journal link.

---

### 6.4 Chart of Accounts (CoA List) — `/coa`

**Purpose:** Hierarchical view of the full account tree. Primary reference for accountants checking balances and structure.

**Layout:** Screen heading + Add account button (top right) + collapsible tree grouped by account kind.

**Account kind groups:** Assets · Liabilities · Equity · Revenue · Expenses

**Group header row (for each kind):**
- Expand/collapse toggle (▶ / ▼)
- Kind name in `display-sm` Playfair Display
- Balance direction label: "Dr balance" or "Cr balance" in `ui-xs` amber/green (never +/-)
- Aggregate balance in `mono-md` right-aligned

**Leaf account rows:**
- Account code in `mono-sm` muted (fixed width column)
- Account name in `ui-md` Syne
- Current balance in `mono-md` right-aligned
- `+` Add sub-account link (appears on hover)
- Edit icon (appears on hover, opens inline edit form — no navigation)
- Deactivate option (not delete — only accounts with no transactions can be deleted)

**Hierarchy:**
Max 4 levels. Indentation increases by 16px per level. Sub-accounts show the same columns as leaf accounts.

**Keyboard navigation:**
- ↑↓ navigate between rows
- → expand a group
- ← collapse a group
- Enter opens the account detail

**Empty state (no accounts):** "Your chart of accounts is empty." with a link to the onboarding CoA setup. This should never happen in practice but is defensive programming.

---

### 6.5 Accounts List — `/accounts`

**Purpose:** Flat list view of all accounts with search and type filtering. Complementary to the tree view.

**Layout:** Filter bar (search + type dropdown) + table + Add account button.

**Table columns:** Code (mono) · Name · Type · Sub-type · Balance (mono right-aligned) · Status (Active/Inactive badge)

**Filter bar:**
- Search: searches code and name
- Type filter: All / Assets / Liabilities / Equity / Revenue / Expenses
- Add account button: amber fill, opens `/accounts/new`

---

### 6.6 Account Detail — `/accounts/[id]`

**Purpose:** Account ledger — all transactions affecting a single account with a running balance.

**Layout:** Account header → Current balance KPI → Date filter → Ledger table.

**Account header:**
- Account name in `display-lg` Playfair Display
- Code in `mono-sm` muted
- Type badge
- Current balance in `mono-lg` DM Mono with Dr/Cr label

**Ledger table:**

| Column | Style | Notes |
|--------|-------|-------|
| Date | `mono-md` | DD MMM |
| Entry # | `mono-md` amber | Clickable link |
| Narration | `ui-md` truncated | |
| Voucher type | `ui-xs` muted | |
| Debit | `mono-md` right-aligned | Blank if credit |
| Credit | `mono-md` right-aligned | Blank if debit |
| Balance | `mono-md` right-aligned | Running balance with Dr/Cr label |

Running balance computed via SQL window function — not stored separately.

First row always: "Opening Balance — [amount] Dr/Cr"

**Date filter:** Date range picker, defaults to full FY.

---

### 6.7 New Account — `/accounts/new`

**Purpose:** Create a new account in the CoA.

**Fields:**
- Account name (text, required)
- Account code (text, required — validated for uniqueness on blur)
- Parent account (autocomplete dropdown — shows the hierarchy, filters to non-leaf accounts)
- Account type (select: Asset / Liability / Equity / Revenue / Expense)
- Sub-type (select — populates based on account type selection)
- Opening balance (numeric, optional — only shown for leaf accounts created outside onboarding)

**Validation:**
- Duplicate code: checked on blur, inline error immediately
- Parent account must not be a system account
- Account type is immutable after creation (warn the user via a tooltip)

---

## 7. Invoicing & Receivables Module

### 7.1 Invoice List — `/invoices`

**Purpose:** View and manage all sales invoices.

**Filter bar:** Status tabs (All · Draft · Sent · Paid · Overdue · Cancelled) · Customer search · Date range · Export

**Table columns:** Invoice # (mono amber, linked) · Customer · Date (mono) · Due date (mono, red if overdue) · Amount (mono right-aligned) · Status (badge) · Actions (Send / Record payment — inline icon buttons)

**Overdue rows:** Due date shown in red. Row gets a subtle red left border.

**Footer:** "Total outstanding: ₹X" in `mono-sm`.

---

### 7.2 New Invoice — `/invoices/new`

**Purpose:** Create a sales invoice with automatic GST calculation.

**Layout:** Two-column (invoice form left, live preview right on desktop). On tablet, tabs toggle between Form and Preview.

**Header section:**
- Customer selector (autocomplete from customer list)
- Invoice date (datepicker, defaults today)
- Due date (datepicker, defaults +30 days)
- Invoice # (auto-assigned, editable)
- Place of supply (auto-set from customer state, overridable)

**Line items table:**
- Columns: Product / Description · HSN/SAC · Qty · Unit · Rate (₹) · GST % · Amount (₹)
- Product field autocompletes from inventory (if enabled) or free-text
- GST % populates from product HSN/SAC if available; otherwise manual select
- Amount calculated automatically: Qty × Rate
- + Add line button below

**Tax section (auto-calculated, read-only):**
- Sub-total (before tax)
- CGST (if intra-state) or IGST (if inter-state) — auto-determined by comparing business state with customer state
- SGST (if intra-state)
- Round-off (within ₹1)
- **Grand total** in `mono-lg` amber

**Actions:** Save as draft (outlined) · Save & Send (amber) — Save & Send triggers email sending to customer.

---

### 7.3 Invoice Detail — `/invoices/[id]`

**Purpose:** View a single invoice in its print-ready format with action buttons.

**Layout:** Invoice document (styled for print) above action buttons. The document design matches the PDF export exactly — no inconsistency between what the user sees on screen and what the customer receives.

**Invoice document sections:**
1. Business header (logo, name, GSTIN, address)
2. Invoice metadata (Invoice #, Date, Due date, Customer details)
3. Line items table (same columns as new invoice form)
4. Tax breakdown
5. Grand total in `mono-lg`
6. Bank details for payment
7. Terms & conditions

**Action buttons (below document):** Edit (if Draft/Sent) · Mark as Paid · Send / Resend · Download PDF · Cancel

**Payment status banner:** If partially paid, shows "₹X of ₹Y paid — ₹Z outstanding" in amber.

---

### 7.4 Invoice Edit — `/invoices/[id]/edit`

**Purpose:** Modify a draft or sent invoice.

**Note:** Posted invoices (where the corresponding journal entry is posted) cannot be edited. They must be cancelled and re-raised. The Edit button is hidden and a "Can't edit a posted invoice — cancel and re-raise" tooltip explains why.

Same layout as New Invoice, pre-filled with existing data.

---

### 7.5 Invoice PDF Preview — `/invoices/[id]/pdf`

**Purpose:** Print-optimised view of the invoice for download.

**Layout:** A4 white card centered on a muted background. Print/Download buttons at top. Pressing Print triggers `window.print()` — the page has a print stylesheet that hides all chrome and shows only the invoice card.

---

### 7.6 Invoice Scan (OCR) — `/invoices/scan`

**Purpose:** Upload a vendor invoice image or PDF, extract data via OCR, and create a purchase entry.

**Layout:** Upload zone (drag-drop or click-to-browse) → OCR results panel → Confirm / Edit form.

**Upload zone:** Large dashed border area. Accepts JPEG, PNG, PDF. Shows a "Scanning…" progress indicator with a determinate progress bar once the file is uploaded.

**OCR results panel:**
Side-by-side: uploaded image (left) and extracted fields (right).

Extracted fields: Vendor name · Invoice # · Invoice date · GSTIN of vendor · Line items · Tax amounts · Total

Each extracted field has a confidence indicator (high/medium/low) shown as a small coloured dot. Low confidence fields are highlighted with an amber border — user must verify them.

**Manual override:** Every extracted field is editable. The user corrects OCR errors before confirming.

**States:**
- Uploading: progress bar
- OCR processing: animated "Scanning invoice…" with estimated wait
- OCR failed: "Could not extract data. Please fill in manually." — falls back to a blank form
- Success: extracted fields shown with confirm button

---

### 7.7 Receivables Summary — `/receivables`

**Purpose:** Overview of outstanding customer receivables with aging.

**Layout:** Two KPI tiles (Total Outstanding, Overdue > 30 days) + Aging table + Customer list.

**Aging buckets:** Current (not yet due) · 1–30 days · 31–60 days · 61–90 days · 90+ days

Each bucket shows total amount. Overdue buckets use increasingly warm colours (amber → red) proportional to age.

**Customer list:** Customer name · Outstanding amount (mono right-aligned) · Oldest unpaid invoice date · "View account" link

---

### 7.8 Customer Detail — `/receivables/[customerId]`

**Purpose:** Full receivables picture for a single customer.

**Layout:** Customer header → Outstanding balance KPI → Tabs (Invoices / Payments / History)

**Invoices tab:** All invoices for this customer, filterable by status.

**Payments tab:** All payments received from this customer.

**Outstanding balance:** Shows in `mono-lg` amber if positive, green if zero.

---

## 8. Payments Module

### 8.1 Payment List — `/payments`

**Purpose:** All recorded payments (received from customers and made to vendors).

**Table columns:** Date (mono) · Reference · Type (Received / Paid — badge) · Party (customer or vendor) · Amount (mono right-aligned) · Allocated to (invoice # if applicable) · Status

**Filter bar:** Date range · Type (Received/Paid) · Party search

---

### 8.2 New Payment — `/payments/new`

**Purpose:** Record a payment received or made.

**Layout:** Two-section form — Payment details (top) and Invoice allocation (bottom).

**Payment details:**
- Type: Radio — "Received from customer" / "Paid to vendor"
- Party: Autocomplete customer or vendor selector (changes based on type)
- Amount: Numeric input (DM Mono)
- Date: Datepicker
- Payment method: Select (Bank Transfer / Cash / Cheque / UPI)
- Reference: Text input (UTR / cheque number)
- Bank account: Select from CoA bank accounts

**Invoice allocation table:**
Shows unpaid invoices for the selected party. Each row: Invoice # · Amount · Outstanding · Allocate amount (editable input).

Running total at bottom: Amount entered − Amount allocated = Unallocated. If unallocated > ₹0.00, submit is blocked with message: "₹X.XX not allocated to any invoice. Allocate to an invoice or adjust the payment amount."

---

### 8.3 Receipt Scan (OCR) — `/receipts/scan`

**Purpose:** Upload a payment receipt and extract data.

Same UX pattern as Invoice Scan (§7.6). Extracted fields: Payer/Payee · Amount · Date · Reference number · Bank.

---

## 9. Financial Reports Module

### 9.0 Reports Layout Pattern

All report screens share a common layout:

**Report header:**
- Small `ui-xs` muted label: e.g. "Profit & loss statement"
- Business name in `display-lg` Playfair Display
- Period and format in `ui-sm` Syne: e.g. "01 Apr 2025 – 31 Mar 2026 · Schedule III format"
- Export PDF button: top-right, outlined

**Period selector:**
- FY dropdown (defaults to active FY)
- Date range pickers (within the selected FY)
- "Regenerate" button applies changes — reports do not auto-refresh on every input change

Reports are designed to look like printed documents within the app — suitable for sharing with a CA or attaching to an email without export. Typography matches the exported PDF exactly.

---

### 9.1 Trial Balance — `/reports/trial-balance`

**Purpose:** Account-wise debit and credit totals for the period. The accountant's first-pass check.

**Table:** Account code (mono muted) · Account name · Opening Dr · Opening Cr · Period Dr · Period Cr · Closing Dr · Closing Cr

**Footer:** Grand totals row. Closing Dr and Closing Cr must match. If they don't (projection drift), show a red warning: "Totals do not balance — contact support."

---

### 9.2 P&L (Schedule III) — `/reports/pl`

**Purpose:** Corporate-format P&L for Pvt Ltd, Public Ltd, and LLP entities.

**Sections (Schedule III):**
```
I.   Revenue from Operations
       a. Sale of Products
       b. Sale of Services
       c. Other Operating Revenue
II.  Other Income
III. Total Revenue (I + II)
IV.  Expenses
       a. Cost of Materials Consumed
       b. Purchases of Stock-in-Trade
       c. Changes in Inventories
       d. Employee Benefit Expenses
       e. Finance Costs
       f. Depreciation & Amortisation
       g. Other Expenses
V.   Profit Before Tax (III - IV)
VI.  Tax Expense
VII. Profit After Tax (V - VI)
```

**Visual treatment:**
- Section headers (I, IV): `display-md` Playfair Display + muted background row
- Line items: `ui-md` Syne, left-indented
- Sub-items: `ui-sm` Syne, further indented
- Amount column: `mono-md` DM Mono, right-aligned, fixed width
- Total rows: heavier top border (`border-top: 1px solid`) + slightly darker background
- **Profit Before Tax row:** green background + green text — clear visual payoff
- **Loss:** red background + red text

---

### 9.3 P&L (Proprietorship) — `/reports/profit-loss`

**Purpose:** Simpler P&L for sole proprietors and partnerships.

```
Revenue
  Sales
  Other Income
  Total Revenue

Less: Direct Expenses (Purchases, Wages, Freight)
= Gross Profit

Less: Indirect Expenses (Rent, Salary, Utilities)
= Net Profit / Net Loss
```

Same typographic treatment, fewer line items.

---

### 9.4 Balance Sheet — `/reports/balance-sheet`

**Purpose:** Full balance sheet (Schedule III for companies, simplified for proprietorship).

**Key constraint:** Assets total must equal Liabilities + Equity total. If they don't, a red banner: "Balance sheet does not balance — check for unposted entries or contact support."

**Schedule III structure:**
```
I.  Equity & Liabilities
    A. Shareholders' Funds
    B. Non-Current Liabilities
    C. Current Liabilities
    Total (A+B+C)

II. Assets
    A. Non-Current Assets
    B. Current Assets
    Total (A+B)

Check: I = II
```

---

### 9.5 General Ledger — `/reports/ledger`

**Purpose:** All transactions for all accounts in the period, grouped by account.

**Controls:** Period selector · Account filter (multi-select) · Export

**Layout:** Each account is a collapsible section. Within each section: the same ledger table as Account Detail (§6.6). Opening balance row → transactions → closing balance row.

Accounts with zero activity in the period are collapsed by default.

---

### 9.6 Cash Flow Statement — `/reports/cash-flow`

**Purpose:** Indirect method cash flow showing Operating, Investing, and Financing activities.

```
Operating Activities:
  Net Profit
  + Depreciation (non-cash add-back)
  + Changes in Working Capital
  = Cash from Operations

Investing Activities:
  Net change in fixed assets / investments
  = Cash from Investing

Financing Activities:
  Net change in loans / capital
  = Cash from Financing

Net Cash Flow = Operating + Investing + Financing
```

Cash flow classification per account is driven by `account_cash_flow_overrides` then `cash_flow_default_mapping`. If an account's classification has been manually overridden, an amber `*` appears next to the line item with a tooltip: "Classification overridden from default."

---

## 10. GST Module

### 10.1 GST Returns List — `/gst/returns`

**Purpose:** View and manage all GST returns across periods.

**Filter bar:** Period · Return type (GSTR-1 / GSTR-2B / GSTR-3B) · Status

**Table columns:** Return # · Type · Period · Status (badge: Draft / Generated / Filed) · Due date (red if overdue) · Actions (Generate / View / File)

**Generate buttons:** GSTR-1 · GSTR-2B · GSTR-3B — prominently placed at the top right. Only one return of each type per period; if already generated, "View" replaces "Generate".

---

### 10.2 GST Return Period Selection — `/gst/returns/[period]`

**Purpose:** Hub screen for a specific GST period.

**Layout:** Period header (e.g. "April 2025 — GSTR filing") → Three return type cards (GSTR-1, GSTR-2B, GSTR-3B), each showing status and a primary action.

---

### 10.3 GSTR-1 — `/gst/returns/[period]/gstr1`

**Purpose:** Outward supplies return — all taxable sales for the period.

**Sections:**
- B2B Invoices (registered buyers): Table with Receiver GSTIN, Invoice #, Date, Taxable value, Tax amounts
- B2C Invoices (unregistered buyers): Aggregated by state
- Credit/debit notes
- Summary preview (auto-generated from the tables above)

**File button:** Opens the File GST Return dialog (§10.13 below).

---

### 10.4 GSTR-2B — `/gst/returns/[period]/gstr2b`

**Purpose:** Auto-populated ITC statement from the GST portal.

**Layout:** ITC summary KPIs (Eligible / Ineligible / Blocked) + Supplier-wise table.

**Note:** GSTR-2B is fetched (not generated) — it comes from the GST portal. The UI shows a "Fetch from GSTN" button. If GSTN is unavailable, the user can upload a JSON file downloaded from the portal.

---

### 10.5 GSTR-3B — `/gst/returns/[period]/gstr3b`

**Purpose:** Monthly summary return — the most important GST filing.

**Sections:**
- 3.1 Outward supplies (auto-populated from GSTR-1 data)
- 4 ITC available (auto-populated from GSTR-2B)
- 5 ITC reversal (manual input)
- Tax payable / paid
- Interest and late fees (auto-calculated if filing after due date)

**Tax payable display:** Broken down by CGST / SGST / IGST / Cess. Each head shows: Liability − ITC offset = Cash to be paid.

**Validation:** Cannot file if outward supplies total differs from GSTR-1 filed amounts by more than the rounding threshold.

---

### 10.6 GST Reconciliation — `/gst/reconciliation`

**Purpose:** Compare GSTR-2B (what suppliers filed) against books (what was purchased) to identify ITC mismatches.

**Layout:** Period selector → Match summary KPIs → Reconciliation table.

**Match summary KPIs:** Matched (green) · Unmatched (red) · Pending (amber) — counts and amounts.

**Reconciliation table:** Each row is an invoice. Columns: Supplier GSTIN · Invoice # · 2B amount · Books amount · Difference · Match status · Action

**Actions per row:** Accept match · Reject (supplier error) · Pending (awaiting supplier correction)

---

### 10.7 ITC Mismatches — `/gst/reconciliation/mismatches`

**Purpose:** Focused view of only the unmatched/rejected ITC entries requiring resolution.

**Each row shows:** Supplier · Invoice # · Amount difference · Reason for mismatch · Resolution status

**Comments field:** Per-row comment for tracking follow-up with the supplier.

---

### 10.8 GST Ledger (Combined) — `/gst/ledger`

**Purpose:** Overview of all three GST ledgers.

**Tabs:** Cash Ledger · ITC Ledger · Liability Ledger

Each tab shows: Period selector → Transaction table → Closing balance by tax head (CGST/SGST/IGST/Cess).

---

### 10.9 GST Cash Ledger — `/gst/ledger/cash`

Transactions showing cash deposited to the GST portal. Balance per tax head.

---

### 10.10 GST ITC Ledger — `/gst/ledger/itc`

ITC credits and their utilisation. Available balance per tax head. Reversals shown as negative rows.

---

### 10.11 GST Payment — `/gst/payment`

**Purpose:** Calculate and record the cash GST payment for a filing period.

**Flow:**
1. Select period
2. See tax liability (from GSTR-3B)
3. Offset ITC (auto-applied in the order: IGST → CGST → SGST per GST rules)
4. Residual cash payment required per head
5. "Generate challan" button — produces a challan reference for portal payment
6. "Record payment" — marks the liability as paid once challan is paid on the portal

---

### 10.12 GST Payment History — `/gst/payment/history`

Table of all GST payments: Date · Challan # · Tax head · Amount. Download challan button per row.

---

### 10.13 Dialog: File GST Return

**Trigger:** "File Return" button on GSTR-3B page.

**Layout:** Compact modal. Title: "File GSTR-3B — [period]"

**Fields:**
- ARN (Acknowledgement Reference Number): text input, validated against GST ARN format: `[0-9]{15}`
- Filing date: datepicker, defaults today

**States:**
- Invalid ARN format: inline error below the field
- Success: modal closes, return status updates to "Filed", toast: "GSTR-3B filed for [period]"

**Important note:** ComplianceOS does not file directly to the GST portal (no GSP integration in v1). The user files on the GST portal manually, then records the ARN here to update the return status in the system.

---

### 10.14 Dialog: Amend GST Return

**Trigger:** "Amend" button on a filed return.

**Layout:** Modal with a JSON textarea for amendment data and a validation error display.

**Use case:** Edge case for power users who need to amend a previously filed return. The JSON format follows the GSTN amendment API schema.

---

## 11. ITR Module

### 11.1 ITR Returns List — `/itr/returns`

**Purpose:** View income tax returns by financial year.

**Table columns:** FY · Form type (ITR-3 / ITR-4 / etc.) · Status · Filed date · Actions

---

### 11.2 ITR Return Detail — `/itr/returns/[financialYear]`

**Purpose:** Return hub for a specific FY. Shows return summary and links to computation, regime comparison, and payment screens.

**Layout:** FY header → Return status KPIs → Action cards (Compute, File, View, Payment history).

---

### 11.2a ITR Return Detail with GSTR-3B Link — `/itr/returns/[financialYear]/[returnId]`

**Purpose:** View detailed return with linked GST data.

**Layout:** Return header → Income details → Tax computation → GSTR-3B linked data preview.

**GSTR-3B linkage:** Shows outward supplies from GSTR-3B that feed into the ITR computation. Discrepancies between books and GST returns are highlighted with an amber border.

**Sections:**
- Gross receipts (from P&L)
- GST outward supplies (from GSTR-3B)
- Reconciliation note (if figures differ)
- Tax computation summary
- Filing status

---

### 11.2b ITR Return GSTR-3B Detail — `/itr/returns/[financialYear]/[returnId]/gstr3b`

**Purpose:** View GSTR-3B data that feeds into ITR computation.

**Layout:** Period selector → GSTR-3B summary table → Link to full GST return.

**Data shown:** Outward supplies · ITC claimed · Tax paid (from linked GSTR-3B filings).

---

### 11.3 ITR Computation — `/itr/computation`

**Purpose:** Compute taxable income from the books.

**Sections:**
- Income from Business/Profession (pulled from P&L)
- Income from Other Sources (manual input)
- Deductions under Chapter VI-A (80C / 80D / 80G / etc.) — manual input with auto-populated limits
- Total Taxable Income
- Tax payable (old regime) — auto-calculated

The P&L-sourced figures show the account balances they're derived from, so the accountant can verify.

---

### 11.4 ITR Regime Comparison — `/itr/computation/regime-comparison`

**Purpose:** Side-by-side comparison of old vs new tax regime to identify which is more beneficial.

**Layout:** Two columns — Old Regime and New Regime. Each shows: Gross income · Deductions (old only) · Taxable income · Tax · Surcharge · Cess · **Total tax liability**.

**Recommendation banner:** "New regime saves ₹X" or "Old regime saves ₹X" — amber background, displayed prominently after the comparison table.

---

### 11.5 ITR Presumptive Scheme — `/itr/computation/presumptive-scheme`

**Purpose:** Calculate tax under Section 44AD (businesses) or 44ADA (professionals).

**Inputs:** Total turnover / gross receipts · Presumptive rate (8% for 44AD, 6% for digital receipts, 50% for 44ADA)

**Output:** Deemed income · Tax on deemed income · Comparison with actuals (if available)

---

### 11.6 ITR Payment — `/itr/payment`

**Purpose:** Record income tax payments (advance tax or self-assessment).

**Payment type:** Advance Tax · Self-Assessment Tax · TDS Credit

---

### 11.7 ITR Advance Tax — `/itr/payment/advance-tax`

**Purpose:** Track advance tax installment payments.

**Installments:** June 15 (15%) · September 15 (45%) · December 15 (75%) · March 15 (100%)

Each installment row shows: Due date · Amount due · Amount paid · Shortfall (if any, in red)

---

### 11.8 ITR Self-Assessment Tax — `/itr/payment/self-assessment`

**Purpose:** Calculate and record self-assessment tax due at the time of filing.

**Calculation:** Total tax liability − TDS credit − TCS credit − Advance tax paid = Self-assessment tax due

---

### 11.9 ITR Payment History — `/itr/payment/history`

Table of all income tax payments: Date · Challan # · Type · Amount · BSR Code.

---

## 12. Payroll Module

### 12.1 Employee List — `/employees`

**Purpose:** All employees with status and department.

**Table:** Employee code (mono) · Name · Department · Joining date (mono) · Status (Active/Inactive badge)

**Filter:** Active / Inactive / All + Department filter

---

### 12.2 New Employee — `/employees/new`

**Purpose:** Add a new employee record.

**Sections (tabbed):**
1. Personal details: Name · PAN · Aadhaar · DOB · Gender · Address
2. Employment: Employee code (auto-assigned) · Department · Designation · Joining date · Probation period
3. Bank details: Bank name · Account number · IFSC
4. Salary structure: (links to salary structure screen after creation)

**PAN uniqueness:** Checked on blur — duplicate PAN shows inline error.

---

### 12.3 Employee Detail — `/employees/[id]`

**Purpose:** Employee profile view with tabs.

**Tabs:** Profile · Salary Structure · Payslips · Leave

**Profile tab:** All personal and employment details, read-only. Edit button opens an edit form.

---

### 12.4 Employee Salary Structure — `/employees/[id]/salary`

**Purpose:** Configure the salary components for this employee.

**Earnings section:**
- Basic salary (required)
- HRA (typically 40-50% of basic, auto-calculated but overridable)
- Special allowance
- Other allowances (add custom components)

**Deductions section:**
- Provident Fund (12% of basic, up to limit — auto-calculated)
- Professional Tax (state-specific, auto-populated from employee state)
- Income Tax TDS (calculated monthly based on projected annual income)

**Gross and Net salary:** Auto-calculated totals shown at the bottom. Updates in real time as components change.

---

### 12.5 Payroll List — `/payroll`

**Purpose:** View all payroll runs.

**Table:** Period · Status (Processing / Processed / Approved) · Employees · Total gross · Total net · Run date

---

### 12.6 Payroll Detail — `/payroll/[id]`

**Purpose:** Single payroll run view.

**Layout:** Period header → Summary KPIs (Total gross / Total deductions / Total net) → Employee breakdown table

**Employee table:** Employee name · Gross · PF · PT · TDS · Other deductions · **Net pay** (mono bold right-aligned)

**Export:** Download as Excel for bank payment upload.

---

### 12.7 Process Payroll — `/payroll/process`

**Purpose:** Run payroll for a period.

**Flow:**
1. Select period (month/year)
2. Review employee list — flag any with missing attendance data or leave issues
3. Salary preview: shows gross, all deductions, net for each employee
4. "Process payroll" button — creates the payroll run and generates payslips

**Warnings before processing:**
- Employees with incomplete attendance
- Employees with salary structure changes mid-month
- Previous month's payroll not approved yet

---

### 12.8 Payroll Reports — `/payroll-reports`

**Purpose:** Compliance reports for statutory filings.

**Report types:** PF challan · ESI challan · Professional Tax workings · Form 16 data

Each report: Period selector → Generate → Table → Export

---

### 12.9 My Payslips — `/my-payslips`

**Purpose:** Employee self-service view of own payslips.

**Audience:** All employees (not admin-restricted).

**Layout:** Period selector (defaults to latest) → Payslip view → Download PDF button.

**Payslip view:** Employee details · Earnings breakup · Deductions breakup · Net pay in `mono-lg` amber · Employer PF contribution note.

**Mobile:** Fully responsive. This is one of the few screens where mobile is a primary device (employees checking payslips on phone).

---

## 13. Inventory Module

### 13.1 Inventory Dashboard — `/inventory`

**Purpose:** Inventory health overview.

**KPIs:** Total stock value (mono-lg) · Low stock items count (red if > 0) · Items out of stock (red)

**Alerts section:** Cards for each low-stock item — Product name · Current stock · Reorder level · "Reorder" quick action

**Recent movements:** Last 10 stock movements table.

---

### 13.2 Product List — `/inventory/products`

**Table:** SKU (mono) · Product name · Category · HSN/SAC · Current stock · Selling price (mono right-aligned) · Status

**Filter:** Category · Stock status (In stock / Low stock / Out of stock)

---

### 13.3 New Product — `/inventory/products/new`

**Fields:** Product name · SKU (auto-generated or manual) · Category · HSN/SAC code · Unit of measurement · Selling price · Purchase price · Opening stock quantity · Reorder level · GST rate (auto-populated from HSN/SAC where possible)

---

### 13.4 Stock Levels — `/inventory/stock`

**Purpose:** Current stock positions across all products.

**Table:** Product · Available (green if healthy, amber if low, red if zero) · Committed (allocated to pending orders) · On-order (purchase orders raised) · **Net available** (Available − Committed)

**Adjust stock button:** Opens an inline form for stock adjustments (shrinkage, damage, corrections) that posts a journal entry to the inventory adjustment account.

---

### 13.5 Inventory Reports — `/inventory/reports`

**Purpose:** Generate inventory valuation and movement reports.

**Report types:**
- Stock Valuation Report — Product-wise stock value (Qty × Cost/Price)
- Stock Movement Report — Inward/Outward movements by period
- Fast/Slow Moving Items — Turnover analysis
- Expiry Report — For products with expiry dates (if applicable)

**Layout:** Report selector → Period filter → Generate → Table → Export (Excel/PDF)

---

## 14. Settings Module

### 14.1 Fiscal Years List — `/settings/fiscal-years`

**Purpose:** Manage fiscal year records.

**Table:** FY name (e.g. 2025-26) · Start date (mono) · End date (mono) · Status badge (Open / Closed / Pending close) · Entry count · Actions

**Actions:**
- Open FY: "Close FY" button (only on open FYs)
- Pending close FYs: "Resolve drafts" link — navigates to Journal list filtered to drafts for that FY

**Pending close state:** FY is shown with an amber warning badge. Tooltip explains: "X draft entries must be posted or deleted before this FY can be closed."

**Create FY button:** Only active if fewer than 2 FYs are currently open (enforced by the 2-FY limit rule).

---

### 14.2 Fiscal Year Detail — `/settings/fiscal-years/[id]`

**Purpose:** View FY details and trigger close.

**Layout:** FY header → Metadata → Stats → Close action.

**Close FY flow (inline — no modal):**
1. "Close FY" button clicked
2. Inline confirmation expands: "Closing FY [year] is irreversible. All draft entries must be posted or deleted first." 
3. If drafts exist: show count with a "View draft entries" link. Close button disabled.
4. If no drafts: "Confirm close" button enabled (amber fill), "Cancel" link beside it.
5. On confirm: FY status updates to Closed, retained earnings carry forward, `fy_summaries` locked.

---

### 14.3 Invoice Configuration — `/settings/invoices`

**Purpose:** Configure invoice appearance and defaults.

**Sections:**
- Numbering format: prefix, starting number, reset per FY toggle
- Business logo: upload zone (JPG/PNG, max 1MB, resized to 200×80px)
- Bank details: displayed on invoice (account name, number, IFSC, bank name)
- Default payment terms: number of days
- Terms & conditions: textarea, shown at the bottom of all invoices
- Invoice footer note: single line

**Preview:** Live preview panel on the right showing how changes affect the invoice layout.

---

## 15. Global UI Elements

### 15.1 App Shell (Sidebar Navigation)

**Layout:** Fixed sidebar (168px wide) + main content area.

**Sidebar sections:**

```
[Logo + Business name]
──────────────────────
MAIN
  Dashboard
  Journal entries
  Chart of accounts
  Accounts

INVOICING
  Invoices
  Receivables
  Payments

REPORTS
  Trial balance
  P&L
  Balance sheet
  General ledger
  Cash flow

GST
  Returns
  Reconciliation
  Ledger
  Payment

ITR
  Returns
  Computation
  Payment

PAYROLL
  Employees
  Payroll
    Process
    Reports
  My payslips

INVENTORY
  Products
  Stock levels

SETTINGS
  Fiscal years
  Invoice settings
──────────────────────
[FY footer: FY 2025-26 · Open]
```

**Section labels:** `ui-xs` Syne, uppercase, tracked, `light` colour.

**Nav items:** `ui-sm` Syne. Icon (14px) + label. Hover: muted background + `dark` text. Active: amber left border (2px) + amber text + amber tinted background.

**FY footer (bottom):**
- Label: "Active fiscal year" in `ui-xs` muted
- FY name in `mono-sm` amber
- Status: green dot + "Open" or red dot + "Pending close" or grey + "Closed"
- Clicking opens the FY popover

**Responsive:** On tablet, sidebar collapses to icons-only (48px wide). A hamburger button expands it as an overlay. Main content area adjusts accordingly.

---

### 15.2 Fiscal Year Popover

**Trigger:** Click FY footer in sidebar.

**Layout:** Small inline popover anchored to the FY footer. Shows all FYs as a list.

Each FY row: FY name (mono) · Status badge · "X days remaining" (amber text, shown only for open FYs near their grace period end)

Active FY has an amber left indicator. Clicking a different FY switches the active context for all data displayed in the app.

---

### 15.3 Balance Bar — Shared Component

**Location:** `/journal/new`, `/journal/[id]/edit` (draft entries only), invoice creation, payroll processing.

**Layout:** Three cells separated by hairline dividers:

```
Total debit: ₹2,20,000.00  |  Total credit: ₹2,20,000.00  |  Difference: ₹0.00 ✓
```

**States:**
- **Balanced:** Difference cell: `₹0.00 ✓` in green text + green background. "Post" button activates.
- **Unbalanced:** Difference cell: `₹X.XX` in red text + red background. Difference is the absolute value — shows the gap, not a signed figure.

**A11y:** `aria-live="polite"` on the difference cell. When the value changes, screen readers announce the new difference.

**Implementation note:** Standalone shared component in `packages/shared/components/balance-bar`. Accepts `totalDebit` and `totalCredit` as props. Calculates difference internally. Do not re-implement inline.

---

## 16. State Design Patterns

### 16.1 Loading States

| Context | Pattern |
|---------|---------|
| Table/list | Skeleton rows (5–10 rows matching expected data density) |
| KPI tile | Skeleton number block (DM Mono width-matched) |
| Form (editing) | Skeleton fields |
| Action button | Inline spinner, button disabled, text changes to "Saving…" |
| Full page first load | Skeleton layout (sidebar populated, content area skeletonised) |

Never block the full screen with a spinner overlay. The app shell always remains visible and interactive.

### 16.2 Empty States

Every list screen has a designed empty state. Pattern:

```
[Contextual icon or illustration — simple SVG, not stock art]
[Primary message — "No journal entries yet"]
[Secondary message — what will appear here once data exists]
[Primary CTA — "Create your first entry"]
```

Empty states are encouraging, not apologetic. "Your books start here" not "No data found."

### 16.3 Error States

| Error type | Pattern |
|-----------|---------|
| Inline field validation | Red text below field, `role="alert"` |
| Form-level | Error summary banner above submit, links to each errored field |
| API/server error | Toast (persistent) with "Try again" action |
| 404 not found | Dedicated screen with back navigation |
| Permission denied | Dedicated screen explaining why + contact admin note |
| Network offline | Persistent amber banner at top: "You appear to be offline. Changes will not be saved." |

### 16.4 Optimistic Updates

Mutations that are fast and low-risk (status badge updates, filter changes) should apply optimistically. If the server rejects, revert and show an error toast.

Mutations that are irreversible (Post entry, Close FY, File GST return) must wait for server confirmation before updating the UI.

### 16.5 Confirmation Patterns

| Risk level | Pattern |
|-----------|---------|
| Low (save draft, add line) | No confirmation — just execute |
| Medium (delete draft entry, cancel invoice) | Inline confirmation — expands below the action button. "Confirm delete?" + "Yes, delete" + "Cancel" |
| High (post entry, close FY, void entry) | Inline form — requires additional input (e.g. void reason) before confirmation |
| Critical (delete account, delete tenant data) | Two-step: type to confirm (e.g. "Type DELETE to confirm") |

**No modals for destructive actions.** Inline confirmation keeps the user in context and avoids the cognitive overhead of a modal overlay.

---

## 17. Accessibility Standards

### 17.1 WCAG 2.1 AA Requirements

All screens must meet WCAG 2.1 AA. Key requirements:

| Requirement | Implementation |
|-------------|----------------|
| Colour contrast | All text ≥ 4.5:1. Amber text on white uses `#B47500`. Light grey uses `#767676` minimum. |
| Keyboard navigation | Every interactive element reachable via Tab. Logical tab order. No keyboard traps except modals. |
| Focus indicators | Visible focus ring on all interactive elements. Use `ring-2 ring-amber-500` (or equivalent) — do not remove default outline without replacement. |
| Label-input linkage | Explicit `htmlFor`/`id` on all form fields. No placeholder-only labels. |
| ARIA navigation | `aria-current="page"` on active nav link. `aria-current="step"` on active wizard step. |
| ARIA live regions | BalanceBar, toast notifications, loading states, real-time validation messages. |
| Modals | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title. Focus trap active when open. Esc closes. Focus returns to trigger element on close. |
| Tables | `<table>` with proper `<thead>`, `<tbody>`, `<th scope="col/row">`. Complex tables use `aria-label`. |
| Error announcements | Inline errors use `role="alert"`. Form errors announced on submit attempt. |
| Screen reader text | Icon-only buttons have `aria-label`. Status-conveying colour has text equivalent. |

### 17.2 Keyboard Navigation Specifics

**Journal entry grid (new/edit):**
- Arrow keys navigate between cells (↑↓←→)
- Enter enters edit mode in a cell
- Esc exits edit mode
- Tab moves to next logical field (not next cell — follows the field order, not grid order)

**CoA tree view:**
- ↑↓ navigate between siblings
- → expands a group (if collapsed)
- ← collapses a group (if expanded) or moves to parent
- Enter navigates to account detail

**Command palette:**
- ↑↓ navigate items
- Enter executes highlighted command
- Esc closes palette
- Focus trap: Tab cycles only within palette

### 17.3 Device Support Matrix

| Device | Resolution | Support level | Notes |
|--------|-----------|---------------|-------|
| Desktop | 1920×1080+ | Full | All features, all screens |
| Desktop | 1440×900 | Full | Common laptop resolution — must test |
| Tablet | 768×1024 | Responsive | Touch-friendly, sidebar collapses to icon rail |
| Mobile | 375×667 | Critical paths only | Invoice viewing, payslip viewing, My Payslips, basic dashboard KPIs |

Mobile non-goals: New journal entry, CoA management, GST filing, ITR computation. These are desktop-only experiences.

### 17.4 Screen Reader Testing

Test with:
- macOS VoiceOver + Safari
- Windows NVDA + Chrome
- iOS VoiceOver (for mobile-responsive screens)

Key flows to verify:
1. Login and authentication
2. New journal entry (full form including balance bar)
3. Invoice creation
4. GSTR-3B filing confirmation
5. Payroll processing

---

*ComplianceOS UX/UI Document — Version 1.1 — April 2026*  
*124 screens · 13 modules · Built for the Indian business owner*
