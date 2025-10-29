#!/usr/bin/env node
// Conservative HTML auto-fixer for low-risk accessibility/usability issues
//  - add missing <html lang="en"> if absent
//  - add missing <title> using h1 or filename
//  - ensure a <main> element exists (wrap body content or insert an empty <main>)
//  - remove empty <h1..h6> elements or fill with filename placeholder
//  - de-duplicate duplicate ids by appending a numeric suffix

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(__dirname, "fixes-backup");

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function backup(filePath, content) {
  const rel = path.relative(ROOT, filePath);
  const dest = path.join(BACKUP_DIR, rel);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
}

function safeWrite(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function titleFromDocument(dom, filename) {
  const h1 = dom.window.document.querySelector("h1");
  if (h1 && h1.textContent.trim()) return h1.textContent.trim();
  return path.basename(filename, path.extname(filename)).replace(/[-_]/g, " ");
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(original);
  const doc = dom.window.document;
  let changed = false;

  // html[lang]
  const html = doc.documentElement;
  if (!html.hasAttribute("lang") || !html.getAttribute("lang").trim()) {
    html.setAttribute("lang", "en");
    changed = true;
  }

  // title
  if (
    !doc.querySelector("title") ||
    !doc.querySelector("title").textContent.trim()
  ) {
    const t = doc.querySelector("title") || doc.createElement("title");
    const titleText = titleFromDocument(dom, filePath);
    t.textContent = titleText;
    if (!doc.querySelector("title")) doc.head.appendChild(t);
    changed = true;
  }

  // ensure <main>
  if (!doc.querySelector("main")) {
    // try to find a main landmark candidate (article or #content)
    const candidate =
      doc.querySelector("article") ||
      doc.getElementById("content") ||
      doc.getElementById("main") ||
      null;
    if (candidate) {
      // wrap candidate in main
      const main = doc.createElement("main");
      main.id = "main-content";
      candidate.parentNode.replaceChild(main, candidate);
      main.appendChild(candidate);
    } else {
      // create an empty main at end of body
      const main = doc.createElement("main");
      main.id = "main-content";
      doc.body.appendChild(main);
    }
    changed = true;
  }

  // remove or fill empty headings
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  for (const h of headings) {
    if (!h.textContent || !h.textContent.trim()) {
      h.textContent = titleFromDocument(dom, filePath);
      changed = true;
    }
  }

  // de-duplicate ids
  const idMap = new Map();
  const all = Array.from(doc.querySelectorAll("[id]"));
  for (const el of all) {
    const id = el.getAttribute("id");
    if (!id) continue;
    if (!idMap.has(id)) {
      idMap.set(id, 1);
      continue;
    }
    const count = idMap.get(id) + 1;
    idMap.set(id, count);
    const newId = `${id}-${count}`;
    el.setAttribute("id", newId);
    changed = true;
  }

  if (changed) {
    ensureBackupDir();
    backup(filePath, original);
    const formatted = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
    safeWrite(filePath, formatted);
    return { file: path.relative(ROOT, filePath), changed: true };
  }
  return { file: path.relative(ROOT, filePath), changed: false };
}

function main() {
  const pattern = "**/*.html";
  const ignore = [
    "**/node_modules/**",
    "**/archive/**",
    "**/assets/**",
    "**/tests/**",
  ];
  const files = glob.sync(pattern, { ignore, nodir: true, cwd: ROOT });
  const results = [];
  for (const f of files) {
    try {
      results.push(fixFile(f));
    } catch (err) {
      console.error("ERROR processing", f, err.message);
    }
  }
  console.log("Fixer run complete. Summary:");
  for (const r of results) {
    console.log(r.changed ? `MODIFIED: ${r.file}` : `OK:       ${r.file}`);
  }
}

if (require.main === module) main();
