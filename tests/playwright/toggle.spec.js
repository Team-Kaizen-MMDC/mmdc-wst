const { test, expect } = require("@playwright/test");

test("company page hamburger opens offcanvas", async ({ page }) => {
  // mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });

  // collect console messages to help debug JS errors
  const logs = [];
  page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));

  await page.goto("/pages/companies/prince-hotels.html");

  const toggler = page.locator('button[aria-label="Open menu"]');
  await expect(toggler).toBeVisible();

  await toggler.click();

  const offcanvas = page.locator("#siteOffcanvas");
  // offcanvas should get the 'show' class when opened
  await expect(offcanvas).toHaveClass(/show/);

  // if there were console errors, fail the test with the logs attached
  const errors = logs.filter(
    (l) => l.startsWith("error") || l.startsWith("pageerror")
  );
  expect(errors.length, "no console errors during toggler open").toBe(0);
});
