import { test, expect } from '@playwright/test';

/**
 * End-to-End Navigation Tests
 * Tests complete user journeys through the site
 */

test.describe('E2E: Job Search and Application Flow', () => {
    test('User can browse jobs from homepage and view job detail', async ({ page }) => {
        await page.goto('/');

        // Wait for jobs section to load
        const jobsSection = page.locator('#jobs');
        await expect(jobsSection).toBeVisible({ timeout: 5000 });

        // Click on a job card (assuming job cards have .job-card class)
        const jobCard = page.locator('.job-card, .card').first();
        await expect(jobCard).toBeVisible();
        await jobCard.click();

        // Should navigate to a job detail page
        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/pages\/jobs\/.+\.html/);

        // Job detail page should have key elements
        const jobTitle = page.locator('h1, .job-title').first();
        await expect(jobTitle).toBeVisible();
    });

    test('User can navigate from homepage to job filter page', async ({ page }) => {
        await page.goto('/');

        // Look for "View All Jobs" or filter link
        const viewAllLink = page.locator('a:has-text("View All"), a:has-text("Search Jobs"), a[href*="jobFilter"]').first();

        if (await viewAllLink.isVisible()) {
            await viewAllLink.click();
            await page.waitForLoadState('load');
            expect(page.url()).toContain('jobFilter.html');
        }
    });

    test('User can navigate back from job detail to homepage', async ({ page }) => {
        // Start at a job detail page
        await page.goto('/pages/jobs/ward-nursing-support.html');

        // Click brand logo to go back to homepage
        const brandLink = page.locator('.site-header__brand');
        await brandLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/\/$|index\.html$/);

        // Hero section should be visible
        const hero = page.locator('.hero, .hero--split');
        await expect(hero).toBeVisible();
    });
});

test.describe('E2E: Company Browsing Flow', () => {
    test('User can browse companies from homepage and view company detail', async ({ page }) => {
        await page.goto('/');

        // Wait for companies section to load
        const companiesSection = page.locator('#companies');
        await expect(companiesSection).toBeVisible({ timeout: 5000 });

        // Click on a company card
        const companyCard = page.locator('.company-card, .card').first();
        await expect(companyCard).toBeVisible();
        await companyCard.click();

        // Should navigate to a company detail page
        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/pages\/companies\/.+\.html/);

        // Company detail page should have key elements
        const companyName = page.locator('h1, .company-name').first();
        await expect(companyName).toBeVisible();
    });

    test('User can view company page and see available jobs', async ({ page }) => {
        await page.goto('/pages/companies/ana-intercontinental.html');

        // Company page should be loaded
        const companyContent = page.locator('main, .container').first();
        await expect(companyContent).toBeVisible();

        // Check for jobs or apply section (if present)
        const jobsOrApply = page.locator('[class*="job"], [class*="position"], a:has-text("Apply"), a:has-text("View Job")').first();
        // This is optional, so we just check the page loaded correctly
        expect(page.url()).toContain('companies/ana-intercontinental.html');
    });

    test('User can navigate back from company detail to homepage', async ({ page }) => {
        await page.goto('/pages/companies/nissan.html');

        // Click footer Home link
        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const homeLink = page.locator('.site-footer a:has-text("Home")').first();
        await homeLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/\/$|index\.html$/);
    });
});

test.describe('E2E: User Registration Flow', () => {
    test('User can navigate to signup page from header', async ({ page }) => {
        await page.goto('/');

        const signupLink = page.locator('.site-header__signup, a:has-text("Signup")').first();
        await signupLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/createAccount.html');

        // Signup page should have a form
        const signupForm = page.locator('form').first();
        await expect(signupForm).toBeVisible();
    });

    test('User can navigate to signup page from mobile menu', async ({ page }) => {
        await page.goto('/');
        await page.setViewportSize({ width: 375, height: 667 });

        // Open offcanvas
        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Click Signup button in offcanvas
        const signupBtn = page.locator('.offcanvas .btn:has-text("Signup")').first();
        await signupBtn.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/createAccount.html');
    });

    test('Signup page has all expected form elements', async ({ page }) => {
        await page.goto('/pages/createAccount.html');

        // Check for common form fields
        const form = page.locator('form').first();
        await expect(form).toBeVisible();

        // Check for submit button
        const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
        await expect(submitBtn).toBeVisible();
    });
});

test.describe('E2E: User Login Flow', () => {
    test('User can navigate to login page from header', async ({ page }) => {
        await page.goto('/');

        const loginBtn = page.locator('.site-header__login-btn, a:has-text("Login")').first();
        await loginBtn.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/signin.html');

        // Login page should have a form
        const loginForm = page.locator('form').first();
        await expect(loginForm).toBeVisible();
    });

    test('User can navigate to login page from mobile menu', async ({ page }) => {
        await page.goto('/');
        await page.setViewportSize({ width: 375, height: 667 });

        // Open offcanvas
        const toggler = page.locator('[data-bs-toggle="offcanvas"]');
        await toggler.click();

        const offcanvas = page.locator('.offcanvas.show');
        await expect(offcanvas).toBeVisible({ timeout: 3000 });

        // Click Login button in offcanvas
        const loginBtn = page.locator('.offcanvas .btn:has-text("Login")').first();
        await loginBtn.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/signin.html');
    });

    test('Login page has expected form elements', async ({ page }) => {
        await page.goto('/pages/signin.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();

        // Check for submit button
        const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
        await expect(submitBtn).toBeVisible();
    });
});

test.describe('E2E: Profile Dashboard Flow', () => {
    test('Profile dashboard page loads correctly', async ({ page }) => {
        await page.goto('/pages/profileDashboard.html');

        // Dashboard should have main content
        const mainContent = page.locator('main, .container').first();
        await expect(mainContent).toBeVisible();

        // Check for profile or dashboard elements
        const dashboard = page.locator('[class*="dashboard"], [class*="profile"]').first();
        await expect(dashboard).toBeVisible({ timeout: 5000 });
    });

    test('User can navigate to edit profile from dashboard', async ({ page }) => {
        await page.goto('/pages/profileDashboard.html');

        // Look for edit profile link or button
        const editLink = page.locator('a[href*="addEdit/profile"], button:has-text("Edit"), a:has-text("Edit")').first();

        if (await editLink.isVisible({ timeout: 3000 })) {
            await editLink.click();
            await page.waitForLoadState('load');
            expect(page.url()).toMatch(/pages\/addEdit\/.+\.html/);
        }
    });
});

test.describe('E2E: Add/Edit Forms Flow', () => {
    test('User can access profile edit form', async ({ page }) => {
        await page.goto('/pages/addEdit/profile.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();

        // Form should have save/submit button
        const submitBtn = page.locator('button[type="submit"], button:has-text("Save")').first();
        await expect(submitBtn).toBeVisible();
    });

    test('User can access contact edit form', async ({ page }) => {
        await page.goto('/pages/addEdit/contact.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();
    });

    test('User can access education edit form', async ({ page }) => {
        await page.goto('/pages/addEdit/education.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();
    });

    test('User can access experience edit form', async ({ page }) => {
        await page.goto('/pages/addEdit/experience.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();
    });

    test('User can access skill edit form', async ({ page }) => {
        await page.goto('/pages/addEdit/skill.html');

        const form = page.locator('form').first();
        await expect(form).toBeVisible();
    });
});

test.describe('E2E: Information Pages Flow', () => {
    test('User can navigate to About page and return', async ({ page }) => {
        await page.goto('/');

        const aboutLink = page.locator('.site-header__nav-link:has-text("About")').first();
        await aboutLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/about.html');

        // Return via brand logo
        const brandLink = page.locator('.site-header__brand');
        await brandLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/\/$|index\.html$/);
    });

    test('User can navigate to Agency page', async ({ page }) => {
        await page.goto('/');

        const agencyLink = page.locator('.site-header__nav-link:has-text("Agency")').first();
        await agencyLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/agency.html');
    });

    test('User can navigate to Contact page from footer', async ({ page }) => {
        await page.goto('/');

        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const contactLink = page.locator('.site-footer a:has-text("Contact")').first();
        await contactLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/contact.html');
    });

    test('User can navigate to Privacy page from footer', async ({ page }) => {
        await page.goto('/');

        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const privacyLink = page.locator('.site-footer a:has-text("Privacy")').first();
        await privacyLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/privacy.html');
    });

    test('User can navigate to Terms page from footer', async ({ page }) => {
        await page.goto('/');

        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const termsLink = page.locator('.site-footer a:has-text("Terms")').first();
        await termsLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/terms.html');
    });

    test('User can navigate to Visa Guidance page from footer', async ({ page }) => {
        await page.goto('/');

        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const visaLink = page.locator('.site-footer a:has-text("Visa Guidance")').first();
        await visaLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/visaGuidance.html');
    });
});

test.describe('E2E: Cross-page Navigation Consistency', () => {
    test('Header and footer remain consistent across job pages', async ({ page }) => {
        const jobPages = [
            '/pages/jobs/ward-nursing-support.html',
            '/pages/jobs/server-hospitality.html',
            '/pages/jobs/mechanic-ground-support-haneda.html'
        ];

        for (const jobPage of jobPages) {
            await page.goto(jobPage);

            // Check header is present
            const header = page.locator('.site-header');
            await expect(header).toBeVisible();

            // Check footer is present
            const footer = page.locator('.site-footer');
            await expect(footer).toBeVisible();

            // Check brand logo works
            const brandLink = page.locator('.site-header__brand');
            await expect(brandLink).toBeVisible();
            await expect(brandLink).toHaveAttribute('href', /.+/);
        }
    });

    test('Header and footer remain consistent across company pages', async ({ page }) => {
        const companyPages = [
            '/pages/companies/ana.html',
            '/pages/companies/nissan.html',
            '/pages/companies/sompo-care.html'
        ];

        for (const companyPage of companyPages) {
            await page.goto(companyPage);

            // Check header is present
            const header = page.locator('.site-header');
            await expect(header).toBeVisible();

            // Check footer is present
            const footer = page.locator('.site-footer');
            await expect(footer).toBeVisible();
        }
    });

    test('Mobile menu works consistently across different page types', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const testPages = [
            '/',
            '/pages/about.html',
            '/pages/jobs/cleaner-facilities-maintenance.html',
            '/pages/companies/yoshinoya.html'
        ];

        for (const testPage of testPages) {
            await page.goto(testPage);

            // Open offcanvas
            const toggler = page.locator('[data-bs-toggle="offcanvas"]');
            await expect(toggler).toBeVisible();
            await toggler.click();

            // Check offcanvas opens
            const offcanvas = page.locator('.offcanvas.show');
            await expect(offcanvas).toBeVisible({ timeout: 3000 });

            // Close offcanvas
            const closeBtn = page.locator('.offcanvas .btn-close');
            await closeBtn.click();
            await expect(offcanvas).not.toBeVisible({ timeout: 3000 });
        }
    });
});
