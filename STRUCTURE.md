# Folder Structure Documentation

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

**Documentation Policy:**

- Do NOT use emojis in any documentation files, including `README.md`, `STRUCTURE.md`, and Copilot instructions.

This document outlines the folder structure for the Japan SSW static site (Phase 1 — HTML + CSS).

## Root directory

- `index.html` — Main homepage entry
- `README.md` — Project documentation and contributor notes
- `.gitignore` — Git ignore configuration

## Folders

### `/pages/`

Contains site pages (HTML):

- `about.html` — About page
- `services.html` — Services page
- `contact.html` — Contact page (form)

### `/assets/`

Static assets grouped by type. Only CSS and static assets are active in Phase 1; JavaScript is Phase 2 (optional).

#### `/assets/css/`

- `main.css` — Primary stylesheet (design tokens, layout, components, utilities)
- `components.css` — Optional reusable components (Phase 2 organization)
- `utilities.css` — Optional utilities (Phase 2 organization)

#### `/assets/js/` (Phase 2 — optional)

This project is Phase 1: HTML + CSS only. JavaScript will be introduced later if needed. When added, prefer small, modular files under `/assets/js/modules/` and document them in `docs/`.

#### `/assets/images/`, `/assets/icons/`, `/assets/fonts/`

- Image and media assets.
- Icons and favicons.
- Web fonts and font-face sources.

### `/components/`

Reserved for reusable server-side or static HTML fragments and templates. Keep filenames consistent with HTML naming (lowercase, hyphens) e.g. `contact-form.html`.

### `/.github/`

- Repository config and guidance files (pull request templates, `copilot_instructions.md`).

## Naming conventions

- HTML files: lowercase with hyphens (e.g., `contact-form.html`).
- CSS files: lowercase with hyphens (e.g., `main.css`).
- JS modules: camelCase (e.g., `navigationController.js`) when Phase 2 is enabled.
- Images: lowercase with hyphens (e.g., `hero-image.jpg`).
- Component fragments: lowercase with hyphens to match HTML convention (e.g., `contact-form.html`).

## Guidelines

1. Keep related assets together by feature or page.
2. Use descriptive, predictable filenames.
3. Prefer semantic HTML and small, focused CSS components.
4. Reserve the root for essential files only.

If you want, I can also:

- Remove speculative files from the repo (create the folders only), or
- Add a short Phase 2 checklist with recommended JS module conventions in `docs/`.
