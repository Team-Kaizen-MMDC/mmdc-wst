#!/usr/bin/env node
/*
 Extractor: scans repository `pages/` HTML files and creates simple JSON
 seed data for companies, jobs and profiles under `backend/seedData/`.

 Usage:
   node scripts/extract-from-pages.js
   npm run extract:pages

 Notes:
 - This is a best-effort extractor that uses heuristics (h1, meta, card bodies).
 - Output files: backend/seedData/companies.json, jobs.json, profiles.json
 - Install dependency: cheerio (added to package.json separately if needed).
*/

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = path.join(__dirname, "..", "..");
const PAGES_DIR = path.join(ROOT, "pages");
const OUT_DIR = path.join(__dirname, "..", "seedData");

if (!fs.existsSync(PAGES_DIR)) {
  console.error("pages/ directory not found at", PAGES_DIR);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) results.push(...walk(full));
    else if (d.isFile() && full.endsWith(".html")) results.push(full);
  });
  return results;
}

function textOr($el) {
  if (!$el || !$el.length) return null;
  return $el.first().text().trim() || null;
}

function extractFromHtml(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(raw);

  // Generic title heuristics
  const title = textOr($("h1")) || $("title").text() || path.basename(filePath);

  // Attempt to find company or organization references
  const companyCandidates = [
    ".company-name",
    ".company-title",
    "#company-name",
    ".employer-name",
    ".company",
  ];
  let company = null;
  for (const s of companyCandidates) {
    const t = textOr($(s));
    if (t) {
      company = t;
      break;
    }
  }

  // try to extract industry from elements or inline JS DEFAULT_COMPANY_INFO
  let industry = null;
  const industrySelectors = [".industry", "#industry", "[data-industry]"];
  for (const s of industrySelectors) {
    const t = textOr($(s));
    if (t) {
      industry = t;
      break;
    }
  }

  // Look for inline JS default objects (e.g., DEFAULT_COMPANY_INFO)
  const scripts = $("script")
    .get()
    .map((s) => $(s).html() || "");
  for (const sc of scripts) {
    if (/DEFAULT_COMPANY_INFO/.test(sc)) {
      const m = sc.match(/DEFAULT_COMPANY_INFO\s*=\s*\{([\s\S]*?)\};/);
      if (m) {
        const body = m[1];
        const indMatch = body.match(/industry:\s*"([^"]+)"/);
        if (indMatch) industry = industry || indMatch[1];
      }
    }
    // company template about text
    if (/DEFAULT_COMPANY_INFO/.test(sc) === false) {
      const webName = sc.match(/companyName:\s*"([^"]+)"/);
      if (webName && !company) company = webName[1];
    }
  }

  // Location heuristics
  const locationCandidates = [
    ".location",
    "#location",
    ".job-location",
    ".company-location",
  ];
  let location = null;
  for (const s of locationCandidates) {
    const t = textOr($(s));
    if (t) {
      location = t;
      break;
    }
  }

  // Description: prefer main card text or first sizable paragraph
  let description = null;
  const mainSelectors = [
    "main",
    ".card-body",
    ".job-description",
    ".company-about",
    "#aboutUsDisplay",
    ".site-content",
  ];
  for (const s of mainSelectors) {
    const text = $(s).text().trim();
    if (text && text.length > 50) {
      description = text
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10)
        .join("\n\n");
      break;
    }
  }

  // If not found, get first <p> or meta description
  if (!description) {
    const p = $("p")
      .get()
      .map((p) => $(p).text().trim())
      .find((t) => t && t.length > 40);
    if (p) description = p;
    else {
      const md = $('meta[name="description"]').attr("content");
      if (md) description = md.trim();
    }
  }

  // If this looks like a job post (jobPost folder or keywords)
  const isJob =
    /job|job-post|jobPost|jobDetails/i.test(filePath) ||
    /Job|Application|Responsibilities|Requirements/.test(raw);

  const record = {
    source: path.relative(ROOT, filePath),
    title: title || null,
    company: company || null,
    industry: industry || null,
    location: location || null,
    description: description || null,
    isJob,
  };

  return record;
}

function groupAndWrite(records) {
  const jobs = records
    .filter((r) => r.isJob)
    .map((r) => ({
      title: r.title,
      companyName: r.company || "Unknown",
      industry: r.industry || null,
      location: r.location || null,
      summary: r.description ? r.description.split("\n")[0] || null : null,
      description: r.description,
      source: r.source,
    }));

  const companies = records
    .filter((r) => !r.isJob && (r.company || /company/i.test(r.source)))
    .map((r) => ({
      name: r.company || r.title,
      industry: r.industry || null,
      location: r.location || null,
      description: r.description,
      source: r.source,
    }));

  const profiles = records
    .filter(
      (r) => /profile/i.test(r.source) || /Profile Dashboard/i.test(r.title),
    )
    .map((r) => ({
      displayName: r.title,
      summary: r.description,
      source: r.source,
    }));

  // Deduplicate by key
  function uniqBy(arr, keyFn) {
    const seen = new Set();
    return arr.filter((item) => {
      const k = keyFn(item);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  const jobsU = uniqBy(jobs, (j) => `${j.title}--${j.companyName}`);
  const companiesU = uniqBy(companies, (c) => c.name);
  const profilesU = uniqBy(profiles, (p) => p.displayName || p.source);

  fs.writeFileSync(
    path.join(OUT_DIR, "jobs.json"),
    JSON.stringify(jobsU, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "companies.json"),
    JSON.stringify(companiesU, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "profiles.json"),
    JSON.stringify(profilesU, null, 2),
  );

  console.log("Wrote:", {
    jobs: path.join(OUT_DIR, "jobs.json"),
    companies: path.join(OUT_DIR, "companies.json"),
    profiles: path.join(OUT_DIR, "profiles.json"),
  });
}

function main() {
  console.log("Scanning pages directory:", PAGES_DIR);
  const files = walk(PAGES_DIR);
  console.log("Found HTML files:", files.length);
  const records = files.map(extractFromHtml);
  groupAndWrite(records);
}

main();
