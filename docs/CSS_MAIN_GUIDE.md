# CSS Main Guide

This document explains the purpose, structure, and conventions used in `assets/css/main.css`.

## Purpose

Central stylesheet for Phase 1 (static HTML + CSS). It contains design tokens, layout primitives, component styles, utilities, and responsive rules.

## File structure (high level)

1. Design tokens - CSS custom properties (colors, spacing, radii, shadows).
2. Resets & base typography.
3. Layout primitives - `.container`, header, footer.
4. Components - hero, feature cards, job panels, company grid, CTA bands.
5. Utilities - spacing helpers (`.mt-sm`, `.mt-md`), text helpers, small grid helpers.
6. Responsive overrides and accessibility tweaks.

## Conventions

- Class naming: semantic classes for components and short utility classes for spacing and typography.
- Buttons: use `.btn` along with `.btn-primary`, `.btn-secondary`, or `.btn-dark`.
- Header: keep the `site-header` contract consistent across pages.

## Header contract

All pages should use the same header markup for consistent navigation and behavior.

Markup example:

```html
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">Japan SSW</a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="#jobs">Jobs</a>
      <a href="#companies">Companies</a>
      <a href="pages/agency.html">Agency</a>
      <a href="pages/about.html">About</a>
    </nav>
    <div class="header-actions">
      <a class="signup-link muted" href="#">Signup</a>
      <a class="btn btn-primary login-btn" href="#">Log in</a>
    </div>
  </div>
</header>
```

Notes:

- For pages inside the `pages/` folder use relative paths (e.g., `../index.html#jobs` or `about.html`).
- The `header-actions` container houses non-navigation CTAs (sign up / login).

## Responsive rules

- The CSS includes breakpoints that stack the header on narrow viewports and allow the nav to wrap.

To test locally:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Accessibility

- Focus states are defined for `.btn`, `.form-control`, and `.site-nav a`.
- Keep keyboard order: Brand -> Nav -> Header actions.

## Phase 2 migration notes

- If enabling Bootstrap, prefer using a scoped subset to avoid large overrides.
- Use progressive enhancement: keep semantic HTML and layer JS behaviors on top.

## How to extend

- Add new component styles near related rules.
- Add utilities under the Utilities section and name them predictably (e.g., `.mt-xl`).
- Keep token usage consistent: reference `var(--primary-color)`.

## Common quick fixes

- Navigation spacing: adjust `.site-nav a { margin-left: X }`.
- Header wrapping issues: tune `.header-inner` breakpoint rules.

