# Code & Design Guide

Purpose: concise coding and design standards to keep the Japan SSW frontend consistent, accessible, and easy to maintain.

## Project conventions

- File layout: keep HTML at the repo root and `pages/` for additional views. Assets live under `assets/` (css, images, icons).
- CSS: single source `assets/css/main.css` for base + components; add small component files only when justified.
- No JavaScript for initial release: keep interactions CSS-only. If JS is required later, place modules under `assets/js/modules/` and use ES modules.

## HTML

- Use semantic HTML elements (`header`, `main`, `section`, `article`, `nav`, `footer`).
- Use accessible landmarks and ARIA only when necessary; prefer semantics first.
- All pages must include a descriptive `meta description`, `lang` attribute on `<html>`, and accessible `alt` text on images.

## CSS

- Naming: prefer clear class names (utility or component). Use small, reusable utility classes for spacing/centering rather than inline styles.
- Variables: use CSS custom properties in `:root` for colors, font stacks, spacing tokens, and shadows.
- Layout: prefer CSS Grid for multi-column layouts and Flexbox for small axis-aligned layouts.
- Responsiveness: mobile-first rules and breakpoints at 900px and 576px as needed.
- Accessibility: visible focus styles, sufficient color contrast, reduced-motion support.

## Typography

- Body: `Open Sans` (loaded via Google Fonts) — use `--font-body`.
- Headings: system Helvetica stack via `--font-heading`.
- Japanese text: use `--font-jp` and apply via `:lang(ja)` or `.jp` when necessary.
- Sizes: H1 36px/44px, H2 32px/36px, H3 28px/36px (set in `main.css`).

## Accessibility

- Keyboard focus must be visible for interactive controls (`:focus` outlines).
- Forms should have associated labels (or aria-label) and clear placeholder behavior.
- Test pages with a contrast checker and keyboard-only navigation.

## Images & assets

- Prefer optimized SVGs for logos and icons. Use compressed raster formats (JPEG/WEBP) for photos.
- Store images under `assets/images/` and reference them with relative paths.

## Performance

- Keep styles minimal. Avoid large third-party libraries for initial release.
- Defer JS until needed; prefer native browser features when possible.

## Contribution guidance (quick)

- Follow the PR template: short description, screenshots, accessibility notes, test steps.
- Run a local preview and include a screenshot of mobile/desktop in PRs when layout changes are involved.

## Design tokens (reference)

- `--primary-color: #eb0000` — primary CTAs
- `--secondary-color: #a57668` — secondary accents
- `--accent-color: #008cff` — accents and links
- `--light-color: #fcfcfc` — backgrounds/cards
- `--dark-color: #290000` — headings, dark UI, footer

If you need this document expanded into separate coding style and visual design sections, I can split it into `CODE_GUIDE.md` and `DESIGN_GUIDE.md` under `docs/`.
