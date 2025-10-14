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
});
