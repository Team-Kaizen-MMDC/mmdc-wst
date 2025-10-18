import { test, expect } from '@playwright/test';

test.describe('Mobile offcanvas navigation', () => {
    test.use({ viewport: { width: 375, height: 800 } });

    test('offcanvas opens, navigates (hash), navigates (page), then closes with focus restored', async ({ page }) => {
        await page.goto('/');

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await expect(toggler).toBeVisible();
        await toggler.click();

        // Offcanvas should be visible
        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Click a hash link like Jobs
        const jobsLink = offcanvas.locator('.nav-link[href="#jobs"]');
        await jobsLink.click();

        // Wait for scroll or hash change
        await page.waitForTimeout(300);
        expect(page.url()).toContain('#jobs');

        // Re-open offcanvas to test page nav
        await toggler.click();
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Navigate to a real page like Agency
        const agencyLink = offcanvas.locator('a.nav-link[href*="agency.html"]');
        await agencyLink.click();
        await page.waitForLoadState('load');
        expect(page.url()).toContain('agency.html');

        // Go back to homepage
        await page.goBack();
        await page.waitForLoadState('load');

        // Open offcanvas again, then close it
        await toggler.click();
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        const closeBtn = offcanvas.locator('.btn-close');
        await closeBtn.click();
        await expect(offcanvas).not.toBeVisible({ timeout: 3000 });

        // Focus should return to toggler
        const focusedHandle = await page.evaluateHandle(() => document.activeElement);
        const focusedElement = focusedHandle.asElement();
        expect(await focusedElement?.getAttribute('data-bs-toggle')).toBe('offcanvas');
    });

    test('offcanvas works on job pages', async ({ page }) => {
        await page.goto('/pages/jobs/ward-nursing-support.html');

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await expect(toggler).toBeVisible();
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Check Jobs link exists
        const jobsLink = offcanvas.locator('.nav-link[href="#jobs"]');
        await expect(jobsLink).toBeVisible();

        // Close offcanvas
        const closeBtn = offcanvas.locator('.btn-close');
        await closeBtn.click();
        await expect(offcanvas).not.toBeVisible({ timeout: 3000 });
    });

    test('offcanvas works on company pages', async ({ page }) => {
        await page.goto('/pages/companies/ana.html');

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await expect(toggler).toBeVisible();
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Check Companies link exists
        const companiesLink = offcanvas.locator('.nav-link[href="#companies"]');
        await expect(companiesLink).toBeVisible();

        // Close offcanvas
        const closeBtn = offcanvas.locator('.btn-close');
        await closeBtn.click();
        await expect(offcanvas).not.toBeVisible({ timeout: 3000 });
    });

    test('offcanvas works on dashboard pages', async ({ page }) => {
        await page.goto('/pages/profileDashboard.html');

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await expect(toggler).toBeVisible();
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Close offcanvas
        const closeBtn = offcanvas.locator('.btn-close');
        await closeBtn.click();
        await expect(offcanvas).not.toBeVisible({ timeout: 3000 });
    });

    test('offcanvas auth buttons work correctly', async ({ page }) => {
        await page.goto('/');

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Check Signup button
        const signupBtn = offcanvas.locator('.btn:has-text("Signup")');
        await expect(signupBtn).toBeVisible();
        await expect(signupBtn).toHaveAttribute('href', /createAccount\.html/);

        // Check Login button
        const loginBtn = offcanvas.locator('.btn:has-text("Login")');
        await expect(loginBtn).toBeVisible();
        await expect(loginBtn).toHaveAttribute('href', /signin\.html/);
    });
});
