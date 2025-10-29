#!/usr/bin/env node
/**
 * Run axe-core accessibility checks via Playwright and save JSON reports.
 * Writes results to tests/accessibility/results/<basename>-axe.json
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

// Auto-discover HTML pages to test. This will include files under the repository
// root and any files under the `pages/` directory (including jobs/ and companies/).
function discoverHtmlPages() {
  const root = path.resolve(process.cwd());
  const results = new Set();

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      // skip node_modules and tests directories
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'tests') continue;
        walk(full);
      } else if (ent.isFile() && ent.name.endsWith('.html')) {
        // compute a web-relative path from repo root
        const rel = path.relative(root, full).replace(/\\/g, '/');
        // ignore archive and assets HTML that aren't part of site pages
        if (rel.startsWith('archive/') || rel.startsWith('assets/')) continue;
        results.add(rel);
      }
    }
  }

  // Walk the project root and also explicitly the pages/ folder if present
  walk(root);
  const pagesDir = path.join(root, 'pages');
  if (fs.existsSync(pagesDir)) walk(pagesDir);

  // Ensure index.html is first for deterministic ordering
  const ordered = Array.from(results).sort();
  const idx = ordered.indexOf('index.html');
  if (idx !== -1) {
    ordered.splice(idx, 1);
    ordered.unshift('index.html');
  }
  return ordered;
}

const pages = discoverHtmlPages();

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
