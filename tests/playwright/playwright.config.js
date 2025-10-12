// @ts-check
const { devices } = require("@playwright/test");

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: "./",
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"], ["html", { outputFolder: "tests/playwright/results" }]],
  use: {
    headless: true,
    baseURL: "http://localhost:8000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // Add a mobile profile to catch viewport-specific regressions
    { name: "webkit-mobile", use: { ...devices["iPhone 12"] } },
  ],
};
