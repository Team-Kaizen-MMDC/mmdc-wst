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

- Base font stack: the project uses a system + Inter stack exposed as `--font-family-sans` in `assets/css/main.css` (`Inter`, system-ui, -apple-system, `Segoe UI`, Roboto, `Helvetica Neue`, Arial, sans-serif). The `html` element sets this stack by default.
- Monospace stack: available as `--font-family-mono` for code-like UI elements.
- Headings: use semantic headings (H1..H6) and rely on the stylesheet's sizing; override only when necessary.
- Sizes: H1/H2/H3 sizes are controlled in `main.css` as part of the base/type scale—prefer editing `--base-font-size` or the heading rules instead of inline styles.

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

The canonical token definitions live in the top of `assets/css/main.css` inside the `:root` block. Change them there to affect the whole site.

- `--primary-color: #eb0000` — primary CTAs
- `--secondary-color: #a57668` — secondary accents
- `--accent-color: #008cff` — accents and links
- `--light-color: #fcfcfc` — backgrounds/cards
- `--dark-color: #290000` — headings, dark UI, footer
- `--ui-color: #f7f7f7` — UI surface / subtle backgrounds
- `--border-radius: 8px` — global rounding
- `--transition: all 0.2s ease` — default motion timing
- `--box-shadow: 0 6px 18px rgba(0,0,0,0.08)` — default shadow
- `--font-family-sans` and `--font-family-mono` — typography stacks

Example usage in CSS:

```css
.btn-primary {
  background: var(--primary-color);
  color: #fff;
}
.site-footer {
  background: var(--dark-color);
  color: #fff;
}
```

## Recommended Links

- **Open Sans (Google Fonts):** [Open Sans — Google Fonts](https://fonts.google.com/specimen/Open+Sans)
- **MDN Web Docs (HTML/CSS/JS):** [MDN Web Docs](https://developer.mozilla.org/)
- **WAI / ARIA:** [W3C Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/) and [WAI-ARIA 1.2 Spec](https://www.w3.org/TR/wai-aria-1.2/)
- **Accessibility Guidance:** [WebAIM](https://webaim.org/) and [The A11Y Project](https://www.a11yproject.com/)
- **Image Optimization Tools / Guides:** [Squoosh](https://squoosh.app/) and [Web.Dev — Image Optimization](https://web.dev/fast/#optimize-images)
