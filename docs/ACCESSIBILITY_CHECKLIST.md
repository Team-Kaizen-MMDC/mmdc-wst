# Accessibility Checklist (WCAG 2.1 AA) — Quick Audit & Remediation Guide

Purpose: a compact, actionable checklist for developers and reviewers to validate accessibility during development, PR review, and QA cycles. Keep this file updated as rules or project conventions evolve.

How to use:

- Run automated checks (axe/pa11y) locally / in CI and attach reports to PRs.
- Walk the keyboard flows manually for critical pages (header → main → forms → footer).
- Triage axe failures: block on critical/serious; schedule minor/definition issues.

Automated checks (run before PR):

- Run Playwright smoke tests.
- Run axe-core (CLI or Playwright integration) on changed pages and save report to `tests/accessibility/results`.

Critical items (must pass before merge):

- [ ] Page has a single, visible skip-to-content link that is keyboard-focusable.
- [ ] `<main>` element present and has `role="main"` or `id` anchor for skip links.
- [ ] All interactive elements (links, buttons, form controls) are keyboard focusable and have visible focus styles.
- [ ] No critical or serious violations from axe-core (examples: missing document language, inaccessible name, focus trap, missing label on form control).
- [ ] Color contrast meets at least 4.5:1 for body text and 3:1 for large text.
- [ ] Images with meaningful content have descriptive `alt` text; decorative images have empty `alt=""`.

Form & controls:

- [ ] All form controls have associated `<label>` elements or accessible names (aria-label/aria-labelledby).
- [ ] Validation errors are announced to assistive technologies (use `aria-live` or role=alert where appropriate).
- [ ] Required fields are programmatically identifiable (aria-required or explicit label text).

Keyboard & focus management:

- [ ] Tab order follows a logical reading/order flow.
- [ ] Focus is not trapped when modal is closed; focus returns to the control that opened the modal.
- [ ] Modals and dialogs use `role="dialog"` and `aria-modal="true"`, and contain a visible focusable close control.
- [ ] Skip links become visible on focus and move focus to primary content anchor.

ARIA & semantics:

- [ ] Landmark elements present: `header`, `nav`, `main`, `footer`, `aside` where appropriate.
- [ ] Navigation lists use semantic lists (`<ul>`/`<li>`), and menu-like patterns use appropriate ARIA roles only when necessary.
- [ ] All ARIA attributes have valid values and are used only to enhance native semantics (do not use ARIA to replace native elements).

Media & non-text content:

- [ ] Video/audio controls provide captions or transcripts where content is essential.
- [ ] Decorative background images use CSS backgrounds; images in markup have proper `alt`.

Keyboard-only user flows to test (manual):

- Header navigation and language toggles
- Job search flow: search → results → job detail → apply CTA
- Login/signup flow (form focus, error announcement)
- Off-canvas menu open/close and focus return

Automated Axe triage guidance:

- Critical / Serious: fix before merge.
- Moderate: schedule in same sprint unless it's purely cosmetic for wide-screen only.
- Minor: defer to backlog if risk is low.

Developer remediation tips (common fixes):

- Missing labels: add `<label for="id">` or `aria-label`/`aria-labelledby` pointing to visible text.
- Missing keyboard focus: ensure element is natively focusable or add `tabindex="0"` and keyboard handlers.
- Color contrast: create token variants with darker colors; avoid using color alone to convey information.
- Focus styles: use an always-visible outline or box-shadow (avoid relying on default UA-only focus that may be faint).

CI integration checklist (recommended):

- [ ] Axe run added to CI that runs on changed pages or the test matrix.
- [ ] Reports saved to artifact storage for PRs (e.g., `tests/accessibility/results/<pr-number>-axe.json`).
- [ ] PR must include a short accessibility summary with the report link and any remaining issues.

References & tools:

- axe-core: https://github.com/dequelabs/axe-core
- Pa11y: https://pa11y.org/
- W3C WCAG 2.1: https://www.w3.org/TR/WCAG21/
- Lighthouse accessibility audits (browser devtools)

Change log:

- 2025-10-25: Created (Phase 2.1) — initial checklist and CI guidance.
