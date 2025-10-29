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
    // Prefer wrapping meaningful page content into a top-level main element.
    // We'll move all body children except header/nav/footer/script/link/meta/style into <main>.
    const bodyChildren = Array.from(doc.body.childNodes);
    const skipTags = [
      "HEADER",
      "NAV",
      "FOOTER",
      "SCRIPT",
      "LINK",
      "META",
      "STYLE",
    ];
    const movable = bodyChildren.filter((n) => {
      if (n.nodeType !== 1) return true; // text nodes should be moved
      if (skipTags.includes(n.tagName)) return false;
      // don't move empty whitespace-only text nodes
      if (n.nodeType === 3 && !n.textContent.trim()) return false;
      return true;
    });
    if (movable.length > 0) {
      const main = doc.createElement("main");
      main.id = "main-content";
      // Insert main before the first movable node for stable order
      const first = movable[0];
      doc.body.insertBefore(main, first);
      for (const node of movable) {
        main.appendChild(node);
      }
      changed = true;
    } else {
      // create an empty main at end of body as a fallback
      const main = doc.createElement("main");
      main.id = "main-content";
      doc.body.appendChild(main);
      changed = true;
    }
  }

  // remove or fill empty headings
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  for (const h of headings) {
    if (!h.textContent || !h.textContent.trim()) {
      h.textContent = titleFromDocument(dom, filePath);
      changed = true;
    }
  }

  // ensure at least one H1 exists
  if (!doc.querySelector("h1")) {
    const h1 = doc.createElement("h1");
    h1.textContent = titleFromDocument(dom, filePath);
    const mainEl = doc.querySelector("main") || doc.body;
    // insert at the start
    if (mainEl.firstChild) mainEl.insertBefore(h1, mainEl.firstChild);
    else mainEl.appendChild(h1);
    changed = true;
  }

  // selects: ensure accessible name (label association or aria-label)
  const selects = Array.from(doc.querySelectorAll("select"));
  let idCounter = 1;
  for (const sel of selects) {
    const hasName =
      sel.hasAttribute("aria-label") ||
      sel.hasAttribute("aria-labelledby") ||
      sel.getAttribute("title");
    // check for associated label (label[for=id] or parent label)
    let hasLabel = false;
    const sid = sel.getAttribute("id");
    if (sid && doc.querySelector(`label[for="${sid}"]`)) hasLabel = true;
    if (!hasLabel && sel.closest("label")) hasLabel = true;
    if (!hasName && !hasLabel) {
      // try to find a preceding label sibling
      const prev = sel.previousElementSibling;
      if (prev && prev.tagName === "LABEL" && prev.textContent.trim()) {
        // ensure select has id and associate
        if (!sid) {
          const newId = `auto-select-${idCounter++}`;
          sel.setAttribute("id", newId);
        }
        prev.setAttribute("for", sel.getAttribute("id"));
      } else {
        // set conservative aria-label
        sel.setAttribute(
          "aria-label",
          `${titleFromDocument(dom, filePath)} select`
        );
      }
      changed = true;
    }
  }

  // anchors with no discernible text and no meaningful child alt: add aria-label
  const anchors = Array.from(doc.querySelectorAll("a"));
  for (const a of anchors) {
    const text = a.textContent && a.textContent.trim();
    const hasAria = a.hasAttribute("aria-label") || a.hasAttribute("title");
    const imgs = Array.from(a.querySelectorAll("img")).filter((i) =>
      (i.getAttribute("alt") || "").trim()
    );
    if (!text && !hasAria && imgs.length === 0) {
      a.setAttribute("aria-label", titleFromDocument(dom, filePath) + " link");
      changed = true;
    }
  }

  // move <main> or <footer> to be direct children of body if nested (avoid nested landmark issues)
  const mainEl = doc.querySelector("main");
  if (
    mainEl &&
    mainEl.parentElement &&
    mainEl.parentElement.tagName !== "BODY"
  ) {
    doc.body.appendChild(mainEl);
    changed = true;
  }
  const footer = doc.querySelector("footer");
  if (
    footer &&
    footer.parentElement &&
    footer.parentElement.tagName !== "BODY"
  ) {
    doc.body.appendChild(footer);
    changed = true;
  }

  // aria-hidden elements that contain focusable elements: remove aria-hidden (they mustn't hide focusable content)
  const hiddenEls = Array.from(doc.querySelectorAll('[aria-hidden="true"]'));
  for (const he of hiddenEls) {
    const focusable = he.querySelector(
      "a[href], button, input, select, textarea, [tabindex]"
    );
    if (focusable) {
      he.removeAttribute("aria-hidden");
      changed = true;
    }
  }

  // de-duplicate ids
  const idMap = new Map();
  const renamed = new Map(); // original -> new
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
    renamed.set(id + "::" + el.nodeName + "::" + (el.className || ""), newId);
    el.setAttribute("id", newId);
    changed = true;
  }

  // Update references to renamed ids in common attributes
  if (renamed.size > 0) {
    // helper to replace exact id matches in a space-separated list
    function replaceIdListAttr(el, attr) {
      if (!el.hasAttribute(attr)) return;
      const v = el.getAttribute(attr);
      const parts = v.split(/\s+/).map((p) => {
        for (const [, newId] of Array.from(renamed.entries())) {
          const orig = newId.replace(/-\d+$/, "");
          if (p === orig) return newId;
        }
        return p;
      });
      el.setAttribute(attr, parts.join(" "));
    }

    // update label[for], aria-labelledby, aria-controls
    const labels = Array.from(doc.querySelectorAll("label[for]"));
    for (const lab of labels) {
      const v = lab.getAttribute("for");
      for (const [, newId] of Array.from(renamed.entries())) {
        const orig = newId.replace(/-\d+$/, "");
        if (v === orig) lab.setAttribute("for", newId);
      }
    }
    const allEls = Array.from(doc.querySelectorAll("*"));
    for (const el of allEls) {
      replaceIdListAttr(el, "aria-labelledby");
      replaceIdListAttr(el, "aria-controls");
      // data-bs-target is usually '#id'
      if (el.hasAttribute("data-bs-target")) {
        const t = el.getAttribute("data-bs-target");
        if (t && t.startsWith("#")) {
          const idRef = t.slice(1);
          for (const [, newId] of Array.from(renamed.entries())) {
            const orig = newId.replace(/-\d+$/, "");
            if (idRef === orig) el.setAttribute("data-bs-target", "#" + newId);
          }
        }
      }
      // href anchors that are page-internal like '#id'
      if (el.hasAttribute("href")) {
        const h = el.getAttribute("href");
        if (h && h.startsWith("#")) {
          const idRef = h.slice(1);
          for (const [, newId] of Array.from(renamed.entries())) {
            const orig = newId.replace(/-\d+$/, "");
            if (idRef === orig) el.setAttribute("href", "#" + newId);
          }
        }
      }
    }
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
