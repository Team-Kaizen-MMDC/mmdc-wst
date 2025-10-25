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

## Progress Measurement Framework

### Completion Tracking Matrix

| Feature Area         | Current Status | Target Completion | Quality Gate                            |
| -------------------- | -------------- | ----------------- | --------------------------------------- |
| **Foundation**       | 80%            | Week 2            | ✅ Structure, ✅ Navigation, 🔄 Content |
| **Job Search**       | 20%            | Week 4            | 🔄 UI Complete, ❌ Functionality        |
| **Company Profiles** | 40%            | Week 5            | ✅ Templates, 🔄 Data Integration       |
| **RSO Directory**    | 30%            | Week 6            | 🔄 Structure, ❌ Functionality          |
| **User Profiles**    | 60%            | Week 3            | ✅ Dashboard, 🔄 Data Management        |
| **Visa Guidance**    | 70%            | Week 2            | ✅ Content, 🔄 Interactive Features     |

**Legend:** ✅ Complete | 🔄 In Progress | ❌ Not Started

### Quality Gates for Each Phase

#### Phase 1: Project Foundation

- [ ] Project goals documented and approved
- [ ] Feature inventory complete with acceptance criteria
- [ ] Progress tracking system established
- [ ] Stakeholder alignment on scope and priorities

#### Phase 2: Usability & Accessibility

- [ ] WCAG 2.1 AA compliance verified across all pages
- [ ] Design system implemented and documented
- [ ] Cross-browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness validated (320px-2560px breakpoints)

#### Phase 3: Functional Implementation

- [ ] Job search returns results with real data
- [ ] User flows completed from search to application
- [ ] Error handling and loading states implemented
- [ ] Performance benchmarks met (<3s page load)

#### Phase 4: Quality Assurance & Launch

- [ ] All acceptance criteria validated
- [ ] User testing feedback incorporated
- [ ] Security review completed
- [ ] Production deployment successful

### Review Checkpoints

#### Weekly Reviews (Every Friday)

- **Scope:** Progress against current phase milestones
- **Participants:** Development team, project stakeholder
- **Deliverables:** Updated completion tracking, blocker identification

#### Phase Gate Reviews (End of Each Phase)

- **Scope:** Complete phase deliverable review
- **Participants:** Full project team + stakeholders
- **Deliverables:** Phase completion sign-off, next phase approval

#### Quality Assurance Reviews (Bi-weekly)

- **Scope:** Code quality, accessibility, performance
- **Participants:** Development team, QA lead
- **Deliverables:** Quality metrics report, improvement recommendations

### Success Metrics Dashboard

#### Development Metrics

- **Code Quality:** Linting scores, test coverage, accessibility audit results
- **Performance:** Page load times, Lighthouse scores, bundle sizes
- **User Experience:** Task completion rates, user feedback scores

#### Business Metrics

- **User Engagement:** Page views, session duration, bounce rates
- **Functional Success:** Job application completions, search success rates
- **Platform Growth:** User registrations, job posting submissions

### Risk Tracking

#### High Priority Risks

- **Technical Debt:** Monitor complexity and refactoring needs
- **Timeline Delays:** Track milestone slippage and resource constraints
- **Quality Issues:** Monitor bug reports and user experience problems

#### Mitigation Strategies

- **Buffer Time:** 20% buffer built into each phase timeline
- **Quality Gates:** No phase progression without completion criteria met
- **Regular Reviews:** Weekly progress checks with early intervention

If you want, I can also:

- Remove speculative files from the repo (create the folders only), or
- Add a short Phase 2 checklist with recommended JS module conventions in `docs/`.
