#!/usr/bin/env node
/**
 * Run axe-core accessibility checks via Playwright and save JSON reports.
 * Writes results to tests/accessibility/results/<basename>-axe.json
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const pages = [
  "index.html",
  "pages/about.html",
  "pages/agency.html",
  "pages/services.html",
  "pages/privacy.html",
  "pages/visaGuidance.html",
];

async function run() {
  const resultsDir = path.resolve(__dirname, "results");
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  try {
    for (const p of pages) {
      const page = await context.newPage();
      const url = `http://localhost:8000/${p}`;
      console.log("[axe] Visiting", url);
      const res = { url };
      try {
        await page.goto(url, { waitUntil: "load", timeout: 15000 });
        // inject axe from CDN to avoid installing packages
        await page.addScriptTag({
          url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.6.3/axe.min.js",
        });
        // run axe
        const axeResults = await page.evaluate(async () => {
          return await window.axe.run();
        });
        res.axe = axeResults;
      } catch (err) {
        console.error("[axe] Error for", url, err.message);
        res.error = String(err.stack || err.message || err);
      }
      const outFile = path.join(resultsDir, `${path.basename(p)}-axe.json`);
      fs.writeFileSync(outFile, JSON.stringify(res, null, 2));
      console.log("[axe] Wrote", outFile);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
