---
name: "frontend-developer"
title: "Frontend Developer"
description: "Skill profile for Frontend Developer — UI, accessibility, Tailwind, i18n."
---

# 🎨 Frontend Developer — Skill Profile
> Japan SSW Platform (`mmdc-wst`)

## Responsibilities
- Build and maintain all UI pages under `pages/`, `index.html`, and static assets in `assets/`
- Implement responsive, accessible layouts following WCAG 2.1 AA standards
- Manage i18n/localization strings in `locales/` and `i18n/`
- Build and watch Tailwind CSS via `npm run build:tailwind` / `npm run watch:tailwind`
- Ensure all navigation links are **relative** (never `/pages/…` — this breaks GitHub Pages)

## Required Tech Stack
| Technology | Version | Notes |
|---|---|---|
| HTML5 | 5.2 | Semantic markup, ARIA roles |
| CSS3 / Tailwind CSS | Tailwind v3.4 | Config in `tailwind.config.js`, input in `assets/css/tailwind_input.css`, output to `assets/css/dist.css` |
| Bootstrap | 5.3 | Used alongside Tailwind for component scaffolding |
| JavaScript | ES6+ | Vanilla JS, no TypeScript on frontend |
| PostCSS | v8 | Config in `postcss.config.js` |

## UX / UI Principles
- **Mobile-first** responsive design — test at 375 px, 768 px, 1280 px breakpoints
- **Accessibility first**: all interactive elements must be keyboard-navigable; use `aria-label`, `role`, `tabindex` correctly
- **Offcanvas / modal patterns**: follow existing offcanvas pattern in `pages/` — see `offcanvas.spec.ts` for expected behavior
- **Color contrast**: minimum 4.5:1 ratio for normal text (WCAG AA)
- **Consistent typography**: use Bootstrap + Tailwind utility classes; avoid inline styles
- **i18n-ready**: all user-facing strings must use the `i18n/` translation mechanism; never hardcode display text
- **Loading states**: show skeleton loaders or spinners for async content
- **Error states**: display user-friendly messages, not raw API errors

## Project Conventions
- Static server: `npm run server` (Python HTTP on port 8000)
- HTML linting: `npm run fix:html`
- Tailwind rebuild required after any class additions: `npm run build:tailwind`
- Do not use absolute paths starting with `/pages/` in `href` or `src` attributes

## Related Skills
- [i18n / Localization Engineer](../i18n-engineer/SKILL.MD)
- [Test Engineer](../test-engineer/SKILL.MD) — frontend Playwright tests
- [Security Engineer](../security-engineer/SKILL.MD) — frontend security headers
