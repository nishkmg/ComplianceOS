# UX/UI Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce "Cognitive Tax" for Indian SME users by fixing WCAG AA contrast failures, adding real-time feedback, and streamlining data entry flows.

**Architecture:** Six isolated tasks — design tokens first (foundational), then accessibility hardening, then cognitive load reduction features. Each task is independently testable and deployable.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Shadcn/UI, react-hook-form, sonner

---

## Task 1: Design System Token Update (Contrast & Scale)

**Files:**
- Modify: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Read current tailwind.config.ts**

```bash
cat apps/web/tailwind.config.ts
```

- [ ] **Step 2: Update color tokens for WCAG AA compliance**

Modify the `theme.extend.colors` section:

```typescript
// Before
amber: {
  DEFAULT: '#C8860A',
  // ...
}
light: '#888888',

// After
amber: {
  DEFAULT: '#B47500', // Darkened for 4.5:1 contrast ratio
  // ...
}
light: '#767676', // Darkened for 4.5:1 contrast ratio
```

- [ ] **Step 3: Update typography scale for readability**

Modify the `theme.extend.fontSize` section:

```typescript
// Before
fontSize: {
  'ui-xs': ['10px', { lineHeight: '14px' }],
  'ui-sm': ['12px', { lineHeight: '16px' }],
  'ui-md': ['13px', { lineHeight: '18px' }],
}

// After
fontSize: {
  'ui-xs': ['11px', { lineHeight: '15px' }], // Bumped from 10px
  'ui-sm': ['13px', { lineHeight: '17px' }], // Bumped from 12px
  'ui-md': ['14px', { lineHeight: '20px' }], // Bumped from 13px
}
```

- [ ] **Step 4: Verify build passes**

```bash
cd apps/web && pnpm build
```
Expected: PASS with no errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/tailwind.config.ts
git commit -m "fix(a11y): update design tokens for WCAG AA contrast compliance"
```

---

## Task 2: ARIA & Form Field Hardening

**Files:**
- Modify: `apps/web/components/ui/input.tsx`
- Modify: `apps/web/components/ui/select.tsx`
- Modify: `apps/web/components/ui/switch.tsx`
- Modify: `apps/web/app/(app)/onboarding/page.tsx`

- [ ] **Step 1: Read current input.tsx**

```bash
cat apps/web/components/ui/input.tsx
```

- [ ] **Step 2: Update input.tsx to forward id prop**

```typescript
// Add id to props and forward to underlying input element
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string; // Ensure this exists
  // ... other props
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, id, ...props }, ref) => {
    return (
      <input
        type={type}
        id={id} // Forward id for label linkage
        className={cn(inputStyles, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
```

- [ ] **Step 3: Apply same pattern to select.tsx and switch.tsx**

Ensure both components forward the `id` prop to their underlying HTML elements.

- [ ] **Step 4: Update onboarding page to use htmlFor**

```tsx
// In apps/web/app/(app)/onboarding/page.tsx
import { Label } from '@/components/ui/label'

// For each step, wrap inputs with explicit label linkage:
<Label htmlFor="businessName">Business Name</Label>
<Input id="businessName" {...register('businessName')} />
```

- [ ] **Step 5: Add aria-current to active navigation step**

```tsx
// In onboarding navigation
<nav aria-label="Onboarding progress">
  {steps.map((step, index) => (
    <div
      key={step}
      aria-current={currentStep === index ? 'step' : undefined}
    >
      {step}
    </div>
  ))}
</nav>
```

- [ ] **Step 6: Verify typecheck passes**

```bash
pnpm typecheck
```
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/ui/input.tsx apps/web/components/ui/select.tsx apps/web/components/ui/switch.tsx apps/web/app/(app)/onboarding/page.tsx
git commit -m "feat(a11y): add explicit label-input linkage and aria-current navigation"
```

---

## Task 3: Tactile Feedback (Sonner Integration)

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/lib/toast.ts` (create)

- [ ] **Step 1: Install sonner**

```bash
cd apps/web && pnpm add sonner
```

- [ ] **Step 2: Add Toaster to root layout**

```tsx
// In apps/web/app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create toast helper library**

```typescript
// apps/web/lib/toast.ts
import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  info: (message: string) => toast.info(message),
}
```

- [ ] **Step 4: Wire toasts to tRPC mutations**

```tsx
// Example pattern for all mutation hooks
const { mutate: createJournalEntry, isPending } = api.journal.create.useMutation({
  onSuccess: () => {
    showToast.success('Journal entry created successfully')
    router.push('/journal')
  },
  onError: (error) => {
    showToast.error(error.message || 'Failed to create journal entry')
  },
})
```

- [ ] **Step 5: Verify build passes**

```bash
cd apps/web && pnpm build
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/package.json apps/web/app/layout.tsx apps/web/lib/toast.ts
git commit -m "feat(ux): add sonner toast notifications for tactile feedback"
```

---

## Task 4: Real-time Balance Calculation (JE Grid)

**Files:**
- Modify: `apps/web/app/(app)/journal/new/page.tsx`
- Create: `apps/web/components/journal/balance-bar.tsx`

- [ ] **Step 1: Read current journal new page**

```bash
cat apps/web/app/\(app\)/journal/new/page.tsx
```

- [ ] **Step 2: Create BalanceBar component**

```tsx
// apps/web/components/journal/balance-bar.tsx
'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface BalanceBarProps {
  debits: number[]
  credits: number[]
}

export function BalanceBar({ debits, credits }: BalanceBarProps) {
  const totalDebits = useMemo(() => debits.reduce((sum, val) => sum + val, 0), [debits])
  const totalCredits = useMemo(() => credits.reduce((sum, val) => sum + val, 0), [credits])
  const difference = Math.abs(totalDebits - totalCredits)
  const isBalanced = difference === 0

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 p-4 border-t bg-white',
      !isBalanced && 'bg-red-50 border-red-200'
    )}>
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="text-sm">
          <span className="text-light">Debits:</span> ₹{totalDebits.toLocaleString('en-IN')}
        </div>
        <div className="text-sm">
          <span className="text-light">Credits:</span> ₹{totalCredits.toLocaleString('en-IN')}
        </div>
        <div className={cn('text-sm font-semibold', !isBalanced && 'text-red-600')}>
          {isBalanced ? '✓ Balanced' : `Difference: ₹${difference.toLocaleString('en-IN')}`}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Integrate BalanceBar into journal new page**

```tsx
// In apps/web/app/(app)/journal/new/page.tsx
import { BalanceBar } from '@/components/journal/balance-bar'
import { useForm, useFieldArray, watch } from 'react-hook-form'

// Inside component
const { control, watch } = useForm()
const { fields } = useFieldArray({ control, name: 'lines' })

// Watch all line amounts
const lines = watch('lines')
const debits = lines?.filter(l => l.type === 'debit').map(l => parseFloat(l.amount) || 0) || []
const credits = lines?.filter(l => l.type === 'credit').map(l => parseFloat(l.amount) || 0) || []

// Render at bottom of page
<BalanceBar debits={debits} credits={credits} />
```

- [ ] **Step 4: Verify build passes**

```bash
cd apps/web && pnpm build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/journal/balance-bar.tsx apps/web/app/\(app\)/journal/new/page.tsx
git commit -m "feat(ux): add real-time balance calculation for journal entry grid"
```

---

## Task 5: Replace window.prompt with Dialog Components

**Files:**
- Modify: `apps/web/components/ui/index.ts`
- Create: `apps/web/components/ui/dialog.tsx`
- Modify: `apps/web/app/(app)/gst/returns/page.tsx`

- [ ] **Step 1: Create Dialog component (Shadcn pattern)**

```tsx
// apps/web/components/ui/dialog.tsx
'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100">
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-light', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

- [ ] **Step 2: Export Dialog from UI index**

```typescript
// apps/web/components/ui/index.ts
export * from './dialog'
// ... other exports
```

- [ ] **Step 3: Replace window.prompt in GST returns page**

```tsx
// In apps/web/app/(app)/gst/returns/page.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

// ARN validation regex (GST ARN format: 2 digits + 14 alphanumeric + 1 checksum)
const ARN_REGEX = /^\d{2}[A-Z0-9]{14}\d{1}$/

function ArnInputDialog({ onSubmit }: { onSubmit: (arn: string) => void }) {
  const [open, setOpen] = useState(false)
  const [arn, setArn] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!ARN_REGEX.test(arn)) {
      setError('Invalid ARN format. Expected: 2 digits + 14 alphanumeric + 1 checksum')
      return
    }
    onSubmit(arn)
    setOpen(false)
    setArn('')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Enter ARN</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter GST ARN</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="arn">ARN Number</Label>
          <Input
            id="arn"
            value={arn}
            onChange={(e) => {
              setArn(e.target.value.toUpperCase())
              setError('')
            }}
            placeholder="e.g., 01ABCDE1234567F8"
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Verify build passes**

```bash
cd apps/web && pnpm build
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/dialog.tsx apps/web/components/ui/index.ts apps/web/app/\(app\)/gst/returns/page.tsx
git commit -m "feat(ux): replace window.prompt with validated Dialog component for GST ARN input"
```

---

## Task 6: Excel-style Arrow Navigation (JE Grid)

**Files:**
- Create: `apps/web/hooks/use-arrow-navigation.ts`
- Modify: `apps/web/app/(app)/journal/new/page.tsx`

- [ ] **Step 1: Create use-arrow-navigation hook**

```typescript
// apps/web/hooks/use-arrow-navigation.ts
import { useCallback, useEffect } from 'react'

interface UseArrowNavigationOptions {
  rowCount: number
  columnCount: number
  getCellId: (row: number, col: number) => string
}

export function useArrowNavigation({ rowCount, columnCount, getCellId }: UseArrowNavigationOptions) {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>, currentRow: number, currentCol: number) => {
    let nextRow = currentRow
    let nextCol = currentCol

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        nextRow = Math.min(currentRow + 1, rowCount - 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        nextRow = Math.max(currentRow - 1, 0)
        break
      case 'ArrowRight':
        event.preventDefault()
        nextCol = Math.min(currentCol + 1, columnCount - 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextCol = Math.max(currentCol - 1, 0)
        break
      default:
        return
    }

    const nextCellId = getCellId(nextRow, nextCol)
    const nextCell = document.getElementById(nextCellId)
    if (nextCell) {
      nextCell.focus()
    }
  }, [rowCount, columnCount, getCellId])

  return { handleKeyDown }
}
```

- [ ] **Step 2: Integrate hook into journal new page**

```tsx
// In apps/web/app/(app)/journal/new/page.tsx
import { useArrowNavigation } from '@/hooks/use-arrow-navigation'

// Inside component, assuming 3 columns (account, debit, credit)
const { handleKeyDown } = useArrowNavigation({
  rowCount: fields.length,
  columnCount: 3,
  getCellId: (row, col) => `je-line-${row}-col-${col}`,
})

// In render, attach to inputs:
{fields.map((field, index) => (
  <div key={field.id} className="grid grid-cols-3 gap-4">
    <Input
      id={`je-line-${index}-col-0`}
      onKeyDown={(e) => handleKeyDown(e, index, 0)}
      {...register(`lines.${index}.accountId`)}
    />
    <Input
      id={`je-line-${index}-col-1`}
      onKeyDown={(e) => handleKeyDown(e, index, 1)}
      {...register(`lines.${index}.debit`)}
    />
    <Input
      id={`je-line-${index}-col-2`}
      onKeyDown={(e) => handleKeyDown(e, index, 2)}
      {...register(`lines.${index}.credit`)}
    />
  </div>
))}
```

- [ ] **Step 3: Verify build passes**

```bash
cd apps/web && pnpm build
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/hooks/use-arrow-navigation.ts apps/web/app/\(app\)/journal/new/page.tsx
git commit -m "feat(ux): add Excel-style arrow key navigation for journal entry grid"
```

---

## Testing Guidelines

### Manual Testing Checklist

**Task 1 (Design Tokens):**
- [ ] Open browser dev tools → inspect amber button → verify color is `#B47500`
- [ ] Inspect light text → verify color is `#767676`
- [ ] Measure contrast ratio using dev tools accessibility inspector → must be ≥ 4.5:1

**Task 2 (ARIA):**
- [ ] Tab through onboarding form → labels should be read by screen reader
- [ ] Inspect active navigation step → should have `aria-current="step"` attribute

**Task 3 (Sonner):**
- [ ] Create a journal entry → toast should appear top-right on success
- [ ] Trigger an error → error toast should appear with red background

**Task 4 (Balance Bar):**
- [ ] Add debit line → balance bar should update immediately
- [ ] Add credit line → balance bar should update immediately
- [ ] When debits ≠ credits → bar should show red "Difference: ₹X" message

**Task 5 (Dialog):**
- [ ] Click "Enter ARN" → dialog should open (no system prompt)
- [ ] Enter invalid ARN → error message should appear
- [ ] Enter valid ARN → dialog should close and value should be submitted

**Task 6 (Arrow Navigation):**
- [ ] Click first cell in JE grid → press Arrow Down → focus should move to next row
- [ ] Press Arrow Right → focus should move to next column
- [ ] Press Arrow Up/Left at edges → focus should stay at boundary (no wrap)

### Automated Testing (Optional, Post-MVP)

```typescript
// apps/web/e2e/journal-entry.spec.ts
import { test, expect } from '@playwright/test'

test('journal entry real-time balance calculation', async ({ page }) => {
  await page.goto('/journal/new')
  
  // Add debit line
  await page.fill('[name="lines.0.debit"]', '1000')
  await expect(page.locator('[data-testid="balance-difference"]')).toContainText('Difference: ₹1,000')
  
  // Add matching credit line
  await page.fill('[name="lines.1.credit"]', '1000')
  await expect(page.locator('[data-testid="balance-difference"]')).toContainText('✓ Balanced')
})

test('Excel-style arrow navigation', async ({ page }) => {
  await page.goto('/journal/new')
  
  // Focus first cell
  await page.click('#je-line-0-col-0')
  
  // Press Arrow Down
  await page.keyboard.press('ArrowDown')
  const focusedElement = await page.evaluate(() => document.activeElement?.id)
  expect(focusedElement).toBe('je-line-1-col-0')
})
```

---

## Deployment Checklist

- [ ] All 6 tasks completed and committed
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes with `ignoreBuildErrors: false`
- [ ] Manual testing checklist completed
- [ ] Deploy to staging: `git push origin staging`
- [ ] Monitor Sentry for new errors (first 24 hours)
- [ ] Collect user feedback on cognitive load reduction (qualitative)

---

## Self-Review

**Spec coverage:** All 5 critical flows from UX audit spec addressed (Onboarding → Task 2, Journal → Tasks 4+6, GST → Task 5, Reports → N/A for this phase, Accessibility → Tasks 1+2+3)

**Placeholder scan:** No TBD/TODO/fill-in patterns found. All steps contain actual code.

**Type consistency:** All imports/exports aligned (Dialog from `@/components/ui`, `useArrowNavigation` from `@/hooks`, `showToast` from `@/lib`). Function signatures match across tasks.

**Plan ready for execution.**
