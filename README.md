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
- Testing
- File Structure
- Best Practices
- Code & Design Guide
- Design files (Figma)
- Contributing
- Deployment
- License & Team

## Overview

Japan SSW is a frontend-first static site scaffold used as the Phase‑1 deliverable for the MMDC/WST project. The site demonstrates a clean, responsive layout and a small set of pages used to communicate services and contact information. Phase‑1 intentionally uses only HTML and CSS (no runtime JavaScript or Bootstrap utilities) to keep the presentation layer simple and portable.

This repository holds the wireframe-driven static pages and a stylesheet (`assets/css/main.css`) that defines the design tokens (colors, spacing, typography) and header contract used across pages.

### Website overview — topic, goal, audience, success metrics, stakeholders, and in-scope features

- Topic: job listings and employer information focused on Specified Skilled Worker (SSW) opportunities in Japan. The site aggregates hiring companies, agency contacts, and helpful guidance for candidates exploring SSW employment.
- Goal: provide an accessible, easy-to-scan public-facing hub where job seekers can discover current listings, learn about hiring companies, and find agency or contact information needed to apply. The scaffold also demonstrates reusable components for future development (cards, hero, offcanvas mobile navigation, and animated entrance utilities).
- Audience: prospective SSW job seekers (domestic and international), employers and partner agencies looking to advertise opportunities, and internal stakeholders who need a lightweight, maintainable frontend scaffold for marketing and outreach.
  -Success Metrics: The project's success will be measured by four key metrics focused on validating the Minimum Viable Product (MVP): 100% Core Function Coverage for all in-scope features; demonstrating User Adoption by securing 20 registered tester accounts across all user roles; confirming 100% Application Flow Completion by successfully tracking 10 test applications from submission to hire; and validating user experience with a System Usability Score (SUS) of 70 from internal or peer testing.
  -Stakeholders: Filipino Skilled Workers (End Users), Japanese employers (Clients), Registered Support Organizations (RSOs), Project Team, and Government & Regulatory Bodies.
  -In-scope Features: User Authentication, Worker Profile Builder, Job Search & Filter, Job Application Flow, Employer Job Posting, Application Tracking System, RSO Directory/Profile, and Multi-Language Support.

## Features (Phase 1)

- Responsive, mobile-first layout using CSS Grid and Flexbox
- Accessibility best practices (semantic HTML, ARIA)
- Performance: minimal assets, optimized images
- Simple, static deployment ([GitHub Pages](https://pages.github.com/))

Phase 2 roadmap (planned):

- Add progressive JavaScript features (forms, interactivity)
- Optionally enable Bootstrap utilities for faster UI components
- Add unit/integration tests and CI checks

## Site Features (detailed)

Below is a concise description of the site's implemented features and UI building blocks, gathered directly from the repository so you can quickly understand what the scaffold provides today.

- Hero (above the fold)

  - Large, centered hero sections using the `.hero` / `.hero-centered` classes. Headings and CTAs are styled for emphasis and accessibility (see `index.html` and `assets/css/main.css`).

- Header & offcanvas (mobile)

  - A reusable `.site-header` pattern provides the brand, primary navigation links (`.site-header__nav-link`) and an actions region (`.site-header__actions`) with Signup/Login CTAs.
  - Mobile navigation uses a Bootstrap-compatible offcanvas (`.offcanvas`, `#siteOffcanvas`) toggled with `[data-bs-toggle="offcanvas"]`. Tests exercise opening/closing and link focus restoration.

- Scroll-triggered entrance animations

  - Lightweight utility classes (for example: `animate-fade-in-up`, `animate-slide-in-left`, `animate-scale-up`) are applied across pages to animate cards, section titles, and CTAs when they enter the viewport.
  - A small IntersectionObserver controller lives at `assets/js/features/animations.js` and toggles `.animate-active` and per-element transition delays to produce staggered entrance effects. The docs include `docs/ANIMATION_EXAMPLES.html` demonstrating usage.

- Responsive components & cards

  - Reusable card and grid patterns (feature cards, agency/company lists, job list items) use utility classes and responsive column classes to adapt across breakpoints. Many pages use classes like `feature-card`, `agency-item`, and Bootstrap-like utility classes for spacing and layout.

- Internationalization (i18n) and language toggle

  - A client-side i18n helper (`assets/js/i18n.js`) loads translations; base translation files live in `i18n/en.json` and `locales/ja.json`.
  - Tests mock/route the locale JSON to validate translated labels (see `tests/playwright/i18n.spec.ts`).

- Accessibility and semantic markup

  - Pages follow semantic HTML patterns and include ARIA attributes where appropriate (for example: nav roles and aria-labels for header links). The repo contains accessibility results (axe/pa11y JSON under `tests/accessibility/results/`) used to guide fixes.

- Automated testing & QA

  - Playwright-based smoke and E2E tests live under `tests/playwright/` (examples: `smoke-links.spec.ts`, `e2e-navigation.spec.ts`). The Playwright config uses `http://localhost:8000` as the default `baseURL` so tests run against a locally served static site.
  - A small collection of accessibility test results and scripts exist in `tests/accessibility/results/` and `TESTING.md` documents the QA procedures.

- Progressive enhancement and graceful fallback
  - The site is designed to work without JavaScript for basic content and navigation. JavaScript is layered on for progressive features (animations, i18n toggles, enhanced interactions).

## Wireframe Summary

This project follows a simple wireframe that maps directly to the HTML pages in this repo. The wireframe focuses on clarity, a small content hierarchy, and predictable navigation:

- **Primary purpose:** present the team's services and contact details with an approachable, readable layout.
- **Target audience:** site visitors seeking information about the team's offerings and how to get in touch.
- **Main pages:** `index.html` (home/hero), `pages/agency.html` (about / agency overview), `pages/services.html` (services grid or list), `pages/contact.html` (contact info / form), `about.html` (team or company details).
- **Header contract:** a single `.site-header` element containing a `.site-header__brand` (logo/text), a `nav.site-nav` for primary links, and a `.site-header__actions` region for secondary links and CTAs (for example: a muted signup link and a primary `.btn`). Keep header markup consistent across pages so the CSS tokens and layout behave predictably.
- **Hero/Above-the-fold:** large heading, short description, primary CTA button. Keep copy concise.
- **Content sections:** services or features presented as a grid/cards; optional testimonial or highlights band; concise contact block in the footer or on the contact page.

Notes:

- The contact form is a Phase‑2 enhancement — the Phase‑1 wireframe uses a static contact page with mailto links or simple instructions.
- Typography and spacing come from the `:root` tokens in `assets/css/main.css`, enabling consistent sizing across breakpoints.

## How to use this site — Visitor guide

This short guide explains the common flows an end user will follow on the site. It is written for non-technical visitors and mirrors the primary journeys we expect on the public site.

- Browsing jobs

  1. Open the home page (`index.html`) to view the hero and the latest job listings.
  1. Use the Jobs anchor (`#jobs`) or the header navigation link labelled "Jobs" to jump to the job list.
  1. Click a job card to open the job detail page (for example: `pages/jobs/mechanic-ground-support-haneda.html`) and review responsibilities, location, and employer information.

- Searching & filtering

  - The site includes a basic job filter page (`pages/jobs/jobFilter.html`) where visitors can narrow results by category or keyword. Use the search fields and click "Search" to update the listing.

- Registering / creating an account

  - Use the Signup link in the header (or inside the mobile offcanvas) to open the registration flow (`pages/createAccount.html`). Fill in the required fields and follow the instructions on-screen. If email verification is required, check the provided email and follow the verification link.

- Applying for a job

  1. From a job detail page click the Apply button (or follow the "Apply" CTAs inside listings).
  1. Depending on the job, the site may either: (a) provide a link to an external application portal, (b) open an application form, or (c) provide contact instructions (mailto or phone). Follow the instructions shown on the job page.

- Contacting companies or agencies

  - Company pages (under `pages/companies/`) and the Agency page (`pages/agency.html`) contain contact information and agency listings. Use the links or contact methods there to reach out directly.

- Language toggle (i18n)

  - Use the language control in the header (or in the mobile offcanvas) to switch between English and Japanese. The site will load translated labels from the locale files and update visible UI text.

- Accessibility & preferences

  - Keyboard: the header and offcanvas navigation support keyboard access; use Tab to move through links and Enter to activate.
  - Reduced motion: if your system preference is set to reduced motion, the site respects that and minimizes animations.
  - Contrast & readability: there are design tokens in `assets/css/main.css` for accessible font sizes and colors; if you encounter low contrast, please open an issue in the repo so we can address it.

- Help & reporting issues
  - For problems with content, broken links, or account issues, use the Contact page (`pages/contact.html`) or open an issue in this repository with a descriptive title and steps to reproduce.

If you'd like, I can add a printable quick-start card (a small HTML snippet) for site ambassadors to hand to visitors, or add microcopy on key pages that surfaces these steps inline.

## Technologies

- HTML5
- CSS3 (variables, Grid, Flexbox)
- JavaScript (ES6) for progressive enhancement and optional site features
- Node.js (used for test tooling and local npm scripts)
- Playwright (end-to-end testing framework used for smoke and E2E tests)
- Python 3 (recommended for a simple local static server during development)
- npm (package scripts to run tests and tooling)

Notes:

- The Phase‑1 site is built primarily with static HTML and CSS. JavaScript is introduced in Phase‑2 for progressive enhancements and optional features.

- Playwright tests (under `tests/playwright/`) require Node.js and are executed via npm scripts. The README includes recommended npm commands to run tests.

- Python 3 is a simple way to serve files locally for development (e.g., `python -m http.server 8000`).

- Bootstrap is optional and can be enabled during Phase‑2 if desired; HTML files include commented placeholders where Bootstrap/JS includes can be added.

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

- CSS cleanup summary: see `docs/CSS_CLEANUP_SUMMARY.md` for the recent refactor and conventions.

## Running tests

Playwright-based smoke tests live under `tests/playwright/`. The Playwright config (`tests/playwright/playwright.config.js`) sets `baseURL` to `http://localhost:8000`, so tests expect a local static server to be available.

One-time setup:

```bash
npm ci
npx playwright install
```

Run tests (two options):

1. Start a server manually (separate terminal) and run Playwright:

```bash
# start server (serves at http://localhost:8000)
python3 -m http.server 8000

# in another terminal
npx playwright test --config=tests/playwright/playwright.config.js
```

1. Use the convenience npm script (starts server, runs Playwright, then stops the server):

```bash
npm run test:playwright:with-server
```

Notes:

- If Playwright reports "Cannot navigate to invalid URL" for goto(`/`), make sure you pass the Playwright config (it provides baseURL) or use the convenience script above.
- The Python static server can show BrokenPipe/ConnectionReset noise when Playwright runs many workers; this is expected for that server under concurrent load. Use `npx http-server` or a small Node static server for quieter logs if desired.
- If npm scripts surface shell startup errors (for example from `.zshrc`), guard optional tool initializations in your rc file (for example `if command -v jenv >/dev/null; then jenv init; fi`).

## Testing documentation

### Embedded demo (in-repo)

**Registration demo (excerpt)** — quick registration highlights

https://github.com/Team-Kaizen-MMDC/mmdc-wst/assets/registration-excerpt.mp4

[Download MP4](demo-videos/registration-excerpt.mp4)

<!-- Retained demo files: only the short MP4 excerpt is kept in demo-videos/ to reduce repo size. Conversion tooling remains available at demo-videos/convert-webm-to-mp4.ps1 and documentation in demo-videos/CONVERT.md. -->

Detailed test documentation and results are available in `TESTING.md` at the repository root. That document contains:

- A list of test cases (functional, mobile/offcanvas, i18n, accessibility)
- Test environment and browsers used
- Evidence and notes for each test (network checks, ARIA, WCAG contrast)
- A summary of fixes applied during testing (with commit references)

Quick links:
Quick links:

- View the full testing report: `TESTING.md`
- Playwright smoke tests: `tests/playwright/` (see the "Running tests" section above for commands)

Project management & QA

- [Project board (Management - Asana)](https://app.asana.com/1/1207231382805506/project/1211385026996908/list/1211385050374916)
- QA & test procedures: `TESTING.md` (detailed test cases, traces, and results)

<!-- Screenshots and CI wiring are maintained separately. -->

## File Structure

Below is an updated view of the repository layout (top-level folders and important files). Paths are relative to the repository root.

```text
mmdc-wst/
├── index.html
├── file.html
├── Makefile
├── package.json
├── README.md
├── STYLE.css
├── run-tests.sh
├── STRUCTURE.md
├── TESTING.md
├── Web Systems and Technology.code-workspace
├── assets/
│   ├── css/
│   │   ├── main.css            # primary stylesheet
│   │   ├── components.css
│   │   └── utilities.css
│   ├── icons/
│   ├── images/
│   │   ├── aiImages/
│   │   ├── company-logos/
│   │   └── team/
│   ├── js/
│   │   ├── main.js
│   │   ├── i18n.js
│   │   └── features/
│   │       └── animations.js    # scroll-trigger controller
│   └── videos/
├── pages/
│   ├── about.html
│   ├── agency.html
│   ├── companyDashboard.html
│   ├── contact.html
│   ├── createAccount.html
│   ├── profileDashboard.html
│   ├── services.html
│   ├── signin.html
│   ├── terms.html
│   ├── visaGuidance.html
│   ├── privacy.html
│   ├── addEdit/
│   │   ├── availability.html
│   │   ├── contact.html
│   │   ├── education.html
│   │   ├── experience.html
│   │   ├── job-post.html
│   │   ├── profile.html
│   │   └── skill.html
│   ├── companies/
│   │   ├── ana-intercontinental.html
│   │   ├── ana.html
│   │   ├── company-list.html
│   │   ├── company-template.html
│   │   ├── daikin.html
│   │   ├── kandenko.html
│   │   ├── mitsubishi-heavy-industries.html
│   │   ├── nissan.html
│   │   ├── prince-hotels.html
│   │   ├── sompo-care.html
│   │   └── yoshinoya.html
│   └── jobs/
│       ├── cleaner-facilities-maintenance.html
│       ├── construction-worker-site-support.html
│       ├── jobFilter.html
│       ├── mechanic-ground-support-haneda.html
│       ├── server-hospitality.html
│       └── ward-nursing-support.html
├── assets-js/                   # legacy/archive JS used in project archive
├── docs/
│   ├── ACCESSIBILITY_CHECKLIST.md
│   ├── ANIMATION_EXAMPLES.html
│   ├── CODE_AND_DESIGN_GUIDE.md
│   └── CSS_MAIN_GUIDE.md
├── i18n/
│   └── en.json
├── locales/
│   └── ja.json
├── tests/
│   └── playwright/
│       ├── smoke-links.spec.ts
│       ├── e2e-navigation.spec.ts
│       └── playwright.config.js
└── test-results/
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

## Design files (Figma)

The project's design files are available in Figma. View the interactive design and assets here:

[Figma — SSW Website](https://www.figma.com/design/1nj5zc6njcZQiCsKMsmkvj/SSW-WEBSITE?node-id=0-1&t=5uuQzTHCggrhaLoT-1)

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
