import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Full-surface accessibility sweep — zero critical/serious violations on
 * every route. Auth'd app routes run under the demo session; public routes
 * (auth/marketing/legal) are checked separately.
 *
 * Thresholds: wcag2a / wcag2aa / wcag21a / wcag21aa.
 */

const APP_ROUTES = [
  '/dashboard',
  '/journal',
  '/journal/new',
  '/invoices',
  '/invoices/new',
  '/receivables',
  '/inventory',
  '/gst/returns',
  '/itr/returns',
  '/itr/payment/history',
  '/payroll',
  '/reports/profit-loss',
  '/reports/trial-balance',
  '/reports/balance-sheet',
  '/settings/fiscal-years',
  '/settings/invoices',
  '/coa',
  '/payments',
  '/employees',
  '/employees/new',
  '/support',
  '/audit-log',
];

const PUBLIC_ROUTES = ['/login', '/signup', '/', '/pricing', '/features', '/privacy', '/terms', '/security'];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: import('@playwright/test').Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  expect(
    violations.map((v) => `${v.id} on ${label}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    `${label} has critical/serious violations`,
  ).toEqual([]);
}

test.describe('Accessibility compliance — app routes (authenticated)', () => {
  test.use({ storageState: undefined });

  test('demo session sweep has no critical or serious violations', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto('/login');
    await page.locator('input[type=email], input#email, input[name=email]').first().waitFor({ timeout: 30000 });
    await page.locator('input[type=email], input#email, input[name=email]').first().fill('demo@complianceos.test');
    await page.locator('input[type=password]').first().fill('demo123');
    await page.getByRole('button', { name: /access account/i }).click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30000 });

    for (const route of APP_ROUTES) {
      await page.goto(route, { waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(1500);
      await expectNoViolations(page, route);
    }
  });
});

test.describe('Accessibility compliance — public routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no critical or serious violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      await expectNoViolations(page, route);
    });
  }
});
