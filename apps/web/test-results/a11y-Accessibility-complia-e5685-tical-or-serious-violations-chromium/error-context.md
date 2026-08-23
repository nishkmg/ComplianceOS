# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> Accessibility compliance — app routes (authenticated) >> demo session sweep has no critical or serious violations
- Location: e2e/a11y.spec.ts:113:7

# Error details

```
Error: page.waitForURL: net::ERR_TOO_MANY_REDIRECTS
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This page isn’t working" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: redirected you too many times.
    - generic [ref=e10]:
      - paragraph
      - list [ref=e11]:
        - listitem [ref=e12]:
          - link "Try deleting your cookies" [ref=e13] [cursor=pointer]:
            - /url: https://support.google.com/chrome?p=rl_error&hl=en-GB
          - text: .
    - generic [ref=e14]: ERR_TOO_MANY_REDIRECTS
  - button "Reload" [ref=e17] [cursor=pointer]
```

# Test source

```ts
  20  |   '/inventory/products',
  21  |   '/inventory/products/new',
  22  |   '/inventory/reports',
  23  |   '/inventory/stock',
  24  |   '/gst/returns',
  25  |   '/inventory/reports/expiry',
  26  |   '/reports/pl',
  27  |   '/forgot-password',
  28  |   '/reset-password',
  29  |   '/about',
  30  |   '/blog',
  31  |   '/contact',
  32  |   '/contact/success',
  33  |   '/cookies',
  34  |   '/features/accounting',
  35  |   '/features/gst',
  36  |   '/features/invoicing',
  37  |   '/features/itr',
  38  |   '/features/payroll',
  39  |   '/credit-notes',
  40  |   '/credit-notes/new',
  41  |   '/payables',
  42  |   '/payables/new',
  43  |   '/gst/hsn-master',
  44  |   '/inventory/operations',
  45  |   '/inventory/movements',
  46  |   '/settings',
  47  |   '/settings/company',
  48  |   '/settings/users',
  49  |   '/gst/ledger',
  50  |   '/gst/ledger/cash',
  51  |   '/gst/ledger/itc',
  52  |   '/gst/ledger/liability',
  53  |   '/gst/payment',
  54  |   '/gst/payment/history',
  55  |   '/gst/reconciliation',
  56  |   '/gst/reconciliation/mismatches',
  57  |   '/itr/returns',
  58  |   '/itr/computation',
  59  |   '/itr/computation/presumptive-scheme',
  60  |   '/itr/computation/regime-comparison',
  61  |   '/itr/payment',
  62  |   '/itr/payment/advance-tax',
  63  |   '/itr/payment/history',
  64  |   '/itr/payment/self-assessment',
  65  |   '/payroll',
  66  |   '/payroll/process',
  67  |   '/payroll/team-salary-preview',
  68  |   '/payroll-reports',
  69  |   '/payroll-reports/pf-challan',
  70  |   '/payroll-reports/esi-challan',
  71  |   '/payroll-reports/form-16',
  72  |   '/my-payslips',
  73  |   '/reports/profit-loss',
  74  |   '/reports/trial-balance',
  75  |   '/reports/balance-sheet',
  76  |   '/reports/cash-flow',
  77  |   '/reports/ledger',
  78  |   '/settings/fiscal-years',
  79  |   '/settings/invoices',
  80  |   '/coa',
  81  |   '/accounts',
  82  |   '/accounts/new',
  83  |   '/payments',
  84  |   '/payments/new',
  85  |   '/employees',
  86  |   '/employees/new',
  87  |   '/support',
  88  |   '/audit-log',
  89  |   '/access-denied',
  90  |   '/onboarding',
  91  |   '/receipts/scan',
  92  |   '/invoices/scan',
  93  |   '/payroll/success',
  94  |   '/itr/payment/recording',
  95  | ];
  96  | 
  97  | const PUBLIC_ROUTES = ['/login', '/signup', '/', '/pricing', '/features', '/privacy', '/terms', '/security', '/features/inventory', '/features/e-invoice', '/demo', '/use-cases/ca-firms', '/compare/tally', '/compare/zoho-books', '/integrations', '/calculators'];
  98  | 
  99  | const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  100 | 
  101 | async function expectNoViolations(page: import('@playwright/test').Page, label: string) {
  102 |   const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  103 |   const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  104 |   expect(
  105 |     violations.map((v) => `${v.id} on ${label}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
  106 |     `${label} has critical/serious violations`,
  107 |   ).toEqual([]);
  108 | }
  109 | 
  110 | test.describe('Accessibility compliance — app routes (authenticated)', () => {
  111 |   test.use({ storageState: undefined });
  112 | 
  113 |   test('demo session sweep has no critical or serious violations', async ({ page }) => {
  114 |     test.setTimeout(300_000);
  115 |     await page.goto('/login');
  116 |     await page.locator('input[type=email], input#email, input[name=email]').first().waitFor({ timeout: 30000 });
  117 |     await page.locator('input[type=email], input#email, input[name=email]').first().fill('demo@complianceos.test');
  118 |     await page.locator('input[type=password]').first().fill('demo123');
  119 |     await page.getByRole('button', { name: /access account/i }).click();
> 120 |     await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });
      |                ^ Error: page.waitForURL: net::ERR_TOO_MANY_REDIRECTS
  121 | 
  122 |     for (const route of APP_ROUTES) {
  123 |       await page.goto(route, { waitUntil: 'load' }).catch(() => {});
  124 |       await page.waitForTimeout(1500);
  125 |       await expectNoViolations(page, route);
  126 |     }
  127 |   });
  128 | });
  129 | 
  130 | test.describe('Accessibility compliance — public routes', () => {
  131 |   for (const route of PUBLIC_ROUTES) {
  132 |     test(`${route} has no critical or serious violations`, async ({ page }) => {
  133 |       await page.goto(route, { waitUntil: 'load' });
  134 |       await page.waitForTimeout(1500);
  135 |       await expectNoViolations(page, route);
  136 |     });
  137 |   }
  138 | });
  139 | 
```