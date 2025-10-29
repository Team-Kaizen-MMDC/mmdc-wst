# Usability Improvement Plan - Phase-by-Phase Implementation

**Created:** October 29, 2025  
**Branch:** `fix/usability`  
**Status:** In Progress

## Overview

This document tracks the implementation of usability improvements based on reviewer feedback:

> "Usability is developing: navigation and headings are consistent, but key affordances are placeholders; add visible focus states, skip-to-content, active-nav styling, and standardize spacing/type scale; also verify contrast and keyboard traversal on the filter form and footer links."

### Strategic Objectives

**Bootstrap & JavaScript Migration Priority:**

- **Goal:** Migrate custom CSS solutions to Bootstrap utilities and JavaScript functionality wherever applicable
- **Rationale:** Reduce custom CSS maintenance, leverage Bootstrap's accessibility features, improve consistency
- **Approach:**
  - Identify custom CSS that duplicates Bootstrap functionality
  - Replace custom solutions with Bootstrap classes and utilities
  - Use Bootstrap JavaScript components for interactive elements
  - Maintain custom CSS only for brand-specific styling
  - Document migration decisions in each phase

**Migration Priorities by Phase:**

1. **Phase 1 (Complete):** Enhanced focus states - future migration to Bootstrap focus ring utilities
2. **Phase 2:** Filter forms - migrate to Bootstrap button groups, form validation JavaScript
3. **Phase 3:** Footer - use Bootstrap spacing utilities and focus ring classes
4. **Phase 4:** Spacing & typography - **PRIMARY FOCUS:** replace 95%+ custom CSS with Bootstrap utilities
5. **Phase 5:** Placeholders - use Bootstrap modals, toasts, tooltips for interactive demos
6. **Phase 6:** Testing - verify Bootstrap components meet accessibility standards
7. **Phase 7:** Documentation - document Bootstrap migration and usage patterns

**Success Metrics:**

- ✅ Reduce custom CSS by 60-80% (leverage Bootstrap utilities)
- ✅ All interactive components use Bootstrap JavaScript where applicable
- ✅ Zero custom spacing/typography classes (use Bootstrap's system)
- ✅ Maintain or improve accessibility scores with Bootstrap's built-in ARIA support

---

## Current State Analysis

**Findings from code review:**

- ✅ Skip-to-content link exists (index.html line 44) with styling
- ✅ Basic focus states exist in main.css (lines 977-1020)
- ✅ Active nav styling exists but is minimal (line 485-489 in main.css)
- ❌ Active nav styling not consistently applied across all pages
- ⚠️ Focus states could be more visible (current implementation is basic)
- ⚠️ Spacing/typography scale inconsistent (mix of hardcoded values and tokens)
- ❌ Filter form contrast/keyboard traversal needs verification
- ❌ Footer link focus states may need enhancement

---

## PHASE 1: Critical Accessibility Fixes ⚡

**Goal:** Address keyboard navigation and visible focus states  
**Timeline:** Immediate (2-3 days)  
**Status:** � Completed

### Tasks

- [x] **1.1 Enhance Skip-to-Content Link Visibility**

  - [x] Review current implementation across all pages
  - [x] Ensure visibility on focus meets WCAG standards
  - [x] Test keyboard focus (Tab key should show it immediately)
  - [x] Verify consistent behavior on all pages

- [x] **1.2 Strengthen Focus States for All Interactive Elements**

  - [x] Increase focus outline visibility (review current 2px implementation)
  - [x] Add high-contrast focus ring colors
  - [x] Apply enhanced focus states to:
    - [x] Navigation links (header)
    - [x] Mobile offcanvas menu links
    - [x] All button variants (primary, secondary, outline)
    - [x] Form controls (inputs, selects, textareas)
    - [x] Footer links
    - [x] Card links (company cards, job listings)
  - [x] Test focus states across all browsers

- [x] **1.3 Active Navigation Styling Enhancement**

  - [x] Design visual indicators for active nav state:
    - [x] Bottom border or underline
    - [x] Background color change
    - [x] Consider icon/indicator
  - [x] Update CSS for `.nav-link.active` styling
  - [x] Apply `.active` class consistently across all pages:
    - [x] index.html
    - [x] pages/about.html
    - [x] pages/agency.html
    - [x] pages/jobs/\*.html
    - [x] pages/companies/\*.html
    - [x] All other pages
  - [x] Update mobile offcanvas menu active states
  - [x] Document active nav pattern in style guide

- [x] **1.4 Verify Keyboard Traversal Order**
  - [x] Test tab order on all major pages:
    - [x] index.html
    - [x] pages/jobs/jobFilter.html
    - [x] pages/about.html
    - [x] pages/agency.html
    - [x] Company detail pages
  - [x] Verify logical flow: Skip link → Brand → Nav → Actions → Main
  - [x] Ensure no focus traps in offcanvas menu
  - [x] Test focus return after closing modals/menus

### Completion Criteria

- [x] All interactive elements have visible focus states
- [x] Active navigation clearly indicates current page
- [x] Keyboard-only navigation works smoothly
- [x] No focus traps detected
- [x] Changes documented

### Phase 1 Implementation Summary

**Completed:** October 29, 2025

**Changes Made:**

1. **Skip-to-Content Link** (`assets/css/main.css`)

   - Enhanced visibility with larger padding (12px 24px)
   - Increased font size (14px → 16px) and weight (600 → 700)
   - Added bright yellow outline (#ffcc00) on focus for high contrast
   - Improved box shadow for depth
   - Added to all pages missing it (12 pages total)

2. **Focus States** (`assets/css/main.css`)

   - Increased outline width (2px → 3px)
   - Added `:focus-visible` support for keyboard-only focus
   - Enhanced box shadows for better visibility
   - Added footer-specific focus states with yellow outline
   - Added focus states for list-group items and company cards
   - Improved form control focus indicators

3. **Active Navigation** (`assets/css/main.css`)

   - Added bottom border indicator (3px red underline)
   - Added background highlight (rgba(235, 0, 0, 0.05))
   - Increased font weight (600 → 700)
   - Added mobile offcanvas-specific styling (left border)
   - Applied `.active` class consistently:
     - Fixed all job pages (was incorrectly on "Companies")
     - Added to jobFilter.html
     - Verified about.html and agency.html

4. **Main Content Anchors**
   - Added `id="main-content"` to 12 pages
   - Added `role="main"` for proper landmark navigation
   - Ensures skip-link functionality works site-wide

**Files Modified:**

- `assets/css/main.css`
- `index.html` (already had skip-link)
- `pages/about.html` (already had skip-link)
- `pages/agency.html`
- `pages/contact.html`
- `pages/privacy.html`
- `pages/terms.html`
- `pages/visaGuidance.html`
- `pages/services.html`
- `pages/jobs/jobFilter.html`
- `pages/jobs/mechanic-ground-support-haneda.html`
- `pages/jobs/cleaner-facilities-maintenance.html`
- `pages/jobs/construction-worker-site-support.html`
- `pages/jobs/server-hospitality.html`
- `pages/jobs/ward-nursing-support.html`

**Next Steps:**

- ✅ Test keyboard navigation manually on all pages
- ✅ Run automated accessibility tests (axe, Lighthouse)
- **Future Enhancement:** Migrate active nav to JavaScript solution (currently static HTML with manual class assignment)
  - Consider using Bootstrap's ScrollSpy or custom JS to auto-detect current page
  - Would eliminate need to manually add `.active` class to each page
  - See Phase 1 completion notes for implementation ideas
- Proceed to Phase 2: Form Accessibility

**Test Results Summary (October 29, 2025):**

✅ **Phase 1 Validation: PASSED**

- All Phase 1 objectives working correctly
- Zero violations detected for skip-links, focus states, active navigation
- See `docs/ACCESSIBILITY_TEST_RESULTS.md` for full report

⚠️ **New Issues Discovered (Pre-existing, not Phase 1 related):**

- Color contrast violations: 63 nodes across 6 pages (CRITICAL: visaGuidance.html has 36)
- Heading order issues: index.html, services.html, agency.html
- Missing H1: agency.html
- Empty heading: index.html
- Links not distinguished from text: visaGuidance.html

**Recommendation:** Address color contrast before Phase 2 (see test results for details)

---

## PHASE 2: Form Accessibility (jobFilter.html Focus) 📋

**Goal:** Ensure filter form meets contrast and keyboard requirements  
**Timeline:** Week 1 (3-4 days)  
**Status:** 🔴 Not Started

**Bootstrap/JS Migration Focus:**

- Replace custom filter button logic with Bootstrap button group JavaScript
- Use Bootstrap form validation classes instead of custom CSS
- Leverage Bootstrap's built-in accessibility features for forms

### Tasks

- [ ] **2.1 Migrate Filter Buttons to Bootstrap Components**

  - [ ] Replace custom button group styling with Bootstrap `.btn-group` and `.btn-group-toggle`
  - [ ] Implement Bootstrap button state management with JavaScript:
    - [ ] Use `data-bs-toggle="button"` for toggle functionality
    - [ ] Replace custom active state CSS with Bootstrap's `.active` class management
  - [ ] Test Bootstrap's built-in keyboard navigation (arrow keys, Enter, Space)
  - [ ] Verify ARIA attributes are automatically managed by Bootstrap

- [ ] **2.2 Filter Form Focus States & Validation**

  - [ ] Leverage Bootstrap form validation classes:
    - [ ] `.form-control:focus` (already styled by Bootstrap)
    - [ ] `.is-valid` and `.is-invalid` states
  - [ ] Replace custom focus indicators with Bootstrap's default (if acceptable) or extend Bootstrap's focus ring utility
  - [ ] Ensure focus order is logical through filter groups
  - [ ] Test keyboard navigation through all filters

- [ ] **2.3 Color Contrast Verification**

  - [ ] Run automated contrast checks (axe, Lighthouse)
  - [ ] Check Bootstrap button states against WCAG AA (4.5:1):
    - [ ] `.btn-outline-primary` active state
    - [ ] `.btn-outline-primary` inactive state
    - [ ] `.btn-outline-secondary` states
    - [ ] Form labels (Bootstrap's `.form-label`)
    - [ ] Placeholder text (Bootstrap's `.form-control::placeholder`)
  - [ ] Document any contrast issues found
  - [ ] Fix all contrast violations (using Bootstrap's color utilities where possible)

- [ ] **2.4 JavaScript-Powered Filter Interactions**

  - [ ] Implement filter state management with vanilla JavaScript or Bootstrap's API:
    - [ ] Use Bootstrap's Button plugin for toggle states
    - [ ] Track selected filters in JavaScript (replace any CSS-only hacks)
    - [ ] Announce filter changes using ARIA live regions (`aria-live="polite"`)
  - [ ] Add keyboard shortcuts using JavaScript:
    - [ ] Enter to apply filters
    - [ ] Escape to reset filters
  - [ ] Implement reset functionality with Bootstrap's `.btn-reset` pattern
  - [ ] Test screen reader announcements for filter changes

- [ ] **2.5 Form Labels and ARIA (Bootstrap-Enhanced)**
  - [ ] Use Bootstrap's form structure:
    - [ ] `.form-label` for all inputs
    - [ ] `.form-text` for helper text with automatic `aria-describedby` linking
  - [ ] Add `aria-label` where visual labels are missing
  - [ ] Ensure filter button groups use Bootstrap's `.btn-group` with proper `role="group"` and `aria-label`
  - [ ] Test with screen reader (NVDA/JAWS)
  - [ ] Verify Bootstrap's automatic ARIA management is working

### Completion Criteria

- [ ] All custom filter CSS replaced with Bootstrap utilities where possible
- [ ] Filter interactions managed by Bootstrap JavaScript or vanilla JS (not CSS-only)
- [ ] All form elements pass contrast requirements
- [ ] Keyboard navigation works without mouse using Bootstrap's built-in features
- [ ] Screen reader properly announces all elements
- [ ] Filter interactions are accessible
- [ ] axe-core shows no violations

---

## PHASE 3: Footer Link Enhancement 🔗

**Goal:** Improve footer link visibility and keyboard accessibility  
**Timeline:** Week 1-2 (2-3 days)  
**Status:** 🔴 Not Started

**Bootstrap/JS Migration Focus:**

- Use Bootstrap's focus ring utilities instead of custom focus CSS
- Implement smooth scroll to footer sections using Bootstrap's ScrollSpy JavaScript
- Leverage Bootstrap's spacing utilities for footer layout

### Tasks

- [ ] **3.1 Footer Link Focus States (Bootstrap-Enhanced)**

  - [ ] Replace custom focus CSS with Bootstrap's focus ring utilities:
    - [ ] Use `.focus-ring` class for consistent focus indicators
    - [ ] Customize focus ring color with `--bs-focus-ring-color` CSS variable
    - [ ] Test contrast ratio for focus indicators using Bootstrap's color system
  - [ ] Apply Bootstrap focus classes to all footer links:
    - [ ] Footer navigation links
    - [ ] Legal links (Terms, Privacy)
    - [ ] CTA buttons (Employer Login, Post a Job) - use `.btn .btn-*` classes
  - [ ] Remove custom focus CSS that duplicates Bootstrap functionality

- [ ] **3.2 Footer Layout with Bootstrap Utilities**

  - [ ] Replace custom footer spacing CSS with Bootstrap spacing utilities:
    - [ ] Use `.py-*`, `.px-*`, `.my-*`, `.mx-*` classes
    - [ ] Use `.gap-*` for flex/grid gaps
  - [ ] Ensure responsive behavior using Bootstrap's responsive spacing:
    - [ ] `.py-3 .py-md-4 .py-lg-5` for mobile-first padding
  - [ ] Remove hardcoded padding/margin values from custom CSS

- [ ] **3.3 Footer Link Hover States (Bootstrap-Enhanced)**

  - [ ] Use Bootstrap's text utilities for hover effects:
    - [ ] `.text-decoration-underline` on hover
    - [ ] Color transitions using Bootstrap color utilities
  - [ ] Ensure hover and focus states are distinct but consistent
  - [ ] Test on touch devices (no hover state issues)

- [ ] **3.4 Footer Keyboard Navigation & ScrollSpy**

  - [ ] Implement smooth scroll to footer with Bootstrap ScrollSpy (optional):
    - [ ] Add skip-to-footer link if needed
    - [ ] Use Bootstrap's smooth scroll behavior
  - [ ] Verify tab order through footer columns is logical
  - [ ] Test with screen reader for proper structure
  - [ ] Ensure footer landmarks are properly labeled
  - [ ] Verify touch targets meet minimum size using Bootstrap's `.btn-lg` where applicable

### Completion Criteria

- [ ] Custom footer focus CSS replaced with Bootstrap utilities
- [ ] Footer spacing uses Bootstrap's spacing scale
- [ ] Footer links have highly visible focus states
- [ ] All footer links meet contrast requirements
- [ ] Keyboard navigation through footer is smooth
- [ ] Touch targets meet minimum size
- [ ] No accessibility violations in footer

---

## PHASE 4: Spacing & Typography Standardization 📐

**Goal:** Migrate to Bootstrap spacing utilities and standardize typography  
**Timeline:** Week 2-3 (5-7 days)  
**Status:** 🔴 Not Started

**Bootstrap/JS Migration Focus:**

- **PRIMARY GOAL:** Replace all custom spacing CSS with Bootstrap's spacing utilities (`.m-*`, `.p-*`, `.gap-*`)
- Use Bootstrap's typography scale and utilities instead of custom font-size declarations
- Minimize custom CSS by leveraging Bootstrap's built-in design system
- Keep custom CSS only for brand-specific colors and unique components

### Tasks

- [ ] **4.1 Audit Current Spacing & Identify Bootstrap Equivalents**

  - [ ] Document current custom spacing:
    - ✅ `--space-lg: 4rem` → Bootstrap equivalent: `.p-5` (3rem) or create custom `.p-6` (4rem)
    - ✅ `--space-md: 2rem` → Bootstrap equivalent: `.p-4` (1.5rem) or `.p-5` (3rem)
    - ✅ `--space-sm: 1rem` → Bootstrap equivalent: `.p-3` (1rem)
  - [ ] Identify all hardcoded spacing values in CSS
  - [ ] Map each custom spacing value to Bootstrap's spacing scale:
    - [ ] Bootstrap uses 0.25rem increments: 0, 0.25rem, 0.5rem, 1rem, 1.5rem, 3rem
    - [ ] Create mapping table (custom → Bootstrap class)
  - [ ] Categorize by component type for systematic replacement

- [ ] **4.2 Replace Custom Spacing with Bootstrap Utilities**

  - [ ] **Phase 4.2a: Critical Pages First**
    - [ ] index.html: Replace all custom spacing classes with Bootstrap utilities
    - [ ] pages/jobs/jobFilter.html: Migrate to `.m-*`, `.p-*`, `.gap-*` classes
    - [ ] pages/about.html: Use Bootstrap spacing throughout
  - [ ] **Phase 4.2b: Component Replacement**
    - [ ] Buttons: Remove custom padding, use `.btn` with `.btn-lg`/`.btn-sm` variants
    - [ ] Cards: Replace custom padding with `.card-body` (built-in 1rem padding)
    - [ ] Forms: Use `.mb-3` for form groups instead of custom margins
    - [ ] Navigation: Use Bootstrap's `.navbar` spacing utilities
    - [ ] Footer: Apply `.py-*`, `.px-*` classes (already planned in Phase 3)
  - [ ] **Phase 4.2c: Remove Custom Spacing CSS**
    - [ ] Delete custom spacing classes from main.css
    - [ ] Remove `--space-*` CSS variables (if fully replaced)
    - [ ] Keep only brand-specific spacing if absolutely necessary
  - [ ] Test responsive behavior at all breakpoints:
    - [ ] Use `.m-*-{breakpoint}` responsive utilities (e.g., `.p-3 .p-md-4 .p-lg-5`)
    - [ ] Mobile (320px-767px)
    - [ ] Tablet (768px-1023px)
    - [ ] Desktop (1024px+)

- [ ] **4.3 Migrate to Bootstrap Typography Scale**

  - [ ] **Phase 4.3a: Map Current Sizes to Bootstrap**
    - [ ] Review current custom scale:
      - H1: 36px → Bootstrap `.display-6` (2.5rem/40px) or custom `.fs-1` override
      - H2: 32px → Bootstrap `.fs-1` (2.5rem/40px) or `.fs-2` (2rem/32px) ✓
      - H3: 28px → Bootstrap `.fs-2` (2rem) or `.fs-3` (1.75rem/28px) ✓
      - Body: 16px → Bootstrap default `$font-size-base` ✓
    - [ ] Decide: override Bootstrap's scale or adapt to Bootstrap's defaults
  - [ ] **Phase 4.3b: Apply Bootstrap Typography Classes**
    - [ ] Replace custom font-size in CSS with Bootstrap's `.fs-*` utilities
    - [ ] Use `.display-*` classes for large headings where appropriate
    - [ ] Use `.lead` for emphasized paragraphs
    - [ ] Use `.small` or `.text-muted` for small text
  - [ ] **Phase 4.3c: Remove Custom Typography CSS**
    - [ ] Audit all `font-size`, `line-height`, `font-weight` declarations
    - [ ] Replace with Bootstrap's `.fw-*` (font-weight), `.lh-*` (line-height) utilities
    - [ ] Delete redundant custom CSS
  - [ ] Document final type scale in CSS guide (referencing Bootstrap's system)

- [ ] **4.4 Create Spacing/Typography Utility Extensions (If Needed)**

  - [ ] **Only if Bootstrap's scale is insufficient:**
    - [ ] Extend Bootstrap's spacing scale with additional sizes:
      ```scss
      $spacer: 1rem;
      $spacers: (
        // Bootstrap defaults: 0, 1, 2, 3, 4, 5
        6: ($spacer * 4),
        // 4rem (matches old --space-lg)
        7: ($spacer * 5),
        // 5rem
        8: ($spacer * 6) // 6rem
      );
      ```
    - [ ] Generate utility classes with Bootstrap's API:
      ```scss
      @import "bootstrap/scss/utilities/api";
      ```
  - [ ] Document any custom extensions in CSS guide
  - [ ] Minimize custom utilities - prefer adapting to Bootstrap's system

- [ ] **4.5 Cleanup & Documentation**
  - [ ] Remove all hardcoded spacing values from CSS
  - [ ] Remove unused custom spacing/typography classes
  - [ ] Update CSS guide to reference Bootstrap utilities
  - [ ] Create quick reference for common patterns:
    - [ ] "Use `.mb-3` for form spacing, not custom margins"
    - [ ] "Use `.py-5` for section padding, not custom classes"
  - [ ] Add usage examples with Bootstrap classes

### Completion Criteria

- [ ] ✅ **95%+ of spacing uses Bootstrap utilities** (custom CSS only for edge cases)
- [ ] Typography uses Bootstrap's scale and utility classes
- [ ] All components migrated to Bootstrap spacing
- [ ] Custom `--space-*` variables removed or minimized
- [ ] No hardcoded spacing values remain (except brand-specific edge cases)
- [ ] Visual regression tests pass
- [ ] Responsive behavior verified with Bootstrap's responsive utilities
- [ ] Documentation updated to reference Bootstrap system

---

## PHASE 5: Placeholder Affordances 🎯

**Goal:** Replace placeholder elements with functional components  
**Timeline:** Week 3-4 (3-5 days)  
**Status:** 🔴 Not Started

**Bootstrap/JS Migration Focus:**

- Use Bootstrap's modal component for interactive demos/coming soon features
- Implement toast notifications for user feedback on placeholder interactions
- Use Bootstrap's JavaScript API to manage dynamic placeholder states
- Leverage Bootstrap's spinner component for loading states

### Tasks

- [ ] **5.1 Identify All Placeholders & Plan Bootstrap Replacements**

  - [ ] Audit for non-functional elements:
    - [ ] Demo buttons (e.g., job alerts signup) → Replace with Bootstrap modal showing "coming soon"
    - [ ] Placeholder links (`href="#"`) → Add Bootstrap toast notification on click
    - [ ] Disabled CTAs with `aria-disabled="true"` → Use Bootstrap's `.disabled` class and JavaScript handler
    - [ ] "Coming soon" features → Implement Bootstrap tooltips or popovers
  - [ ] Create comprehensive list with locations and proposed Bootstrap solution
  - [ ] Document in spreadsheet with Bootstrap component mapping

- [ ] **5.2 Prioritize by User Impact & Bootstrap Implementation**

  - [ ] **High Priority** (implement with Bootstrap components):
    - [ ] Primary CTAs (job search, apply buttons) → Use Bootstrap modals for auth/signup flow
    - [ ] Core navigation elements → Ensure all use Bootstrap's `.nav-link` with proper states
    - [ ] Essential form submissions → Use Bootstrap form validation JavaScript
  - [ ] **Medium Priority** (implement with Bootstrap JS):
    - [ ] Secondary features (job alerts, filters) → Bootstrap modal + toast for feedback
    - [ ] Social sharing buttons → Bootstrap dropdown for share options
    - [ ] Newsletter signups → Bootstrap form with JavaScript validation
  - [ ] **Low Priority** (use Bootstrap utilities to mark):
    - [ ] Future features → Bootstrap badges (`.badge`) with "coming soon" text
    - [ ] Advanced filtering → Bootstrap tooltips explaining future availability
    - [ ] Premium features → Bootstrap cards with `.opacity-50` and disabled state

- [ ] **5.3 Implement Placeholder Interactions with Bootstrap JavaScript**

  - [ ] **Bootstrap Modal for Demos:**
    ```javascript
    // Replace placeholder buttons with modal triggers
    document.querySelectorAll("[data-demo-feature]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal("#demoModal");
        modal.show();
      });
    });
    ```
  - [ ] **Bootstrap Toast for Notifications:**
    ```javascript
    // Show toast for placeholder link clicks
    document.querySelectorAll('a[href="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const toast = new bootstrap.Toast("#comingSoonToast");
        toast.show();
      });
    });
    ```
  - [ ] **Bootstrap Tooltip for Inline Hints:**
    - [ ] Add `data-bs-toggle="tooltip"` to disabled elements
    - [ ] Initialize tooltips with `const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')`
  - [ ] Add visual indicators using Bootstrap components:
    - [ ] Use `.badge .bg-warning` for "Demo" labels
    - [ ] Use `.btn.disabled` for disabled state styling
    - [ ] Use `.text-muted` for explanatory text
  - [ ] Ensure clear user expectations with ARIA:
    - [ ] `aria-label="Demo feature - not yet functional"`
    - [ ] `role="button"` with `aria-disabled="true"` for non-link demos

- [ ] **5.4 Document Placeholder State (Bootstrap-Enhanced)**
  - [ ] Update feature documentation to reference Bootstrap components used
  - [ ] Add roadmap for replacing Bootstrap demo modals with real functionality
  - [ ] Mark intentional vs. incomplete features in documentation
  - [ ] Create tracking issues for future work with Bootstrap implementation notes
  - [ ] Document which Bootstrap JavaScript components are in use (Modal, Toast, Tooltip, etc.)

### Completion Criteria

- [ ] All placeholders identified and documented with Bootstrap solution
- [ ] High-priority placeholders use Bootstrap modals/toasts for feedback
- [ ] Bootstrap JavaScript components initialized and working
- [ ] Clear visual/semantic distinction using Bootstrap utilities (badges, disabled states)
- [ ] User expectations properly set with Bootstrap tooltips/popovers
- [ ] Future work tracked with Bootstrap migration path
- [ ] No custom JavaScript where Bootstrap component exists

---

## PHASE 6: Testing & Validation ✅

**Goal:** Verify all improvements meet accessibility standards  
**Timeline:** Ongoing (1-2 hours per phase)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **6.1 Automated Testing**

  - [ ] Run axe-core on all modified pages:
    - [ ] index.html
    - [ ] pages/jobs/jobFilter.html
    - [ ] pages/about.html
    - [ ] pages/agency.html
    - [ ] Company pages
  - [ ] Run Lighthouse accessibility audits
  - [ ] Execute existing Playwright tests
  - [ ] Generate reports for each phase
  - [ ] Save reports to `tests/accessibility/results/`

- [ ] **6.2 Manual Keyboard Testing**

  - [ ] Tab through entire site without mouse
  - [ ] Test all form interactions
  - [ ] Verify focus order and visibility
  - [ ] Test with different browser zoom levels:
    - [ ] 100% (default)
    - [ ] 150%
    - [ ] 200%
  - [ ] Document any issues found

- [ ] **6.3 Screen Reader Testing**

  - [ ] Test with NVDA (Windows) or JAWS
  - [ ] Verify landmark navigation
  - [ ] Check form announcements
  - [ ] Test navigation menu functionality
  - [ ] Verify image alt text
  - [ ] Test dynamic content announcements

- [ ] **6.4 Color Contrast Verification**

  - [ ] Use WebAIM Contrast Checker
  - [ ] Document all color combinations:
    - [ ] Primary text on backgrounds
    - [ ] Button text on button backgrounds
    - [ ] Link colors on backgrounds
    - [ ] Focus states
  - [ ] Fix any failures immediately
  - [ ] Maintain contrast ratio spreadsheet

- [ ] **6.5 Cross-browser Testing**
  - [ ] Chrome (latest)
    - [ ] Desktop
    - [ ] Mobile
  - [ ] Firefox (latest)
    - [ ] Desktop
    - [ ] Mobile
  - [ ] Safari (latest)
    - [ ] Desktop
    - [ ] iOS
  - [ ] Edge (latest)
  - [ ] Verify keyboard shortcuts work consistently
  - [ ] Check mobile keyboard navigation

### Completion Criteria

- [ ] All automated tests pass
- [ ] No WCAG AA violations
- [ ] Keyboard navigation works in all browsers
- [ ] Screen reader announces all content correctly
- [ ] All color combinations pass contrast requirements
- [ ] Test reports generated and saved

---

## PHASE 7: Documentation & Maintenance 📚

**Goal:** Ensure improvements are maintained long-term  
**Timeline:** Week 4 (2-3 days)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **7.1 Update Accessibility Checklist**

  - [ ] Document new focus state patterns
  - [ ] Add spacing/typography guidelines
  - [ ] Update PR checklist requirements
  - [ ] Add examples for common patterns
  - [ ] Update `docs/ACCESSIBILITY_CHECKLIST.md`

- [ ] **7.2 Create Style Guide**

  - [ ] Document active navigation patterns
  - [ ] Show focus state examples with screenshots
  - [ ] Provide code snippets for reuse
  - [ ] Include do's and don'ts
  - [ ] Add to `docs/CODE_AND_DESIGN_GUIDE.md`

- [ ] **7.3 Update CSS Documentation**

  - [ ] Document new spacing tokens
  - [ ] Explain typography scale usage
  - [ ] Provide component usage examples
  - [ ] Update inline CSS comments
  - [ ] Update `docs/CSS_MAIN_GUIDE.md`

- [ ] **7.4 Training & Handoff**
  - [ ] Brief team on new patterns
  - [ ] Create quick reference guide
  - [ ] Establish review process for future changes
  - [ ] Record video walkthrough (optional)
  - [ ] Schedule knowledge sharing session

### Completion Criteria

- [ ] All documentation updated
- [ ] Style guide includes new patterns
- [ ] Team trained on new standards
- [ ] Review process established
- [ ] Quick reference guide created

---

## Success Criteria

Each phase is complete when:

- ✅ All tasks checked off
- ✅ All automated tests pass
- ✅ Manual keyboard navigation flows smoothly
- ✅ No WCAG AA violations in affected areas
- ✅ Changes documented in style guide
- ✅ PR reviewed and approved
- ✅ No visual regressions in existing features
- ✅ Phase marked complete in this document

---

## Risk Mitigation

### Potential Issues & Solutions

**1. Bootstrap override conflicts**

- **Risk:** Focus states may conflict with Bootstrap defaults
- **Solution:** Apply more specific selectors, test thoroughly, use `!important` sparingly
- **Mitigation:** Review Bootstrap docs, test in isolation first

**2. Bootstrap migration may introduce breaking changes**

- **Risk:** Replacing custom CSS with Bootstrap utilities could break existing layouts or styling
- **Solution:** Migrate incrementally, test each page after changes, maintain visual regression testing
- **Mitigation:**
  - Use feature branches for each phase
  - Take before/after screenshots
  - Test at all breakpoints (mobile, tablet, desktop)
  - Keep custom CSS temporarily during transition period
  - Document which Bootstrap components/utilities replace which custom CSS

**3. Spacing changes may break layouts**

- **Risk:** Standardizing spacing could shift designs unexpectedly
- **Solution:** Phase changes, visual regression testing, designer review
- **Mitigation:** Take screenshots before/after, test at all breakpoints

**4. Active nav state JavaScript implementation**

- **Risk:** Currently static HTML with manual `.active` class, may need JavaScript automation
- **Solution:**
  - Short-term: Keep current static approach (works, just requires manual maintenance)
  - Long-term: Use Bootstrap's ScrollSpy or custom `window.location` JavaScript to auto-detect page
- **Mitigation:** Keep solution lightweight, ensure progressive enhancement, static fallback

**5. Filter form complexity**

- **Risk:** Many interactive elements to test thoroughly
- **Solution:** Break into smaller test chunks, use Bootstrap's built-in JavaScript where possible
- **Mitigation:** Create comprehensive test plan, use Playwright for automation, leverage Bootstrap's accessibility features

**6. Browser inconsistencies**

- **Risk:** Focus styles may render differently across browsers
- **Solution:** Use Bootstrap's standardized focus patterns, test extensively
- **Mitigation:** Document known issues, provide fallbacks, rely on Bootstrap's cross-browser testing

**7. Over-reliance on JavaScript**

- **Risk:** Too much Bootstrap JavaScript could impact performance or break with JS disabled
- **Solution:** Use progressive enhancement, ensure core functionality works without JS
- **Mitigation:**
  - Critical features should work with HTML/CSS only
  - JavaScript enhances experience but isn't required
  - Test with JS disabled in browser
  - Use Bootstrap's data attributes for automatic initialization (no custom JS needed)

---

## Estimated Timeline

| Phase                            | Duration | Start | End |
| -------------------------------- | -------- | ----- | --- |
| Phase 1: Critical Accessibility  | 2-3 days | TBD   | TBD |
| Phase 2: Form Accessibility      | 3-4 days | TBD   | TBD |
| Phase 3: Footer Enhancement      | 2-3 days | TBD   | TBD |
| Phase 4: Spacing/Typography      | 5-7 days | TBD   | TBD |
| Phase 5: Placeholder Affordances | 3-5 days | TBD   | TBD |
| Phase 6: Testing                 | Ongoing  | TBD   | TBD |
| Phase 7: Documentation           | 2-3 days | TBD   | TBD |

**Total Estimated Time:** 3-4 weeks

---

## Progress Tracking

### Overall Status

- **Phases Completed:** 1/7
- **Overall Progress:** 14%
- **Current Phase:** Phase 1 - Complete ✅
- **Blockers:** None

### Phase Status Legend

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⚠️ Blocked

### Recent Updates

- **2025-10-29 (Evening):** Phase 1 completed! All critical accessibility fixes implemented.
- **2025-10-29 (Afternoon):** Plan created, Phase 1 started and completed same day.

---

## Next Steps

### Immediate Actions (Today)

1. Review and approve this plan
2. Set up development environment
3. Create feature branch: `fix/usability-phase-1`
4. Run baseline accessibility tests
5. Begin Phase 1, Task 1.1

### This Week

1. Complete Phase 1 (Critical Accessibility)
2. Begin Phase 2 (Form Accessibility)
3. Run automated tests after each task
4. Document any blockers or issues

### This Month

1. Complete Phases 1-4
2. Begin Phase 5 if time permits
3. Continuous testing and validation
4. Weekly progress updates in this document

---

## Team Notes

### Questions & Decisions

- [ ] Confirm spacing token values with design team
- [ ] Review active nav styling with UX designer
- [ ] Decide on focus color (currently `#0066cc` - is this approved?)
- [ ] Confirm priority for placeholder features

### Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Playwright Documentation](https://playwright.dev/)

### Related Documents

- `docs/ACCESSIBILITY_CHECKLIST.md` - Accessibility requirements
- `docs/CODE_AND_DESIGN_GUIDE.md` - Design system
- `docs/CSS_MAIN_GUIDE.md` - CSS architecture
- `docs/PR_CHECKLIST.md` - PR requirements

---

## Changelog

| Date       | Phase | Change               | Author |
| ---------- | ----- | -------------------- | ------ |
| 2025-10-29 | All   | Initial plan created | System |

---

**Last Updated:** October 29, 2025  
**Document Owner:** Development Team  
**Review Cycle:** Update after each phase completion
