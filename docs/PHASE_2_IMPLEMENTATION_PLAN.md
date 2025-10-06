# Phase 2 Implementation Plan

**Project:** Japan SSW (MMDC-WST)  
**Version:** 1.0.0  
**Status:** Planning Document  
**Last Updated:** October 6, 2025  
**Target:** Modern JavaScript (ES2024) + Bootstrap 5.3.x Integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Technology Recommendations](#technology-recommendations)
4. [Architecture & Patterns](#architecture--patterns)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Feature Priorities](#feature-priorities)
7. [Testing Strategy](#testing-strategy)
8. [Performance Considerations](#performance-considerations)
9. [Accessibility & Progressive Enhancement](#accessibility--progressive-enhancement)
10. [Migration Checklist](#migration-checklist)
11. [Risk Assessment](#risk-assessment)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

Phase 2 will transform the Japan SSW static site into an interactive, modern web application while maintaining the clean, accessible foundation established in Phase 1. This plan outlines a strategic approach to integrate modern JavaScript (ES2024) and Bootstrap 5.3.x without backend dependencies.

**Key Objectives:**

- Enhance user experience with progressive JavaScript features
- Implement client-side form validation and interactivity
- Integrate Bootstrap 5.3.x utilities selectively
- Maintain accessibility (WCAG 2.1 AA compliance)
- Keep performance optimized (Core Web Vitals)
- Preserve mobile-first, responsive design

**No Backend Required:**

- All features are client-side only
- Data persistence via localStorage/sessionStorage
- Form submissions via mailto or external services (EmailJS, Formspree)
- Future-ready for backend integration (API endpoints planned but not implemented)

---

## Current State Analysis

### Strengths (Phase 1 Deliverables)

✅ **Solid Foundation:**

- Clean, semantic HTML5 structure
- Well-organized CSS with design tokens (`assets/css/main.css`)
- Mobile-first responsive design (Grid + Flexbox)
- Accessibility best practices (ARIA, semantic markup)
- Performance-optimized (minimal assets, optimized images)

✅ **Infrastructure:**

- Playwright test suite configured (`tests/playwright/`)
- npm scripts for development workflow
- GitHub Actions deployment pipeline
- Clear documentation (README, CODE_AND_DESIGN_GUIDE)

✅ **Code Quality:**

- BEM-style CSS naming conventions
- Consistent design tokens (`:root` variables)
- Cross-page header/footer contract maintained
- WebP/responsive images implemented

### Gaps & Opportunities (Phase 2 Targets)

❌ **JavaScript Disabled:**

- All JS files are placeholder/archived
- No client-side validation or interactivity
- Forms are static (no submit handling)
- No dynamic UI components (tooltips, modals, dropdowns)

❌ **Bootstrap Commented Out:**

- Bootstrap 5.3.2 CDN links exist but are commented
- Missing utility-first styling benefits
- No component library for rapid prototyping

❌ **Limited Interactivity:**

- Contact form is static (mailto fallback)
- No progressive disclosure patterns
- No loading states or user feedback
- Profile dashboard has one inline script for tooltip (non-reusable)

❌ **Missing Modern Features:**

- No ES modules structure
- No bundler/build process
- No state management patterns
- No component-based architecture

### Technical Debt

⚠️ **Immediate Issues:**

- JavaScript module files are empty placeholders (archived to `archive/assets-js/`)
- Some pages use inline Tailwind CDN (`pages/addEdit/*.html`) — inconsistent with project CSS approach
- Bootstrap version is 5.3.2 (slightly outdated; 5.3.3 released)
- No linting/formatting configuration (ESLint, Prettier)

⚠️ **Documentation Gaps:**

- No JavaScript architecture documented
- No component usage guide
- No browser compatibility matrix
- No performance budget defined

---

## Technology Recommendations

### JavaScript (ES2024)

**Recommendation: Use Native ES Modules + Modern JavaScript**

```javascript
// Recommended: ES2024 features
export class FormValidator {
  #config; // Private fields

  constructor(config) {
    this.#config = config ?? { strict: true };
  }

  async validate(data) {
    // Top-level await, optional chaining, nullish coalescing
    const schema = await import("./schemas/contact.js");
    return schema.default?.validate(data) ?? false;
  }
}
```

**Why ES2024:**

- Native browser support (Chrome 90+, Firefox 88+, Safari 14.1+)
- No transpilation needed for modern browsers
- Smaller bundle sizes
- Better tree-shaking and performance
- Private class fields, top-level await, pattern matching

**Key Features to Leverage:**

- ✅ ES Modules (`import`/`export`)
- ✅ Async/Await (Promise-based APIs)
- ✅ Optional Chaining (`?.`)
- ✅ Nullish Coalescing (`??`)
- ✅ Private Class Fields (`#field`)
- ✅ Array/Object methods (`at()`, `findLast()`, `Object.hasOwn()`)
- ✅ Logical Assignment (`||=`, `&&=`, `??=`)
- ✅ Top-level Await (ES2022)

**Polyfills:** Include `core-js` only for legacy browser support (optional, graceful degradation preferred)

---

### Bootstrap 5.3.x

**Recommendation: Bootstrap 5.3.3 (Latest Stable) with Selective Imports**

**Why Bootstrap 5.3.3:**

- Latest stable release (September 2024)
- Enhanced color modes (light/dark)
- Improved CSS variables
- Better accessibility features
- Smaller bundle sizes (modular imports)
- No jQuery dependency

**Integration Strategy:**

#### Option A: CDN (Recommended for Phase 2)

```html
<!-- Bootstrap CSS -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
  crossorigin="anonymous"
/>

<!-- Bootstrap Bundle (includes Popper) -->
<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
  crossorigin="anonymous"
  defer
></script>
```

#### Option B: npm + Custom Build (Phase 3/Future)

```bash
npm install bootstrap@5.3.3
```

```scss
// Custom Bootstrap build (only what you need)
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";

// Include only needed components
@import "bootstrap/scss/grid";
@import "bootstrap/scss/forms";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/modal";
@import "bootstrap/scss/utilities";
```

**Bootstrap Components to Use:**

| Component   | Priority | Use Case                                           |
| ----------- | -------- | -------------------------------------------------- |
| Grid System | High     | Replace manual grid with Bootstrap responsive grid |
| Forms       | High     | Form controls, validation states                   |
| Buttons     | Medium   | Enhance existing `.btn` system                     |
| Modal       | High     | Job details, profile edit modals                   |
| Tooltips    | Medium   | Help text, info bubbles                            |
| Dropdown    | Medium   | User menu, filters                                 |
| Navbar      | Low      | Optional enhancement (custom header works well)    |
| Cards       | Low      | Job cards, company cards                           |
| Alerts      | Medium   | User feedback messages                             |
| Badges      | Low      | Status indicators                                  |
| Spinners    | High     | Loading states                                     |

**Bootstrap Components to AVOID:**

- ❌ Carousel (use native Intersection Observer or custom)
- ❌ Accordion (simple CSS alternative exists)
- ❌ Tabs (semantic HTML + CSS Grid preferred)
- ❌ Collapse (custom implementation is lighter)

---

### Build Tools & Dependencies

**Recommendation: Minimal Tooling for Phase 2**

```json
{
  "devDependencies": {
    "@playwright/test": "^1.45.0",
    "eslint": "^9.9.0",
    "prettier": "^3.3.3",
    "vite": "^5.4.0",
    "sass": "^1.77.0"
  },
  "dependencies": {
    "bootstrap": "^5.3.3"
  }
}
```

**Why Vite (Optional for Development):**

- Fast dev server with HMR
- Native ES modules support
- Minimal configuration
- Tree-shaking and code splitting
- Can serve static files in Phase 2, ready for bundling in Phase 3

**ESLint + Prettier:**

```javascript
// eslint.config.js (ESLint 9 flat config)
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
```

---

## Architecture & Patterns

### Module Structure

**Recommended File Organization:**

```
assets/js/
├── main.js                 # Entry point, app initialization
├── config/
│   ├── constants.js        # App-wide constants
│   └── routes.js           # Page-specific initialization map
├── core/
│   ├── EventBus.js         # Pub/Sub pattern for decoupled communication
│   ├── Storage.js          # localStorage/sessionStorage wrapper
│   └── Router.js           # Simple client-side routing (optional)
├── components/
│   ├── Modal.js            # Modal component (Bootstrap wrapper)
│   ├── Toast.js            # Toast notifications
│   ├── Tooltip.js          # Tooltip controller
│   └── Dropdown.js         # Dropdown menus
├── features/
│   ├── navigation/
│   │   ├── MobileNav.js    # Mobile menu toggle
│   │   └── UserMenu.js     # User dropdown menu
│   ├── forms/
│   │   ├── FormValidator.js    # Validation logic
│   │   ├── ContactForm.js      # Contact form handler
│   │   └── ProfileForm.js      # Profile edit forms
│   ├── jobs/
│   │   ├── JobFilter.js    # Job search/filter
│   │   ├── JobCard.js      # Job card interactions
│   │   └── JobModal.js     # Job detail modal
│   └── profile/
│       ├── ProfileDashboard.js
│       └── TooltipController.js
├── utils/
│   ├── dom.js              # DOM manipulation helpers
│   ├── validators.js       # Validation utilities
│   ├── debounce.js         # Performance utilities
│   └── api.js              # Future API client (Phase 3)
└── polyfills/
    └── core.js             # Polyfills for legacy browsers (optional)
```

### Design Patterns

#### 1. ES Module Pattern

```javascript
// features/forms/ContactForm.js
import { FormValidator } from "./FormValidator.js";
import { Toast } from "../../components/Toast.js";
import { Storage } from "../../core/Storage.js";

export class ContactForm {
  #validator;
  #form;

  constructor(formElement) {
    this.#form = formElement;
    this.#validator = new FormValidator();
    this.init();
  }

  init() {
    this.#form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(this.#form);
    const data = Object.fromEntries(formData);

    if (!this.#validator.validate(data)) {
      Toast.show("Please fix validation errors", "error");
      return;
    }

    await this.submit(data);
  }

  async submit(data) {
    // Phase 2: localStorage or EmailJS
    // Phase 3: API endpoint
    Storage.set("contact_draft", data);
    Toast.show("Message saved locally", "success");
  }
}
```

#### 2. Component Pattern (Reusable UI)

```javascript
// components/Modal.js
export class Modal {
  #element;
  #bootstrapModal;

  constructor(id, options = {}) {
    this.#element = document.getElementById(id);
    this.#bootstrapModal = new bootstrap.Modal(this.#element, options);
  }

  show(content) {
    if (content) {
      this.#element.querySelector(".modal-body").innerHTML = content;
    }
    this.#bootstrapModal.show();
  }

  hide() {
    this.#bootstrapModal.hide();
  }

  static create(id, title, content) {
    const template = `
      <div class="modal fade" id="${id}" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">${content}</div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", template);
    return new Modal(id);
  }
}
```

#### 3. Event Bus Pattern (Decoupled Communication)

```javascript
// core/EventBus.js
export class EventBus {
  #events = new Map();

  on(event, callback) {
    if (!this.#events.has(event)) {
      this.#events.set(event, []);
    }
    this.#events.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.#events.get(event);
    if (callbacks) {
      this.#events.set(
        event,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  emit(event, data) {
    const callbacks = this.#events.get(event) ?? [];
    callbacks.forEach((callback) => callback(data));
  }
}

// Global instance
export const eventBus = new EventBus();
```

#### 4. Storage Wrapper Pattern

```javascript
// core/Storage.js
export class Storage {
  static PREFIX = "japanssw_";

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  }

  static remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  }
}
```

### State Management

**Recommendation: Simple Reactive Pattern (No External Library)**

```javascript
// core/State.js
export class State {
  #state = {};
  #listeners = new Map();

  get(key) {
    return this.#state[key];
  }

  set(key, value) {
    const oldValue = this.#state[key];
    this.#state[key] = value;

    if (oldValue !== value) {
      this.#notify(key, value, oldValue);
    }
  }

  subscribe(key, callback) {
    if (!this.#listeners.has(key)) {
      this.#listeners.set(key, []);
    }
    this.#listeners.get(key).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.#listeners.get(key);
      this.#listeners.set(
        key,
        callbacks.filter((cb) => cb !== callback)
      );
    };
  }

  #notify(key, newValue, oldValue) {
    const callbacks = this.#listeners.get(key) ?? [];
    callbacks.forEach((callback) => callback(newValue, oldValue));
  }
}

// Usage example
import { State } from "./core/State.js";

const appState = new State();

// Subscribe to changes
appState.subscribe("user", (user) => {
  document.querySelector(".user-name").textContent = user.name;
});

// Update state (automatically triggers UI update)
appState.set("user", { name: "Juan Dela Cruz", role: "worker" });
```

---

## Language Translation (EN ↔ JP) Implementation

### Overview

Implement **free, client-side bilingual support** for English and Japanese users without any external API costs or dependencies.

**Why Include in Phase 2?**

✅ **High User Impact** - Target audience includes Japanese workers and English-speaking employers  
✅ **Zero Cost** - No translation APIs, no subscriptions, no rate limits  
✅ **Low Complexity** - Simple JSON dictionaries and localStorage  
✅ **Accessibility Critical** - Essential for users in Japan  
✅ **Quick Implementation** - Can be completed in 1-2 days  
✅ **Offline-Ready** - Works without internet connection  

### Architecture

```
assets/js/
├── core/
│   ├── i18n.js                    # Translation engine
│   └── translations.js            # EN/JP dictionaries
└── components/
    └── LanguageToggle.js          # Toggle button component
```

### Translation Dictionary Example

```javascript
// core/translations.js
export const translations = {
  en: {
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'hero.title': 'Find Your Dream Job in Japan',
    'btn.apply': 'Apply Now',
    'form.required': 'This field is required',
  },
  ja: {
    'nav.home': 'ホーム',
    'nav.jobs': '求人',
    'hero.title': '日本で夢の仕事を見つけよう',
    'btn.apply': '今すぐ応募',
    'form.required': 'この項目は必須です',
  }
};
```

### i18n Engine (Simplified)

```javascript
// core/i18n.js
import { Storage } from './Storage.js';
import { translations } from './translations.js';

export class I18n {
  static getCurrentLanguage() {
    // 1. Check localStorage
    const stored = Storage.get('lang');
    if (stored) return stored;
    
    // 2. Check browser language
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'ja'].includes(browserLang) ? browserLang : 'en';
  }
  
  static setLanguage(lang) {
    Storage.set('lang', lang);
    document.documentElement.lang = lang;
    this.updatePageContent();
  }
  
  static translate(key) {
    const lang = this.getCurrentLanguage();
    return translations[lang]?.[key] || key;
  }
  
  static updatePageContent() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.translate(key);
    });
  }
}
```

### HTML Usage

```html
<!-- Navigation -->
<nav>
  <a href="/" data-i18n="nav.home">Home</a>
  <a href="/jobs" data-i18n="nav.jobs">Jobs</a>
</nav>

<!-- Language Toggle -->
<button id="lang-toggle" class="btn btn-sm btn-outline-secondary">
  日本語
</button>

<!-- Forms -->
<input 
  type="text" 
  data-i18n-placeholder="form.name"
  placeholder="Full Name"
>
```

### Performance

- **Bundle Size:** ~7KB total (5KB translations + 2KB engine)
- **Load Time:** Instant (no network requests)
- **Switching Speed:** < 50ms (pure JavaScript)
- **Storage:** < 1KB in localStorage

### Implementation Timeline

**Week 3 (During Phase 2.2 - Navigation)**

- Day 1: Create `translations.js` with 50-100 common keys
- Day 2: Implement `i18n.js` engine and `LanguageToggle.js`
- Day 3: Add `data-i18n` attributes to all pages
- Day 4: Test and refine

### Translation Coverage

**Phase 2 (Essential)**

- Navigation menu items
- Button labels (Apply, Submit, Save, etc.)
- Form labels and validation messages
- Common UI text (Loading, Error, Success)
- Footer copyright and links

**Phase 3 (Extended)**

- Job descriptions
- Page content
- Help text and tooltips
- Error messages
- Legal pages (Privacy, Terms)

---

## Implementation Roadmap

### Phase 2.1: Foundation (Week 1-2)

**Goal: Enable JavaScript infrastructure and Bootstrap**

**Tasks:**

1. ✅ Uncomment Bootstrap CDN links in all HTML files
2. ✅ Update Bootstrap version from 5.3.2 → 5.3.3
3. ✅ Create `/assets/js/` module structure (directories + files)
4. ✅ Implement `main.js` entry point with page-specific initialization
5. ✅ Add ESLint + Prettier configuration
6. ✅ Create core utilities (EventBus, Storage, State)
7. ✅ Update documentation (README, CODE_AND_DESIGN_GUIDE)

**Deliverables:**

- Bootstrap 5.3.3 loaded on all pages
- Empty but structured JS modules
- Linting/formatting workflow
- Updated docs

**Testing:**

- Verify Bootstrap components render correctly
- Test responsive grid on all breakpoints
- Validate no console errors
- Run Playwright smoke tests

---

### Phase 2.2: Navigation & Interactivity (Week 3)

**Goal: Enhance navigation and add basic interactions**

**Tasks:**

1. ✅ Implement mobile navigation toggle
2. ✅ Create user menu dropdown (header)
3. ✅ **Add language translation (EN ↔ JP)** ⭐ NEW
4. ✅ Add smooth scroll behavior for anchor links
5. ✅ Implement Bootstrap tooltips for info icons
6. ✅ Add loading spinners for async actions
7. ✅ Create toast notification system

**Components:**

```javascript
// features/navigation/MobileNav.js
// features/navigation/UserMenu.js
// core/i18n.js                      ⭐ Language translation
// core/translations.js              ⭐ EN/JP dictionaries
// components/LanguageToggle.js      ⭐ Toggle button
// components/Tooltip.js
// components/Toast.js
```

**Bootstrap Features Used:**

- Dropdown component (user menu)
- Tooltip component
- Spinner utility
- Toast component

**Testing:**

- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (NVDA, VoiceOver)
- Mobile menu toggle on < 900px breakpoint
- User menu interactions
- **Language switching (EN ↔ JP, localStorage persistence)** ⭐ NEW

**Translation Tasks:**

- Create `translations.js` with 50-100 essential keys
- Implement `i18n.js` translation engine
- Add `data-i18n` attributes to all navigation elements
- Create `LanguageToggle.js` component with accessible button
- Test language switching across all pages
- Verify localStorage persistence

---

### Phase 2.3: Form Validation (Week 4-5)

**Goal: Implement client-side form validation**

**Tasks:**

1. ✅ Create `FormValidator` base class
2. ✅ Implement validation rules (email, phone, required, min/max length)
3. ✅ Add real-time validation feedback
4. ✅ Style validation states (Bootstrap .is-valid / .is-invalid)
5. ✅ Handle contact form submission (EmailJS integration)
6. ✅ Add form field masking (phone numbers, dates)
7. ✅ Implement autosave to localStorage (profile forms)

**Components:**

```javascript
// features/forms/FormValidator.js
// features/forms/ContactForm.js
// features/forms/ProfileForm.js
// utils/validators.js
```

**Validation Rules:**

```javascript
// utils/validators.js
export const validators = {
  required: (value) => value.trim() !== "",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[\+]?[0-9]{10,15}$/.test(value.replace(/\s/g, "")),
  minLength: (min) => (value) => value.length >= min,
  maxLength: (max) => (value) => value.length <= max,
  pattern: (regex) => (value) => regex.test(value),
};
```

**Bootstrap Features Used:**

- Form validation classes (`.is-valid`, `.is-invalid`)
- Form feedback components (`.valid-feedback`, `.invalid-feedback`)
- Input groups
- Floating labels

**Testing:**

- Test all validation rules (unit tests)
- Submit forms with invalid data
- Verify error messages display
- Test autosave functionality
- Keyboard-only form completion

---

### Phase 2.4: Job Board Enhancements (Week 6)

**Goal: Add interactive job filtering and modals**

**Tasks:**

1. ✅ Implement job search/filter (client-side)
2. ✅ Create job detail modal
3. ✅ Add "Apply" button interactions
4. ✅ Implement favorite/bookmark jobs (localStorage)
5. ✅ Add sort functionality (date, title, location)
6. ✅ Create loading states for search results

**Components:**

```javascript
// features/jobs/JobFilter.js
// features/jobs/JobCard.js
// features/jobs/JobModal.js
// features/jobs/JobBookmarks.js
```

**Features:**

```javascript
// Filter jobs by category, location, type
const filters = {
  category: ['Accommodation', 'Agriculture', 'Construction', ...],
  location: ['Tokyo', 'Osaka', 'Kyoto', ...],
  type: ['Full-time', 'Part-time', 'Contract']
};

// Sort options
const sortOptions = {
  'date-desc': (a, b) => new Date(b.postedDate) - new Date(a.postedDate),
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'location-asc': (a, b) => a.location.localeCompare(b.location)
};
```

**Bootstrap Features Used:**

- Modal component (job details)
- Dropdown (filter/sort menus)
- Badges (job categories, status)
- Spinner (loading states)

**Testing:**

- Filter combinations
- Sort functionality
- Modal open/close (Escape key)
- Bookmark persistence
- Mobile responsiveness

---

### Phase 2.5: Profile Dashboard (Week 7)

**Goal: Make profile dashboard fully interactive**

**Tasks:**

1. ✅ Refactor inline tooltip script to reusable component
2. ✅ Implement profile edit forms (Experience, Skills, Education)
3. ✅ Add client-side validation for all profile forms
4. ✅ Implement progress tracking (profile completion %)
5. ✅ Add image upload preview (base64 encoding)
6. ✅ Create confirmation modals for delete actions
7. ✅ Persist profile data to localStorage

**Components:**

```javascript
// features/profile/ProfileDashboard.js
// features/profile/ExperienceForm.js
// features/profile/SkillsForm.js
// features/profile/EducationForm.js
// features/profile/ProfileProgress.js
// components/ImageUpload.js
```

**Profile Completion Calculator:**

```javascript
// Calculate profile completion percentage
const calculateCompletion = (profile) => {
  const fields = [
    "name",
    "location",
    "visa",
    "age",
    "gender",
    "experience",
    "education",
    "skills",
    "preferences",
  ];

  const completed = fields.filter((field) => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : true);
  });

  return Math.round((completed.length / fields.length) * 100);
};
```

**Bootstrap Features Used:**

- Modal (edit forms, confirmations)
- Progress bar (profile completion)
- Form controls
- Tooltip (existing info bubbles)

**Testing:**

- Form validation
- Data persistence
- Image upload preview
- Progress calculation accuracy
- Delete confirmations

---

### Phase 2.6: Performance & Polish (Week 8)

**Goal: Optimize performance and add finishing touches**

**Tasks:**

1. ✅ Implement lazy loading for images
2. ✅ Add Intersection Observer for scroll animations
3. ✅ Optimize JavaScript bundle (code splitting)
4. ✅ Add service worker for offline support (optional)
5. ✅ Implement debounce/throttle for scroll/input events
6. ✅ Add loading skeletons for async content
7. ✅ Optimize Core Web Vitals (LCP, FID, CLS)

**Performance Utilities:**

```javascript
// utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// utils/lazyload.js
export class LazyLoad {
  static observe(selector = "img[data-src]") {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "50px" }
    );

    document.querySelectorAll(selector).forEach((img) => observer.observe(img));
  }
}
```

**Bootstrap Features Used:**

- Skeleton placeholders
- Spinners

**Testing:**

- Lighthouse audit (target: 90+ on all metrics)
- PageSpeed Insights
- WebPageTest
- Test on 3G network throttling

---

## Feature Priorities

### High Priority (Must Have - Phase 2)

| Feature                  | Component        | Complexity | Impact |
| ------------------------ | ---------------- | ---------- | ------ |
| Form Validation          | FormValidator.js | Medium     | High   |
| Contact Form Submit      | ContactForm.js   | Medium     | High   |
| Mobile Navigation        | MobileNav.js     | Low        | High   |
| User Menu Dropdown       | UserMenu.js      | Low        | High   |
| Tooltips                 | Tooltip.js       | Low        | Medium |
| Toast Notifications      | Toast.js         | Low        | Medium |
| Job Filter               | JobFilter.js     | Medium     | High   |
| Job Modal                | JobModal.js      | Low        | High   |
| Profile Forms            | ProfileForm.js   | High       | High   |
| localStorage Persistence | Storage.js       | Low        | Medium |

### Medium Priority (Should Have - Phase 2)

| Feature              | Component          | Complexity | Impact |
| -------------------- | ------------------ | ---------- | ------ |
| Job Bookmarks        | JobBookmarks.js    | Low        | Medium |
| Profile Progress     | ProfileProgress.js | Low        | Medium |
| Image Upload Preview | ImageUpload.js     | Medium     | Medium |
| Lazy Loading Images  | LazyLoad.js        | Low        | Medium |
| Smooth Scroll        | ScrollBehavior.js  | Low        | Low    |
| Loading Skeletons    | Skeleton.js        | Low        | Medium |
| Form Autosave        | AutoSave.js        | Medium     | Medium |

### Low Priority (Nice to Have - Phase 3)

| Feature             | Component       | Complexity | Impact |
| ------------------- | --------------- | ---------- | ------ |
| Dark Mode Toggle    | ThemeToggle.js  | Medium     | Low    |
| Service Worker      | sw.js           | High       | Low    |
| Client-side Routing | Router.js       | High       | Low    |
| Advanced Search     | SearchEngine.js | High       | Medium |
| Analytics           | Analytics.js    | Low        | Low    |

### Language Translation (EN ↔ JP) - Recommended for Phase 2

**Approach:** Free, client-side translation using JSON dictionaries (no API costs)

| Feature                    | Component       | Complexity | Impact | Notes                          |
| -------------------------- | --------------- | ---------- | ------ | ------------------------------ |
| Language Toggle            | i18n.js         | Low        | High   | localStorage-based persistence |
| Translation Dictionary     | translations.js | Medium     | High   | EN/JP JSON mappings            |
| Dynamic Content Updates    | i18n.js         | Low        | High   | data-i18n attribute system     |
| Language Detection         | i18n.js         | Low        | Medium | Browser language + manual      |
| Accessible Toggle Button   | LanguageToggle  | Low        | High   | ARIA labels, keyboard support  |

**Why Phase 2?**
- Target audience is bilingual (Japanese workers, English-speaking employers)
- Critical for user accessibility in Japan
- Low complexity (no backend, no API, no cost)
- High impact on user experience
- Easy to implement with JSON dictionaries

---

## Testing Strategy

### Unit Tests (Vitest)

```javascript
// tests/unit/validators.test.js
import { describe, it, expect } from "vitest";
import { validators } from "../utils/validators.js";

describe("Email Validator", () => {
  it("should validate correct email", () => {
    expect(validators.email("test@example.com")).toBe(true);
  });

  it("should reject invalid email", () => {
    expect(validators.email("invalid-email")).toBe(false);
  });
});
```

### Integration Tests (Playwright)

```javascript
// tests/playwright/contact-form.spec.js
import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test("should validate required fields", async ({ page }) => {
    await page.goto("/pages/contact.html");

    // Submit empty form
    await page.click('button[type="submit"]');

    // Verify validation errors appear
    const emailError = page.locator(".invalid-feedback");
    await expect(emailError).toBeVisible();
  });

  test("should submit valid form", async ({ page }) => {
    await page.goto("/pages/contact.html");

    await page.fill("#name", "Test User");
    await page.fill("#email", "test@example.com");
    await page.fill("#message", "Test message");

    await page.click('button[type="submit"]');

    // Verify success toast
    const toast = page.locator(".toast-success");
    await expect(toast).toBeVisible();
  });
});
```

### Accessibility Tests

```javascript
// tests/a11y/navigation.spec.js
test("should be keyboard navigable", async ({ page }) => {
  await page.goto("/");

  // Tab through navigation
  await page.keyboard.press("Tab");
  const firstLink = await page.locator(":focus");
  await expect(firstLink).toHaveAttribute("href");

  // Test dropdown with keyboard
  await page.keyboard.press("Enter");
  const dropdown = page.locator(".dropdown-menu");
  await expect(dropdown).toBeVisible();

  // Close with Escape
  await page.keyboard.press("Escape");
  await expect(dropdown).not.toBeVisible();
});
```

### Performance Tests

```javascript
// tests/performance/lighthouse.js
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const runLighthouse = async (url) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance", "accessibility"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  // Assert performance score
  const score = runnerResult.lhr.categories.performance.score * 100;
  expect(score).toBeGreaterThan(90);

  await chrome.kill();
};
```

---

## Performance Considerations

### JavaScript Optimization

**1. Code Splitting**

```javascript
// main.js - lazy load page-specific modules
const initPage = async () => {
  const page = document.body.dataset.page;

  switch (page) {
    case "home":
      const { HomePage } = await import("./features/home/HomePage.js");
      new HomePage().init();
      break;
    case "jobs":
      const { JobsPage } = await import("./features/jobs/JobsPage.js");
      new JobsPage().init();
      break;
    // ... other pages
  }
};
```

**2. Debounce Expensive Operations**

```javascript
// Search input with debounce
import { debounce } from "./utils/debounce.js";

const searchInput = document.querySelector("#job-search");
const handleSearch = debounce((value) => {
  // Expensive filtering operation
  filterJobs(value);
}, 300);

searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
```

**3. Lazy Load Bootstrap Components**

```javascript
// Only initialize Bootstrap components when needed
const initModal = async (modalId) => {
  if (!window.bootstrap) {
    await import(
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    );
  }
  return new bootstrap.Modal(document.getElementById(modalId));
};
```

### CSS Optimization

**1. Critical CSS Inline**

```html
<!-- Inline critical CSS for above-the-fold content -->
<style>
  /* Header, hero, and layout tokens */
  :root {
    --primary-color: #eb0000;
    ...;
  }
  .site-header {
    ...;
  }
  .hero {
    ...;
  }
</style>

<!-- Load full CSS asynchronously -->
<link
  rel="preload"
  href="assets/css/main.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

**2. Purge Unused Bootstrap CSS**

```javascript
// Future Phase 3: Use PurgeCSS
module.exports = {
  content: ["./**/*.html", "./assets/js/**/*.js"],
  css: ["./assets/css/bootstrap.min.css"],
};
```

### Image Optimization

**1. Responsive Images + WebP**

```html
<picture>
  <source
    srcset="
      assets/images/hero-320.webp   320w,
      assets/images/hero-640.webp   640w,
      assets/images/hero-1280.webp 1280w
    "
    type="image/webp"
  />
  <img
    src="assets/images/hero-640.jpg"
    alt="Hero image"
    loading="lazy"
    width="640"
    height="360"
  />
</picture>
```

**2. Lazy Loading with IntersectionObserver**

```javascript
// Lazy load images below the fold
const lazyImages = document.querySelectorAll("img[data-src]");
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach((img) => imageObserver.observe(img));
```

### Performance Budget

| Metric                         | Target  | Maximum |
| ------------------------------ | ------- | ------- |
| First Contentful Paint (FCP)   | < 1.5s  | 2.0s    |
| Largest Contentful Paint (LCP) | < 2.0s  | 2.5s    |
| First Input Delay (FID)        | < 50ms  | 100ms   |
| Cumulative Layout Shift (CLS)  | < 0.05  | 0.1     |
| Total Blocking Time (TBT)      | < 200ms | 300ms   |
| Time to Interactive (TTI)      | < 3.0s  | 3.5s    |
| JavaScript Bundle Size         | < 50KB  | 100KB   |
| CSS Bundle Size                | < 30KB  | 50KB    |
| Total Page Weight              | < 500KB | 1MB     |

---

## Accessibility & Progressive Enhancement

### WCAG 2.1 AA Compliance

**1. Keyboard Navigation**

```javascript
// Ensure all interactive elements are keyboard accessible
class KeyboardNavigation {
  static init() {
    // Trap focus in modals
    Modal.on("shown", (modal) => this.trapFocus(modal));

    // Handle Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
        this.closeAllDropdowns();
      }
    });
  }

  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }
}
```

**2. ARIA Labels & Live Regions**

```html
<!-- Loading state with live region -->
<div class="search-results" aria-live="polite" aria-busy="false">
  <!-- Results will be announced to screen readers when updated -->
</div>

<!-- Form validation feedback -->
<input
  type="email"
  id="email"
  aria-describedby="email-help email-error"
  aria-invalid="false"
/>
<small id="email-help">We'll never share your email</small>
<div id="email-error" class="invalid-feedback" role="alert">
  <!-- Error message appears here -->
</div>
```

**3. Focus Management**

```javascript
// Return focus after modal close
class Modal {
  #lastFocusedElement;

  show() {
    this.#lastFocusedElement = document.activeElement;
    this.modal.show();
    // Focus first focusable element in modal
    this.modal.querySelector("button, input").focus();
  }

  hide() {
    this.modal.hide();
    // Restore focus to trigger element
    this.#lastFocusedElement?.focus();
  }
}
```

### Progressive Enhancement

**1. Feature Detection**

```javascript
// Check for localStorage support
const hasLocalStorage = (() => {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch {
    return false;
  }
})();

// Graceful fallback
class Storage {
  static set(key, value) {
    if (hasLocalStorage) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      // Use cookies or session storage as fallback
      document.cookie = `${key}=${JSON.stringify(value)}`;
    }
  }
}
```

**2. No-JS Fallbacks**

```html
<!-- Contact form works without JS (mailto fallback) -->
<form action="mailto:contact@japanssw.com" method="post" enctype="text/plain">
  <!-- Form fields -->
  <noscript>
    <p>
      This form will open your email client. For better experience, please
      enable JavaScript.
    </p>
  </noscript>
</form>
```

**3. Reduced Motion**

```css
/* Respect prefers-reduced-motion -->
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Migration Checklist

### Pre-Migration (Phase 2.0)

- [ ] Backup current codebase (create `phase1-final` tag)
- [ ] Document all current functionality
- [ ] Review browser compatibility requirements
- [ ] Set up development environment (Node.js, npm)
- [ ] Create Phase 2 branch (`feature/phase2-bootstrap-js`)

### Bootstrap Integration (Phase 2.1)

- [ ] Update Bootstrap version to 5.3.3 in all HTML files
- [ ] Uncomment Bootstrap CSS CDN links
- [ ] Uncomment Bootstrap JS CDN links
- [ ] Add `defer` attribute to Bootstrap script tags
- [ ] Test Bootstrap components render correctly
- [ ] Verify no CSS conflicts with existing `main.css`
- [ ] Update SRI hashes for CDN integrity
- [ ] Test responsive grid on all breakpoints
- [ ] Run Playwright tests to catch regressions

### JavaScript Setup (Phase 2.1)

- [ ] Create `/assets/js/` directory structure
- [ ] Implement `main.js` entry point
- [ ] Create core modules (EventBus, Storage, State)
- [ ] Add ESLint configuration (`eslint.config.js`)
- [ ] Add Prettier configuration (`.prettierrc`)
- [ ] Set up npm scripts for linting
- [ ] Configure Playwright for JS tests
- [ ] Add `.gitignore` entries for node_modules, build artifacts

### Feature Implementation (Phase 2.2-2.5)

- [ ] Navigation: Mobile menu toggle
- [ ] Navigation: User dropdown menu
- [ ] Components: Toast notifications
- [ ] Components: Tooltips (refactor inline script)
- [ ] Components: Modal wrapper
- [ ] Forms: Validation framework
- [ ] Forms: Contact form handler
- [ ] Forms: Profile edit forms
- [ ] Jobs: Filter/search functionality
- [ ] Jobs: Job detail modal
- [ ] Jobs: Bookmark system
- [ ] Profile: Dashboard interactions
- [ ] Profile: Progress calculator
- [ ] Profile: Image upload preview

### Testing & QA (Phase 2.6)

- [ ] Write unit tests for utilities/validators
- [ ] Add Playwright integration tests for all features
- [ ] Run accessibility audit (axe-core, Lighthouse)
- [ ] Test keyboard navigation (all interactive elements)
- [ ] Test screen reader compatibility (NVDA, VoiceOver)
- [ ] Performance audit (Lighthouse, PageSpeed Insights)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Test on slow network (3G throttling)
- [ ] Verify no console errors/warnings

### Documentation (Phase 2.6)

- [ ] Update README with JavaScript setup instructions
- [ ] Document JavaScript architecture (this plan)
- [ ] Create component usage guide
- [ ] Update CODE_AND_DESIGN_GUIDE with JS patterns
- [ ] Add JSDoc comments to all public APIs
- [ ] Create browser compatibility matrix
- [ ] Document localStorage schema
- [ ] Add troubleshooting guide

### Deployment (Phase 2.7)

- [ ] Merge Phase 2 branch to `main`
- [ ] Create `v2.0.0` release tag
- [ ] Deploy to GitHub Pages
- [ ] Test production build
- [ ] Monitor for errors (analytics, Sentry)
- [ ] Update project badges in README
- [ ] Announce Phase 2 completion to team

---

## Risk Assessment

### High Risk

| Risk                                      | Impact | Mitigation                                                                |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------- |
| Bootstrap CSS conflicts with custom CSS   | High   | Use CSS cascade carefully; namespace custom styles; test thoroughly       |
| JavaScript errors break entire page       | High   | Implement error boundaries; use try-catch; add error logging              |
| Performance degradation (large JS bundle) | High   | Code splitting; lazy loading; performance budget monitoring               |
| Accessibility regressions                 | High   | Automated a11y testing; manual screen reader testing; ARIA best practices |

### Medium Risk

| Risk                                 | Impact | Mitigation                                                                |
| ------------------------------------ | ------ | ------------------------------------------------------------------------- |
| Browser compatibility issues         | Medium | Feature detection; polyfills for legacy browsers; progressive enhancement |
| localStorage quota exceeded          | Medium | Implement quota management; graceful fallback to cookies                  |
| Third-party CDN downtime (Bootstrap) | Medium | Consider self-hosting critical assets; implement fallback CDN             |
| Testing coverage gaps                | Medium | Set coverage thresholds; require tests for PRs; automate testing in CI    |

### Low Risk

| Risk                            | Impact | Mitigation                                                |
| ------------------------------- | ------ | --------------------------------------------------------- |
| TypeScript migration complexity | Low    | Optional for Phase 3; use JSDoc for type hints in Phase 2 |
| Build tool learning curve       | Low    | Keep tooling minimal in Phase 2; add Vite only if needed  |
| Documentation maintenance       | Low    | Update docs alongside code; automate with JSDoc           |

---

## Success Metrics

### User Experience

- ✅ Contact form submission success rate > 95%
- ✅ Average form completion time < 2 minutes
- ✅ Mobile navigation usability score > 4.5/5
- ✅ Job search relevance > 90%
- ✅ Profile completion rate increase by 40%

### Performance

- ✅ Lighthouse Performance score > 90
- ✅ Lighthouse Accessibility score > 95
- ✅ First Contentful Paint (FCP) < 1.5s
- ✅ Largest Contentful Paint (LCP) < 2.0s
- ✅ Cumulative Layout Shift (CLS) < 0.05
- ✅ Total JavaScript bundle < 100KB (gzipped)

### Code Quality

- ✅ ESLint zero errors, < 5 warnings
- ✅ Test coverage > 80% for critical paths
- ✅ Zero console errors in production
- ✅ All Playwright tests passing
- ✅ WCAG 2.1 AA compliance (zero critical issues)

### Development Velocity

- ✅ Feature implementation time reduction by 30%
- ✅ Bug fix time reduction by 25%
- ✅ Code review turnaround < 24 hours
- ✅ CI/CD pipeline success rate > 95%

---

## Recommendations Summary

### Immediate Actions (Week 1)

1. **Update Bootstrap to 5.3.3** across all HTML files
2. **Create JavaScript module structure** as outlined in Architecture section
3. **Set up ESLint + Prettier** for code quality
4. **Implement core utilities** (EventBus, Storage, State)
5. **Update documentation** (README, CODE_AND_DESIGN_GUIDE)

### Short-term (Weeks 2-4)

1. **Implement navigation features** (mobile menu, user dropdown)
2. **Build form validation framework**
3. **Create reusable components** (Modal, Toast, Tooltip)
4. **Add contact form submission** (EmailJS or Formspree)

### Medium-term (Weeks 5-8)

1. **Enhance job board** (filter, search, bookmarks)
2. **Make profile dashboard interactive**
3. **Optimize performance** (lazy loading, code splitting)
4. **Complete testing suite** (unit + integration + a11y)

### Future Considerations (Phase 3+)

1. **TypeScript migration** for better type safety
2. **Build process** (Vite + bundler) for production optimization
3. **Component library** (custom or integrate Headless UI)
4. **Backend integration** (API endpoints, authentication)
5. **Progressive Web App** (service worker, offline support)
6. **Internationalization** (i18n for Japanese + English)
7. **Advanced features** (notifications, messaging, real-time updates)

---

## Conclusion

This Phase 2 implementation plan provides a clear, actionable roadmap to modernize the Japan SSW frontend with **ES2024 JavaScript** and **Bootstrap 5.3.3** while maintaining the solid foundation built in Phase 1.

**Key Principles:**

- ✅ Progressive enhancement (works without JS)
- ✅ Performance first (code splitting, lazy loading)
- ✅ Accessibility always (WCAG 2.1 AA compliance)
- ✅ Mobile-first responsive design
- ✅ Maintainable, modular code architecture
- ✅ Comprehensive testing strategy

**Next Steps:**

1. Review and approve this plan with the team
2. Create Phase 2 project board with all tasks
3. Set up development environment
4. Begin Phase 2.1 implementation (Foundation)

**Questions or Feedback:**

- Open an issue on GitHub
- Discuss in team meetings
- Update this plan as requirements evolve

---

**Document Version:** 1.0.0  
**Author:** Team Kaizen MMDC  
**Last Review:** October 6, 2025  
**Next Review:** Start of Phase 2.1
