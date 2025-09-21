# BEM Rename Map

This file contains the proposed mapping from current selectors to BEM-style selectors. Apply changes component-by-component and update HTML accordingly.

Guiding rules

- Blocks: use `site-header`, `feature-card`, `site-footer`, `job-panel`, `company-card`, etc.
- Elements: `block__element` (e.g., `site-header__nav`).
- Modifiers: `block--modifier` (e.g., `site-footer--dark`).
- Utilities (spacing, grid, buttons) remain as-is: `.mt-sm`, `.grid-2`, `.btn`, `.btn-primary`.

---

## Header (block: `site-header`)

- `.site-header` → `.site-header` (block stays)
- `.header-inner` → `.site-header__inner`
- `.brand` → `.site-header__brand`
- `.site-nav` → `.site-header__nav`
- `.site-nav a` → `.site-header__nav-link`
- `.header-actions` → `.site-header__actions`
- `.header-actions .signup-link` → `.site-header__signup`
- `.login-btn` → `.site-header__login-btn` (or keep `.login-btn` as utility/variant of `.btn`)

Notes:

- Update HTML across all pages to replace element class names.
- Keep responsive rules targeting the block (e.g., `.site-header__inner`) rather than global selectors.

---

## Feature Card (block: `feature-card`)

- `.feature-card` → `.feature-card` (block stays)
- `.feature-card h3` → `.feature-card__title`
- `.feature-card p` → `.feature-card__desc`
- `.feature-card .btn` → `.feature-card__cta` (prefer to use `.btn` + `.feature-card__cta`)
- `.feature-card img` → `.feature-card__img`
- `.feature-card .btn { margin-top }` → `.feature-card__cta { margin-top }` (update CSS rule)

Notes:

- Prefer keeping `.btn` as the primitive and adding `.feature-card__cta` for layout-specific spacing.

---

## Footer (block: `site-footer`)

- `.site-footer` → `.site-footer` (block stays)
- `.site-footer--dark` → `.site-footer--dark` (modifier stays)
- `.footer-grid` → `.site-footer__grid`
- `.footer-cta` → `.site-footer__cta`
- `.footer-cta .muted` → `.site-footer__cta-muted`
- `.footer-cta-actions` → `.site-footer__cta-actions`
- `.footer-links` → `.site-footer__links`
- `.link-col` → `.site-footer__link-col`
- `.footer-legal` → `.site-footer__legal`
- `.legal-inner` → `.site-footer__legal-inner`

Notes:

- Keep `.site-footer--dark` as the modifier applied to the block.

---

## Job Panel (block: `job-panel`)

- `.job-panel` → `.job-panel` (block stays)
- `.job-item` → `.job-panel__item`
- `.job-item h4` → `.job-panel__title`
- `.job-item .job-meta` → `.job-panel__meta`

Notes:

- Keep grid/layout helpers separate.

---

## Company Card (block: `company-card`)

- `.company-card` → `.company-card` (block stays)
- If internal elements exist (logo, name), map to `.company-card__logo`, `.company-card__name`.

---

## Hero

- `.hero` → `.hero` (block stays)
- `.hero-inner` → `.hero__inner` (note: currently used in multiple contexts; if ambiguous, scope as `.hero .hero-inner` → `.hero__inner`)
- `.hero-copy` → `.hero__copy`
- `.hero-ctas` → `.hero__ctas`
- `.hero-art` → `.hero__art`
- `.hero-search` → `.hero__search`

Notes:

- `hero-inner` appears multiple times; ensure renaming doesn't collide with other uses.

---

## Utilities & Buttons

- Keep: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-dark`, `.mt-sm`, `.grid-2`, etc.
- Replace descendant usages where possible with explicit BEM selectors referencing the block + element, e.g., `.feature-card .btn` → `.feature-card__cta.btn`.

---

## Automated/Manual steps

1. Create `docs/BEM_RENAME_MAP.md` (this file).
2. For each component (header first):
   - Update CSS selectors in `assets/css/main.css`.
   - Update HTML files to match new classes.
   - Run local preview and visual/a11y checks.
   - Commit changes with message: `style(bem): convert <component> to BEM`.
3. Repeat per component.
4. Update docs (`docs/CSS_MAIN_GUIDE.md`, `assets/css/main.css` top doc) to explain BEM usage.

---
