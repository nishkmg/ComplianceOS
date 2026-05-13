# ComplianceOS Design System Implementation Plan

## Executive Summary

This plan implements the "Editorial Ledger" design concept from the ComplianceOS Design Plan across all 66 pages. The design creates a hybrid of Indian financial newspaper aesthetics with hand-ruled ledger tradition.

## Current State Assessment

### Already Implemented
- Three typefaces (Playfair Display, Syne, DM Mono)
- CSS variables for colors, typography, spacing
- Basic component styles (buttons, inputs, badges, tables, cards)
- KpiTile, BalanceBar, Badge components
- Indian number formatting utility
- Layout with sidebar navigation

### Needs Enhancement
- Command palette for keyboard shortcuts (⌘K)
- Filter tab styles for journal entries
- Report-specific styles
- Onboarding step indicators
- Keyboard shortcut hints
- Dense table layouts with 0.5px borders

## Phase 1: Foundation Updates

### Task 1.1: Update globals.css

**Add:**
1. Filter Tab Styles
2. Report Styles (.report-container, .report-header, .report-line, .report-amount)
3. Command Palette Styles
4. Onboarding Step Styles
5. Keyboard Hint Styles

### Task 1.2: Create Command Palette Component
**File:** `apps/web/components/command-palette.tsx`
- Triggered by ⌘K
- Search across screens, entries, accounts
- Categories: Screens, Actions, Recent Entries, Accounts
- Keyboard navigation

### Task 1.3: Create Keyboard Shortcuts Hook
**File:** `apps/web/hooks/use-keyboard-shortcuts.ts`
- Global listener
- Context-aware shortcuts
- Visual hints

**Shortcuts:**
- ⌘K: Open command palette
- N: New journal entry
- ⌘S: Save draft
- ⌘↵: Post entry (when balanced)
- Esc: Close/discard
- /: Focus search

## Phase 2: Core Accounting Pages

### Task 2.1: Dashboard
- KPI Row: 4 tiles (Revenue, Expenses, Net Profit, Cash)
- Two-column body: Recent entries + FY progress
- Greeting with company name

### Task 2.2: Journal List
- Filter tabs (All/Posted/Draft/Voided) with amber active
- Dense table: Entry #, Date, Narration, Debit, Credit, Status
- Footer: Running totals
- Search by narration/entry #

### Task 2.3: New Journal Entry
- Header: Entry #, Date, Narration, Reference
- Lines table: Account autocomplete, Debit/Credit inputs
- Balance bar: Real-time difference check
- Actions: Discard, Save draft, Post entry
- Keyboard: ⌘S, ⌘↵, N, Tab navigation

### Task 2.4: Journal Entry Detail
- Header with status badge
- Lines table (read-only if posted)
- Narration correction modal
- Void modal with reason
- Actions: Edit, Delete, Post (draft) / Void (posted)

### Task 2.5: Chart of Accounts
- Tree view grouped by kind
- Collapsible groups
- Dr/Cr balance labels (not +/-)
- Inline add account form

## Phase 3: Reports Pages

### Task 3.1: P&L Statement
- Report header: Company name in Playfair Display
- Schedule III format
- Section headers with muted background
- Line items with indentation
- Final profit/loss with colored background

### Task 3.2: Balance Sheet
- Two-column layout
- Equity & Liabilities | Assets
- Balance check banner

### Task 3.3: Trial Balance
- Table: Code, Name, Debit, Credit
- Balanced indicator
- Export button

### Task 3.4: Cash Flow
- Indirect method format
- Operating/Investing/Financing sections
- Net cash flow summary

### Task 3.5: Ledger
- Account selector dropdown
- Transaction table with running balance
- Date, Particulars, Entry #, Debit, Credit, Balance

## Phase 4: Onboarding & Settings

### Task 4.1: Onboarding
- Step progress indicator (circles with states)
- Full-screen per step
- Step 1-6: Profile, Modules, CoA, FY+GST, Opening Balances, Dashboard

### Task 4.2: Settings
- Consistent form styling
- Fiscal Years table with Close FY

## Phase 5: Other Modules

### Task 5.1-5.4: Invoicing, GST, ITR, Payroll
- Apply table styles
- DM Mono for amounts
- Status badges
- Consistent buttons

## Phase 6: Verification

### Audit Checklists:
- [ ] All ₹ amounts use DM Mono + Indian numbering
- [ ] Screen headings: Playfair Display
- [ ] UI elements: Syne
- [ ] Numbers: DM Mono
- [ ] Amber only for CTAs and draft
- [ ] 0.5px borders on tables
- [ ] Keyboard shortcuts work
- [ ] Reports look print-ready

## Implementation Order

**Week 1:** Foundation (globals.css, command palette, keyboard hooks)
**Week 2:** Core Accounting (Dashboard, Journal pages)
**Week 3:** Reports (P&L, Balance Sheet, Trial Balance, Cash Flow)
**Week 4:** Onboarding + Ledger + Settings
**Week 5:** Other modules + Full verification

## Success Criteria

1. Typography: Playfair (headings), Syne (UI), DM Mono (numbers)
2. Colors: Amber (CTA/draft), Green (posted), Red (errors)
3. Numbers: Indian format (1,00,000) with ₹ prefix
4. Layout: Dense tables, 0.5px borders, no shadows
5. Keyboard: All shortcuts work with inline hints
6. Reports: Print-ready styling
7. Balance: Real-time difference with green check
