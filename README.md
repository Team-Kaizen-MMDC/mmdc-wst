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

This repository holds the wireframe-driven static pages and a stylesheet ([assets/css/main.css](assets/css/main.css)) that defines the design tokens (colors, spacing, typography) and header contract used across pages.

## Project docs (short links)

-- **Demo videos:** [docs/DEMO_VIDEOS.md](docs/DEMO_VIDEOS.md) — guidance and the retained demo MP4 excerpt.
-- **Project overview & site features:** [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) — topic, goals, audience, feature summary, and visitor flows.

For implementation details, testing guidance, and design docs, see the [docs/](docs/) folder.

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

-- Playwright tests (under [tests/playwright/](tests/playwright/)) require Node.js and are executed via npm scripts. The README includes recommended npm commands to run tests.

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

-- HTML files live in the repo root and [pages/](pages/)
-- CSS in [assets/css/](assets/css/) (`main.css`, `components.css`, `utilities.css`)
-- JS in [assets/js/](assets/js/) (entry: `main.js`, modules under `modules/`)
-- Assets in [assets/images/](assets/images/), [assets/icons/](assets/icons/), [assets/fonts/](assets/fonts/)

## Running tests

Playwright-based smoke tests live under [tests/playwright/](tests/playwright/). The Playwright config [tests/playwright/playwright.config.js](tests/playwright/playwright.config.js) sets `baseURL` to `http://localhost:8000`, so tests expect a local static server to be available.

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

Detailed test documentation and results are available in [TESTING.md](TESTING.md) at the repository root. That document contains:

- A list of test cases (functional, mobile/offcanvas, i18n, accessibility)
- Test environment and browsers used
- Evidence and notes for each test (network checks, ARIA, WCAG contrast)
- A summary of fixes applied during testing (with commit references)

Quick links:
Quick links:

- View the full testing report: [TESTING.md](TESTING.md)
- Playwright smoke tests: [tests/playwright/](tests/playwright/) (see the "Running tests" section above for commands)

Project management & QA

- [Project board (Management - Asana)](https://app.asana.com/1/1207231382805506/project/1211385026996908/list/1211385050374916)
- QA & test procedures: [TESTING.md](TESTING.md) (detailed test cases, traces, and results)

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

The site will be available at:

```text
https://Team-Kaizen-MMDC.github.io/mmdc-wst/
```

## License & Team

This project is licensed under the MIT License. Built by **Team Kaizen MMDC**.
