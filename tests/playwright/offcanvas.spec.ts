import { test, expect } from '@playwright/test';

test.describe('Offcanvas navigation (mobile)', () => {
    test('offcanvas opens/closes and links navigate/close the offcanvas', async ({ page }) => {
        await page.goto('/');
        await page.setViewportSize({ width: 375, height: 800 });

        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await expect(toggler).toBeVisible();
        await toggler.click();

        // offcanvas visible
        await expect(page.locator('.offcanvas.show')).toBeVisible();

        // Click Jobs link and ensure offcanvas hides and scrolled
        const jobsLink = page.locator('.offcanvas .nav-link', { hasText: 'Jobs' });
        await jobsLink.click();

        // After click, offcanvas should be hidden
        await expect(page.locator('.offcanvas.show')).toHaveCount(0);

        // Now open again and test that links close the offcanvas for navigation to an external page
        await toggler.click();
        const agencyLink = page.locator('.offcanvas .nav-link', { hasText: 'Agency' });
        await agencyLink.click();

        // Because Agency navigates off-site, ensure the navigation occurred
        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/agency.html');
    });

    test('focus returns to toggler after offcanvas hides', async ({ page }) => {
        await page.goto('/');
        await page.setViewportSize({ width: 375, height: 800 });
        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await toggler.click();
        await page.locator('.offcanvas .btn-close').click();
        await expect(toggler).toBeFocused();
    });
});
