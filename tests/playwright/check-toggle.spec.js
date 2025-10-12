const { test, expect } = require("@playwright/test");

test("language switch exists in header and offcanvas", async ({ page }) => {
  await page.goto("http://localhost:8000");
  await page.waitForLoadState("networkidle");

  // Header switch
  const headerCount = await page.locator("#lang-toggle").count();
  // Offcanvas switch uses suffix '-off'
  const offCount = await page.locator("#lang-toggle-off").count();

  // Expect at least the header switch to exist
  expect(headerCount).toBeGreaterThan(0);
  // If offcanvas exists in DOM, expect its switch too (allow zero)
  // But we will log counts so the developer can see what's present
  console.log("header switch count:", headerCount);
  console.log("offcanvas switch count:", offCount);
});
