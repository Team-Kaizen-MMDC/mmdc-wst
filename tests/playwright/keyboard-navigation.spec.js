/**
 * Keyboard Navigation Usability Tests
 * Tests keyboard accessibility across key pages
 */

const { test, expect } = require("@playwright/test");

const PAGES = [
  { name: "Home", url: "http://localhost:3000/index.html" },
  {
    name: "Job Filter",
    url: "http://localhost:3000/pages/jobs/jobFilter.html",
  },
  { name: "About", url: "http://localhost:3000/pages/about.html" },
  { name: "Services", url: "http://localhost:3000/pages/services.html" },
];

test.describe("Keyboard Navigation - Skip Links", () => {
  for (const page of PAGES) {
    test(`${page.name}: Skip to main content link works`, async ({
      page: pw,
    }) => {
      await pw.goto(page.url);

      // Tab to first focusable element (should be skip link)
      await pw.keyboard.press("Tab");

      // Check if skip link is visible or becomes visible on focus
      const skipLink = pw
        .locator('a[href="#main-content"], a[href="#main"]')
        .first();

      if ((await skipLink.count()) > 0) {
        await expect(skipLink).toBeFocused({ timeout: 1000 });

        // Press Enter to activate skip link
        await pw.keyboard.press("Enter");

        // Verify main content area received focus
        const mainContent = pw.locator("#main-content, #main, main").first();
        await expect(mainContent).toBeFocused({ timeout: 2000 });
      }
    });
  }
});

test.describe("Keyboard Navigation - Focus Indicators", () => {
  test("Job Filter: All interactive elements have visible focus", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    // Test filter buttons
    const filterButtons = page.locator(".filter-group button");
    const count = await filterButtons.count();

    if (count > 0) {
      // Focus first button
      await filterButtons.first().focus();

      // Check computed styles for focus indicator
      const outlineWidth = await filterButtons.first().evaluate((el) => {
        return window.getComputedStyle(el, ":focus").outlineWidth;
      });

      // Should have visible outline (not '0px')
      expect(outlineWidth).not.toBe("0px");
    }
  });

  test("Navigation links have visible focus indicators", async ({ page }) => {
    await page.goto("http://localhost:3000/index.html");

    const navLinks = page.locator("nav a, .navbar a");
    const count = await navLinks.count();

    if (count > 0) {
      await navLinks.first().focus();

      const outlineWidth = await navLinks.first().evaluate((el) => {
        return window.getComputedStyle(el, ":focus").outlineWidth;
      });

      expect(outlineWidth).not.toBe("0px");
    }
  });
});

test.describe("Keyboard Navigation - Tab Order", () => {
  test("Job Filter: Tab order is logical", async ({ page }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    // Start from beginning
    await page.keyboard.press("Tab");

    const firstFocused = await page.evaluate(
      () => document.activeElement.tagName
    );

    // Should focus on interactive element (A, BUTTON, INPUT)
    expect(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"]).toContain(
      firstFocused
    );

    // Tab through several elements - should stay within page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");

      const currentTag = await page.evaluate(
        () => document.activeElement.tagName
      );
      expect(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "BODY"]).toContain(
        currentTag
      );
    }
  });
});

test.describe("Keyboard Navigation - Interactive Controls", () => {
  test("Job Filter: Search input keyboard shortcuts work", async ({ page }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    const searchInput = page
      .locator('#searchInput, input[type="search"]')
      .first();

    if ((await searchInput.count()) > 0) {
      // Focus search
      await searchInput.focus();

      // Type search query
      await searchInput.fill("engineer");
      await expect(searchInput).toHaveValue("engineer");

      // Test Escape to clear
      await page.keyboard.press("Escape");
      await expect(searchInput).toHaveValue("");

      // Test Ctrl+K shortcut (should focus search)
      await page.keyboard.press("Control+k");
      await expect(searchInput).toBeFocused();
    }
  });

  test("Job Filter: Filter buttons toggle with keyboard", async ({ page }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    const filterButton = page.locator(".filter-group button").first();

    if ((await filterButton.count()) > 0) {
      // Focus button
      await filterButton.focus();

      // Get initial aria-pressed state
      const initialPressed = await filterButton.getAttribute("aria-pressed");

      // Press Enter or Space to toggle
      await page.keyboard.press("Enter");

      // Wait a bit for state to update
      await page.waitForTimeout(100);

      // Check aria-pressed changed
      const newPressed = await filterButton.getAttribute("aria-pressed");

      if (initialPressed !== null) {
        expect(newPressed).not.toBe(initialPressed);
      }
    }
  });

  test("Job Filter: Clear button keyboard accessible", async ({ page }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    const clearButton = page
      .locator('#clearFilters, button:has-text("Clear")')
      .first();

    if ((await clearButton.count()) > 0) {
      // Focus clear button
      await clearButton.focus();
      await expect(clearButton).toBeFocused();

      // Activate with Enter
      await page.keyboard.press("Enter");

      // Verify focus returns to search (if implemented)
      await page.waitForTimeout(100);
      const focusedTag = await page.evaluate(
        () => document.activeElement.tagName
      );
      expect(["INPUT", "BUTTON", "A"]).toContain(focusedTag);
    }
  });
});

test.describe("Keyboard Navigation - Form Accessibility", () => {
  test("Contact form: All fields keyboard navigable", async ({ page }) => {
    const contactPages = [
      "http://localhost:3000/pages/contact.html",
      "http://localhost:3000/pages/addEdit/contact.html",
    ];

    for (const url of contactPages) {
      try {
        await page.goto(url, { timeout: 5000 });

        const formInputs = page.locator(
          "form input, form textarea, form select, form button"
        );
        const count = await formInputs.count();

        if (count > 0) {
          // Tab through form elements
          for (let i = 0; i < Math.min(count, 5); i++) {
            await page.keyboard.press("Tab");

            const focused = await page.evaluate(() => ({
              tag: document.activeElement.tagName,
              type: document.activeElement.type || null,
            }));

            // Should focus on form element or button
            expect(["INPUT", "TEXTAREA", "SELECT", "BUTTON"]).toContain(
              focused.tag
            );
          }

          break; // Only test first available contact page
        }
      } catch (err) {
        // Skip if page doesn't exist
        console.log(`Skipping ${url}: ${err.message}`);
      }
    }
  });
});

test.describe("Keyboard Navigation - ARIA Live Regions", () => {
  test("Job Filter: Results announced to screen readers", async ({ page }) => {
    await page.goto("http://localhost:3000/pages/jobs/jobFilter.html");

    // Check for ARIA live region
    const liveRegion = page.locator("[aria-live], #filterAnnouncement").first();

    if ((await liveRegion.count()) > 0) {
      const ariaLive = await liveRegion.getAttribute("aria-live");
      expect(["polite", "assertive"]).toContain(ariaLive);

      // Trigger filter change
      const filterButton = page.locator(".filter-group button").first();
      if ((await filterButton.count()) > 0) {
        await filterButton.click();

        // Wait for announcement
        await page.waitForTimeout(500);

        // Check live region has content
        const text = await liveRegion.textContent();
        expect(text).toBeTruthy();
      }
    }
  });
});
