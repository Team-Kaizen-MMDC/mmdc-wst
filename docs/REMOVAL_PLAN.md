# Phase 2 — Legacy Selector Removal Plan

This document describes the safe, incremental removal of legacy (pre-BEM) selectors from `assets/css/main.css`. It groups selectors into small batches, lists verification steps, rollback instructions, and recommended commit/PR hygiene.

Goals

- Remove duplicated legacy selectors once BEM aliases and HTML annotations are confirmed present.
- Keep changes small and reversible (one component per removal commit).
- Use manual smoke checks and simple visual diffs to detect regressions quickly.

Batching strategy

- Group by component and risk surface. Prefer removing selectors that are scoped (header, feature-card) before more widely-used layout helpers (hero-inner, footer-grid).
- Each batch includes: files to change, selectors to remove, sanity-check pages, and viewport checklist.

Batch 1 — Header + Primary Buttons (low risk)

- Selectors to remove from `assets/css/main.css`:

  - `.header-inner` (example/sample markup lines and any duplicate rules)
  - `.brand` (sample markup)
  - `.site-nav` (legacy nav container)
  - `.header-actions` (legacy actions wrapper)
  - `.login-btn` (if HTML uses `.site-header__login-btn`) — treat `.login-btn` as utility only if still used elsewhere.

- Files to check after removal:

  - `index.html`, `pages/about.html`, `pages/agency.html` (confirm header markup uses `.site-header__*`)

- Verification checklist:

  - Start local server: `python3 -m http.server 8000`
  - Open homepage, about, and agency pages in desktop (1280x800) and mobile (375x812) widths.
  - Confirm header alignment, nav links, signup/login buttons render and have expected spacing/colors.
  - Run a quick text search for any remaining `.header-inner` or `.brand` in HTML.

- Rollback:
  - Revert the single commit that removed the selectors: `git revert <commit>` or reset branch if not pushed.

Batch 2 — Feature Cards (low-medium risk)

- Selectors to remove:

  - `.feature-card h3`, `.feature-card p`, `.feature-card .btn` (retain `.btn` primitive)

- Files to check:

  - `index.html`, `pages/about.html`, `pages/agency.html` (feature card markup)

- Verification checklist: same as Batch 1 plus inspect feature cards in page sections for spacing and CTA behavior.

Batch 3 — Job Panel & Company Card (medium risk)

- Selectors to remove:

  - `.job-item`, `.job-item h4`, `.job-item .job-meta` (after ensuring `.job-panel__*` used)
  - `.company-card` legacy inner selectors if any remain (ensure `.company-card__title` used)

- Files to check:

  - `index.html` (job-panel, company grid)

- Verification checklist: confirm job item titles, meta lines, and company tiles render unchanged.

Batch 4 — Footer (higher risk)

- Selectors to remove:

  - `.footer-grid`, `.footer-cta`, `.footer-cta-actions`, `.footer-links`, `.link-col`, `.footer-legal`, `.legal-inner`

- Files to check:

  - All pages containing footers (site-wide), including `index.html`, `pages/*`.

- Verification checklist:
  - Inspect footer content across pages and viewport sizes.
  - Confirm link columns, CTA area, and legal bar styles are intact.

Batch 5 — Hero Layout Helpers (largest-scope)

- Selectors to consider:

  - `.hero-inner`, `.hero-copy`, `.hero-ctas`, `.hero-art`, `.hero-search`

- Notes: these are used as layout helpers across different hero variants; convert to `.hero__inner` only after confirming no collisions, or keep as layout utilities if needed.

Testing & Visual Regression

- Manual smoke testing:

  - Start a local server: `python3 -m http.server 8000`
  - Use Chrome/Firefox devtools to test viewports: desktop (1280x800), tablet (768x1024), mobile (375x812).
  - Walk through page flows focusing on areas affected by the removal.

- Quick visual diff approach (optional):
  - Capture before/after screenshots using `screencapture` (macOS) or headless tools.
  - Compare images with `diff` or an image diff tool.

Commands

Start server (macOS):

```bash
python3 -m http.server 8000
```

Search for remaining legacy selectors:

```bash
grep -R "\.header-inner\|\.brand\|\.feature-card h3\|\.job-item\|\.footer-grid" -n .
```

Rollback guidance

- Prefer `git revert <commit>` for safety when the changes are already pushed.
- If the branch is local and not shared, you may use `git reset --hard <sha-before>` and force-push.

Commit & PR guidance

- Make one commit per batch with clear message, e.g., `style(bem): remove legacy header selectors (.header-inner, .brand)`.
- In the PR description include the `docs/LEGACY_USAGE_REPORT.md` and `docs/BEM_RENAME_MAP.md` links and the smoke-test checklist used.

Acceptance criteria for Phase 2 completion

- All legacy selectors listed in `docs/LEGACY_USAGE_REPORT.md` are either removed or intentionally retained with justification.
- No critical visual regressions on core pages after removals.
- Linter errors for empty rulesets removed.
- Changes committed and PR opened for review.
