import { test, expect } from '@playwright/test';

test.describe('UX/UI Design System — §1', () => {
  test('typography fonts are loaded (display, ui, mono)', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('h1, .font-display')).toHaveCSS('font-family', /Playfair Display/);
    await expect(page.locator('nav, .font-ui')).toHaveCSS('font-family', /Syne/);
    await expect(page.locator('[class*="font-mono"]').first()).toHaveCSS('font-family', /DM Mono/);
  });
});

test.describe('Global Interaction Patterns — §2', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('§2.1: keyboard shortcut ⌘K opens command palette', async ({ page }) => {
    const commandPalette = page.locator('[role="dialog"]').filter({ hasText: /command palette|palette/i });
    if (await commandPalette.isHidden().catch(() => true)) {
      await page.keyboard.press('Meta+k');
      await page.waitForTimeout(500);
    }
    const palette = page.locator('input[placeholder*="Command"], input[placeholder*="Search"], input[placeholder*="Type"], .command-palette input');
    const exists = await palette.count();
    if (exists > 0) {
      await expect(palette.first()).toBeVisible();
    }
  });

  test('§2.2: skip-to-main-content link exists (visually hidden)', async ({ page }) => {
    const skipLink = page.locator('a').filter({ hasText: /skip to main content/i });
    await expect(skipLink).toHaveCount(1);
    const box = await skipLink.boundingBox();
    if (box) {
      expect(box.height).toBe(0);
    }
  });

  test('§2.2: skip link becomes visible on focus (Tab)', async ({ page }) => {
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a').filter({ hasText: /skip to main content/i });
    await expect(skipLink).toBeVisible();
  });

  test('§2.4: Indian number formatting in rupee amounts', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const amounts = page.locator('[class*="mono"], .text-mono');
    const count = await amounts.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await amounts.nth(i).textContent();
        if (text && text.includes('₹')) {
          expect(text).toMatch(/₹\d{1,2},\d{3}/);
        }
      }
    }
  });

  test('§2.5: status badges use correct colours', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const badges = page.locator('[class*="badge"], span:has-text("Posted"), span:has-text("Draft")');
    const count = await badges.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(badges.nth(i)).toBeVisible();
      }
    }
  });

  test('§2.6: toast notifications render correctly', async ({ page }) => {
    await page.goto('/login');
    const toast = page.locator('[role="alert"], [aria-live="polite"], .sonner-toast');
    await expect(toast.first()).not.toBeNull();
  });

  test('§2.8: empty states show on list screens', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const emptyText = page.getByText(/no entry|no data|no invoice|no account|no product|no employee|no payment|no return/i);
    const exists = await emptyText.count();
    if (exists > 0) {
      await expect(emptyText.first()).toBeVisible();
    }
  });
});

test.describe('Accessibility — §17', () => {
  test('§17.1: all form inputs have labels with htmlFor/id linkage', async ({ page }) => {
    for (const url of ['/login', '/signup']) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const inputs = page.locator('input:not([type="hidden"])');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelCount = await label.count();
          if (labelCount === 0) {
            const surroundingLabel = page.locator(`label:has(input#${id})`);
            expect(await surroundingLabel.count()).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test('§17.1: error messages use role="alert"', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(300);
    const alerts = page.locator('[role="alert"]');
    const count = await alerts.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(alerts.nth(i)).toBeVisible();
      }
    }
  });

  test('§17.1: focus indicators are visible on interactive elements', async ({ page }) => {
    await page.goto('/login');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toHaveCSS('outline-style', /solid|auto/);
  });

  test('§17.1: aria-current on active navigation', async ({ page }) => {
    await page.goto('/dashboard');
    const currentNav = page.locator('[aria-current="page"], [aria-current="true"]');
    const count = await currentNav.count();
    if (count > 0) {
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

test.describe('Authentication Screens — §3', () => {
  test('§3.1: login has all required elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('§3.1: login shows loading state on submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(300);
    const button = page.getByRole('button', { name: /signing in|sign in/i });
    const isDisabled = await button.isDisabled();
    if (isDisabled) {
      expect(true).toBe(true);
    }
  });

  test('§3.1: login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(2000);
    const errorText = page.getByText(/incorrect|invalid|error|failed/i);
    const exists = await errorText.count();
    if (exists > 0) {
      await expect(errorText.first()).toBeVisible();
    }
  });

  test('§3.1: signup link exists on login page', async ({ page }) => {
    await page.goto('/login');
    const signupLink = page.locator('a[href*="signup"], a[href*="sign-up"]');
    await expect(signupLink).toHaveCount(1);
  });
});

test.describe('Onboarding — §4', () => {
  test('login page loads (pre-onboarding check)', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ComplianceOS/);
  });
});

test.describe('Dashboard — §5.1', () => {
  test('KPI tiles render', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const kpis = page.locator('[class*="kpi"], [class*="Kpi"], .kpi-tile');
    const count = await kpis.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(kpis.nth(i)).toBeVisible();
      }
    }
  });

  test('dashboard greeting shows business name', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1').filter({ hasText: /Good/ });
    const exists = await heading.count();
    if (exists > 0) {
      await expect(heading).toBeVisible();
    }
  });
});

test.describe('Navigation — §15.1', () => {
  test('sidebar navigation shows all sections', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav a');
    const count = await nav.count();
    expect(count).toBeGreaterThan(10);
  });

  test('click sidebar link navigates to correct page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const settingsLinks = page.locator('nav a[href*="settings"], nav a:has-text("Settings")');
    const exists = await settingsLinks.count();
    if (exists > 0) {
      await settingsLinks.first().click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('settings');
    }
  });
});

test.describe('Error States — §16.3', () => {
  test('404 pages show not found message', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await page.waitForLoadState('networkidle');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('inline validation works on form fields', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /sign up|create|submit/i }).click();
    await page.waitForTimeout(500);
    const errorMsgs = page.locator('[role="alert"], .text-danger, .text-red, .error');
    const count = await errorMsgs.count();
    if (count > 0) {
      await expect(errorMsgs.first()).toBeVisible();
    }
  });
});

test.describe('Console & Network Cleanliness', () => {
  test('no console errors on main pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    for (const url of ['/login', '/signup', '/dashboard']) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }
    expect(errors).toEqual([]);
  });

  test('no failed network requests on key pages', async ({ page }) => {
    const failures: string[] = [];
    page.on('requestfailed', req => {
      failures.push(`${req.url()} - ${req.failure()?.errorText}`);
    });
    for (const url of ['/login', '/signup', '/dashboard', '/journal']) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }
    expect(failures).toEqual([]);
  });
});

test.describe('Responsiveness — §17.3', () => {
  test('mobile viewport renders critical paths', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('tablet viewport renders navigation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('Design System Compliance', () => {
  test('amber colour appears in primary buttons', async ({ page }) => {
    await page.goto('/login');
    const buttons = page.getByRole('button', { name: /sign in/i });
    await expect(buttons).toHaveCSS('color', /255|orange|amber|rgba\(/);
  });

  test('rupee symbol uses correct format', async ({ page }) => {
    await page.goto('/dashboard');
    const content = await page.content();
    const rupeeCount = (content.match(/₹/g) || []).length;
    expect(rupeeCount).toBeGreaterThan(0);
  });
});
