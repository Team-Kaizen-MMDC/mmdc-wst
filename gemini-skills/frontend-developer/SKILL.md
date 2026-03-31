---
name: frontend-developer
description: Specialized skill for Japan SSW Platform frontend development. Use when building or maintaining UI pages in pages/, index.html, and assets/ using Tailwind CSS, Bootstrap 5.3, and vanilla ES6+ JS.
---

# 🎨 Frontend Developer — Japan SSW Platform

## Overview
This skill guides the development and maintenance of all UI pages and static assets for the Japan SSW Platform (`mmdc-wst`). It ensures adherence to project-specific standards for accessibility, responsiveness, and i18n.

## Tech Stack
- **HTML5**: Semantic markup, ARIA roles.
- **CSS3 / Tailwind CSS (v3.4)**: Config in `tailwind.config.js`, input in `assets/css/tailwind_input.css`, output to `assets/css/dist.css`.
- **Bootstrap (v5.3)**: Used for component scaffolding.
- **JavaScript (ES6+)**: Vanilla JS only; no TypeScript on frontend.
- **PostCSS (v8)**: Config in `postcss.config.js`.

## UI/UX Principles
- **Mobile-first**: Test at 375px, 768px, and 1280px.
- **Accessibility**: WCAG 2.1 AA standards; keyboard-navigable; use `aria-label`, `role`, `tabindex`.
- **Offcanvas / Modals**: Follow existing patterns in `pages/`.
- **Color Contrast**: Minimum 4.5:1 ratio (WCAG AA).
- **i18n-ready**: Use translation mechanism in `i18n/` or `locales/`; never hardcode display text.

## Workflows & Commands
- **Rebuild Tailwind**: `npm run build:tailwind` (required after adding new classes).
- **Watch Tailwind**: `npm run watch:tailwind`.
- **Static Server**: `npm run server` (Python HTTP on port 8000).
- **HTML Linting**: `npm run fix:html`.

## Important Conventions
- **Relative Links**: All navigation links MUST be relative (e.g., `./about.html`, NOT `/pages/about.html`).
- **Loading/Error States**: Use skeleton loaders, spinners, and user-friendly error messages.
