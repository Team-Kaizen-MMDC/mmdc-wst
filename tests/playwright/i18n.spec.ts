import { test, expect } from '@playwright/test';

test.describe('i18n and language toggle', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('language toggle injects and toggles site text (EN -> JA)', async ({ page }) => {
        const headerToggle = page.locator('#lang-toggle');
        await expect(headerToggle).toBeVisible();

        // Intercept locale request to ensure it's requested
        let requested = false;
        await page.route('**/locales/ja.json', async (route) => {
            requested = true;
            await route.continue();
        });

        // Toggle to Japanese (check=true)
        await headerToggle.check();
        await page.waitForTimeout(200);

        expect(requested).toBeTruthy();

        // Desktop nav should translate
        await expect(page.locator('a.site-header__nav-link', { hasText: '求人' })).toBeVisible();

        // Check offcanvas title translates when opened in mobile viewport
        await page.setViewportSize({ width: 375, height: 800 });
        await page.locator('[data-bs-toggle="offcanvas"]').click();
        await expect(page.locator('#siteOffcanvasLabel')).toHaveText('メニュー');
        await page.locator('.offcanvas .btn-close').click();
    });

    test('language preference persists in localStorage', async ({ page }) => {
        const headerToggle = page.locator('#lang-toggle');
        await headerToggle.check();
        await page.waitForTimeout(200);
        const lang = await page.evaluate(() => localStorage.getItem('preferred_language'));
        expect(lang).toBe('ja');
    });

    test('fallback to English when locale file returns 404', async ({ page }) => {
        await page.route('**/locales/ja.json', (route) => route.fulfill({ status: 404, body: '{}' }));
        await page.goto('/');
        const headerToggle = page.locator('#lang-toggle');
        await headerToggle.check();
        await page.waitForTimeout(200);
        const headerText = await page.locator('header').innerText();
        expect(headerText).not.toContain('nav.jobs');
        expect(headerText).toContain('Jobs');
    });

    test('language toggle works on job detail pages', async ({ page }) => {
        await page.goto('/pages/jobs/ward-nursing-support.html');
        const headerToggle = page.locator('#lang-toggle');
        await expect(headerToggle).toBeVisible();

        await headerToggle.check();
        await page.waitForTimeout(200);

        // Desktop nav should translate
        await expect(page.locator('a.site-header__nav-link', { hasText: '求人' })).toBeVisible();
    });

    test('language toggle works on company pages', async ({ page }) => {
        await page.goto('/pages/companies/ana.html');
        const headerToggle = page.locator('#lang-toggle');
        await expect(headerToggle).toBeVisible();

        await headerToggle.check();
        await page.waitForTimeout(200);

        // Desktop nav should translate
        await expect(page.locator('a.site-header__nav-link', { hasText: '求人' })).toBeVisible();
    });

    test('language toggle works on dashboard pages', async ({ page }) => {
        await page.goto('/pages/profileDashboard.html');
        const headerToggle = page.locator('#lang-toggle');
        await expect(headerToggle).toBeVisible();

        await headerToggle.check();
        await page.waitForTimeout(200);

        // Desktop nav should translate
        await expect(page.locator('a.site-header__nav-link', { hasText: '求人' })).toBeVisible();
    });

    test('language toggle works on info pages', async ({ page }) => {
        await page.goto('/pages/about.html');
        const headerToggle = page.locator('#lang-toggle');
        await expect(headerToggle).toBeVisible();

        await headerToggle.check();
        await page.waitForTimeout(200);

        // Desktop nav should translate
        await expect(page.locator('a.site-header__nav-link', { hasText: '求人' })).toBeVisible();
    });
});
