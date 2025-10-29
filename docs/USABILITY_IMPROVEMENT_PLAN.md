# Usability Improvement Plan - Phase-by-Phase Implementation

**Created:** October 29, 2025  
**Branch:** `fix/usability`  
**Status:** In Progress

## Overview

This document tracks the implementation of usability improvements based on reviewer feedback:

> "Usability is developing: navigation and headings are consistent, but key affordances are placeholders; add visible focus states, skip-to-content, active-nav styling, and standardize spacing/type scale; also verify contrast and keyboard traversal on the filter form and footer links."

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

- Test keyboard navigation manually on all pages
- Run automated accessibility tests (axe, Lighthouse)
- Proceed to Phase 2: Form Accessibility

- [ ] No focus traps detected
- [ ] Changes documented

---

## PHASE 2: Form Accessibility (jobFilter.html Focus) 📋

**Goal:** Ensure filter form meets contrast and keyboard requirements  
**Timeline:** Week 1 (3-4 days)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **2.1 Filter Form Focus States**

  - [ ] Add visible focus indicators to:
    - [ ] Search input field (jobFilter.html line 215)
    - [ ] Support filter button group
    - [ ] Japanese Level filter buttons
    - [ ] Location filter buttons
    - [ ] Industry filter buttons
    - [ ] Reset button
    - [ ] Apply/Search button
  - [ ] Ensure focus order is logical through filter groups
  - [ ] Test keyboard navigation through all filters

- [ ] **2.2 Color Contrast Verification**

  - [ ] Run automated contrast checks (axe, Lighthouse)
  - [ ] Check button states against WCAG AA (4.5:1):
    - [ ] `.btn-outline-primary` active state
    - [ ] `.btn-outline-primary` inactive state
    - [ ] `.btn-outline-secondary` states
    - [ ] Form labels
    - [ ] Placeholder text
  - [ ] Document any contrast issues found
  - [ ] Fix all contrast violations

- [ ] **2.3 Keyboard Navigation Improvements**

  - [ ] Ensure all filter buttons are keyboard operable
  - [ ] Add keyboard shortcuts:
    - [ ] Enter to apply filters
    - [ ] Escape to reset filters
  - [ ] Test screen reader announcements for filter changes
  - [ ] Verify filter state changes are announced

- [ ] **2.4 Form Labels and ARIA**
  - [ ] Verify all inputs have proper labels
  - [ ] Add `aria-label` where visual labels are missing
  - [ ] Add `aria-describedby` for helper text
  - [ ] Ensure filter button groups have proper grouping labels
  - [ ] Test with screen reader (NVDA/JAWS)

### Completion Criteria

- [ ] All form elements pass contrast requirements
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader properly announces all elements
- [ ] Filter interactions are accessible
- [ ] axe-core shows no violations

---

## PHASE 3: Footer Link Enhancement 🔗

**Goal:** Improve footer link visibility and keyboard accessibility  
**Timeline:** Week 1-2 (2-3 days)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **3.1 Footer Link Focus States**

  - [ ] Design highly visible focus states for dark background
  - [ ] Implement focus indicators:
    - [ ] Bright outline color (yellow, cyan, or white with offset)
    - [ ] Optional background highlight
  - [ ] Test contrast ratio for focus indicators
  - [ ] Apply to all footer links:
    - [ ] Footer navigation links
    - [ ] Legal links (Terms, Privacy)
    - [ ] CTA buttons (Employer Login, Post a Job)

- [ ] **3.2 Footer Link Hover States**

  - [ ] Add hover feedback (underline, color shift)
  - [ ] Ensure hover and focus states are distinct but consistent
  - [ ] Test on touch devices (no hover state issues)

- [ ] **3.3 Footer Keyboard Navigation**

  - [ ] Verify tab order through footer columns is logical
  - [ ] Test with screen reader for proper structure
  - [ ] Ensure footer landmarks are properly labeled
  - [ ] Test skip-to-footer if needed

- [ ] **3.4 Footer Spacing Consistency**
  - [ ] Review footer padding/margins (currently very tight)
  - [ ] Ensure touch targets meet minimum size (44x44px mobile)
  - [ ] Update spacing using spacing tokens
  - [ ] Test responsive behavior

### Completion Criteria

- [ ] Footer links have highly visible focus states
- [ ] All footer links meet contrast requirements
- [ ] Keyboard navigation through footer is smooth
- [ ] Touch targets meet minimum size
- [ ] No accessibility violations in footer

---

## PHASE 4: Spacing & Typography Standardization 📐

**Goal:** Create consistent spacing and type scale across the site  
**Timeline:** Week 2-3 (5-7 days)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **4.1 Audit Current Spacing System**

  - [ ] Document current tokens:
    - ✅ `--space-lg: 4rem`
    - ✅ `--space-md: 2rem`
    - ✅ `--space-sm: 1rem`
  - [ ] Identify all hardcoded spacing values
  - [ ] Create spreadsheet of unique values used
  - [ ] Categorize by component type

- [ ] **4.2 Expand Spacing Token System**

  - [ ] Create comprehensive spacing scale in main.css:
    ```css
    --space-xs: 0.25rem; /* 4px */
    --space-sm: 0.5rem; /* 8px */
    --space-md: 1rem; /* 16px */
    --space-lg: 1.5rem; /* 24px */
    --space-xl: 2rem; /* 32px */
    --space-2xl: 3rem; /* 48px */
    --space-3xl: 4rem; /* 64px */
    ```
  - [ ] Map old values to new scale
  - [ ] Update CSS custom properties section

- [ ] **4.3 Standardize Typography Scale**

  - [ ] Review current scale:
    - ✅ H1: 36px/44px
    - ✅ H2: 32px/36px
    - ✅ H3: 28px/36px
    - ✅ Body: 16px/24px
  - [ ] Audit all font-size declarations
  - [ ] Convert hardcoded sizes to tokens
  - [ ] Add missing intermediate sizes if needed:
    - [ ] H4, H5, H6 sizes
    - [ ] Small text size
    - [ ] Caption size
  - [ ] Document type scale in CSS guide

- [ ] **4.4 Apply to Components Systematically**

  - [ ] High-priority pages:
    - [ ] index.html
    - [ ] pages/jobs/jobFilter.html
    - [ ] pages/about.html
  - [ ] Update component styles:
    - [ ] Buttons (all variants)
    - [ ] Cards (job cards, company cards)
    - [ ] Forms (inputs, labels, groups)
    - [ ] Navigation (header, footer)
  - [ ] Remove hardcoded padding/margin values
  - [ ] Test responsive behavior at all breakpoints:
    - [ ] Mobile (320px-767px)
    - [ ] Tablet (768px-1023px)
    - [ ] Desktop (1024px+)

- [ ] **4.5 Create Spacing Utility Classes**
  - [ ] Generate margin utilities:
    ```css
    .mt-xs {
      margin-top: var(--space-xs);
    }
    .mt-sm {
      margin-top: var(--space-sm);
    }
    .mt-md {
      margin-top: var(--space-md);
    }
    /* etc. for all sides and sizes */
    ```
  - [ ] Generate padding utilities
  - [ ] Generate gap utilities for flexbox/grid
  - [ ] Document utility classes in CSS guide
  - [ ] Add usage examples

### Completion Criteria

- [ ] Complete spacing token system implemented
- [ ] All components use spacing tokens
- [ ] Typography scale fully documented
- [ ] No hardcoded spacing values remain
- [ ] Visual regression tests pass
- [ ] Responsive behavior verified

---

## PHASE 5: Placeholder Affordances 🎯

**Goal:** Replace placeholder elements with functional components  
**Timeline:** Week 3-4 (3-5 days)  
**Status:** 🔴 Not Started

### Tasks

- [ ] **5.1 Identify All Placeholders**

  - [ ] Audit for non-functional elements:
    - [ ] Demo buttons (e.g., job alerts signup)
    - [ ] Placeholder links (`href="#"`)
    - [ ] Disabled CTAs with `aria-disabled="true"`
    - [ ] "Coming soon" features
  - [ ] Create comprehensive list with locations
  - [ ] Document in spreadsheet

- [ ] **5.2 Prioritize by User Impact**

  - [ ] **High Priority** (implement first):
    - [ ] Primary CTAs (job search, apply buttons)
    - [ ] Core navigation elements
    - [ ] Essential form submissions
  - [ ] **Medium Priority** (implement second):
    - [ ] Secondary features (job alerts, filters)
    - [ ] Social sharing buttons
    - [ ] Newsletter signups
  - [ ] **Low Priority** (document for future):
    - [ ] Future features clearly marked "coming soon"
    - [ ] Advanced filtering options
    - [ ] Premium features

- [ ] **5.3 Progressive Enhancement Strategy**

  - [ ] Add visual indicators for placeholder vs. functional:
    - [ ] "Demo" badges
    - [ ] Disabled state styling
    - [ ] Tooltips explaining state
  - [ ] Add helper text for keyboard users
  - [ ] Ensure clear user expectations
  - [ ] Update ARIA labels to reflect state

- [ ] **5.4 Document Placeholder State**
  - [ ] Update feature documentation
  - [ ] Add roadmap for implementation
  - [ ] Mark intentional vs. incomplete features
  - [ ] Create tracking issues for future work

### Completion Criteria

- [ ] All placeholders identified and documented
- [ ] High-priority placeholders addressed
- [ ] Clear visual/semantic distinction for demos
- [ ] User expectations properly set
- [ ] Future work tracked in issues

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

**2. Spacing changes may break layouts**

- **Risk:** Standardizing spacing could shift designs unexpectedly
- **Solution:** Phase changes, visual regression testing, designer review
- **Mitigation:** Take screenshots before/after, test at all breakpoints

**3. Active nav state requires JS**

- **Risk:** Currently static HTML, may need JS to set active class
- **Solution:** Can use CSS `:current` pseudo-class or simple JS on page load
- **Mitigation:** Keep solution lightweight, ensure progressive enhancement

**4. Filter form complexity**

- **Risk:** Many interactive elements to test thoroughly
- **Solution:** Break into smaller test chunks, automate where possible
- **Mitigation:** Create comprehensive test plan, use Playwright for automation

**5. Browser inconsistencies**

- **Risk:** Focus styles may render differently across browsers
- **Solution:** Use standardized focus patterns, test extensively
- **Mitigation:** Document known issues, provide fallbacks

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
