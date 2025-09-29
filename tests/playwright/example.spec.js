const { test, expect } = require("@playwright/test");

test.describe("Static site smoke tests", () => {
  test.beforeEach(async ({ page }) => {
    // start from the base URL defined in playwright.config.js
    await page.goto("/");
  });

  test("homepage has main header and jobs anchor", async ({ page }) => {
    await expect(page.locator(".site-header__brand")).toHaveText(/Japan/i);
    await expect(
      page.locator("a.site-header__nav-link", { hasText: "Jobs" })
    ).toBeVisible();
  });

  test("company page loads and contains View jobs", async ({ page }) => {
    await page.goto("/pages/companies/ana.html");
    await expect(page.locator("h1.feature-card__title")).toHaveText(
      /All Nippon Airways/
    );
    await expect(page.locator("a.btn", { hasText: "View jobs" })).toBeVisible();
  });

  test("create account page has form and footer", async ({ page }) => {
    await page.goto("/pages/createAccount.html");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator("footer.site-footer")).toBeVisible();
  });
});
