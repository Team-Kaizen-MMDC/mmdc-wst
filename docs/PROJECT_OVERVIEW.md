# Project Overview

Topic

- Job listings and employer information focused on Specified Skilled Worker (SSW) opportunities in Japan.

Goal

- Provide an accessible, easy-to-scan public hub for job seekers and employers; demonstrate reusable frontend components.

Audience and stakeholders

- Prospective SSW job seekers, Japanese employers, Registered Support Organizations (RSOs), Project Team, Government & Regulatory Bodies.

In-scope features (Phase 1)

- Static, responsive site scaffold with semantic HTML and accessible layout.

Site features (summary)

- Hero patterns, header & offcanvas mobile navigation, entrance animations (IntersectionObserver), responsive cards, i18n helper, and accessibility-focused markup.

How to use (visitor guide)

- Browse jobs via `index.html` and `pages/jobs/`; use the header Jobs link or anchors. See `pages/createAccount.html` to try the registration flow. Use the language control to toggle English/Japanese.

Wireframe and structure

- Primary pages: `index.html`, `pages/agency.html`, `pages/services.html`, `pages/contact.html`, `pages/createAccount.html`, `pages/companies/*`, and `pages/jobs/*`.

Testing & QA

- Playwright E2E and smoke tests under `tests/playwright/` and accessibility results are recorded under `tests/accessibility/results/`.

For full details and examples, refer to the repository `README.md` short links to docs in the root.
