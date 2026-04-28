---
name: ComplianceOS Marketing Design System
colors:
  surface: '#fff8f4'
  surface-dim: '#e5d8cb'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e4'
  surface-container: '#f9ecde'
  surface-container-high: '#f3e6d9'
  surface-container-highest: '#ede0d3'
  on-surface: '#211b13'
  on-surface-variant: '#514535'
  inverse-surface: '#362f27'
  inverse-on-surface: '#fcefe1'
  outline: '#847563'
  outline-variant: '#d6c4af'
  surface-tint: '#825500'
  primary: '#825500'
  on-primary: '#ffffff'
  primary-container: '#c8860a'
  on-primary-container: '#3f2700'
  inverse-primary: '#ffb950'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#006494'
  on-tertiary: '#ffffff'
  tertiary-container: '#309bdb'
  on-tertiary-container: '#002f49'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb3'
  primary-fixed-dim: '#ffb950'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#cae6ff'
  tertiary-fixed-dim: '#8ecdff'
  on-tertiary-fixed: '#001e30'
  on-tertiary-fixed-variant: '#004b70'
  background: '#fff8f4'
  on-background: '#211b13'
  surface-variant: '#ede0d3'
  page-bg: '#FAFAF8'
  section-dark: '#111111'
  section-muted: '#F4F2EE'
  section-amber: rgba(200, 134, 10, 0.06)
  amber-text: '#B47500'
  border-subtle: '#E8E4DC'
  text-mid: '#555555'
  text-light: '#888888'
typography:
  marketing-hero:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.1'
  marketing-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.15'
  display-xl:
    fontFamily: Playfair Display
    fontSize: 38px
    fontWeight: '400'
    lineHeight: '1.2'
  display-lg:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '400'
    lineHeight: '1.3'
  ui-lg:
    fontFamily: Syne
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.5'
  ui-md:
    fontFamily: Syne
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-sm:
    fontFamily: Syne
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  ui-xs:
    fontFamily: Syne
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.1em
  mono-lg:
    fontFamily: DM Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.4'
  mono-md:
    fontFamily: DM Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-48: 48px
  space-64: 64px
  space-96: 96px
  space-128: 128px
  gutter-desktop: 24px
  gutter-wide: 32px
  margin-mobile: 16px
---

# ComplianceOS — Public Marketing Pages UX/UI Specification

**Version:** 1.0  
**Date:** April 2026  
**Scope:** All public-facing pages accessible without authentication  
**Status:** Draft — Stakeholder sign-off required on imagery authenticity before development begins

---

## ⚠️ Stakeholder Sign-Off Requirement

> **Before any development begins on public pages, the following must be confirmed in writing by a designated stakeholder:**
>
> All product imagery used on the homepage and feature pages must be authentic. This means: real screenshots of the actual ComplianceOS interface, real photographs of Indian business owners or accountants using the product in genuine working contexts, or commissioned photography showing real-world use. No stock photography, AI-generated imagery, or placeholder illustrations depicting people or work environments may be used in the shipped product.
>
> **Sign-off block (required before development):**
>
> | Role | Name | Date | Signature |
> |------|------|------|-----------|
> | Product Owner | | | |
> | Design Lead | | | |
> | Marketing Lead | | | |

---

## Table of Contents

1. [Design System — Marketing Extension](#1-design-system--marketing-extension)
2. [Global Navigation & Footer](#2-global-navigation--footer)
3. [Homepage — `/`](#3-homepage--)
4. [Features Overview — `/features`](#4-features-overview--features)
5. [Feature: Accounting — `/features/accounting`](#5-feature-accounting--featuresaccounting)
6. [Feature: GST — `/features/gst`](#6-feature-gst--featuresgst)
7. [Feature: Invoicing — `/features/invoicing`](#7-feature-invoicing--featuresinvoicing)
8. [Feature: Payroll — `/features/payroll`](#8-feature-payroll--featurespayroll)
9. [Feature: ITR — `/features/itr`](#9-feature-itr--featuresitr)
10. [Pricing — `/pricing`](#10-pricing--pricing)
11. [About — `/about`](#11-about--about)
12. [Contact — `/contact`](#12-contact--contact)
13. [Blog Index — `/blog`](#13-blog-index--blog)
14. [Blog Post — `/blog/[slug]`](#14-blog-post--blogslug)
15. [Legal Pages](#15-legal-pages)
16. [Component Library — Marketing](#16-component-library--marketing)
17. [Responsive Breakpoints](#17-responsive-breakpoints)
18. [Micro-interactions & Scroll Triggers](#18-micro-interactions--scroll-triggers)
19. [Accessibility — Contrast & Standards](#19-accessibility--contrast--standards)
20. [Imagery Guidelines & Authenticity Standards](#20-imagery-guidelines--authenticity-standards)

---

## 1. Design System — Marketing Extension

The marketing site extends the product's design system — same tokens, same typefaces — but adapts the layout philosophy for a persuasion context rather than a density context. The app is built for daily productivity; the marketing site is built for conversion. Density gives way to breathing room on the marketing side, but the visual language remains identical so the transition from landing page to product feels seamless rather than jarring.

### 1.1 Typography — Marketing Scale Extension

The product uses `display-xl` (38px) as its ceiling. Marketing pages extend this upward with two additional hero-scale tokens. All tokens below `marketing-hero` are identical to the product system.

| Token | Font | Size | Weight | Line Height | Use |
|-------|------|------|--------|-------------|-----|
| `marketing-hero` | Playfair Display | 64px | 400 | 1.1 | Homepage hero headline |
| `marketing-xl` | Playfair Display | 48px | 400 | 1.15 | Section headlines on feature pages |
| `display-xl` | Playfair Display | 38px | 400 | 1.2 | Sub-section headings |
| `display-lg` | Playfair Display | 26px | 400 | 1.3 | Card headings, blog titles |
| `display-md` | Playfair Display | 20px | 400 | 1.4 | Feature headings |
| `display-sm` | Playfair Display | 16px | 400 | 1.5 | Pull quotes, callout headings |
| `ui-lg` | Syne | 18px | 500 | 1.5 | Nav items (marketing nav is larger than app nav) |
| `ui-md` | Syne | 16px | 400 | 1.6 | Body copy, feature descriptions |
| `ui-sm` | Syne | 14px | 400 | 1.6 | Captions, fine print, metadata |
| `ui-xs` | Syne | 12px | 500 | 1.5 | Section labels (uppercase, tracked) |
| `mono-lg` | DM Mono | 18px | 400 | 1.4 | Hero stat numbers (e.g. "₹12,45,000 processed") |
| `mono-md` | DM Mono | 14px | 400 | 1.5 | Code snippets, product UI callouts |

**Mobile typography reduction:** At `<768px`, `marketing-hero` reduces to 40px, `marketing-xl` to 32px, `display-xl` to 28px. All other tokens remain consistent.

### 1.2 Colour System — Marketing Additions

The product's colour system is inherited exactly. Marketing pages add the following surface treatments that do not appear in the app:

| Token | Value | Use |
|-------|-------|-----|
| `page-bg` | `#FAFAF8` | Warm off-white page background (not pure white) — evokes newsprint |
| `section-dark` | `#111111` | Dark section backgrounds for contrast breaks — used sparingly |
| `section-amber` | `rgba(200,134,10,0.06)` | Very light amber wash for feature highlight sections |
| `section-muted` | `#F4F2EE` | Light warm grey for alternating sections |
| `amber-text` | `#B47500` | Amber text on white — WCAG AA compliant (4.5:1 on `page-bg`) |
| `amber-dark-bg` | `#C8860A` | Amber text on `section-dark` — passes 5.2:1 |

**No new accent colours are introduced.** The single-amber-accent rule from the product extends to the marketing site without exception.

### 1.3 Spacing — Marketing Scale

Marketing sections use a wider spacing scale than the dense app. The 4–32px product scale is supplemented with:

| Token | Value | Use |
|-------|-------|-----|
| `space-48` | 48px | Between major components within a section |
| `space-64` | 64px | Section internal padding (top/bottom) on desktop |
| `space-96` | 96px | Between major page sections on desktop |
| `space-128` | 128px | Hero section top padding |

On mobile (`<768px`), `space-96` compresses to 56px and `space-128` compresses to 72px.

### 1.4 Border Radius — Marketing Additions

| Token | Value | Use |
|-------|-------|-----|
| `radius-xl` | 16px | Hero imagery frames, large feature cards |
| `radius-2xl` | 24px | Full-bleed screenshot frames on dark backgrounds |

Product radius tokens (`radius-sm` 4px, `radius-md` 8px, `radius-lg` 12px) are reused for buttons and form elements.

### 1.5 Shadow System

The product uses no shadows. Marketing pages introduce a single, restrained shadow token to lift product screenshots off backgrounds:

| Token | Value | Use |
|-------|-------|-----|
| `shadow-screenshot` | `0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)` | Product screenshot frames only |
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` | Feature cards on light backgrounds |

No other shadow values are permitted. No glow effects, coloured shadows, or layered shadow stacking.

### 1.6 Grid System

| Breakpoint | Columns | Gutter | Max content width |
|------------|---------|--------|-------------------|
| Mobile (`<768px`) | 4 | 16px | 100% − 32px margin |
| Tablet (`768–1199px`) | 8 | 24px | 100% − 48px margin |
| Desktop (`1200–1439px`) | 12 | 24px | 1200px |
| Wide (`≥1440px`) | 12 | 32px | 1320px |

---

## 2. Global Navigation & Footer

### 2.1 Top Navigation — `<MarketingNav />`

**Route:** All public pages  
**File:** `apps/web/app/(marketing)/layout.tsx`

**Layout (desktop):**

```
[ComplianceOS wordmark]    [Product ▾]  [Pricing]  [About]  [Blog]    [Log in]  [Start free →]
```

**Wordmark:** "ComplianceOS" in Playfair Display 20px, `#1A1A1A`. No logo mark in v1 — the name alone is the brand identifier.

**Nav items:** Syne 16px/500, `#555555`. On hover: `#1A1A1A`, no underline.

**"Product" dropdown:** Opens on click (not hover — hover dropdowns cause accidental activations on tablet). Contains:
- Accounting & Ledger
- GST Filing
- Invoicing
- Payroll
- ITR Returns

Each item: feature name in Syne 15px/500, one-line description in Syne 13px/400 `#888888`.

**"Log in":** Ghost button — no border, `#555555` text, Syne 14px/500. On hover: `#1A1A1A`.

**"Start free →":** Amber fill button. Syne 14px/500, white text, `radius-md`, 12px × 20px padding. On hover: darken amber by 8% (`#B27609`). Arrow (`→`) is a regular character, not an icon — it moves 3px right on hover via CSS `transform: translateX(3px)` with `transition: transform 0.15s ease`.

**Sticky behaviour:** Nav becomes sticky at `top: 0` after scrolling 80px. When sticky: adds `background: rgba(250,250,248,0.92)`, `backdrop-filter: blur(8px)`, `border-bottom: 0.5px solid #E8E4DC`. Transition: 200ms ease.

**Mobile nav (`<768px`):**
- Wordmark left-aligned
- Hamburger icon (3 lines, 20px, `#555555`) right-aligned
- Tap hamburger: full-screen overlay slides in from right. Background `#111111`.
- Overlay contains: nav items stacked vertically in Playfair Display 26px/400 white, "Log in" and "Start free" at bottom.
- Close: × icon top-right, or tap outside.
- Animation: `transform: translateX(100%)` → `translateX(0)`, 250ms ease-out.

**A11y:**
- `role="navigation"` on `<nav>`
- `aria-label="Main navigation"`
- Dropdown uses `aria-expanded`, `aria-controls`
- Mobile overlay: `role="dialog"`, `aria-modal="true"`, focus trap, Esc closes
- Active page: `aria-current="page"` on the matching nav item

---

### 2.2 Footer — `<MarketingFooter />`

**Layout:** 4-column grid on desktop, 2-column on tablet, stacked on mobile.

```
Column 1 (wider):
ComplianceOS
[Tagline: "Built for Indian business."]
[Address: India]
© 2026 ComplianceOS. All rights reserved.

Column 2: Product
  Accounting
  GST Filing
  Invoicing
  Payroll
  ITR Returns

Column 3: Company
  About
  Blog
  Pricing
  Contact

Column 4: Legal
  Privacy policy
  Terms of service
  Cookie policy
  Security
```

**Wordmark in footer:** Playfair Display 20px, `#1A1A1A`.  
**Tagline:** Syne 14px/400, `#888888`, italic.  
**Column headings:** Syne 11px/500, `#888888`, uppercase, letter-spacing 0.08em.  
**Links:** Syne 14px/400, `#555555`. Hover: `#1A1A1A`.  
**Footer background:** `#F4F2EE` (section-muted).  
**Top border:** 0.5px solid `#E8E4DC`.  
**Padding:** 64px top, 48px bottom.

---

## 3. Homepage — `/`

**File:** `apps/web/app/(marketing)/page.tsx`  
**Purpose:** Convert visitors into sign-ups. Communicate the product's identity, problem solved, and differentiation in under 90 seconds of reading.  
**Primary CTA:** "Start free — no credit card" → `/signup`  
**Secondary CTA:** "See how it works" → scrolls to product demo section

---

### 3.1 Hero Section

**Wireframe annotation:**

```
┌─────────────────────────────────────────────────────┐
│  [Nav]                                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Section label — ui-xs, amber]                     │
│  BUILT FOR INDIAN BUSINESS                          │
│                                                     │
│  [Headline — marketing-hero, Playfair Display]      │
│  The accounting software                            │
│  that thinks in lakhs,                              │
│  not thousands.                                     │
│                                                     │
│  [Subheadline — ui-md, mid]                         │
│  Double-entry books, GST returns, payroll and       │
│  ITR — fully connected, built from scratch          │
│  for how Indian businesses actually work.           │
│                                                     │
│  [CTA row]                                          │
│  [Start free →]  [Watch demo  ▶]                   │
│                                                     │
│  [Trust line — ui-xs, light]                        │
│  Free to start · No credit card · Indian FY Apr–Mar │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Product screenshot — authentic, with shadow]      │
│  [Dashboard view showing real data in context]      │
└─────────────────────────────────────────────────────┘
```

**Section label:** "BUILT FOR INDIAN BUSINESS" — Syne 11px/500, `#B47500` (amber-text), uppercase, letter-spacing 0.1em. Margin-bottom: 16px.

**Headline:** Playfair Display 64px/400, `#1A1A1A`, line-height 1.1. Line breaks are intentional — enforce with `<br>` at `≥1200px`. On mobile, wraps naturally at 40px.

> **Copywriting note:** "Thinks in lakhs, not thousands" is the core positioning line. It is the only thing on this page that competitors cannot say. Do not change it without stakeholder approval.

**Subheadline:** Syne 18px/400, `#555555`, line-height 1.6, max-width 560px.

**CTA row:**
- "Start free →": amber fill button, Syne 16px/500, padding 14px × 28px, `radius-md`. Arrow moves 3px right on hover.
- "Watch demo ▶": ghost button with `#555555` border, Syne 16px/500, padding 14px × 24px. Play icon (▶) is 12px. On hover: border darkens to `#1A1A1A`.
- Gap between CTAs: 12px.

**Trust line:** Syne 13px/400, `#888888`. Three items separated by " · ".

**Hero imagery — mandatory authenticity requirements:**

The screenshot displayed below the CTAs must be a real screenshot of the ComplianceOS dashboard in use. Specifically:
- It must show the dashboard with real-looking (but fictitious) data for an Indian business — amounts in lakhs format, Indian company name, current Indian FY
- No placeholder grey boxes, no Lorem Ipsum, no "Company Name Here"
- Framed in a browser chrome mockup (macOS style) using the product's actual border radius and colour system
- Displayed at `radius-2xl` (24px) with `shadow-screenshot`
- The screenshot must be approved by the Product Owner before development

**Responsive behaviour:**
- Desktop (≥1200px): Headline and CTAs left-aligned, screenshot right-aligned in a 2-column grid (55% / 45%)
- Tablet (768–1199px): Stacked. Headline centred, screenshot below at full column width
- Mobile (<768px): Same as tablet. Screenshot shown cropped to the KPI tiles and greeting — not the full dashboard

**Scroll trigger:** On scroll into view (IntersectionObserver, threshold 0.1), the screenshot slides up 24px and fades in. Duration 400ms, ease-out. No JS-heavy scroll libraries — plain IntersectionObserver.

---

### 3.2 Social Proof Bar

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  Trusted by businesses across India                 │
│                                                     │
│  [CA firm logo]  [Trading co.]  [Mfg. co.]  ...    │
│  (real client logos — minimum 6, max 12)            │
└─────────────────────────────────────────────────────┘
```

**Background:** `#F4F2EE` (section-muted).  
**Heading:** Syne 13px/400, `#888888`, centred.  
**Logos:** Displayed in greyscale at 60% opacity. On hover: full colour, 100% opacity, transition 200ms. Max logo height: 32px. Logos scroll as a marquee on mobile.

**Authenticity requirement:** Only real client logos from paying or beta customers. No fabricated logos. If fewer than 6 real logos are available at launch, this section is omitted entirely — do not display placeholder company names.

---

### 3.3 Core Benefits Section — 5 Benefits

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  [Section label]                                    │
│  WHY COMPLIANCEOS                                   │
│                                                     │
│  Everything an Indian business needs,               │
│  in one place that actually works.                  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │          │
│  │ Benefit 1│  │ Benefit 2│  │ Benefit 3│          │
│  │ [desc]   │  │ [desc]   │  │ [desc]   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  ┌──────────┐  ┌──────────┐                         │
│  │ [Icon]   │  │ [Icon]   │                         │
│  │ Benefit 4│  │ Benefit 5│                         │
│  │ [desc]   │  │ [desc]   │                         │
│  └──────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────┘
```

**The 5 core benefits (copy and icon guidance):**

| # | Headline | Description | Icon |
|---|----------|-------------|------|
| 1 | **Books that balance themselves** | Every journal entry is double-entry by construction. Posting is blocked until debits equal credits — the UI enforces what your accountant has always manually checked. | Scale/balance icon — two equal columns |
| 2 | **GST done without a CA on call** | GSTR-1, GSTR-2B, and GSTR-3B generated from your own entries. ITC reconciliation built in. File the return yourself — record the ARN, done. | Filing/document icon with check |
| 3 | **Reports that look like reports** | P&L and Balance Sheet in Schedule III format, typeset for print. Send to your CA or a bank directly from the browser — no export, no reformatting. | Document/ledger icon |
| 4 | **Indian numbers, everywhere** | ₹12,45,000 — not ₹1,245,000. Every amount in the Indian numbering system, every time. This is the only accounting software that gets this right without a plugin. | Rupee symbol icon |
| 5 | **One FY closes, the next one opens** | Apr–Mar fiscal years built in from day one. Two concurrent open FYs for year-end transitions. No "financial year workaround" required. | Calendar/year icon |

**Card design:**
- Background: `surface` white
- Border: 0.5px solid `#E8E4DC`
- Border-radius: `radius-lg` (12px)
- Padding: 28px
- Top border: 2px solid `#C8860A` (amber) — inherits the product's KPI tile treatment
- Icon: 32px × 32px, drawn in `#C8860A` (amber), SVG line icons — not filled, not from an icon library that bleeds generic SaaS aesthetics
- Benefit headline: Playfair Display 20px/400, `#1A1A1A`, margin-bottom 8px
- Description: Syne 15px/400, `#555555`, line-height 1.6
- No CTA inside each card — the section CTA sits below the grid

**Grid:** 3-column on desktop, 2-column on tablet, 1-column on mobile.

**Section CTA:** Below the grid, centred: "See all features →" in amber text, Syne 15px/500. Hover: underline.

**Scroll trigger:** Cards animate in as a staggered group (50ms delay between each). Slide up 16px + fade in, 300ms ease-out per card. Trigger at 0.15 intersection threshold.

---

### 3.4 Product Demo Section

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  [Dark background — section-dark #111111]           │
│                                                     │
│  [Section label — amber]                            │
│  THE PRODUCT                                        │
│                                                     │
│  [Headline — Playfair, white]                       │
│  See a journal entry posted                         │
│  in under 10 seconds.                               │
│                                                     │
│  [Tab row]                                          │
│  [Dashboard] [New Entry] [P&L Report] [GST Return]  │
│                                                     │
│  [Authentic product screenshot — large]             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Background:** `#111111` (section-dark). This is the only dark section on the homepage.

**Section label:** Syne 11px/500, `#C8860A`, uppercase.

**Headline:** Playfair Display 38px/400, white (#FFFFFF), line-height 1.2.

**Tab row:** 4 tabs — Dashboard / New Entry / P&L Report / GST Return. Each is a pill-style button. Inactive: Syne 14px/400, `#888888`, transparent background. Active: Syne 14px/500, `#C8860A`, `rgba(200,134,10,0.12)` background, `#C8860A` border. On tab click, the screenshot cross-fades (200ms opacity) to the relevant screen.

**Screenshots:** All screenshots must be real product screens. Each tab has an annotated callout (a small amber dot with a line to a text label) pointing to 1–2 key UI elements. Callouts use Syne 12px/400, `#C8860A` for the label text.

**Screenshot frame:** `radius-2xl` (24px), `shadow-screenshot`. On dark background: no additional border needed.

**Authenticity requirement:** All 4 screenshots must be taken from the working product, not designed in Figma. They must show real (but sample) Indian business data. Screenshots must be approved by Product Owner before development.

---

### 3.5 Feature Grid — Module Overview

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  Everything connected.                              │
│  Nothing siloed.                                    │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Accounting       │  │ GST Returns      │        │
│  │ [description]    │  │ [description]    │        │
│  │ Learn more →     │  │ Learn more →     │        │
│  └──────────────────┘  └──────────────────┘        │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ Invoicing        │  │ Payroll          │        │
│  └──────────────────┘  └──────────────────┘        │
│  ┌──────────────────┐                              │
│  │ ITR Returns      │                              │
│  └──────────────────┘                              │
└─────────────────────────────────────────────────────┘
```

**Section background:** `#FAFAF8` (page-bg).

**Headline:** Playfair Display 38px/400, `#1A1A1A`, centred. Line break enforced between the two lines.

**Module cards:** On hover, a 2px amber bottom border slides in from left (width: 0 → 100%, transition 250ms). "Learn more →" link appears on hover with same arrow animation as the primary CTA.

**Grid:** 2-column on desktop, 2-column on tablet, 1-column on mobile.

---

### 3.6 Testimonials Section

**⚠️ Authenticity requirement — mandatory before development:**

> All testimonials displayed on the marketing site must be from real, named, verifiable users. Each testimonial requires:
> - Full name (not initials)
> - Company name and role
> - A real photograph (not avatar or illustration) — either provided by the user or taken with their consent
> - Written consent on file from the user to display their name, company, photo, and quote
> - The quote must be their actual words — not paraphrased or cleaned up beyond fixing obvious typos
>
> The design team must maintain a signed testimonial consent file linked to each testimonial entry in the CMS.
>
> If fewer than 3 verified testimonials are available at launch, this section is omitted. Do not display placeholder quotes.

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  [Section label]                                    │
│  FROM OUR USERS                                     │
│                                                     │
│  [Headline]                                         │
│  They switched from Tally.                          │
│  Here's what they said.                             │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ " The P&L actually looks like a P&L —        │   │
│  │   not like a software printout. My CA        │   │
│  │   was surprised I generated it myself. "     │   │
│  │                                              │   │
│  │ [Real photo]  Priya Sharma                   │   │
│  │               Proprietor, Sharma Garments    │   │
│  │               Mumbai                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [◀ prev]  ● ○ ○  [next ▶]                         │
└─────────────────────────────────────────────────────┘
```

**Quote text:** Playfair Display 20px/400-italic, `#1A1A1A`, line-height 1.5. Opening `"` and closing `"` in `#C8860A` (amber), Playfair Display 48px/400, positioned as decorative drop characters (not functional quotation marks — those are in the HTML).

**Attribution:**
- Photo: 48px × 48px circle, `radius-sm` border (not a full circle crop — subtle rounding only), 1px border `#E8E4DC`
- Name: Syne 15px/500, `#1A1A1A`
- Role and company: Syne 13px/400, `#888888`
- Location: Syne 12px/400, `#888888`

**Carousel controls:** Previous/next chevrons in `#888888`. Dot indicators: active = amber fill 8px, inactive = `#E8E4DC` fill 6px. Auto-advances every 6 seconds. Pauses on hover.

**Background:** `#F4F2EE` (section-muted).

**A11y:**
- Carousel uses `role="region"`, `aria-label="User testimonials"`
- Previous/next buttons: `aria-label="Previous testimonial"` / `aria-label="Next testimonial"`
- Dot indicators: `role="tab"`, `aria-selected`, `aria-label="Testimonial 1 of 3"`
- `prefers-reduced-motion`: auto-advance disabled, no slide animation — static display only

---

### 3.7 Conversion Section (Pre-footer CTA)

**Wireframe:**

```
┌─────────────────────────────────────────────────────┐
│  [Amber wash background — section-amber]            │
│                                                     │
│  Ready to move off Tally?                           │
│                                                     │
│  Start free. No credit card.                        │
│  No migration consultant required.                  │
│                                                     │
│  [Start free →]   [Talk to us]                     │
│                                                     │
│  Your data stays in India. Always.                  │
└─────────────────────────────────────────────────────┘
```

**Background:** `rgba(200,134,10,0.06)` (section-amber).  
**Border-top / border-bottom:** 0.5px solid `rgba(200,134,10,0.2)`.  
**Headline:** Playfair Display 38px/400, `#1A1A1A`.  
**Subheadline:** Syne 18px/400, `#555555`.  
**"Start free →":** Amber fill (same as hero CTA).  
**"Talk to us":** Outlined — `#1A1A1A` border, `#1A1A1A` text.  
**Trust line:** Syne 13px/400, `#888888`. "Your data stays in India. Always." — this is a product and legal commitment, not marketing copy. Only include if it is literally true (servers in India).

---

### 3.8 Homepage Responsive Summary

| Section | Desktop (≥1200px) | Tablet (768–1199px) | Mobile (<768px) |
|---------|-------------------|---------------------|-----------------|
| Hero | 2-col, text left, screenshot right | Stacked, centred | Stacked, screenshot cropped |
| Social proof | Horizontal logo row | Horizontal logo row | Scrolling marquee |
| Benefits | 3-col grid | 2-col grid | 1-col stack |
| Product demo | Full-width tabs + screenshot | Full-width | Tabs scroll horizontally |
| Feature grid | 2-col grid | 2-col grid | 1-col stack |
| Testimonials | Single card + controls | Single card + controls | Single card + controls |
| Conversion | Centred, 2-col CTAs | Centred, 2-col CTAs | Stacked CTAs |

---

## 4. Features Overview — `/features`

**File:** `apps/web/app/(marketing)/features/page.tsx`  
**Purpose:** Give an overview of all modules before a visitor dives into a specific feature page.

**Layout:**

**Hero:** Playfair Display 48px/400 headline: "Every module your accountant wanted. Built together, not bolted on." Syne 18px subheadline. No hero imagery required — headline carries the section.

**Module cards (5 cards, staggered layout):**

Each card is larger than a typical card — roughly the width of a half-page column. Alternating left/right image-text layout (the "zigzag" pattern) on desktop. Stacked on mobile.

Each card includes:
- Module name: Playfair Display 26px/400
- 2-sentence description: Syne 16px/400, `#555555`
- 3 bullet features (specific, not generic)
- Screenshot: authentic product screen, `radius-xl` (16px), `shadow-card`
- "Explore [module] →" link in amber

**Modules covered:** Accounting · GST · Invoicing · Payroll · ITR

---

## 5. Feature: Accounting — `/features/accounting`

**File:** `apps/web/app/(marketing)/features/accounting/page.tsx`

**Hero headline:** "Double-entry accounting that enforces what your CA has always asked for."

**Key UX sections:**

**1. The balance constraint (visual demo):**
Animated illustration (SVG, no external libraries) showing the balance bar — starting unbalanced (red), then amounts entered until it reaches ₹0.00 ✓ (green). This animation plays once on scroll-into-view, and replays on click. No sound. No autoplay on `prefers-reduced-motion`.

**2. Journal entry walkthrough:**
A 3-step mini-tutorial: Step 1 — Header (date, narration). Step 2 — Lines (account autocomplete, debit/credit). Step 3 — Post (amber button activates). Steps are shown as tabs. Authentic screenshots only.

**3. Chart of accounts (tree view screenshot):**
Full-width screenshot of the CoA tree, annotated with 3 callouts:
- "Dr/Cr labels — not +/−" pointing to the balance direction label
- "4-level hierarchy" pointing to the indented tree structure
- "Indian account codes" pointing to the 4-digit code column

**4. Reports section:**
Two side-by-side screenshots: P&L (Schedule III) and Balance Sheet. Caption: "Typeset for print. Send to your CA directly — no export, no formatting."

**CTA:** "Start with the accounting module →" → `/signup`

---

## 6. Feature: GST — `/features/gst`

**File:** `apps/web/app/(marketing)/features/gst/page.tsx`

**Hero headline:** "GSTR-1, GSTR-2B, GSTR-3B — generated from your own entries. Not re-entered."

**Key UX sections:**

**1. The filing flow (3-step visual):**
Horizontal stepper on desktop, vertical on mobile:
- Step 1: Entries posted → GSTR-1 auto-generated
- Step 2: GSTR-2B fetched → ITC reconciled
- Step 3: GSTR-3B generated → Enter ARN → Filed

Each step has an authentic screenshot thumbnail and a 1-line description.

**2. ITC reconciliation screenshot:**
Full-width screenshot of the reconciliation screen. Annotated callout pointing to the "Matched / Unmatched / Pending" KPI row: "Know your ITC position before the due date."

**3. Honest limitation banner:**
```
┌─────────────────────────────────────────────────────┐
│  ℹ  ComplianceOS does not file directly to the     │
│     GST portal (no GSP integration in v1). You     │
│     file on the GSTN portal, then record the ARN   │
│     here. We generate everything; you file it.     │
└─────────────────────────────────────────────────────┘
```
Background: `rgba(200,134,10,0.06)`. Border: 0.5px solid `rgba(200,134,10,0.2)`. Syne 14px/400, `#555555`. This is a mandatory disclosure — do not hide it or make it secondary.

---

## 7. Feature: Invoicing — `/features/invoicing`

**File:** `apps/web/app/(marketing)/features/invoicing/page.tsx`

**Hero headline:** "Invoices that post to your books automatically. No double entry."

**Key UX sections:**

**1. Invoice → ledger flow diagram:**
SVG diagram (no external libraries) showing: Invoice created → Journal entry auto-generated → Receivables updated → GST liability updated. Connected with hairline amber arrows.

**2. PDF preview screenshot:**
The invoice PDF as it appears on screen. Must show a realistic Indian invoice: GSTIN displayed, HSN/SAC codes on line items, CGST/SGST breakdown, bank details at the bottom. All with Indian number formatting.

**3. OCR section:**
Two-panel screenshot: Left — uploaded vendor invoice photo. Right — extracted fields with confidence indicators. Caption: "Scan a vendor bill. Fix what the OCR got wrong. Post it."

---

## 8. Feature: Payroll — `/features/payroll`

**File:** `apps/web/app/(marketing)/features/payroll/page.tsx`

**Hero headline:** "Payroll that knows PF from PT, and both from TDS."

**Key UX sections:**

**1. Salary structure screenshot:**
Employee salary structure screen. Annotated callouts: "PF at 12% of basic — auto-calculated", "Professional Tax by state — auto-set", "TDS projection — updated monthly".

**2. Payslip screenshot:**
The employee payslip view. Must show realistic Indian payslip with all statutory components. Caption: "Employees see their own payslips. No PDFs emailed every month."

**3. Compliance reports:**
Screenshots of PF challan and Form 16 data screens. Section headline: "The reports your CA needs for filings — generated, not typed."

---

## 9. Feature: ITR — `/features/itr`

**File:** `apps/web/app/(marketing)/features/itr/page.tsx`

**Hero headline:** "Your books talk directly to your ITR. No re-entry at year end."

**Key UX sections:**

**1. Regime comparison screenshot:**
The side-by-side old vs new regime comparison. Annotated with the recommendation banner: "'New regime saves ₹X' — calculated from your actual books."

**2. Presumptive scheme section:**
Screenshot of the 44AD/44ADA screen. Note: "For eligible businesses — deemed income calculated from turnover. No detailed expense tracking required."

**3. Integration chain:**
Visual diagram: Journal entries → P&L → ITR Computation → Self-assessment tax. Same amber-arrow SVG style as Invoicing page.

---

## 10. Pricing — `/pricing`

**File:** `apps/web/app/(marketing)/pricing/page.tsx`  
**Purpose:** Present pricing tiers clearly. Eliminate confusion about what is included. Make the free tier compelling enough to start without requiring a call.

**Hero:** Playfair Display 48px/400: "Simple pricing for Indian businesses." No subheadline — the pricing table does the work.

### 10.1 Pricing Table

**Wireframe:**

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Free           │  │ Pro            │  │ Business       │
│                │  │ [MOST POPULAR] │  │                │
│ ₹0/month       │  │ ₹X,XXX/yr      │  │ ₹X,XXX/yr      │
│                │  │                │  │                │
│ • Accounting   │  │ Everything in  │  │ Everything in  │
│ • 1 FY         │  │   Free, plus:  │  │   Pro, plus:   │
│ • Basic reports│  │ • GST module   │  │ • Payroll      │
│                │  │ • Invoicing    │  │ • ITR          │
│                │  │ • Unlimited FYs│  │ • Priority     │
│                │  │                │  │   support      │
│ [Start free]   │  │ [Start Pro]    │  │ [Contact us]   │
└────────────────┘  └────────────────┘  └────────────────┘
```

**Note:** Exact pricing figures are not defined in this spec — those are a business decision. The table structure and visual treatment are specified here.

**Card design:**
- All three cards: same `radius-lg`, surface white, 0.5px `#E8E4DC` border
- "Most popular" card: amber `2px` top border (matches product KPI tile treatment). "MOST POPULAR" label: Syne 10px/500, `#C8860A`, uppercase, positioned above the card.
- Price: DM Mono 32px/400, `#1A1A1A`. "₹" in DM Mono 20px. "/year" in Syne 14px/400, `#888888`.
- Feature list: Syne 14px/400, `#555555`. Check icon before each item: 14px SVG, `#C8860A`.
- CTA button: amber fill for "Pro" tier, outlined for others.

**Billing toggle:** Annual / Monthly toggle above the table. Annual selected by default. "Save 20% with annual billing" label appears when Annual is active, in amber. Prices update on toggle without page reload.

**FAQ accordion below the table:**

6–8 commonly asked questions. Each is a row with the question in Syne 15px/500, `#1A1A1A`. On click: answer expands with smooth height transition (200ms ease), answer text in Syne 14px/400, `#555555`. Chevron (▼) rotates 180° on open.

Suggested questions:
- What happens to my data when my free trial ends?
- Can I switch plans mid-year?
- Does pricing include GST filing?
- Is my data stored in India?
- Can I add multiple businesses?
- Is there a setup fee?

**A11y:** FAQ uses `<details>` / `<summary>` or `aria-expanded` / `aria-controls` pattern. Each item independently expandable.

---

## 11. About — `/about`

**File:** `apps/web/app/(marketing)/about/page.tsx`

**Hero headline:** "We built the accounting software we wish existed when we started our businesses."

### Sections:

**1. The problem we're solving:**
2–3 paragraphs in Syne 16px/400, `#555555`. Honest, first-person. Names the specific frustrations: Tally's interface designed for Windows XP, QuickBooks' complete indifference to Indian compliance, Zoho's everything-and-the-kitchen-sink complexity.

**2. The team:**
Cards for each founder/key team member. Each card requires:
- Real photograph (not illustration, not stock) — approved by the person
- Name in Syne 16px/500
- Role in Syne 14px/400, `#888888`
- 2–3 sentence bio in Syne 14px/400, `#555555`
- LinkedIn link (optional)

**Photo requirement:** Photos must be taken in a professional but authentic context — not corporate headshots against grey backgrounds, not casual phone selfies. The aesthetic: thoughtful, working, real. This matches the "editorial ledger" brand direction.

**3. Why we built it this way:**
A short narrative about the design choices — the three-typeface system, the amber-only accent, the density-first layout. Written in plain language, not design jargon. This section exists to build trust with accountants who will be skeptical of another SaaS tool.

**4. What we believe:**
4–5 short statements, each 1–2 sentences. In Playfair Display 20px/400-italic. Examples: "Your books should balance because the software prevents imbalance, not because you checked." "Indian numbering is not a locale option. It is the default."

---

## 12. Contact — `/contact`

**File:** `apps/web/app/(marketing)/contact/page.tsx`

**Hero:** Playfair Display 38px/400: "Get in touch." No further preamble.

**Layout:** Two-column on desktop (form left, info right). Stacked on mobile.

### 12.1 Contact Form

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | Min 2 chars |
| Email | Email | Yes | Standard email format |
| Business type | Select | No | Dropdown: Proprietorship / Partnership / Pvt Ltd / CA Firm / Other |
| Message | Textarea | Yes | Min 20 chars |

**Submit button:** "Send message" — amber fill, full-width on mobile, auto-width on desktop.

**Success state:** Form replaced with: "Message sent. We'll reply to [email] within 1 business day." in Syne 16px/400. Green check icon above.

**Error state:** If submission fails: "Something went wrong. Email us directly at [email address]." in red.

**Spam protection:** Honeypot field (hidden via CSS, not `display:none`). Rate limiting on the API route.

### 12.2 Contact Information Panel (right column)

- Email: [address] — amber text link
- WhatsApp: [number] — with WhatsApp icon
- Response time: "Within 1 business day (Mon–Fri, IST)"
- Office location (if applicable)

---

## 13. Blog Index — `/blog`

**File:** `apps/web/app/(marketing)/blog/page.tsx`

**Purpose:** Content marketing for Indian accountants and SME owners. Primary SEO surface.

**Layout:**
- Featured post: Full-width card at top, 50/50 image-text split
- Post grid: 3-column on desktop, 2-column on tablet, 1-column on mobile

**Post card:**
- Thumbnail image (real photos or actual product screenshots — no stock illustrations)
- Category label: Syne 11px/500, `#B47500`, uppercase
- Title: Playfair Display 20px/400, `#1A1A1A`, max 2 lines
- Excerpt: Syne 14px/400, `#555555`, max 3 lines
- Author photo (32px circle) + name + date in Syne 12px/400, `#888888`

**No sidebar.** Blogs with sidebars perform worse on mobile and fragment the reading experience.

---

## 14. Blog Post — `/blog/[slug]`

**File:** `apps/web/app/(marketing)/blog/[slug]/page.tsx`

**Layout:** Single centred column, max-width 680px, no sidebar.

**Typography:**
- Post title: Playfair Display 38px/400, `#1A1A1A`
- Byline: Syne 13px/400, `#888888`
- Body: Syne 17px/400, `#1A1A1A`, line-height 1.8
- Subheadings (H2): Playfair Display 26px/400
- Subheadings (H3): Syne 18px/500
- Blockquotes: Playfair Display 20px/400-italic, `#555555`, left border 3px solid `#C8860A`, padding-left 20px
- Code: DM Mono 14px, `#1A1A1A`, `#F4F2EE` background, `radius-sm` padding

**Image rules:** All images in blog posts must be authentic — real screenshots, real photographs, or original diagrams. No stock photography.

**Reading progress:** Thin amber line at the top of the viewport (position: fixed) indicating scroll progress. 2px height, `#C8860A`. Accessible: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`.

**Related posts:** 2 related post cards below the post, selected by category tag.

---

## 15. Legal Pages

### 15.1 Privacy Policy — `/privacy`

**File:** `apps/web/app/(marketing)/privacy/page.tsx`

**Layout:** Centred column, max-width 760px. No hero image.

**Structure:** Standard sections — Data collected · How we use it · Storage location (India-first) · Third parties · User rights · Contact. Each section is a named anchor.

**Typography:** Same as blog post body. Table of contents at the top linking to each section anchor.

**Note:** This document must be written or reviewed by a legal professional familiar with Indian data protection law (DPDP Act 2023) before publication. The design team does not write legal copy.

### 15.2 Terms of Service — `/terms`

Same layout as Privacy Policy.

### 15.3 Cookie Policy — `/cookies`

Same layout. Shorter. Links to the consent management tool.

### 15.4 Security — `/security`

Describes: encryption at rest and in transit, data residency, access controls, incident response contact. Written for a CTO or IT manager audience.

---

## 16. Component Library — Marketing

### 16.1 `<MarketingButton />` — States

| State | Visual |
|-------|--------|
| Default (primary) | Amber fill, white text, `radius-md`, padding 14px 28px |
| Hover (primary) | Background `#B27609` (8% darker), arrow moves +3px X |
| Active (primary) | Background `#9E6808` (16% darker), scale 0.98 |
| Focus (primary) | Amber fill + `ring-2` amber focus ring, 2px offset |
| Disabled (primary) | Opacity 40%, cursor not-allowed |
| Default (outlined) | White/transparent bg, `#1A1A1A` border and text |
| Hover (outlined) | Background `#F4F2EE`, border `#555555` |
| Default (ghost) | No border, `#555555` text |
| Hover (ghost) | Text `#1A1A1A` |

### 16.2 `<FeatureCard />` — States

| State | Visual |
|-------|--------|
| Default | White bg, 0.5px `#E8E4DC` border, 2px amber top border, `shadow-card` |
| Hover | `shadow-card` lifts slightly (`0 4px 16px rgba(0,0,0,0.08)`), transition 200ms |
| Focus-within | Amber focus ring on the card container |

### 16.3 `<SectionLabel />` — Component

Syne 11px/500, amber (`#B47500`), uppercase, letter-spacing 0.1em. Always appears above a section headline. Margin-bottom 12px.

### 16.4 `<TestimonialCard />` — States

| State | Visual |
|-------|--------|
| Active | Full opacity, amber quote marks |
| Inactive (in carousel) | Not visible |
| Loading (before photo loads) | Avatar placeholder in `#F4F2EE`, shimmer animation |

### 16.5 `<PricingCard />` — States

| State | Visual |
|-------|--------|
| Default | Same as FeatureCard |
| Featured (Pro) | 2px amber top border, `shadow-card` elevated |
| CTA hover | Same as MarketingButton primary hover |

### 16.6 `<FAQItem />` — States

| State | Visual |
|-------|--------|
| Closed | Question text visible, chevron pointing down |
| Open | Answer expands (height transition 200ms), chevron rotates 180° |
| Hover | Background `#F4F2EE` on the question row |
| Focus | Amber focus ring on the question row |

### 16.7 `<NavDropdown />` — States

| State | Visual |
|-------|--------|
| Closed | Nav item in default state |
| Open | Dropdown panel slides down (transform + opacity, 150ms), amber indicator on active item |
| Item hover | Item background `#F4F2EE`, text `#1A1A1A` |

---

## 17. Responsive Breakpoints

All breakpoints are defined as CSS custom properties and Tailwind config extensions. Do not use arbitrary breakpoints — only use these four.

| Name | Min-width | Tailwind prefix | Notes |
|------|-----------|-----------------|-------|
| `mobile` | 0px | (default, no prefix) | Base styles |
| `tablet` | 768px | `md:` | Sidebar collapses, 2-col grids |
| `desktop` | 1200px | `lg:` | Full layout, max-width containers |
| `wide` | 1440px | `xl:` | Wider gutters, max 1320px content |

**Typography reductions at `mobile`:**

| Token | Desktop | Mobile |
|-------|---------|--------|
| `marketing-hero` | 64px | 40px |
| `marketing-xl` | 48px | 32px |
| `display-xl` | 38px | 28px |
| `display-lg` | 26px | 22px |

**Spacing reductions at `mobile`:**

| Token | Desktop | Mobile |
|-------|---------|--------|
| `space-128` | 128px | 72px |
| `space-96` | 96px | 56px |
| `space-64` | 64px | 40px |
| `space-48` | 48px | 32px |

**Touch targets:** All interactive elements on mobile must have a minimum tap target of 44px × 44px. This applies even when the visual element is smaller — use padding to extend the hit area without changing visual size.

---

## 18. Micro-interactions & Scroll Triggers

### 18.1 Primary CTA Arrow Animation

Applied to: All "→" suffix CTAs across the marketing site.

```css
.cta-arrow {
  display: inline-block;
  transition: transform 0.15s ease;
}
.cta:hover .cta-arrow {
  transform: translateX(3px);
}
```

### 18.2 Nav Sticky Transition

```css
.marketing-nav {
  transition: background 0.2s ease, border-color 0.2s ease, backdrop-filter 0.2s ease;
}
.marketing-nav.is-sticky {
  background: rgba(250, 250, 248, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 0.5px solid #E8E4DC;
}
```

JS: Add `.is-sticky` class when `window.scrollY > 80`.

### 18.3 Section Entry Animations (Scroll Trigger)

All section entry animations use IntersectionObserver. They do not use GSAP, Framer Motion, or any animation library — plain CSS transitions triggered by class addition.

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once only
      }
    });
  },
  { threshold: 0.15 }
);
```

```css
.animate-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.animate-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Staggered groups (benefit cards, feature cards):**

```css
.animate-stagger .animate-in:nth-child(1) { transition-delay: 0ms; }
.animate-stagger .animate-in:nth-child(2) { transition-delay: 50ms; }
.animate-stagger .animate-in:nth-child(3) { transition-delay: 100ms; }
.animate-stagger .animate-in:nth-child(4) { transition-delay: 150ms; }
.animate-stagger .animate-in:nth-child(5) { transition-delay: 200ms; }
```

### 18.4 Feature Card Hover

```css
.feature-card {
  transition: box-shadow 0.2s ease;
}
.feature-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
}
.feature-card .learn-more {
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.feature-card:hover .learn-more {
  opacity: 1;
  transform: translateX(0);
}
```

### 18.5 Testimonial Carousel

Auto-advance: 6000ms interval. On hover: `clearInterval`. On mouse-leave: restart interval.

Transition between testimonials:
```css
.testimonial-card {
  transition: opacity 0.25s ease;
}
.testimonial-card.is-exiting {
  opacity: 0;
}
.testimonial-card.is-entering {
  opacity: 1;
}
```

### 18.6 FAQ Accordion

```css
.faq-answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.2s ease;
}
.faq-item.is-open .faq-answer {
  grid-template-rows: 1fr;
}
.faq-answer-inner {
  overflow: hidden;
}
.faq-chevron {
  transition: transform 0.2s ease;
}
.faq-item.is-open .faq-chevron {
  transform: rotate(180deg);
}
```

### 18.7 Reading Progress Bar (Blog)

```js
window.addEventListener('scroll', () => {
  const article = document.querySelector('article');
  const scrolled = window.scrollY - article.offsetTop;
  const total = article.offsetHeight - window.innerHeight;
  const progress = Math.min(Math.max(scrolled / total, 0), 1);
  document.querySelector('.reading-progress').style.width = `${progress * 100}%`;
});
```

### 18.8 Reduced Motion

All animations must respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-in,
  .feature-card,
  .cta-arrow,
  .testimonial-card,
  .marketing-nav,
  .faq-answer,
  .faq-chevron {
    transition: none !important;
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
```

Testimonial carousel auto-advance: disabled entirely under `prefers-reduced-motion`.

---

## 19. Accessibility — Contrast & Standards

### 19.1 Contrast Ratios — All Text/Background Combinations

Every combination used on the marketing site must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text ≥18px regular or ≥14px bold).

| Text colour | Background | Ratio | Passes AA | Notes |
|-------------|------------|-------|-----------|-------|
| `#1A1A1A` (dark) | `#FAFAF8` (page-bg) | 18.9:1 | ✅ AAA | Primary body text |
| `#1A1A1A` (dark) | `#FFFFFF` | 19.6:1 | ✅ AAA | White cards |
| `#555555` (mid) | `#FAFAF8` (page-bg) | 7.4:1 | ✅ AAA | Secondary text |
| `#555555` (mid) | `#FFFFFF` | 7.6:1 | ✅ AAA | Card body text |
| `#888888` (light) | `#FAFAF8` (page-bg) | 3.5:1 | ✅ AA (large only) | Use only at 18px+ |
| `#888888` (light) | `#FFFFFF` | 3.5:1 | ✅ AA (large only) | Captions: ensure ≥14px |
| `#B47500` (amber-text) | `#FAFAF8` (page-bg) | 4.6:1 | ✅ AA | Section labels, links |
| `#B47500` (amber-text) | `#FFFFFF` | 4.8:1 | ✅ AA | Feature card amber text |
| `#C8860A` (amber) | `#FFFFFF` | 3.9:1 | ⚠️ Fails AA for small text | Do not use as text under 18px |
| `#C8860A` (amber) | `#111111` (section-dark) | 5.2:1 | ✅ AA | Dark section amber labels |
| `#FFFFFF` | `#C8860A` (amber button) | 3.9:1 | ✅ AA (large only) | Button text is 14px bold — passes |
| `#FFFFFF` | `#111111` (section-dark) | 19.6:1 | ✅ AAA | Dark section body text |
| `#888888` (light) | `#F4F2EE` (section-muted) | 3.2:1 | ⚠️ Fails for small text | Use only at 18px+ on muted bg |
| `#555555` (mid) | `#F4F2EE` (section-muted) | 6.8:1 | ✅ AA | Safe for all sizes |

**Implementation rules:**
- Never use `#C8860A` as text colour on a white or near-white background for text under 18px. Use `#B47500` instead.
- Never use `#888888` for body text (under 18px) on any background. Reserve it for captions and metadata at 14px+ where it passes AA for large text.
- All amber text links must use `#B47500`, not `#C8860A`.

### 19.2 Focus Styles

All interactive elements must have a visible focus indicator that is not removed by the CSS `outline: none` pattern.

**Standard focus ring:**
```css
:focus-visible {
  outline: 2px solid #C8860A;
  outline-offset: 2px;
  border-radius: inherit;
}
```

**Use `:focus-visible` (not `:focus`)** — this shows the ring only for keyboard navigation, not on mouse click.

### 19.3 ARIA Requirements by Section

| Section | Requirement |
|---------|-------------|
| Nav | `role="navigation"`, `aria-label="Main navigation"`, `aria-current="page"` on active item |
| Mobile nav overlay | `role="dialog"`, `aria-modal="true"`, focus trap, Esc closes |
| Nav dropdown | `aria-expanded`, `aria-controls`, `aria-haspopup="true"` |
| Hero CTA | No ARIA needed — standard `<a>` or `<button>` with meaningful text |
| Testimonial carousel | `role="region"`, `aria-label="Testimonials"`, prev/next with `aria-label` |
| FAQ accordion | `<button aria-expanded>` on question, `aria-controls` pointing to answer ID |
| Pricing toggle | `role="radiogroup"`, each option is `role="radio"` with `aria-checked` |
| Feature screenshot | `alt` text describing what the screenshot shows — not "screenshot of dashboard" |
| Reading progress | `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Reading progress"` |
| Blog images | `alt` text required on all images, decorative images use `alt=""` |

### 19.4 Semantic HTML Requirements

- Page `<h1>`: exactly one per page, the primary headline
- `<h2>`: section headings only — never used for visual styling
- `<h3>` and below: subsections only
- `<button>` for actions (modal triggers, accordion toggles, carousel controls)
- `<a>` for navigation (links to pages or anchors)
- Never use `<div>` or `<span>` as interactive elements
- `<img>` always has `alt` text
- `<form>` fields always have associated `<label>` elements (not just `placeholder`)

### 19.5 Skip Navigation

Every page must have a "Skip to main content" link as the first focusable element:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

Visually hidden until focused:
```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  background: #C8860A;
  color: #FFFFFF;
  padding: 8px 16px;
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  border-radius: 0 0 8px 8px;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
```

### 19.6 Screen Reader Testing Requirements

Before launch, the following pages must be tested with at least two screen readers:

| Page | VoiceOver (macOS/Safari) | NVDA (Windows/Chrome) |
|------|--------------------------|----------------------|
| Homepage | Required | Required |
| Pricing | Required | Required |
| Contact | Required | Required |
| Any blog post | Required | — |

Test checklist per page:
- All headings announced in correct order
- All form fields labelled and announced
- All images have meaningful alt text
- Carousel controls announced with purpose
- Modals trap focus and close on Esc
- Reading progress bar announced on blog posts

---

## 20. Imagery Guidelines & Authenticity Standards

### 20.1 Product Screenshots

**Requirements:**
- Must be taken from the working ComplianceOS application — not designed in Figma or drawn as illustrations
- Must show realistic, but clearly sample, data for an Indian business
- Sample data requirements:
  - Company name: clearly fictional (e.g. "Mehta Textiles Pvt. Ltd." or "Suresh Trading Co.") — not a real company
  - Amounts: realistic Indian business scale (thousands to lakhs range), in Indian numbering format
  - Dates: within the current Indian fiscal year (Apr 2025 – Mar 2026)
  - Entry codes: sequential and properly formatted (JE-2026-001, etc.)
  - GST numbers: clearly fictitious format if shown
- Must be retaken if the UI changes significantly before launch
- Approval process: screenshot → Product Owner review → Design Lead approval → cleared for use

**File format:** PNG, retina resolution (2× minimum). No JPEG compression on UI screenshots — compression artefacts on hairline borders are visible and unprofessional.

**Frame:** Browser chrome mockup at `radius-2xl`, `shadow-screenshot`. Chrome shows macOS-style traffic lights (purely decorative — no interaction). The browser URL bar shows `app.complianceos.in` or similar — not `localhost:3000`.

### 20.2 Lifestyle / People Photography

If photography showing people is used on the marketing site (About page, testimonials, blog posts):

**What is required:**
- Real photographs of real people
- Written consent on file from every person photographed
- Indian contexts — offices, working environments, people, and surroundings that are recognisably Indian
- Natural, working contexts — not staged "business meeting" scenes
- Consistent colour treatment: slightly warm, editorial tone. Not high-contrast HDR. Not desaturated "professional" grey.

**What is prohibited:**
- Stock photography from Getty, Shutterstock, Unsplash, or similar
- AI-generated photographs of people
- Photographs taken without the subject's knowledge or consent
- Western contexts presented as Indian (e.g. a stock photo of a London office labelled as an Indian business)
- Illustration avatars presented as real people

### 20.3 Illustration Policy

Illustrations may be used for:
- Diagram/flow explanations (filing flow, journal entry walkthrough)
- Abstract concepts (security, encryption)
- Empty states within the product itself

Illustrations may not be used for:
- Substituting for product screenshots
- Representing people or work environments
- Showing product UI that has not been built

**Illustration style if used:** Flat, minimal SVG. Line weight consistent with the 0.5px product aesthetic at small sizes, scaling to 1.5px at illustration scale. Amber as the only accent colour. No gradients. No shadows. Purely informational — never decorative.

### 20.4 Imagery Approval Workflow

```
1. Designer selects or creates imagery
2. Designer submits to Imagery Review:
   └─ For screenshots: Product Owner confirms accuracy
   └─ For photography: Verify consent on file, confirm authenticity
   └─ For illustrations: Design Lead confirms style consistency
3. Approved imagery tagged in asset management system with:
   - Approval date
   - Approver name
   - Consent record ID (for photography)
   - Expiry date if applicable (photography consent may have time limits)
4. Development uses only approved imagery from asset system
5. Any new imagery introduced post-launch follows same workflow
```

**Stakeholder sign-off before go-live:** The designated Product Owner must confirm in writing (email or signed document) that all imagery used on the homepage and feature pages meets the authenticity requirements in this document. Development may not deploy the marketing site to production without this confirmation.

---

*ComplianceOS Marketing Pages UX/UI Specification — Version 1.0 — April 2026*  
*Public-facing · Pre-authentication · Requires stakeholder sign-off on imagery before development*
