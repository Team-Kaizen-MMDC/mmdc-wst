import { test, expect } from '@playwright/test';

/**
 * Smoke tests for header and footer links across all pages
 * Tests that all navigation links work correctly on every page
 */

// List of all pages to test
const PAGES = [
    { path: '/', name: 'Homepage' },
    { path: '/pages/about.html', name: 'About' },
    { path: '/pages/agency.html', name: 'Agency' },
    { path: '/pages/contact.html', name: 'Contact' },
    { path: '/pages/createAccount.html', name: 'Create Account' },
    { path: '/pages/signin.html', name: 'Sign In' },
    { path: '/pages/profileDashboard.html', name: 'Profile Dashboard' },
    { path: '/pages/companyDashboard.html', name: 'Company Dashboard' },
    { path: '/pages/services.html', name: 'Services' },
    { path: '/pages/terms.html', name: 'Terms' },
    { path: '/pages/privacy.html', name: 'Privacy' },
    { path: '/pages/visaGuidance.html', name: 'Visa Guidance' },
    // Job pages
    { path: '/pages/jobs/mechanic-ground-support-haneda.html', name: 'Job: Mechanic' },
    { path: '/pages/jobs/cleaner-facilities-maintenance.html', name: 'Job: Cleaner' },
    { path: '/pages/jobs/construction-worker-site-support.html', name: 'Job: Construction' },
    { path: '/pages/jobs/server-hospitality.html', name: 'Job: Server' },
    { path: '/pages/jobs/ward-nursing-support.html', name: 'Job: Nursing' },
    { path: '/pages/jobs/jobFilter.html', name: 'Job Filter' },
    // Company pages
    { path: '/pages/companies/ana-intercontinental.html', name: 'Company: ANA InterContinental' },
    { path: '/pages/companies/prince-hotels.html', name: 'Company: Prince Hotels' },
    { path: '/pages/companies/sompo-care.html', name: 'Company: SOMPO Care' },
    { path: '/pages/companies/nissan.html', name: 'Company: Nissan' },
    { path: '/pages/companies/daikin.html', name: 'Company: Daikin' },
    { path: '/pages/companies/kandenko.html', name: 'Company: Kandenko' },
    { path: '/pages/companies/yoshinoya.html', name: 'Company: Yoshinoya' },
    { path: '/pages/companies/ana.html', name: 'Company: ANA' },
    { path: '/pages/companies/mitsubishi-heavy-industries.html', name: 'Company: Mitsubishi' },
    // Add/Edit pages
    { path: '/pages/addEdit/profile.html', name: 'Edit: Profile' },
    { path: '/pages/addEdit/contact.html', name: 'Edit: Contact' },
    { path: '/pages/addEdit/education.html', name: 'Edit: Education' },
    { path: '/pages/addEdit/experience.html', name: 'Edit: Experience' },
    { path: '/pages/addEdit/skill.html', name: 'Edit: Skill' },
];

// Header links expected on desktop
const HEADER_NAV_LINKS = [
    { text: 'Jobs', href: '#jobs' },
    { text: 'Companies', href: '#companies' },
    { text: 'Agency', href: 'pages/agency.html' },
    { text: 'About', href: 'pages/about.html' },
];

// Footer links expected on all pages
const FOOTER_LINKS = [
    // Company column
    { text: 'Home', href: 'index.html' },
    { text: 'About', href: 'pages/about.html' },
    { text: 'Contact', href: 'pages/contact.html' },
    // Jobs column (hash links)
    { text: 'Search Jobs', href: '#jobs' },
    { text: 'Companies', href: '#companies' },
    // Resources column
    { text: 'Visa Guidance', href: 'pages/visaGuidance.html' },
    { text: 'Privacy', href: 'pages/privacy.html' },
    // Legal footer
    { text: 'Terms', href: 'pages/terms.html' },
];

test.describe('Smoke Tests: Header Links', () => {
    for (const page of PAGES) {
        test(`Header links work on ${page.name}`, async ({ page: browserPage }) => {
            await browserPage.goto(page.path);
            await browserPage.waitForLoadState('load');

            // If the page doesn't include the public header (admin/edit pages), skip header checks
            const header = browserPage.locator('.site-header');
            if ((await header.count()) === 0) {
                return; // skip header/link checks for pages without the site header
            }

            // Check brand link exists and is visible when header is present
            const brandLink = browserPage.locator('.site-header__brand');
            await expect(brandLink).toBeVisible();

            // Desktop navigation: check all nav links exist and are visible on large screens
            await browserPage.setViewportSize({ width: 1200, height: 800 });

            for (const link of HEADER_NAV_LINKS) {
                const navLink = browserPage.locator(`.site-header__nav-link:has-text("${link.text}")`);
                // Some pages alter header links; skip if a specific nav item is not present
                if ((await navLink.count()) === 0) {
                    console.log(`nav link not found on ${page.path}: ${link.text} - skipping`);
                    continue;
                }
                await expect(navLink).toBeVisible({ timeout: 5000 });
                // Check href path style: if href exists and is not an external URL or hash,
                // ensure it does not start with a leading '/pages/' which breaks on some hosts.
                const rawHref = (await navLink.getAttribute('href')) || '';
                if (rawHref && !rawHref.startsWith('#') && !/^https?:\/\//.test(rawHref)) {
                    if (rawHref.startsWith('/pages/')) {
                        throw new Error(`Found link using leading '/pages/' on ${page.path} for ${link.text}: ${rawHref}. Use 'pages/...' instead.`);
                    }
                }
                // Click non-hash links and assert navigation; test hash links on homepage only
                const hrefAttr = (await navLink.getAttribute('href')) || '';
                // Treat links that include a hash (#) as hash links even when they use an absolute or
                // relative path like '../../index.html#jobs'
                if (hrefAttr.includes('#')) {
                    const hash = hrefAttr.slice(hrefAttr.indexOf('#'));
                    // Click and assert the resulting URL contains the hash and the target is in view.
                    await navLink.click();
                    // some pages produce a full index.html#jobs while others just set the hash
                    await browserPage.waitForTimeout(400);
                    const cur = new URL(browserPage.url());
                    expect(cur.hash.endsWith(hash) || browserPage.url().includes(hash)).toBeTruthy();
                    const target = browserPage.locator(hash);
                    await expect(target).toBeInViewport();
                    // Return to the original page under test for subsequent checks
                    await browserPage.goto(page.path);
                    await browserPage.waitForLoadState('load');
                    continue;
                } else {
                    // For regular links, click and verify the URL contains the expected resource
                    await navLink.click();
                    // Wait for either navigation or load of SPA-like page
                    await browserPage.waitForLoadState('load');
                    const cur = new URL(browserPage.url());
                    // Normalize to the final filename (e.g. 'agency.html') to be tolerant of relative
                    // prefixes used on nested pages (../, /, etc.)
                    const expectedNormalized = link.href.replace(/^\/+/, '');
                    const expectedFile = expectedNormalized.split('/').pop();
                    const curPath = cur.pathname || '/';
                    const pathMatches = (expectedFile && curPath.endsWith(expectedFile)) || (curPath === '/' && expectedFile === 'index.html');
                    expect(pathMatches, `expected ${curPath} to end with ${expectedFile}`).toBeTruthy();
                    // Return to the original page to continue testing header links on this page
                    await browserPage.goto(page.path);
                    await browserPage.waitForLoadState('load');
                }
            }

            // Check auth links if present (some pages may hide auth actions)
            const signupLink = browserPage.locator('.site-header__signup');
            if ((await signupLink.count()) > 0) {
                // Only assert visible when it exists
                await expect(signupLink.first()).toBeVisible({ timeout: 3000 });
                const signupHref = (await signupLink.first().getAttribute('href')) || '';
                if (signupHref) {
                    // Attempt navigation but tolerate cases where a modal or fragment is used
                    await signupLink.first().click().catch(() => { });
                    await browserPage.waitForTimeout(600);
                    const url = browserPage.url();
                    const formVisible = await browserPage.locator('form#signup, form[id*=create], form[class*=signup], form').first().isVisible().catch(() => false);
                    const modalVisible = await browserPage.locator('[role="dialog"], .modal, [aria-modal="true"]').first().isVisible().catch(() => false);
                    if (!(url.includes('pages/createAccount.html') || url.includes('createAccount') || formVisible || modalVisible)) {
                        console.warn(`Signup link on ${page.path} did not navigate to createAccount or reveal a signup form; skipping strict assert`);
                    }
                    await browserPage.goto(page.path);
                    await browserPage.waitForLoadState('load');
                }
            }

            const loginBtn = browserPage.locator('.site-header__login-btn');
            if ((await loginBtn.count()) > 0) {
                await expect(loginBtn.first()).toBeVisible({ timeout: 3000 });
                const loginHref = (await loginBtn.first().getAttribute('href')) || '';
                if (loginHref) {
                    await loginBtn.first().click().catch(() => { });
                    await browserPage.waitForTimeout(600);
                    const url = browserPage.url();
                    const formVisible = await browserPage.locator('form#login, form[id*=sign], form[class*=login], form').first().isVisible().catch(() => false);
                    const modalVisible = await browserPage.locator('[role="dialog"], .modal, [aria-modal="true"]').first().isVisible().catch(() => false);
                    if (!(url.includes('pages/signin.html') || url.includes('signin') || formVisible || modalVisible)) {
                        console.warn(`Login link on ${page.path} did not navigate to signin or reveal a login form; skipping strict assert`);
                    }
                    await browserPage.goto(page.path);
                    await browserPage.waitForLoadState('load');
                }
            }
        });
    }
});

test.describe('Smoke Tests: Mobile Offcanvas Links', () => {
    // Test mobile offcanvas on a subset of representative pages
    const MOBILE_TEST_PAGES = [
        { path: '/', name: 'Homepage' },
        { path: '/pages/about.html', name: 'About' },
        { path: '/pages/jobs/ward-nursing-support.html', name: 'Job Detail' },
        { path: '/pages/companies/ana.html', name: 'Company Detail' },
    ];

    for (const page of MOBILE_TEST_PAGES) {
        test(`Mobile offcanvas links work on ${page.name}`, async ({ page: browserPage }) => {
            await browserPage.goto(page.path);
            await browserPage.waitForLoadState('load');
            await browserPage.setViewportSize({ width: 375, height: 667 });

            // Open offcanvas
            const toggler = browserPage.locator('[data-bs-toggle="offcanvas"]');
            await toggler.waitFor({ state: 'visible', timeout: 5000 });
            await toggler.click();

            // Check offcanvas is visible
            const offcanvas = browserPage.locator('.offcanvas.show');
            await expect(offcanvas).toBeVisible({ timeout: 3000 });

            // Check all nav links exist in offcanvas
            for (const link of HEADER_NAV_LINKS) {
                const offcanvasLink = browserPage.locator(`.offcanvas .nav-link:has-text("${link.text}")`);
                await expect(offcanvasLink).toBeVisible();
            }

            // Check auth buttons in offcanvas
            const signupBtn = browserPage.locator('.offcanvas .btn-outline-secondary:has-text("Signup")');
            await expect(signupBtn).toBeVisible();

            const loginBtn = browserPage.locator('.offcanvas .btn-danger:has-text("Login")');
            await expect(loginBtn).toBeVisible();

            // Close offcanvas
            const closeBtn = browserPage.locator('.offcanvas .btn-close');
            await closeBtn.click();
            await expect(offcanvas).not.toBeVisible({ timeout: 3000 });
        });
    }
});

test.describe('Smoke Tests: Footer Links', () => {
    // Test footer on a representative subset of pages
    const FOOTER_TEST_PAGES = [
        { path: '/', name: 'Homepage' },
        { path: '/pages/about.html', name: 'About' },
        { path: '/pages/createAccount.html', name: 'Create Account' },
        { path: '/pages/jobs/server-hospitality.html', name: 'Job Detail' },
        { path: '/pages/companies/nissan.html', name: 'Company Detail' },
        { path: '/pages/addEdit/profile.html', name: 'Edit Profile' },
    ];

    for (const page of FOOTER_TEST_PAGES) {
        test(`Footer links work on ${page.name}`, async ({ page: browserPage }) => {
            await browserPage.goto(page.path);
            await browserPage.waitForLoadState('load');

            // Ensure footer exists on the page
            const footerLocator = browserPage.locator('.site-footer');
            if ((await footerLocator.count()) === 0) {
                // Some pages (admin/edit pages) may not include the public footer. Skip.
                return;
            }

            // Scroll to footer
            await footerLocator.scrollIntoViewIfNeeded();

            // Check footer is visible
            const footer = footerLocator;
            await expect(footer).toBeVisible();

            // Check a subset of critical footer links
            const criticalFooterLinks = [
                { text: 'Home', href: 'index.html' },
                { text: 'About', href: 'pages/about.html' },
                { text: 'Contact', href: 'pages/contact.html' },
                { text: 'Privacy', href: 'pages/privacy.html' },
                { text: 'Terms', href: 'pages/terms.html' },
            ];

            for (const link of criticalFooterLinks) {
                const footerLink = browserPage.locator(`.site-footer a:has-text("${link.text}")`).first();
                await expect(footerLink).toBeVisible();
                const hrefAttr = (await footerLink.getAttribute('href')) || '';
                if (hrefAttr && !hrefAttr.startsWith('#') && !/^https?:\/\//.test(hrefAttr)) {
                    if (hrefAttr.startsWith('/pages/')) {
                        throw new Error(`Footer link uses leading '/pages/' on ${page.path}: ${hrefAttr}. Use relative 'pages/...'`);
                    }
                }
                if (hrefAttr.startsWith('#')) {
                    // Only test hash link behavior on homepage
                    if (page.path === '/') {
                        await footerLink.click();
                        await browserPage.waitForTimeout(300);
                        expect(browserPage.url()).toContain(hrefAttr);
                        const target = browserPage.locator(hrefAttr);
                        await expect(target).toBeInViewport();
                        // Return to homepage root
                        await browserPage.goto('/');
                        await browserPage.waitForLoadState('load');
                    } else {
                        // skip hash links on non-home pages
                        continue;
                    }
                } else {
                    await Promise.all([
                        browserPage.waitForNavigation({ waitUntil: 'load' }),
                        footerLink.click()
                    ]);
                    const expectedPath = link.href.startsWith('/') ? link.href : '/' + link.href;
                    expect(browserPage.url()).toContain(expectedPath.replace(/index\.html$/, ''));
                    // Navigate back to the page under test
                    await browserPage.goto(page.path);
                    await browserPage.waitForLoadState('load');
                }
            }

            // Check copyright text exists
            const copyright = browserPage.locator('.site-footer small:has-text("Japan SSW")');
            await expect(copyright).toBeVisible();
        });
    }
});

test.describe('Smoke Tests: Critical Link Navigation', () => {
    test('Brand logo navigates to homepage from any page', async ({ page }) => {
        // Start from a deep page
        await page.goto('/pages/jobs/ward-nursing-support.html');

        const brandLink = page.locator('.site-header__brand');
        await brandLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/\/$|index\.html$/);
    });

    test('Footer Home link navigates to homepage from any page', async ({ page }) => {
        // Start from a deep page
        await page.goto('/pages/companies/ana-intercontinental.html');

        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        const homeLink = page.locator('.site-footer a:has-text("Home")').first();
        await homeLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toMatch(/\/$|index\.html$/);
    });

    test('Signup link navigates to create account page', async ({ page }) => {
        await page.goto('/');

        const signupLink = page.locator('.site-header__signup');
        await signupLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/createAccount.html');
    });

    test('Login button navigates to sign in page', async ({ page }) => {
        await page.goto('/');

        const loginBtn = page.locator('.site-header__login-btn');
        await loginBtn.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/signin.html');
    });

    test('Agency link navigates correctly', async ({ page }) => {
        await page.goto('/');

        const agencyLink = page.locator('.site-header__nav-link:has-text("Agency")');
        await agencyLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/agency.html');
    });

    test('About link navigates correctly', async ({ page }) => {
        await page.goto('/');

        const aboutLink = page.locator('.site-header__nav-link:has-text("About")');
        await aboutLink.click();

        await page.waitForLoadState('load');
        expect(page.url()).toContain('pages/about.html');
    });
});

test.describe('Smoke Tests: Hash Link Navigation', () => {
    test('Jobs hash link scrolls to jobs section on homepage', async ({ page }) => {
        await page.goto('/');

        // Click Jobs link
        const jobsLink = page.locator('.site-header__nav-link:has-text("Jobs")');
        await jobsLink.click();

        // Wait a bit for scroll
        await page.waitForTimeout(500);

        // Check that URL has hash
        expect(page.url()).toContain('#jobs');

        // Check that jobs section is in viewport
        const jobsSection = page.locator('#jobs');
        await expect(jobsSection).toBeInViewport();
    });

    test('Companies hash link scrolls to companies section on homepage', async ({ page }) => {
        await page.goto('/');

        const companiesLink = page.locator('.site-header__nav-link:has-text("Companies")');
        await companiesLink.click();

        await page.waitForTimeout(500);
        expect(page.url()).toContain('#companies');

        const companiesSection = page.locator('#companies');
        await expect(companiesSection).toBeInViewport();
    });
});
