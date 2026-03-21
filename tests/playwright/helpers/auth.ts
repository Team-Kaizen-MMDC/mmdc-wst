/**
 * Test auth helper
 * Provides a small helper to set an 'isLoggedIn' cookie for the Playwright
 * browser context so tests can simulate an authenticated user.
 */
export async function setTestAuth(context: import('@playwright/test').BrowserContext, baseUrl?: string) {
    const url = baseUrl || process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

    // Playwright requires a cookie entry to include either url or domain+path.
    await context.addCookies([
        {
            name: 'isLoggedIn',
            value: 'true',
            url,
        },
    ]);
}

export default setTestAuth;
