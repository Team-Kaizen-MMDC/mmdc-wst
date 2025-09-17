# Japan SSW

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![HTML5](https://img.shields.io/badge/HTML5-5.2-orange)
![CSS3](https://img.shields.io/badge/CSS3-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Node.js](https://img.shields.io/badge/Node.js-18-green)

A modern, responsive website built with HTML, CSS, JavaScript, and Bootstrap.

## Table of Contents

- Overview
- Features
- Technologies
- Getting Started
- Development
- File Structure
- Best Practices
- Contributing
- Deployment
- License & Team

## Overview

Japan SSW is a frontend-only scaffold for building modern, responsive websites using HTML, CSS, JavaScript, and Bootstrap. It targets accessible, performant, and maintainable static sites.

## Features

- Responsive, mobile-first layout using Bootstrap 5
- ES6+ modular JavaScript
- Accessibility best practices (semantic HTML, ARIA)
- Performance: lazy-loading, optimized assets
- Simple, static deployment (GitHub Pages)

## Technologies

- HTML5
- CSS3 (variables, Grid, Flexbox)
- JavaScript (ES6 modules)
- Bootstrap 5 (CDN)

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

 ### Recommended Resources & Documentation

- **HTML / CSS / JS (reference):** [MDN Web Docs](https://developer.mozilla.org/)
- **Accessibility (WCAG & ARIA):** [W3C Web Accessibility Initiative](https://www.w3.org/WAI/) and ARIA spec ([WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/))
- **Accessibility Guidance & Testing:** [WebAIM](https://webaim.org/) and [The A11Y Project](https://www.a11yproject.com/)
- **Performance & Auditing:** [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) and [WebPageTest](https://www.webpagetest.org/)
- **Progressive Enhancement & Best Practices:** [Google Web Fundamentals](https://developers.google.com/web/fundamentals)
- **Image Optimization:** [Squoosh](https://squoosh.app/) and [Image Optimization Guide](https://web.dev/fast/#optimize-images)
- **Bootstrap Documentation:** [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)
- **JavaScript Modules & Patterns:** [ES Modules (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- **SEO Basics for Static Sites:** [Google Search Central](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

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
