# ComplianceOS — User-Facing Screen Inventory

**Version:** 1.2  
**Date:** 2026-04-25  
**Total Screens:** 139 pages (99 app + 17 marketing + 23 public) + 12 dialogs/modals + 5 wizards + 8 popovers/overlays  
**Marketing Pages Added:** 17 public-facing marketing pages (no auth required)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🖥️ | Desktop optimized |
| 📱 | Mobile responsive |
| 📊 | Tablet optimized |
| 🔐 | Auth required |
| 👤 | Role-specific (Admin/Accountant/Employee) |
| ⚠️ | Has error state |
| ⏳ | Has loading state |
| 📭 | Has empty state |
| ✅ | Has success state |

---

## 1. Public Marketing Pages (No Auth)

### 1.1 Homepage
| Attribute | Details |
|-----------|---------|
| **Route** | `/` |
| **File** | `apps/web/app/(marketing)/page.tsx` |
| **Purpose** | Convert visitors to sign-ups. Communicate product identity and differentiation. |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Sticky nav, Hero (64px headline + product screenshot), 5 benefit cards, Dark demo section with tab switcher, Module feature grid, Testimonial carousel, Conversion CTA, Footer |
| **States** | ⏳ Screenshot loading, scroll-triggered fade-in animations |
| **A11y** | Skip link, `role="navigation"`, `aria-expanded` dropdown, carousel ARIA, reduced-motion support |

### 1.2 Features Overview
| Attribute | Details |
|-----------|---------|
| **Route** | `/features` |
| **File** | `apps/web/app/(marketing)/features/page.tsx` |
| **Purpose** | Overview of all 5 modules before diving into specific feature pages |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, 5 zigzag cards (alternating image/text), Module screenshots |
| **States** | Scroll-triggered fade-in |
| **A11y** | Alt text on screenshots, semantic headings |

### 1.3 Feature: Accounting
| Attribute | Details |
|-----------|---------|
| **Route** | `/features/accounting` |
| **File** | `apps/web/app/(marketing)/features/accounting/page.tsx` |
| **Purpose** | Detail page for accounting module |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, Balance constraint demo (animated), Chart of accounts tree screenshot, Reports section (P&L + BS), CTA |
| **States** | Scroll-triggered animations |
| **A11y** | Semantic headings, `alt` on screenshots |

### 1.4 Feature: GST
| Attribute | Details |
|-----------|---------|
| **Route** | `/features/gst` |
| **File** | `apps/web/app/(marketing)/features/gst/page.tsx` |
| **Purpose** | Detail page for GST module |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, 3-step filing flow, ITC reconciliation screenshot, Honest limitation banner (no GSP integration), CTA |
| **States** | Scroll-triggered animations |
| **A11y** | Limitation banner uses `role="note"` |

### 1.5 Feature: Invoicing
| Attribute | Details |
|-----------|---------|
| **Route** | `/features/invoicing` |
| **File** | `apps/web/app/(marketing)/features/invoicing/page.tsx` |
| **Purpose** | Detail page for invoicing module |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, Invoice → Ledger flow diagram, Invoice PDF preview with GST breakdown, OCR scan two-panel, CTA |
| **States** | Scroll-triggered animations |
| **A11y** | Table ARIA on invoice preview |

### 1.6 Feature: Payroll
| Attribute | Details |
|-----------|---------|
| **Route** | `/features/payroll` |
| **File** | `apps/web/app/(marketing)/features/payroll/page.tsx` |
| **Purpose** | Detail page for payroll module |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, Salary structure (earnings + deductions), Payslip view, Compliance reports section, CTA |
| **States** | Scroll-triggered animations |
| **A11y** | Form field labels in salary structure |

### 1.7 Feature: ITR
| Attribute | Details |
|-----------|---------|
| **Route** | `/features/itr` |
| **File** | `apps/web/app/(marketing)/features/itr/page.tsx` |
| **Purpose** | Detail page for ITR module |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, Regime comparison (old vs new), Presumptive scheme (44AD/44ADA), Integration chain diagram, CTA |
| **States** | Scroll-triggered animations |
| **A11y** | Comparison table ARIA |

### 1.8 Pricing
| Attribute | Details |
|-----------|---------|
| **Route** | `/pricing` |
| **File** | `apps/web/app/(marketing)/pricing/page.tsx` |
| **Purpose** | Present pricing tiers with billing toggle and FAQ |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Billing toggle (Annual/Monthly with radio role), 3 pricing cards (Free/Pro/Business), FAQ accordion (6 items), "Most popular" badge |
| **States** | ✅ Billing toggle updates prices without reload, ⚠️ Email support SLA |
| **A11y** | `role="radiogroup"`, `aria-checked` on toggle, FAQ uses `<details>`/`<summary>` |

### 1.9 About
| Attribute | Details |
|-----------|---------|
| **Route** | `/about` |
| **File** | `apps/web/app/(marketing)/about/page.tsx` |
| **Purpose** | Company background, team, beliefs |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Hero headline, Problem statement, 3 team cards, Design narrative, 5 belief statements |
| **States** | Scroll-triggered animations |
| **A11y** | Semantic heading hierarchy, `alt` on team photos |

### 1.10 Contact
| Attribute | Details |
|-----------|---------|
| **Route** | `/contact` |
| **File** | `apps/web/app/(marketing)/contact/page.tsx` |
| **Purpose** | Contact form and business information |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Contact form (Name, Email, Business type select, Message textarea), Contact info panel, Honeypot spam protection |
| **States** | ✅ Success (green check + confirmation), ⚠️ Error (fallback email), ⏳ Submit loading |
| **A11y** | `htmlFor`/`id` on all form fields, `role="alert"` on errors |

### 1.11 Blog Index
| Attribute | Details |
|-----------|---------|
| **Route** | `/blog` |
| **File** | `apps/web/app/(marketing)/blog/page.tsx` |
| **Purpose** | Content marketing and SEO surface |
| **Audience** | All (public) |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Featured post (50/50 image-text), 3-col post grid, Category labels, Author + date |
| **States** | ⏳ Loading (images) |
| **A11y** | `alt` on blog images, semantic `<article>` elements |

### 1.12 Blog Post
| Attribute | Details |
|-----------|---------|
| **Route** | `/blog/[slug]` |
| **File** | `apps/web/app/(marketing)/blog/[slug]/page.tsx` |
| **Purpose** | Individual blog article |
| **Audience** | All (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Reading progress bar (fixed top), Back link, Post title, Byline, Body (H2/H3/blockquote), Related posts |
| **States** | Reading progress updates on scroll |
| **A11y** | `role="progressbar"`, `aria-valuenow`, semantic headings, blockquote ARIA |

### 1.13 Privacy Policy
| Attribute | Details |
|-----------|---------|
| **Route** | `/privacy` |
| **File** | `apps/web/app/(marketing)/privacy/page.tsx` |
| **Purpose** | Data handling and privacy disclosures (DPDP Act 2023) |
| **Audience** | All (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Table of contents (anchored sections), Data Collected, How We Use It, Storage, Third Parties, User Rights, Contact |
| **A11y** | Named anchors, semantic section headings |

### 1.14 Terms of Service
| Attribute | Details |
|-----------|---------|
| **Route** | `/terms` |
| **File** | `apps/web/app/(marketing)/terms/page.tsx` |
| **Purpose** | Terms governing use of the service |
| **Audience** | All (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Sectioned legal document: Service, Responsibilities, Liability, Termination |

### 1.15 Cookie Policy
| Attribute | Details |
|-----------|---------|
| **Route** | `/cookies` |
| **File** | `apps/web/app/(marketing)/cookies/page.tsx` |
| **Purpose** | Cookie usage disclosure |
| **Audience** | All (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Essential cookies only, No tracking/advertising cookies, Browser control instructions |

### 1.16 Security
| Attribute | Details |
|-----------|---------|
| **Route** | `/security` |
| **File** | `apps/web/app/(marketing)/security/page.tsx` |
| **Purpose** | Security practices for CTO/IT manager audience |
| **Audience** | All (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Encryption (TLS 1.3 + AES-256), Data Residency (India-only), Access Controls, Incident Response contact |

---

## 2. Authentication Screens (Public)

### 1.1 Login
| Attribute | Details |
|-----------|---------|
| **Route** | `/login` |
| **File** | `apps/web/app/(auth)/login/page.tsx` |
| **Purpose** | User authentication via email/password |
| **Audience** | All users (public) |
| **Device** | 🖥️ 📱 📊 (responsive) |
| **Components** | Email input, Password input, Login button, "Forgot password" link, "Create account" link |
| **States** | ⏳ Loading (authenticating), ⚠️ Error (invalid credentials), ✅ Success (redirect to dashboard) |
| **A11y** | Label-input linkage, keyboard navigation, error announcements |

### 1.2 Signup
| Attribute | Details |
|-----------|---------|
| **Route** | `/signup` |
| **File** | `apps/web/app/(auth)/signup/page.tsx` |
| **Purpose** | New tenant registration |
| **Audience** | New users (public) |
| **Device** | 🖥️ 📱 📊 |
| **Components** | Business name input, Email input, Password input, Confirm password, Signup button |
| **States** | ⏳ Loading, ⚠️ Error (email exists, weak password), ✅ Success (redirect to onboarding) |
| **A11y** | Form validation announcements, password strength indicator |

---

## 2. Onboarding Wizard (5-Step Flow)

### 2.1 Onboarding Main Wizard
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` |
| **File** | `apps/web/app/(app)/onboarding/page.tsx` |
| **Purpose** | Multi-step tenant setup wizard |
| **Audience** | 🔐 New users (post-signup) |
| **Device** | 🖥️ 📊 (desktop/tablet optimized) |
| **Components** | Progress stepper (5 steps), Step content area, Navigation buttons (Back/Next/Skip) |
| **States** | ⏳ Loading (step data), ⚠️ Validation errors, ✅ Step completion |
| **A11y** | `aria-current="step"` on active step, `role="step"` on progress items, keyboard navigation |

### 2.2 Step 1: Business Profile
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 1) |
| **File** | `apps/web/app/(app)/onboarding/step-business-profile.tsx` |
| **Purpose** | Collect business entity information |
| **Audience** | 🔐 New users |
| **Device** | 🖥️ 📊 |
| **Components** | 8 form fields: Business name, Legal name, Business type (dropdown), Industry (dropdown), PAN, GSTIN, State (dropdown), Address (textarea) |
| **States** | ⏳ Submitting, ⚠️ Validation (PAN/GSTIN format), ✅ Saved |
| **A11y** | Explicit `htmlFor`/`id` on all inputs, dropdown ARIA labels |

### 2.3 Step 2: Module Activation
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 2) |
| **File** | `apps/web/app/(app)/onboarding/step-module-activation.tsx` |
| **Purpose** | Select which compliance modules to enable |
| **Audience** | 🔐 New users |
| **Device** | 🖥️ 📊 |
| **Components** | Module cards (GST, ITR, Payroll, Inventory) with toggle switches, Help tooltips |
| **States** | ⏳ Saving preferences, ✅ Module enabled |
| **A11y** | Switch components with ARIA labels, module descriptions |

### 2.4 Step 3: Chart of Accounts Template
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 3) |
| **File** | `apps/web/app/(app)/onboarding/step-coa-template.tsx` |
| **Purpose** | Select pre-built COA template |
| **Audience** | 🔐 New users |
| **Device** | 🖥️ 📊 |
| **Components** | Template cards (Trading, Manufacturing, Services, Freelancer, CA/CS), Preview button, Customize option |
| **States** | ⏳ Loading templates, ⏳ Seeding COA, ✅ Template applied |
| **A11y** | Card selection with radio pattern, template descriptions |

### 2.5 Step 3b: COA Review (Conditional)
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 3b) |
| **File** | `apps/web/app/(app)/onboarding/step-coa-review.tsx` |
| **Purpose** | Review and customize seeded COA |
| **Audience** | 🔐 New users (if customized template selected) |
| **Device** | 🖥️ 📊 |
| **Components** | COA tree view, Add account button, Edit account modal, Delete account button |
| **States** | ⏳ Loading COA, 📭 Empty (no accounts), ✅ COA finalized |
| **A11y** | Tree view with ARIA, keyboard navigation |

### 2.6 Step 4: Fiscal Year & GST Configuration
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 4) |
| **File** | `apps/web/app/(app)/onboarding/step-fy-gst.tsx` |
| **Purpose** | Set fiscal year start and GST type |
| **Audience** | 🔐 New users |
| **Device** | 🖥️ 📊 |
| **Components** | FY start date picker, GST type selector (Regular/Composition), GSTIN display |
| **States** | ⏳ Saving, ⚠️ Validation (FY overlap), ✅ Configuration saved |
| **A11y** | Date picker ARIA, radio group for GST type |

### 2.7 Step 5: Opening Balances
| Attribute | Details |
|-----------|---------|
| **Route** | `/onboarding` (Step 5) |
| **File** | `apps/web/app/(app)/onboarding/step-opening-balances.tsx` |
| **Purpose** | Import or manually enter opening balances |
| **Audience** | 🔐 New users |
| **Device** | 🖥️ 📊 |
| **Components** | CSV/XLSX upload zone, Manual entry table (account, debit, credit), Balance checker, Skip button |
| **States** | ⏳ Uploading, ⏳ Importing, ⚠️ Import errors, 📭 No balances, ✅ Balances imported |
| **A11y** | File upload ARIA, table keyboard navigation |

---

## 3. Dashboard & Navigation

### 3.1 Main Dashboard
| Attribute | Details |
|-----------|---------|
| **Route** | `/dashboard` |
| **File** | `apps/web/app/(app)/dashboard/page.tsx` |
| **Purpose** | Overview of financial health, quick actions |
| **Audience** | 🔐 All authenticated users |
| **Device** | 🖥️ 📊 (responsive grid) |
| **Components** | Greeting header, 4 KPI tiles (Revenue MTD, Expenses MTD, Net Profit MTD, Cash Balance), Recent entries table, Top customers list, Quick action buttons |
| **States** | ⏳ Loading data, 📭 No recent entries, ✅ Data loaded |
| **A11y** | KPI tiles with semantic headings, table ARIA labels |

### 3.2 Command Palette (Overlay)
| Attribute | Details |
|-----------|---------|
| **Route** | Global (⌘K shortcut) |
| **File** | `apps/web/components/command-palette.tsx` |
| **Purpose** | Quick navigation and actions via keyboard |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ (keyboard-driven) |
| **Components** | Search input, Command list (pages, actions), Keyboard shortcut hints |
| **States** | ⏳ Search filtering, 📭 No results, ✅ Command executed |
| **A11y** | Modal ARIA, keyboard navigation (↑↓Enter), focus trap |

---

## 4. Core Accounting Module

### 4.1 Journal Entry List
| Attribute | Details |
|-----------|---------|
| **Route** | `/journal` |
| **File** | `apps/web/app/(app)/journal/page.tsx` |
| **Purpose** | View and filter all journal entries |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Filter bar (date range, status, account), Entry table (Entry #, Date, Narration, Amount, Status), Pagination, Export button |
| **States** | ⏳ Loading, 📭 No entries, ✅ Entries listed |
| **A11y** | Table ARIA, filter labels, pagination keyboard nav |

### 4.2 New Journal Entry
| Attribute | Details |
|-----------|---------|
| **Route** | `/journal/new` |
| **File** | `apps/web/app/(app)/journal/new/page.tsx` |
| **Purpose** | Create double-entry journal transaction |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ (data-entry optimized) |
| **Components** | Date picker, Narration input, Line item grid (Account dropdown, Debit, Credit, Description), Add line button, Save Draft button, Post Entry button, BalanceBar (real-time) |
| **States** | ⏳ Saving, ⚠️ Unbalanced entry, ✅ Posted/Drafted |
| **A11y** | Excel-style arrow navigation, BalanceBar live region, dropdown ARIA |

### 4.3 Journal Entry Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/journal/[id]` |
| **File** | `apps/web/app/(app)/journal/[id]/page.tsx` |
| **Purpose** | View single journal entry details |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Entry header (Entry #, Status badge, Date), Narration display, Line items table, Audit trail, Action buttons (Edit, Void, Delete) |
| **States** | ⏳ Loading, ⚠️ Not found, ✅ Entry displayed |
| **A11y** | Status badge ARIA, action button labels |

### 4.4 Chart of Accounts List
| Attribute | Details |
|-----------|---------|
| **Route** | `/coa` |
| **File** | `apps/web/app/(app)/coa/page.tsx` |
| **Purpose** | View full chart of accounts tree |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Tree view (4-level hierarchy), Account codes, Account types, Balance display, Expand/collapse toggles |
| **States** | ⏳ Loading, 📭 No accounts, ✅ Tree rendered |
| **A11y** | Tree view ARIA, keyboard navigation (↑↓←→) |

### 4.5 Accounts List
| Attribute | Details |
|-----------|---------|
| **Route** | `/accounts` |
| **File** | `apps/web/app/(app)/accounts/page.tsx` |
| **Purpose** | Manage individual accounts |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Account table (Code, Name, Type, Balance), Search/filter, Add account button |
| **States** | ⏳ Loading, 📭 No accounts, ✅ Accounts listed |
| **A11y** | Table ARIA, search label |

### 4.6 Account Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/accounts/[id]` |
| **File** | `apps/web/app/(app)/accounts/[id]/page.tsx` |
| **Purpose** | View account ledger and details |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Account header (Name, Code, Type), Current balance, Ledger table (Date, Entry #, Narration, Debit, Credit, Balance), Date filter |
| **States** | ⏳ Loading, 📭 No transactions, ✅ Ledger displayed |
| **A11y** | Table ARIA, balance live region |

### 4.7 New Account (Modal/Page)
| Attribute | Details |
|-----------|---------|
| **Route** | `/accounts/new` |
| **File** | `apps/web/app/(app)/accounts/new/page.tsx` |
| **Purpose** | Create new COA account |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Account name input, Account code input, Parent account dropdown, Account type selector, Opening balance input |
| **States** | ⏳ Creating, ⚠️ Validation (duplicate code), ✅ Account created |
| **A11y** | Form labels, dropdown ARIA |

---

## 5. Invoicing & Receivables Module

### 5.1 Invoice List
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices` |
| **File** | `apps/web/app/(app)/invoices/page.tsx` |
| **Purpose** | View and manage all invoices |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Filter bar (status, customer, date), Invoice table (#, Customer, Date, Amount, Status, Due), Create button, Export button |
| **States** | ⏳ Loading, 📭 No invoices, ✅ Invoices listed |
| **A11y** | Table ARIA, status badge labels |

### 5.2 New Invoice
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices/new` |
| **File** | `apps/web/app/(app)/invoices/new/page.tsx` |
| **Purpose** | Create sales invoice |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Customer selector, Invoice date, Line items (Product, Qty, Rate, GST%), Tax calculation, Total display, Save & Send buttons |
| **States** | ⏳ Saving, ⚠️ Validation (missing customer), ✅ Invoice created |
| **A11y** | Form labels, real-time total announcements |

### 5.3 Invoice Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices/[id]` |
| **File** | `apps/web/app/(app)/invoices/[id]/page.tsx` |
| **Purpose** | View single invoice |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 📱 |
| **Components** | Invoice header (#, Status, Customer), Line items table, Tax breakdown, Payment status, Actions (Edit, Send, Download PDF) |
| **States** | ⏳ Loading, ⚠️ Not found, ✅ Invoice displayed |
| **A11y** | Status ARIA, action labels |

### 5.4 Invoice Edit
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices/[id]/edit` |
| **File** | `apps/web/app/(app)/invoices/[id]/edit/page.tsx` |
| **Purpose** | Modify draft/pending invoice |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Same as New Invoice (pre-filled), Update button, Cancel button |
| **States** | ⏳ Loading, ⏳ Saving, ⚠️ Validation, ✅ Updated |
| **A11y** | Form labels, change confirmation |

### 5.5 Invoice PDF Preview
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices/[id]/pdf` |
| **File** | `apps/web/app/(app)/invoices/[id]/pdf/page.tsx` |
| **Purpose** | Print-ready PDF preview |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ (print layout) |
| **Components** | PDF render (business logo, invoice details, line items, totals, bank details), Print button, Download button |
| **States** | ⏳ Rendering, ✅ PDF ready |
| **A11y** | Print ARIA, download button label |

### 5.6 Invoice Scan (OCR)
| Attribute | Details |
|-----------|---------|
| **Route** | `/invoices/scan` |
| **File** | `apps/web/app/(app)/invoices/scan/page.tsx` |
| **Purpose** | Upload and OCR vendor invoices |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Upload zone (drag-drop), OCR results preview (vendor, date, amount, GSTIN), Confirm button, Manual override fields |
| **States** | ⏳ Uploading, ⏳ OCR processing, ⚠️ OCR failed, 📭 No results, ✅ Extracted |
| **A11y** | Upload ARIA, results table labels |

### 5.7 Receivables Summary
| Attribute | Details |
|-----------|---------|
| **Route** | `/receivables` |
| **File** | `apps/web/app/(app)/receivables/page.tsx` |
| **Purpose** | Overview of customer receivables |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Total outstanding KPI, Aging summary (Current, 30, 60, 90+ days), Customer list with outstanding amounts |
| **States** | ⏳ Loading, 📭 No receivables, ✅ Summary displayed |
| **A11y** | KPI ARIA, table labels |

### 5.8 Customer Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/receivables/[customerId]` |
| **File** | `apps/web/app/(app)/receivables/[customerId]/page.tsx` |
| **Purpose** | View single customer account |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Customer header (Name, Contact), Outstanding balance, Invoice history table, Payment history, Add invoice button |
| **States** | ⏳ Loading, ⚠️ Not found, ✅ Customer displayed |
| **A11y** | Table ARIA, balance live region |

---

## 6. Payments Module

### 6.1 Payment List
| Attribute | Details |
|-----------|---------|
| **Route** | `/payments` |
| **File** | `apps/web/app/(app)/payments/page.tsx` |
| **Purpose** | View all recorded payments |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Filter bar (date, type, customer), Payment table (Date, Reference, Type, Amount, Status), Record payment button |
| **States** | ⏳ Loading, 📭 No payments, ✅ Payments listed |
| **A11y** | Table ARIA, filter labels |

### 6.2 New Payment
| Attribute | Details |
|-----------|---------|
| **Route** | `/payments/new` |
| **File** | `apps/web/app/(app)/payments/new/page.tsx` |
| **Purpose** | Record payment received/made |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Payment type selector (Received/Paid), Customer/Vendor selector, Amount input, Date picker, Reference input, Allocation table (invoice selection), Submit button |
| **States** | ⏳ Saving, ⚠️ Validation (unallocated amount), ✅ Payment recorded |
| **A11y** | Form labels, allocation table ARIA |

### 6.3 Receipt Scan (OCR)
| Attribute | Details |
|-----------|---------|
| **Route** | `/receipts/scan` |
| **File** | `apps/web/app/(app)/receipts/scan/page.tsx` |
| **Purpose** | Upload and OCR payment receipts |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Upload zone, OCR results preview, Confirm button, Manual override |
| **States** | ⏳ Uploading, ⏳ OCR processing, ⚠️ Failed, ✅ Extracted |
| **A11y** | Upload ARIA, results labels |

---

## 7. Financial Reports Module

### 7.1 Trial Balance
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/trial-balance` |
| **File** | `apps/web/app/(app)/reports/trial-balance/page.tsx` |
| **Purpose** | View trial balance report |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Account table (Account, Debit, Credit), Totals row, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Table ARIA, totals announcements |

### 7.2 Profit & Loss (Schedule III)
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/pl` |
| **File** | `apps/web/app/(app)/reports/pl/page.tsx` |
| **Purpose** | P&L statement (corporate format) |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Income section, Expenses section, Net profit/loss display, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Section headings, totals live region |

### 7.3 Profit & Loss (Proprietorship)
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/profit-loss` |
| **File** | `apps/web/app/(app)/reports/profit-loss/page.tsx` |
| **Purpose** | P&L statement (proprietorship format) |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Revenue section, Expense section, Net profit/loss, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Section headings, totals announcements |

### 7.4 Balance Sheet
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/balance-sheet` |
| **File** | `apps/web/app/(app)/reports/balance-sheet/page.tsx` |
| **Purpose** | Balance sheet statement |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Assets section (Current, Non-current), Liabilities section, Equity section, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Section headings, balance check ARIA |

### 7.5 General Ledger
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/ledger` |
| **File** | `apps/web/app/(app)/reports/ledger/page.tsx` |
| **Purpose** | General ledger for all accounts |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Account filter, Ledger table (Date, Entry #, Narration, Debit, Credit, Balance), Export button |
| **States** | ⏳ Loading, 📭 No transactions, ✅ Ledger displayed |
| **A11y** | Table ARIA, running balance announcements |

### 7.6 Cash Flow Statement
| Attribute | Details |
|-----------|---------|
| **Route** | `/reports/cash-flow` |
| **File** | `apps/web/app/(app)/reports/cash-flow/page.tsx` |
| **Purpose** | Cash flow (indirect method) |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Operating activities, Investing activities, Financing activities, Net cash change, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Section headings, totals ARIA |

---

## 8. GST Module

### 8.1 GST Returns List
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/returns` |
| **File** | `apps/web/app/(app)/gst/returns/page.tsx` |
| **Purpose** | View and manage GST returns |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Filter bar (period, return type, status), Returns table (Return #, Type, Period, Status, Due date, Actions), Generate buttons (GSTR-1/2B/3B) |
| **States** | ⏳ Loading, 📭 No returns, ✅ Returns listed |
| **A11y** | Table ARIA, status badge labels |

### 8.2 GST Return Period Selection
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/returns/[period]` |
| **File** | `apps/web/app/(app)/gst/returns/[period]/page.tsx` |
| **Purpose** | Select return type for period |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period display, Return type cards (GSTR-1, GSTR-2B, GSTR-3B), Generate buttons |
| **States** | ⏳ Loading, ✅ Period selected |
| **A11y** | Card selection ARIA |

### 8.3 GSTR-1 (Outward Supplies)
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/returns/[period]/gstr1` |
| **File** | `apps/web/app/(app)/gst/returns/[period]/gstr1/page.tsx` |
| **Purpose** | View/edit GSTR-1 return |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period header, B2B invoices table, B2C invoices table, Credit/debit notes, Summary preview, File button |
| **States** | ⏳ Generating, 📭 No invoices, ✅ Return ready |
| **A11y** | Table ARIA, summary announcements |

### 8.4 GSTR-2B (ITC Statement)
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/returns/[period]/gstr2b` |
| **File** | `apps/web/app/(app)/gst/returns/[period]/gstr2b/page.tsx` |
| **Purpose** | View GSTR-2B (auto-populated ITC) |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period header, ITC summary (Eligible, Ineligible), Supplier-wise ITC table, Download button |
| **States** | ⏳ Fetching, 📭 No ITC, ✅ ITC displayed |
| **A11y** | Table ARIA, ITC totals |

### 8.5 GSTR-3B (Summary Return)
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/returns/[period]/gstr3b` |
| **File** | `apps/web/app/(app)/gst/returns/[period]/gstr3b/page.tsx` |
| **Purpose** | View/edit GSTR-3B summary |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period header, Outward supplies summary, ITC claim section, Tax payable/paid, Interest/late fee, File button |
| **States** | ⏳ Generating, ⚠️ Validation, ✅ Return ready |
| **A11y** | Form labels, summary ARIA |

### 8.6 GST Reconciliation
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/reconciliation` |
| **File** | `apps/web/app/(app)/gst/reconciliation/page.tsx` |
| **Purpose** | Compare 2B vs books for ITC |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Match summary (Matched, Unmatched, Pending), Reconciliation table, Action buttons (Accept, Reject, Pending) |
| **States** | ⏳ Reconciling, 📭 No data, ✅ Reconciliation complete |
| **A11y** | Table ARIA, match status labels |

### 8.7 ITC Mismatches
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/reconciliation/mismatches` |
| **File** | `apps/web/app/(app)/gst/reconciliation/mismatches/page.tsx` |
| **Purpose** | Review unmatched ITC entries |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Mismatch list (Invoice #, Supplier, Amount, Reason), Resolution actions, Comments field |
| **States** | ⏳ Loading, 📭 No mismatches, ✅ Mismatches listed |
| **A11y** | Table ARIA, reason labels |

### 8.8 GST Ledger (Combined)
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/ledger` |
| **File** | `apps/web/app/(app)/gst/ledger/page.tsx` |
| **Purpose** | View GST ledger summary |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Ledger tabs (Cash, ITC, Liability), Transaction table, Balance display |
| **States** | ⏳ Loading, 📭 No transactions, ✅ Ledger displayed |
| **A11y** | Tab ARIA, table labels |

### 8.9 GST Cash Ledger
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/ledger/cash` |
| **File** | `apps/web/app/(app)/gst/ledger/cash/page.tsx` |
| **Purpose** | View cash ledger for GST |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Cash transaction table, Balance by tax head (CGST, SGST, IGST) |
| **States** | ⏳ Loading, 📭 No transactions, ✅ Ledger displayed |
| **A11y** | Table ARIA, balance announcements |

### 8.10 GST ITC Ledger
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/ledger/itc` |
| **File** | `apps/web/app/(app)/gst/ledger/itc/page.tsx` |
| **Purpose** | View ITC ledger |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, ITC transaction table, Available ITC by tax head |
| **States** | ⏳ Loading, 📭 No ITC, ✅ Ledger displayed |
| **A11y** | Table ARIA, ITC balance labels |

### 8.11 GST Payment
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/payment` |
| **File** | `apps/web/app/(app)/gst/payment/page.tsx` |
| **Purpose** | Calculate and record GST tax payment |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Tax liability display, ITC utilization table, Cash payment required, Challan generation button |
| **States** | ⏳ Calculating, ⚠️ Insufficient ITC, ✅ Payment recorded |
| **A11y** | Form labels, liability announcements |

### 8.12 GST Payment History
| Attribute | Details |
|-----------|---------|
| **Route** | `/gst/payment/history` |
| **File** | `apps/web/app/(app)/gst/payment/history/page.tsx` |
| **Purpose** | View GST payment history |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Period filter, Payment table (Date, Challan #, Amount, Tax head), Download challan button |
| **States** | ⏳ Loading, 📭 No payments, ✅ History displayed |
| **A11y** | Table ARIA, download labels |

#### Dialog: File GST Return
| Attribute | Details |
|-----------|---------|
| **Trigger** | "File Return" button on GSTR-3B page |
| **File** | `apps/web/app/(app)/gst/returns/page.tsx` (inline Dialog) |
| **Purpose** | Enter ARN and confirm filing |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | ARN input field, Validation message, Submit button, Cancel button |
| **States** | ⚠️ Invalid ARN format, ✅ Return filed |
| **A11y** | Modal ARIA, input label, error announcements |

#### Dialog: Amend GST Return
| Attribute | Details |
|-----------|---------|
| **Trigger** | "Amend" button on filed return |
| **File** | `apps/web/app/(app)/gst/returns/page.tsx` (inline Dialog) |
| **Purpose** | Enter JSON changes for amendment |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | JSON textarea, Validation error display, Submit button, Cancel button |
| **States** | ⚠️ Invalid JSON, ✅ Return amended |
| **A11y** | Modal ARIA, textarea label, error announcements |

---

## 9. ITR (Income Tax) Module

### 9.1 ITR Returns List
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/returns` |
| **File** | `apps/web/app/(app)/itr/returns/page.tsx` |
| **Purpose** | View income tax returns |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Returns table (Return #, Form type, Status, Filing date), Compute button |
| **States** | ⏳ Loading, 📭 No returns, ✅ Returns listed |
| **A11y** | Table ARIA, status labels |

### 9.2 ITR Return Detail (by FY)
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/returns/[financialYear]` |
| **File** | `apps/web/app/(app)/itr/returns/[financialYear]/page.tsx` |
| **Purpose** | View return for specific FY |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | FY header, Return summary, Form selector (ITR-1/2/3/4), File button |
| **States** | ⏳ Loading, ✅ Return displayed |
| **A11y** | Summary ARIA |

### 9.3 ITR Return Detail (with GSTR-3B link)
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/returns/[financialYear]/[returnId]` |
| **File** | `apps/web/app/(app)/itr/returns/[financialYear]/[returnId]/page.tsx` |
| **Purpose** | View detailed return with linked data |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Return header, Income details, Tax computation, GSTR-3B linked data preview |
| **States** | ⏳ Loading, ✅ Return displayed |
| **A11y** | Section headings |

### 9.3a ITR Return Detail with GSTR-3B Link
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/returns/[financialYear]/[returnId]` |
| **File** | `apps/web/app/(app)/itr/returns/[financialYear]/[returnId]/page.tsx` |
| **Purpose** | View detailed return with linked GST data |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Return header, Income details, Tax computation, GSTR-3B linked data preview |
| **States** | ⏳ Loading, ✅ Return displayed |
| **A11y** | Section headings |

### 9.3b ITR Return GSTR-3B Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/returns/[financialYear]/[returnId]/gstr3b` |
| **File** | `apps/web/app/(app)/itr/returns/[financialYear]/[returnId]/gstr3b/page.tsx` |
| **Purpose** | View GSTR-3B data linked to ITR |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, GSTR-3B summary table, Link to full GST return |
| **States** | ⏳ Loading, ✅ Data displayed |
| **A11y** | Table ARIA |

### 9.4 ITR Computation
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/computation` |
| **File** | `apps/web/app/(app)/itr/computation/page.tsx` |
| **Purpose** | Compute taxable income |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Income from business/profession, Income from other sources, Deductions (80C/80D/etc.), Taxable income display |
| **States** | ⏳ Computing, ✅ Computation ready |
| **A11y** | Form labels, totals announcements |

### 9.5 ITR Regime Comparison
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/computation/regime-comparison` |
| **File** | `apps/web/app/(app)/itr/computation/regime-comparison/page.tsx` |
| **Purpose** | Compare old vs new tax regime |
| **Audience** | 🔐 Accountants, Admins |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Side-by-side comparison table (Taxable income, Tax, Cess, Total), Regime recommendation |
| **States** | ⏳ Computing, ✅ Comparison ready |
| **A11y** | Table ARIA, comparison labels |

### 9.6 ITR Presumptive Scheme
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/computation/presumptive-scheme` |
| **File** | `apps/web/app/(app)/itr/computation/presumptive-scheme/page.tsx` |
| **Purpose** | Calculate tax under 44AD/44ADA |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Turnover/gross receipts input, Presumptive rate selector (6%/8%), Deemed income display, Tax calculation |
| **States** | ⏳ Calculating, ✅ Computation ready |
| **A11y** | Form labels, calculation announcements |

### 9.7 ITR Payment
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/payment` |
| **File** | `apps/web/app/(app)/itr/payment/page.tsx` |
| **Purpose** | Record income tax payment |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | Payment type selector (Advance/Self-assessment), Tax liability display, Payment entry form, Challan generation |
| **States** | ⏳ Calculating, ✅ Payment recorded |
| **A11y** | Form labels, payment confirmation |

### 9.8 ITR Advance Tax
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/payment/advance-tax` |
| **File** | `apps/web/app/(app)/itr/payment/advance-tax/page.tsx` |
| **Purpose** | Calculate and record advance tax |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Installment selector (Jun/Sep/Dec/Mar), Tax liability, Paid to date, Payable amount |
| **States** | ⏳ Calculating, ✅ Advance tax recorded |
| **A11y** | Form labels, installment ARIA |

### 9.9 ITR Self-Assessment Tax
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/payment/self-assessment` |
| **File** | `apps/web/app/(app)/itr/payment/self-assessment/page.tsx` |
| **Purpose** | Record self-assessment tax payment |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ 📊 |
| **Components** | FY selector, Total tax liability, TDS/TCS credit, Advance tax paid, Balance payable, Payment button |
| **States** | ⏳ Calculating, ✅ Payment recorded |
| **A11y** | Form labels, balance announcements |

### 9.10 ITR Payment History
| Attribute | Details |
|-----------|---------|
| **Route** | `/itr/payment/history` |
| **File** | `apps/web/app/(app)/itr/payment/history/page.tsx` |
| **Purpose** | View income tax payment history |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | FY filter, Payment table (Date, Challan #, Type, Amount), Download challan button |
| **States** | ⏳ Loading, 📭 No payments, ✅ History displayed |
| **A11y** | Table ARIA, download labels |

---

## 10. Payroll Module

### 10.1 Employee List
| Attribute | Details |
|-----------|---------|
| **Route** | `/employees` |
| **File** | `apps/web/app/(app)/employees/page.tsx` |
| **Purpose** | View all employees |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Employee table (Name, Code, Department, Status), Add employee button, Filter by status |
| **States** | ⏳ Loading, 📭 No employees, ✅ Employees listed |
| **A11y** | Table ARIA, status labels |

### 10.2 New Employee
| Attribute | Details |
|-----------|---------|
| **Route** | `/employees/new` |
| **File** | `apps/web/app/(app)/employees/new/page.tsx` |
| **Purpose** | Add new employee |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Personal details form (Name, PAN, Aadhaar, DOB, Joining date), Bank details, Salary structure inputs |
| **States** | ⏳ Saving, ⚠️ Validation (duplicate PAN), ✅ Employee added |
| **A11y** | Form labels, section headings |

### 10.3 Employee Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/employees/[id]` |
| **File** | `apps/web/app/(app)/employees/[id]/page.tsx` |
| **Purpose** | View employee profile |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Employee header (Name, Code, Status), Personal details, Bank details, Employment history |
| **States** | ⏳ Loading, ⚠️ Not found, ✅ Employee displayed |
| **A11y** | Section headings, detail labels |

### 10.4 Employee Salary Structure
| Attribute | Details |
|-----------|---------|
| **Route** | `/employees/[id]/salary` |
| **File** | `apps/web/app/(app)/employees/[id]/salary/page.tsx` |
| **Purpose** | Configure salary components |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Earnings section (Basic, HRA, Allowances), Deductions section (PF, Professional Tax), Save button |
| **States** | ⏳ Loading, ⏳ Saving, ✅ Structure saved |
| **A11y** | Form labels, totals announcements |

### 10.5 Payroll List
| Attribute | Details |
|-----------|---------|
| **Route** | `/payroll` |
| **File** | `apps/web/app/(app)/payroll/page.tsx` |
| **Purpose** | View payroll runs |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Payroll table (Period, Status, Total salary, Date), Process payroll button |
| **States** | ⏳ Loading, 📭 No payroll, ✅ Payroll listed |
| **A11y** | Table ARIA, status labels |

### 10.6 Payroll Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/payroll/[id]` |
| **File** | `apps/web/app/(app)/payroll/[id]/page.tsx` |
| **Purpose** | View single payroll run |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Period header, Employee list with salary breakdown, Total summary, Export button |
| **States** | ⏳ Loading, ✅ Payroll displayed |
| **A11y** | Table ARIA, totals |

### 10.7 Process Payroll
| Attribute | Details |
|-----------|---------|
| **Route** | `/payroll/process` |
| **File** | `apps/web/app/(app)/payroll/process/page.tsx` |
| **Purpose** | Run payroll for period |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Period selector, Employee list (with attendance/leave), Salary preview, Process button |
| **States** | ⏳ Calculating, ⚠️ Missing data, ✅ Payroll processed |
| **A11y** | Form labels, calculation progress |

### 10.8 Payroll Reports
| Attribute | Details |
|-----------|---------|
| **Route** | `/payroll-reports` |
| **File** | `apps/web/app/(app)/payroll-reports/page.tsx` |
| **Purpose** | View payroll compliance reports |
| **Audience** | 🔐 Admins, HR |
| **Device** | 🖥️ 📊 |
| **Components** | Report selector (PF, ESI, PT), Period filter, Report table, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Report labels, table ARIA |

### 10.9 My Payslips
| Attribute | Details |
|-----------|---------|
| **Route** | `/my-payslips` |
| **File** | `apps/web/app/(app)/my-payslips/page.tsx` |
| **Purpose** | Employee self-service payslip view |
| **Audience** | 🔐 All employees |
| **Device** | 🖥️ 📱 |
| **Components** | Period selector, Payslip list, Download PDF button |
| **States** | ⏳ Loading, 📭 No payslips, ✅ Payslips displayed |
| **A11y** | List ARIA, download labels |

---

## 11. Inventory Module

### 11.1 Inventory Dashboard
| Attribute | Details |
|-----------|---------|
| **Route** | `/inventory` |
| **File** | `apps/web/app/(app)/inventory/page.tsx` |
| **Purpose** | Inventory overview |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Stock value KPI, Low stock alerts, Recent movements |
| **States** | ⏳ Loading, 📭 No inventory, ✅ Dashboard displayed |
| **A11y** | KPI ARIA, alert labels |

### 11.2 Product List
| Attribute | Details |
|-----------|---------|
| **Route** | `/inventory/products` |
| **File** | `apps/web/app/(app)/inventory/products/page.tsx` |
| **Purpose** | View all products |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Product table (Name, SKU, Category, Stock, Price), Add product button, Filter by category |
| **States** | ⏳ Loading, 📭 No products, ✅ Products listed |
| **A11y** | Table ARIA, filter labels |

### 11.3 New Product
| Attribute | Details |
|-----------|---------|
| **Route** | `/inventory/products/new` |
| **File** | `apps/web/app/(app)/inventory/products/new/page.tsx` |
| **Purpose** | Add new product |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Product form (Name, SKU, Category, HSN/SAC, Price, Opening stock), Save button |
| **States** | ⏳ Saving, ⚠️ Validation (duplicate SKU), ✅ Product added |
| **A11y** | Form labels, validation messages |

### 11.4 Stock Levels
| Attribute | Details |
|-----------|---------|
| **Route** | `/inventory/stock` |
| **File** | `apps/web/app/(app)/inventory/stock/page.tsx` |
| **Purpose** | View current stock levels |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Stock table (Product, Available, Committed, On-order), Low stock filter, Adjust stock button |
| **States** | ⏳ Loading, 📭 No stock, ✅ Stock displayed |
| **A11y** | Table ARIA, stock level labels |

### 11.5 Inventory Reports
| Attribute | Details |
|-----------|---------|
| **Route** | `/inventory/reports` |
| **File** | `apps/web/app/(app)/inventory/reports/page.tsx` |
| **Purpose** | Generate inventory valuation and movement reports |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | Report selector (Valuation, Movement, Fast/Slow Moving, Expiry), Period filter, Export button |
| **States** | ⏳ Loading, 📭 No data, ✅ Report generated |
| **A11y** | Report labels, table ARIA |

---

## 12. Settings Module

### 12.1 Fiscal Years List
| Attribute | Details |
|-----------|---------|
| **Route** | `/settings/fiscal-years` |
| **File** | `apps/web/app/(app)/settings/fiscal-years/page.tsx` |
| **Purpose** | Manage fiscal years |
| **Audience** | 🔐 Admins |
| **Device** | 🖥️ 📊 |
| **Components** | FY table (Name, Start date, End date, Status), Create FY button, Close FY button |
| **States** | ⏳ Loading, ✅ FYs listed |
| **A11y** | Table ARIA, status labels |

### 12.2 Fiscal Year Detail
| Attribute | Details |
|-----------|---------|
| **Route** | `/settings/fiscal-years/[id]` |
| **File** | `apps/web/app/(app)/settings/fiscal-years/[id]/page.tsx` |
| **Purpose** | View/edit fiscal year details |
| **Audience** | 🔐 Admins |
| **Device** | 🖥️ 📊 |
| **Components** | FY header, Date range, Status display, Close FY button (if open), Journal entry count |
| **States** | ⏳ Loading, ⚠️ Not found, ✅ FY displayed |
| **A11y** | Section headings, action confirmation |

### 12.3 Invoice Configuration
| Attribute | Details |
|-----------|---------|
| **Route** | `/settings/invoices` |
| **File** | `apps/web/app/(app)/settings/invoices/page.tsx` |
| **Purpose** | Configure invoice settings |
| **Audience** | 🔐 Admins |
| **Device** | 🖥️ 📊 |
| **Components** | Numbering format, Logo upload, Bank details, Terms & conditions, Save button |
| **States** | ⏳ Loading, ⏳ Saving, ✅ Config saved |
| **A11y** | Form labels, upload ARIA |

---

## 13. Global UI Elements

### 13.1 App Shell (Sidebar Navigation)
| Attribute | Details |
|-----------|---------|
| **Location** | All `(app)` routes |
| **File** | `apps/web/app/(app)/layout.tsx` |
| **Purpose** | Main application layout |
| **Audience** | 🔐 All authenticated users |
| **Device** | 🖥️ 📊 (responsive sidebar) |
| **Components** | Logo, Navigation menu (15 sections), Fiscal year selector (footer), User menu |
| **States** | Active route highlighting, FY popover |
| **A11y** | Nav ARIA, `aria-current` on active link, skip link |

### 13.2 Fiscal Year Popover
| Attribute | Details |
|-----------|---------|
| **Trigger** | Click FY selector in sidebar footer |
| **File** | `apps/web/app/(app)/layout.tsx` (inline) |
| **Purpose** | Switch between fiscal years |
| **Audience** | 🔐 All users |
| **Device** | 🖥️ 📊 |
| **Components** | FY list (Name, Status badge, Days remaining) |
| **States** | Open/Closed, Active FY highlighted |
| **A11y** | Popover ARIA, button labels |

### 13.3 Balance Bar (Floating)
| Attribute | Details |
|-----------|---------|
| **Location** | Journal entry new/edit pages |
| **File** | `apps/web/components/ui/balance-bar.tsx` |
| **Purpose** | Real-time debit/credit balance display |
| **Audience** | 🔐 Accountants |
| **Device** | 🖥️ |
| **Components** | Total debits, Total credits, Difference (or "Balanced" message) |
| **States** | Balanced (green) / Unbalanced (red) |
| **A11y** | Live region for balance updates |

---

## 14. Accessibility Summary

### 14.1 WCAG 2.1 AA Compliance

| Feature | Implementation |
|---------|----------------|
| **Color Contrast** | All text ≥ 4.5:1 (amber `#B47500`, light `#767676`) |
| **Label-Input Linkage** | Explicit `htmlFor`/`id` on all form fields |
| **ARIA Navigation** | `aria-current` on active nav items, `role="step"` on wizard |
| **Keyboard Navigation** | Arrow key support in JE grid, ⌘K command palette |
| **Focus Management** | Visible focus rings, focus trap in modals |
| **Live Regions** | BalanceBar, toast notifications, loading states |
| **Screen Reader** | All interactive elements labeled, error announcements |

### 14.2 Device Support

| Device | Support Level |
|--------|---------------|
| **Desktop (1920x1080+)** | Full support, all features + marketing pages |
| **Tablet (768x1024)** | Responsive layout, touch-friendly |
| **Mobile (375x667)** | Marketing pages responsive (breakpoints at 768px), app critical paths only |

---

## 15. Screen Count Summary

| Category | Count |
|----------|-------|
| **App Pages (Routes)** | 99 (+3 ITR sub-screens, +1 Inventory Reports) |
| **Marketing Pages (Public)** | 17 (homepage, 5 feature pages, pricing, about, contact, blog×2, 4 legal, features overview) |
| **Dialogs/Modals** | 12 |
| **Wizards** | 5 (onboarding steps) |
| **Popovers/Overlays** | 8 |
| **Total Unique Screens** | 141 |
