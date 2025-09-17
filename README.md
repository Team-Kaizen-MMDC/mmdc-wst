# Japan SSW

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![HTML5](https://img.shields.io/badge/HTML5-5.2-orange)
![CSS3](https://img.shields.io/badge/CSS3-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Node.js](https://img.shields.io/badge/Node.js-18-green)

A modern, responsive website scaffold. Phase 1 of this project uses only
HTML and CSS (no JavaScript or Bootstrap). Phase 2 will add JavaScript
features and optional Bootstrap utilities.

## Table of Contents

- Overview
- Features
- Technologies
- Getting Started
- Development
- File Structure
- Best Practices
- Code & Design Guide
- Contributing
- Deployment
- License & Team

## Overview
Japan SSW is a frontend-first static site scaffold used as the Phase‑1 deliverable for the MMDC/WST project. The site demonstrates a clean, responsive layout and a small set of canonical pages used to communicate services and contact information. Phase‑1 intentionally uses only HTML and CSS (no runtime JavaScript or Bootstrap utilities) to keep the presentation layer simple and portable.

This repository holds the wireframe-driven static pages and a canonical stylesheet (`assets/css/main.css`) that defines the design tokens (colors, spacing, typography) and header contract used across pages.

## Features (Phase 1)

- Responsive, mobile-first layout using CSS Grid and Flexbox
- Accessibility best practices (semantic HTML, ARIA)
- Performance: minimal assets, optimized images
- Simple, static deployment ([GitHub Pages](https://pages.github.com/))

Phase 2 roadmap (planned):

- Add progressive JavaScript features (forms, interactivity)
- Optionally enable Bootstrap utilities for faster UI components
- Add unit/integration tests and CI checks


## Wireframe Summary

This project follows a simple wireframe that maps directly to the HTML pages in this repo. The wireframe focuses on clarity, a small content hierarchy, and predictable navigation:

- **Primary purpose:** present the team's services and contact details with an approachable, readable layout.
- **Target audience:** site visitors seeking information about the team's offerings and how to get in touch.
- **Main pages:** `index.html` (home/hero), `pages/agency.html` (about / agency overview), `pages/services.html` (services grid or list), `pages/contact.html` (contact info / form), `about.html` (team or company details).
- **Header contract:** a single `.site-header` element containing a `.brand` (logo/text), a `nav.site-nav` for primary links, and a `.header-actions` region for secondary links and CTAs (for example: a muted signup link and a primary `.btn`). Keep header markup consistent across pages so the CSS tokens and layout behave predictably.
- **Hero/Above-the-fold:** large heading, short description, primary CTA button. Keep copy concise.
- **Content sections:** services or features presented as a grid/cards; optional testimonial or highlights band; concise contact block in the footer or on the contact page.

Notes:

- The contact form is a Phase‑2 enhancement — the Phase‑1 wireframe uses a static contact page with mailto links or simple instructions.
- Typography and spacing come from the `:root` tokens in `assets/css/main.css`, enabling consistent sizing across breakpoints.

## Technologies

- HTML5
- CSS3 (variables, Grid, Flexbox)
- JavaScript will be introduced in Phase 2 (ES6 modules)

Note: Bootstrap and site JavaScript are intentionally disabled in Phase 1.
HTML files contain commented placeholders where Bootstrap/JS includes can be
uncommented during Phase 2.

## Getting Started

Prerequisites:

- Modern web browser
- Local web server for development

Install and run locally:

```bash
git clone https://github.com/Team-Kaizen-MMDC/mmdc-wst.git
cd mmdc-wst
# Serve files (choose one)
python -m http.server 8000
# or
npx http-server
# or
php -S localhost:8000
```

Open `http://localhost:8000` in your browser.

## Development

- HTML files live in the repo root and `pages/`
- CSS in `assets/css/` (`main.css`, `components.css`, `utilities.css`)
- JS in `assets/js/` (entry: `main.js`, modules under `modules/`)
- Assets in `assets/images/`, `assets/icons/`, `assets/fonts/`

## File Structure

```text
japan-ssw/
├── index.html
├── pages/
│   ├── about.html
│   ├── services.html
│   └── contact.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── icons/
├── components/
└── .github/
```

## Best Practices

- Use semantic HTML and ARIA for accessibility
- Follow BEM-style naming in CSS
- Keep JavaScript modular and avoid global state
- Optimize images and lazy-load large assets

See the project's coding and visual design standards in [docs/CODE_AND_DESIGN_GUIDE.md](docs/CODE_AND_DESIGN_GUIDE.md).

### Recommended Resources & Documentation

- **HTML / CSS / JS (reference):** [MDN Web Docs](https://developer.mozilla.org/)
- **Accessibility (WCAG & ARIA):** [W3C Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/) and the ARIA specification: [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- **Accessibility Guidance & Testing:** [WebAIM](https://webaim.org/) and [The A11Y Project](https://www.a11yproject.com/)
- **Performance & Auditing:** [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) and [WebPageTest](https://www.webpagetest.org/)
- **Progressive Enhancement & Best Practices:** [Google Web Fundamentals](https://developers.google.com/web/fundamentals)
- **Image Optimization:** [Squoosh](https://squoosh.app/) and [Web.Dev — Image Optimization Guide](https://web.dev/fast/#optimize-images)
- **Bootstrap Documentation:** [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- **JavaScript Modules & Patterns:** [ES Modules — MDN Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- **SEO Basics for Static Sites:** [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

Use these resources when implementing features, writing docs, or reviewing PRs to ensure accessibility, performance, and maintainability.

## Contributing

We use a branch-based workflow (no forking required). Create feature branches in this repository and open PRs against `main`.

1. Create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-change
```

1. Commit and push your branch:

```bash
git add .
git commit -m "Describe your change"
git push origin feature/your-change
```

1. Open a Pull Request on GitHub targeting `main` and request review from code owners.

## Deployment

This repository includes a GitHub Actions workflow that publishes the repository root to the `gh-pages` branch on pushes to `main`. A `.nojekyll` file is included to ensure files are served as-is.

After merging to `main`, enable GitHub Pages under `Settings > Pages` (if not automatically configured). The site will be available at:

```text
https://Team-Kaizen-MMDC.github.io/mmdc-wst/
```

## License & Team

This project is licensed under the MIT License. Built by **Team Kaizen MMDC**.
