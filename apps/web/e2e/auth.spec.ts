import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show login page', async ({ page }) => {
    await expect(page).toHaveTitle(/ComplianceOS/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should fail login with invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page.getByText(/invalid credentials|error/i)).toBeVisible();
  });

  test('should redirect to onboarding after login for new user', async ({ page }) => {
    await page.getByLabel('Email').fill('demo@complianceos.test');
    await page.getByLabel('Password').fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('should protect app routes from unauthenticated access', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect journal routes from unauthenticated access', async ({ page }) => {
    await page.goto('/journal');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should protect settings routes from unauthenticated access', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});
