# Phase 2 Quick Start Guide

**Quick reference for implementing Phase 2 improvements**  
**Full details:** See [PHASE_2_IMPLEMENTATION_PLAN.md](./PHASE_2_IMPLEMENTATION_PLAN.md)

---

## What is Phase 2?

Transform the static HTML/CSS site into an interactive web application using:

- **Modern JavaScript (ES2024)** - Native ES modules, async/await, latest features
- **Bootstrap 5.3.3** - Latest stable version with enhanced utilities
- **No Backend** - All features are client-side (localStorage, EmailJS for forms)

---

## Week-by-Week Overview

| Week | Phase | Focus      | Key Deliverables                                |
| ---- | ----- | ---------- | ----------------------------------------------- |
| 1-2  | 2.1   | Foundation | Bootstrap enabled, JS structure, linting setup  |
| 3    | 2.2   | Navigation | Mobile menu, user dropdown, tooltips, toasts    |
| 4-5  | 2.3   | Forms      | Validation framework, contact form, autosave    |
| 6    | 2.4   | Jobs       | Filter/search, modals, bookmarks                |
| 7    | 2.5   | Profile    | Interactive dashboard, edit forms, progress     |
| 8    | 2.6   | Polish     | Performance optimization, lazy loading, testing |

---

## Technology Stack

### JavaScript (ES2024)

```javascript
// Use modern features - no transpilation needed
import { FormValidator } from "./features/forms/FormValidator.js";

export class ContactForm {
  #validator; // Private fields (ES2022)

  constructor(formElement) {
    this.#validator = new FormValidator();
    this.init();
  }

  async handleSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));

    // Optional chaining & nullish coalescing (ES2020)
    const isValid = this.#validator.validate(data) ?? false;

    if (isValid) {
      await this.submit(data);
    }
  }
}
```

### Bootstrap 5.3.3

**Update from:** 5.3.2 → **5.3.3**

```html
<!-- Current (commented) -->
<!-- 
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" ...>
-->

<!-- Update to (uncommented) -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
  crossorigin="anonymous"
/>
<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
  crossorigin="anonymous"
  defer
></script>
```

---

## Project Structure

```
assets/js/
├── main.js                          # Entry point
├── config/
│   ├── constants.js                 # App constants
│   └── routes.js                    # Page routing
├── core/
│   ├── EventBus.js                  # Pub/Sub events
│   ├── Storage.js                   # localStorage wrapper
│   └── State.js                     # Simple state management
├── components/
│   ├── Modal.js                     # Bootstrap modal wrapper
│   ├── Toast.js                     # Toast notifications
│   ├── Tooltip.js                   # Tooltip controller
│   └── Dropdown.js                  # Dropdown menus
├── features/
│   ├── navigation/
│   │   ├── MobileNav.js            # Mobile menu
│   │   └── UserMenu.js             # User dropdown
│   ├── forms/
│   │   ├── FormValidator.js        # Validation
│   │   ├── ContactForm.js          # Contact form
│   │   └── ProfileForm.js          # Profile forms
│   ├── jobs/
│   │   ├── JobFilter.js            # Job filtering
│   │   ├── JobCard.js              # Job interactions
│   │   └── JobModal.js             # Job details
│   └── profile/
│       ├── ProfileDashboard.js     # Dashboard
│       └── TooltipController.js    # Tooltip (refactored)
└── utils/
    ├── dom.js                       # DOM helpers
    ├── validators.js                # Validation rules
    └── debounce.js                  # Performance utils
```

---

## Priority Features

### Must Have (Phase 2)

- ✅ Form Validation (high impact)
- ✅ Contact Form Submit (high impact)
- ✅ Mobile Navigation (high impact)
- ✅ User Menu Dropdown (high impact)
- ✅ Job Filter/Search (high impact)
- ✅ Profile Interactive Forms (high impact)
- ✅ Tooltips (medium impact)
- ✅ Toast Notifications (medium impact)
- ✅ localStorage Persistence (medium impact)

### Nice to Have (Phase 3)

- Dark mode toggle
- Service worker (offline support)
- Client-side routing
- **Language Translation (EN ↔ JP)** - Free, client-side translation using localStorage
- Advanced analytics

---

## Bootstrap Components Usage

### Use These

| Component    | Priority | Use Case                  |
| ------------ | -------- | ------------------------- |
| **Grid**     | High     | Responsive layout         |
| **Forms**    | High     | Validation, styling       |
| **Modal**    | High     | Job details, profile edit |
| **Dropdown** | Medium   | User menu, filters        |
| **Tooltips** | Medium   | Help text                 |
| **Spinners** | High     | Loading states            |
| **Alerts**   | Medium   | User feedback             |
| **Buttons**  | Medium   | Enhance existing buttons  |

### Avoid These

- ❌ Carousel (use Intersection Observer instead)
- ❌ Accordion (simple CSS alternative)
- ❌ Tabs (semantic HTML + Grid)
- ❌ Navbar (custom header is fine)

---

## Development Workflow

### 1. Setup (First Time)

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install

# Setup ESLint + Prettier
npm install --save-dev eslint@^9.9.0 prettier@^3.3.3

# Start dev server
npm run server
# or
python3 -m http.server 8000
```

### 2. Development

```bash
# Run linting
npx eslint assets/js/**/*.js

# Format code
npx prettier --write assets/js/**/*.js

# Run tests (with server)
npm run test:playwright:with-server

# Run tests (manual)
npm run server  # Terminal 1
npm run test:playwright  # Terminal 2
```

### 3. Testing Checklist

- [ ] Lighthouse score > 90 (performance, accessibility)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader compatible (NVDA/VoiceOver)
- [ ] Mobile responsive (320px - 1920px)
- [ ] No console errors
- [ ] Forms validate correctly
- [ ] All Playwright tests pass

---

## Code Examples

### Form Validation

```javascript
// features/forms/FormValidator.js
export class FormValidator {
  validate(data) {
    const errors = {};

    // Required fields
    if (!data.name?.trim()) {
      errors.name = "Name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = "Invalid email address";
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
}

// Usage
import { FormValidator } from "./FormValidator.js";

const validator = new FormValidator();
const formData = { name: "Juan", email: "juan@example.com" };
const errors = validator.validate(formData);

if (errors) {
  console.error("Validation errors:", errors);
}
```

### Toast Notifications

```javascript
// components/Toast.js
export class Toast {
  static show(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type}`;
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2" data-bs-dismiss="toast"></button>
      </div>
    `;

    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  }
}

// Usage
import { Toast } from "./components/Toast.js";

Toast.show("Form submitted successfully!", "success");
Toast.show("Please fix validation errors", "danger");
```

### localStorage Wrapper

```javascript
// core/Storage.js
export class Storage {
  static PREFIX = "japanssw_";

  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage error:", error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage error:", error);
      return false;
    }
  }
}

// Usage
import { Storage } from "./core/Storage.js";

Storage.set("profile", { name: "Juan", location: "Tokyo" });
const profile = Storage.get("profile", {});
```

### Language Translation (Free - EN ↔ JP)

```javascript
// core/i18n.js
export class I18n {
  static STORAGE_KEY = "preferred_language";
  static DEFAULT_LANG = "en";

  static translations = {
    en: {
      "nav.home": "Home",
      "nav.about": "About Us",
      "nav.services": "Services",
      "nav.jobs": "Jobs",
      "nav.contact": "Contact",
      "btn.apply": "Apply Now",
      "btn.learn_more": "Learn More",
      "footer.copyright": "© 2025 Japan SSW. All rights reserved.",
    },
    ja: {
      "nav.home": "ホーム",
      "nav.about": "私たちについて",
      "nav.services": "サービス",
      "nav.jobs": "求人",
      "nav.contact": "お問い合わせ",
      "btn.apply": "今すぐ応募",
      "btn.learn_more": "詳細を見る",
      "footer.copyright": "© 2025 Japan SSW. 全著作権所有。",
    },
  };

  static getCurrentLanguage() {
    return Storage.get(this.STORAGE_KEY, this.DEFAULT_LANG);
  }

  static setLanguage(lang) {
    Storage.set(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    this.updatePageContent();
  }

  static translate(key) {
    const lang = this.getCurrentLanguage();
    return this.translations[lang]?.[key] || key;
  }

  static updatePageContent() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.translate(key);
    });

    // Update placeholder attributes
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = this.translate(key);
    });
  }
}

// Usage in HTML
// <a href="/" data-i18n="nav.home">Home</a>
// <button data-i18n="btn.apply">Apply Now</button>

// Language toggle button
import { I18n } from "./core/i18n.js";

const toggleBtn = document.getElementById("lang-toggle");
toggleBtn.addEventListener("click", () => {
  const current = I18n.getCurrentLanguage();
  const newLang = current === "en" ? "ja" : "en";
  I18n.setLanguage(newLang);
  toggleBtn.textContent = newLang === "en" ? "日本語" : "English";
});
```

---

## Performance Targets

| Metric                   | Target  | Maximum |
| ------------------------ | ------- | ------- |
| First Contentful Paint   | < 1.5s  | 2.0s    |
| Largest Contentful Paint | < 2.0s  | 2.5s    |
| First Input Delay        | < 50ms  | 100ms   |
| Cumulative Layout Shift  | < 0.05  | 0.1     |
| JavaScript Bundle        | < 50KB  | 100KB   |
| Total Page Weight        | < 500KB | 1MB     |

---

## Accessibility Requirements

- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation (all features)
- ✅ Screen reader support (NVDA, VoiceOver)
- ✅ Focus visible on all interactive elements
- ✅ ARIA labels where needed
- ✅ Color contrast ratio > 4.5:1
- ✅ Reduced motion support

---

## Common Tasks

### Add a New Feature Module

```javascript
// 1. Create module file
// features/newfeature/NewFeature.js
export class NewFeature {
  constructor() {
    this.init();
  }

  init() {
    // Initialize feature
  }
}

// 2. Import in main.js
import { NewFeature } from "./features/newfeature/NewFeature.js";

// 3. Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  new NewFeature();
});
```

### Add a Bootstrap Component

```javascript
// 1. Add HTML markup
<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">
  Open Modal
</button>

<div class="modal fade" id="myModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <!-- Modal content -->
    </div>
  </div>
</div>

// 2. Initialize in JavaScript (optional)
import { Modal } from './components/Modal.js';

const modal = new Modal('myModal');
modal.show();
```

### Add Form Validation

```javascript
// 1. Add validation attributes to HTML
<input
  type="email"
  id="email"
  required
  aria-describedby="email-error"
>
<div id="email-error" class="invalid-feedback"></div>

// 2. Validate on submit
import { FormValidator } from './features/forms/FormValidator.js';

const form = document.querySelector('form');
const validator = new FormValidator();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  const errors = validator.validate(data);
  if (errors) {
    // Show errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`#${field}`);
      input.classList.add('is-invalid');
      input.nextElementSibling.textContent = message;
    });
  } else {
    // Submit form
    console.log('Valid!', data);
  }
});
```

### Add Language Translation Toggle

```html
<!-- 1. Add language toggle button to header -->
<button
  id="lang-toggle"
  class="btn btn-sm btn-outline-secondary"
  aria-label="Switch language"
>
  日本語
</button>

<!-- 2. Add data-i18n attributes to translatable elements -->
<nav>
  <a href="/" data-i18n="nav.home">Home</a>
  <a href="/about" data-i18n="nav.about">About Us</a>
  <a href="/services" data-i18n="nav.services">Services</a>
</nav>
```

```javascript
// 3. Initialize i18n on page load
import { I18n } from "./core/i18n.js";

document.addEventListener("DOMContentLoaded", () => {
  // Set initial language from storage
  const lang = I18n.getCurrentLanguage();
  document.documentElement.lang = lang;
  I18n.updatePageContent();

  // Update toggle button text
  const toggleBtn = document.getElementById("lang-toggle");
  toggleBtn.textContent = lang === "en" ? "日本語" : "English";

  // Handle toggle clicks
  toggleBtn.addEventListener("click", () => {
    const current = I18n.getCurrentLanguage();
    const newLang = current === "en" ? "ja" : "en";
    I18n.setLanguage(newLang);
    toggleBtn.textContent = newLang === "en" ? "日本語" : "English";
  });
});
```

---

## Migration Steps

### Step 1: Update Bootstrap (All HTML files)

```bash
# Find and replace in all HTML files:
# OLD: bootstrap@5.3.2
# NEW: bootstrap@5.3.3

# Update integrity hashes:
# CSS: sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH
# JS:  sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz
```

### Step 2: Uncomment Bootstrap Links

```html
<!-- BEFORE (commented) -->
<!-- 
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" ...>
-->

<!-- AFTER (uncommented and updated) -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
  crossorigin="anonymous"
/>
```

### Step 3: Create JavaScript Structure

```bash
# Create directories
mkdir -p assets/js/{config,core,components,features,utils}
mkdir -p assets/js/features/{navigation,forms,jobs,profile}

# Create main.js
touch assets/js/main.js
```

### Step 4: Add Script Tag to HTML

```html
<!-- Add before </body> -->
<script type="module" src="/assets/js/main.js"></script>
```

### Step 5: Test Everything

```bash
# Run Playwright tests
npm run test:playwright:with-server

# Check browser console for errors
# Open http://localhost:3000 and check DevTools
```

---

## Troubleshooting

### Bootstrap Not Loading

- ✅ Check CDN links are uncommented
- ✅ Verify integrity hashes match
- ✅ Check browser console for CORS errors
- ✅ Ensure `defer` attribute is present on script tag

### JavaScript Module Errors

- ✅ Use `type="module"` on script tag
- ✅ Use `.js` extension in import paths
- ✅ Use absolute or relative paths (not bare specifiers)
- ✅ Check browser console for syntax errors

### localStorage Not Working

- ✅ Check browser privacy settings
- ✅ Verify not in incognito/private mode
- ✅ Check quota limits (usually 5-10MB)
- ✅ Wrap in try-catch for error handling

### Performance Issues

- ✅ Use code splitting (dynamic imports)
- ✅ Lazy load images (Intersection Observer)
- ✅ Debounce expensive operations
- ✅ Check Lighthouse for bottlenecks

---

## Resources

- **Full Implementation Plan:** [PHASE_2_IMPLEMENTATION_PLAN.md](./PHASE_2_IMPLEMENTATION_PLAN.md)
- **Bootstrap Docs:** https://getbootstrap.com/docs/5.3/
- **MDN JavaScript:** https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **Web.dev Performance:** https://web.dev/vitals/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Next Steps

1. ✅ Review this guide and the full implementation plan
2. ✅ Set up development environment
3. ✅ Create Phase 2 branch: `feature/phase2-bootstrap-js`
4. ✅ Start with Phase 2.1 (Foundation)
5. ✅ Follow the 8-week roadmap

**Questions?** Open an issue or discuss in team meetings.

---

**Last Updated:** October 6, 2025  
**Version:** 1.0.0  
**Team:** Kaizen MMDC
