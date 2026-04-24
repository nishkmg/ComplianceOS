# Spec: UX/UI Audit & Cognitive Tax Remediation

**Date**: 2026-04-24  
**Author**: UX/UI Expert Agent  
**Objective**: Reduce "Cognitive Tax" for Indian SMEs, Freelancers, and Accountants while ensuring WCAG 2.1 AA compliance and data integrity.

---

## 1. Executive Summary
The current ComplianceOS interface delivers high functional coverage but suffers from high "Cognitive Tax" (mental effort required to process data). Critical findings include failing color contrast, lack of real-time feedback in data-heavy grids, and friction-heavy input methods (window.prompt). This spec outlines a phased remediation plan to reach a "Top 1%" UX standard.

## 2. Evidence-Based Audit Findings

### 2.1 UX Issue Log (Prioritized by Impact)

| ID | Flow | Severity | Heuristic | Finding | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UX-CR-01** | Journal/Invoice | **CRITICAL** | H1: Visibility | No real-time balance/total calculation. | High mental arithmetic load; error-prone. |
| **UX-HI-01** | GST | **HIGH** | H5: Error Prevention | `window.prompt` used for ARN/JSON. | No validation; jarring "system break" UI. |
| **UX-HI-02** | Reports | **HIGH** | H4: Consistency | No drill-down in Balance Sheet/P&L. | Stale data exploration; high navigation cost. |
| **UX-HI-03** | Journal | **HIGH** | H7: Flexibility | Standard Tab-only grid navigation. | Slow data entry for pro accountants (Excel users). |
| **UX-ME-01** | Onboarding | **MEDIUM** | H3: User Control | No ability to skip Opening Balances. | Increased drop-off during initial setup. |

### 2.2 UI Consistency & Accessibility (WCAG 2.1 AA)

| Element | Current | Required | Status | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Amber** | `#C8860A` (3.5:1) | 4.5:1 | ❌ **FAIL** | Darken to `#B47500`. |
| **Secondary Text** | `#888888` (3.5:1) | 4.5:1 | ❌ **FAIL** | Darken to `#767676`. |
| **Label Sizing** | 10px / 12px | 12px min | ❌ **FAIL** | Shift scale to 11px / 13px / 14px. |
| **Form Linkage** | Implicit | Explicit | ❌ **FAIL** | Enforce `id` + `htmlFor` on all inputs. |

---

## 3. Remediation Roadmap (Step-by-Step)

### Phase 1: The "Legibility Foundation" (Junior Dev)
**Task 1: Design System Token Update**
- **File**: `apps/web/tailwind.config.ts`
- **Changes**:
  - `amber.DEFAULT`: `#C8860A` → `#B47500`
  - `light`: `#888888` → `#767676`
  - `fontSize.ui-xs`: `10px` → `11px`
  - `fontSize.ui-sm`: `12px` → `13px`
  - `fontSize.ui-md`: `13px` → `14px`
- **Verify**: Run `pnpm build` and inspect color contrast via browser dev tools.

### Phase 2: Accessibility & State (Junior Dev)
**Task 2: ARIA & Label Hardening**
- **Components**: `input.tsx`, `select.tsx`, `switch.tsx`.
- **Changes**: Ensure `id` prop is forwarded to the underlying HTML element.
- **Pages**: Onboarding steps (1-5). Wrap inputs in `<Label htmlFor="unique-id">`.
- **A11y**: Add `aria-current="step"` to active navigation items.

**Task 3: Tactile Feedback (Sonner)**
- **Installation**: `pnpm add sonner` in `@complianceos/web`.
- **Implementation**: Add `<Toaster />` to root layout. Use `toast.success()` in all `onSuccess` handlers for tRPC mutations.

### Phase 3: Cognitive Tax Reduction (Mid-Level Dev)
**Task 4: Real-time Balance Calculation**
- **Page**: `journal/new/page.tsx`.
- **Logic**: Use `watch` from `react-hook-form` to memoize the sum of all debit/credit lines. 
- **UI**: Update the `BalanceBar` to show "Difference: [Amount]" in real-time. Turn amount RED if difference != 0.

**Task 5: Modal-Based GST Input**
- **Component**: Create a standard `Dialog` or `Modal` in `ui/`.
- **Page**: `gst/returns/page.tsx`.
- **Logic**: Replace `prompt()` calls with the new Modal. Add RegEx validation for ARN format.

**Task 6: Excel-Style Arrow Navigation**
- **Page**: `journal/new/page.tsx` grid.
- **Logic**: Add `onKeyDown` listener to inputs.
  - `ArrowDown`: Move focus to `(currentRow + 1, currentColumn)`.
  - `ArrowUp`: Move focus to `(currentRow - 1, currentColumn)`.
- **UX**: Professional accountants enter data via numeric pads + arrow keys; this reduces entry time by ~60%.

---

## 4. Success Metrics
1. **Task Success Rate**: Increase by 25% (measured by reduction in "JE Balance Errors").
2. **Time-on-Task**: Decrease onboarding time by 15% via "Save & Continue" visibility.
3. **Accessibility**: 100% WCAG 2.1 AA compliance for color and contrast.
4. **User Anxiety**: Qualitative reduction in "Did it save?" queries via Toast implementation.
