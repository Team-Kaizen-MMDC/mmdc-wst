const { test, expect } = require("@playwright/test");

const COMPANY_PAGES = [
  "/pages/companies/prince-hotels.html",
  "/pages/companies/ana-intercontinental.html",
  "/pages/companies/daikin.html",
  "/pages/companies/nissan.html",
];

test.describe("mobile offcanvas behavior", () => {
  for (const path of COMPANY_PAGES) {
    test(`hamburger opens offcanvas on ${path}`, async ({ page }) => {
      // run in a mobile viewport so toggler is visible across projects
      await page.setViewportSize({ width: 375, height: 812 });

      // collect console messages to help debug JS errors
      const logs = [];
      page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));

      await page.goto(path);

      const toggler = page.locator('button[aria-label="Open menu"]');
      await expect(toggler).toBeVisible();

      await toggler.click();

      const offcanvas = page.locator("#siteOffcanvas");
      // wait for the 'show' class and ensure it's visible
      await offcanvas.waitFor({ state: "visible" });
      await expect(offcanvas).toHaveClass(/show/);

      // ensure Signup and Login action buttons exist inside offcanvas
      await expect(offcanvas.locator("a", { hasText: "Signup" })).toBeVisible();
      await expect(offcanvas.locator("a", { hasText: "Login" })).toBeVisible();

      // fail fast on console errors
      const errors = logs.filter(
        (l) => l.startsWith("error") || l.startsWith("pageerror")
      );
      expect(errors.length, `no console errors for ${path}`).toBe(0);
    });
  }
});
