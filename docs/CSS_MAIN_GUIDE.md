# CSS Main Guide

This document explains the purpose, structure, and conventions used in `assets/css/main.css`.

## Purpose

Central stylesheet for Phase 1 (static HTML + CSS). It contains design
tokens, layout primitives, component styles, utilities, and responsive
rules.

## File structure (high level)

1. Design tokens - CSS custom properties (colors, spacing, radii, shadows).
2. Resets & base typography.
3. Layout primitives - `.container`, header, footer.
4. Components - hero, feature cards, job panels, company grid, CTA bands.
5. Utilities - spacing helpers (`.mt-sm`, `.mt-md`), text helpers, small grid helpers.
6. Responsive overrides and accessibility tweaks.

## Conventions

- Class naming: semantic classes for components and short utility
  classes for spacing and typography.
- Buttons: use `.btn` along with `.btn-primary`, `.btn-secondary`, or `.btn-dark`.
- Header: keep the `site-header` contract consistent across pages.

- The CSS includes breakpoints that stack the header on narrow viewports
  and allow the nav to wrap.

## Design tokens and where to edit

The design tokens (colors, radii, typography stacks, and common motion
tokens) live at the top of `assets/css/main.css` in the `:root` block.
Update those variables to change the site's global theme.

Common tokens you'll find and may edit:

```css
:root {
  --primary-color: #eb0000;
  --secondary-color: #a57668;
  --accent-color: #008cff;
  --light-color: #fcfcfc;
  --dark-color: #290000;
  --ui-color: #f7f7f7;

  --border-radius: 8px;
  --transition: all 0.2s ease;
  --box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);

  --font-family-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  --font-family-mono: "SFMono-Regular", Menlo, Monaco, "Roboto Mono",
    "Courier New", monospace;

  --base-font-size: 16px;
}
```

Changing `--primary-color` will update CTAs and other components that
reference it. If you want to experiment locally, edit these values then
refresh the served pages.

Additional typography tokens you may see in `:root`:

- `--font-heading` — heading font stack (Helvetica family by default)
- `--font-body` — body font stack (Open Sans + system fallbacks)
- `--font-jp` — Japanese font stack (Yu Gothic / Hiragino / Meiryo)

Note about loading fonts: `--font-body` references `Open Sans`. To
ensure consistent rendering across environments, add this to your page
`<head>` if you want the web font loaded:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

## Header contract

All pages should use the same header markup for consistent navigation and behavior.

Markup example:

```html
<header class="site-header">
  <div class="container header-inner">
  <a class="brand" href="index.html">Japan SSW</a>
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

- For pages inside the `pages/` folder use relative paths. Example:
  `../index.html#jobs` or `about.html`.
- The `header-actions` container houses non-navigation CTAs
  (sign up / login).

## Responsive rules

- The CSS includes breakpoints that stack the header on narrow viewports
  and allow the nav to wrap.

To test locally:

```bash
python3 -m http.server 8000
# Visit:
# http://localhost:8000
```

## Accessibility

- Focus states are defined for:
  - `.btn`
  - `.form-control`
  - `.site-nav a`
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
