const { test, expect } = require("@playwright/test");

test.describe("Jobs pages", () => {
  test("index -> job link navigates to job details", async ({ page }) => {
    await page.goto("/");
    // find the first job 'Apply' button that links to /pages/jobs/
    const jobLink = page
      .locator("a.btn", { hasText: "Apply" })
      .filter({ has: page.locator('[href*="pages/jobs/"]') })
      .first();
    // fallback: locate any job link under .job-list
    const jobListLink = page
      .locator('.job-list a.btn[href*="pages/jobs/"]')
      .first();
    const chosen = (await jobLink.count()) ? jobLink : jobListLink;
    await expect(chosen).toBeVisible();
    await chosen.click();
    // should land on a job details page with an H1 title
    await expect(page.locator("h1#job-title")).toBeVisible();
  });

  test("job detail shows sticky apply CTA linking to signin", async ({
    page,
  }) => {
    // job.html was replaced by ward-nursing-support.html — use that canonical page
    await page.goto("/pages/jobs/ward-nursing-support.html");
    const applyBtn = page.locator("a.job-sticky-cta__btn#apply");
    await expect(applyBtn).toBeVisible();
    // the CTA links to signin page
    await expect(applyBtn).toHaveAttribute("href", /signin.html$/);
  });

  test("all job pages load correctly", async ({ page }) => {
    const jobPages = [
      "/pages/jobs/ward-nursing-support.html",
      "/pages/jobs/mechanic-ground-support-haneda.html",
      "/pages/jobs/cleaner-facilities-maintenance.html",
      "/pages/jobs/construction-worker-site-support.html",
      "/pages/jobs/server-hospitality.html",
    ];

    for (const jobPage of jobPages) {
      await page.goto(jobPage);
      // Each job page should have a title
      await expect(page.locator("h1#job-title")).toBeVisible();
      // Each should have an apply button
      await expect(
        page.locator("a#apply, a.btn:has-text('Apply')")
      ).toBeVisible();
    }
  });

  test("job filter page loads and has filter elements", async ({ page }) => {
    await page.goto("/pages/jobs/jobFilter.html");

    // Job filter page should load
    const mainContent = page.locator("main, .container").first();
    await expect(mainContent).toBeVisible();

    // Should have filter controls or job listings
    const filterOrJobs = page
      .locator('[class*="filter"], [class*="job"], form, .card')
      .first();
    await expect(filterOrJobs).toBeVisible({ timeout: 5000 });
  });

  test("navigating between job pages maintains header/footer", async ({
    page,
  }) => {
    const jobPages = [
      "/pages/jobs/ward-nursing-support.html",
      "/pages/jobs/server-hospitality.html",
    ];

    for (const jobPage of jobPages) {
      await page.goto(jobPage);

      // Header should be present
      const header = page.locator(".site-header");
      await expect(header).toBeVisible();

      // Footer should be present
      const footer = page.locator(".site-footer");
      await expect(footer).toBeVisible();
    }
  });
});
