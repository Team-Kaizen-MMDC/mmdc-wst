/**
 * main.js - Application Entry Point
 * Phase 2: Bootstrap 5.3.3 + Modern JavaScript (ES2024)
 *
 * Initializes all features and components based on the current page.
 */

import { MobileNav } from "./features/navigation/MobileNav.js";
import { SmoothScroll } from "./features/navigation/SmoothScroll.js";
import I18n from "./i18n.js";

/**
 * Initialize application
 */
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initFeatures());
    } else {
      this.initFeatures();
    }
  }

  initFeatures() {
    console.log("🚀 Japan SSW Phase 2 - Initializing...");

    // Initialize i18n loader and language toggle
    this.i18n = new I18n();
    this.i18n.init();
    this.ensureLanguageToggle();

    // Initialize mobile navigation
    new MobileNav();

    // Initialize smooth scrolling for anchor links
    new SmoothScroll();

    // Accessibility: return focus to toggler after offcanvas closes (if present)
    const offcanvasEl = document.getElementById("siteOffcanvas");
    if (offcanvasEl) {
      const toggler = document.querySelector(
        '[data-bs-toggle="offcanvas"][data-bs-target="#siteOffcanvas"]'
      );
      offcanvasEl.addEventListener("hidden.bs.offcanvas", () => {
        if (toggler) toggler.focus();
      });
      // Ensure links inside the offcanvas navigate after it finishes hiding.
      // This prevents Bootstrap's offcanvas backdrop/overflow from blocking
      // normal navigation (especially when using history or smooth scroll).
      offcanvasEl.addEventListener("click", (e) => {
        const anchor = e.target.closest && e.target.closest("a");
        if (!anchor) return;

        const href = anchor.getAttribute("href");
        if (!href || href.trim() === "") return;

        // Only defer navigation when it's an in-page anchor or the element
        // is intended to dismiss the offcanvas. Otherwise, let the browser
        // handle navigation immediately (avoid unnecessary preventDefault).
        const shouldDefer =
          href.startsWith("#") || anchor.hasAttribute("data-bs-dismiss");
        if (!shouldDefer) return; // allow default navigation

        // If offcanvas isn't actually visible, just navigate immediately.
        if (!offcanvasEl.classList.contains("show")) {
          if (href.startsWith("#")) {
            if (history.pushState) history.pushState(null, null, href);
            else window.location.hash = href;
          } else {
            window.location.href = href;
          }
          return;
        }

        // Prevent default navigation; navigate after offcanvas hides.
        e.preventDefault();

        const doNavigate = () => {
          if (href.startsWith("#")) {
            if (history.pushState) history.pushState(null, null, href);
            else window.location.hash = href;
          } else {
            window.location.href = href;
          }
        };

        const onHidden = () => {
          doNavigate();
          offcanvasEl.removeEventListener("hidden.bs.offcanvas", onHidden);
        };

        offcanvasEl.addEventListener("hidden.bs.offcanvas", onHidden);
        // If the link does not have data-bs-dismiss, trigger hide now.
        if (!anchor.hasAttribute("data-bs-dismiss")) {
          const bsOff = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (bsOff) bsOff.hide();
        }
      });
    }

    // Log successful initialization
    console.log("✅ All features initialized successfully");
  }

  ensureLanguageToggle() {
    // Add an accessible language switch (form-switch) to header actions
    const headerActions = document.querySelector(".site-header__actions");
    if (!headerActions) return;

    if (document.getElementById("lang-toggle")) return; // already present

    const createSwitch = (idSuffix = "") => {
      const wrapper = document.createElement("div");
      wrapper.className =
        "form-check form-switch m-0 d-flex align-items-center gap-2";

      const input = document.createElement("input");
      input.className = "form-check-input";
      input.type = "checkbox";
      input.id = `lang-toggle${idSuffix}`;
      input.setAttribute("role", "switch");

      const label = document.createElement("label");
      label.className = "form-check-label mb-0";
      label.setAttribute("for", `lang-toggle${idSuffix}`);
      label.id = `lang-toggle-label${idSuffix}`;

      wrapper.appendChild(input);
      wrapper.appendChild(label);

      return { wrapper, input, label };
    };

    const { wrapper, input, label } = createSwitch();

    // Label shows the currently selected language.
    const setLabel = (lang) => {
      label.textContent = lang === "en" ? "English" : "日本語";
      input.setAttribute("aria-checked", String(lang !== "en"));
      input.checked = lang !== "en";
    };

    // Initialize state
    const current = this.i18n.getCurrentLanguage();
    setLabel(current);

    input.addEventListener("change", async () => {
      const newLang = input.checked ? "ja" : "en";
      if (newLang !== "en") {
        await this.i18n.loadLocale(newLang);
      }
      this.i18n.setLanguage(newLang);
      setLabel(newLang);
    });

    // Place the switch at the far right of the header actions.
    // Use Bootstrap spacing utilities to push it to the end on large screens.
    wrapper.classList.add("ms-3", "ms-lg-auto");

    // If there's a flex container that contains actions, append the switch
    // there so it visually sits at the far end. This ensures it's the last
    // element on the header row and aligned to the right on wide screens.
    const actionsContainer = headerActions.closest(".navbar") || headerActions;
    // Prefer appending to the actions container itself to guarantee right-most
    // placement. If that fails, fallback to the original insertion next to
    // the login button.
    try {
      actionsContainer
        .querySelector(".site-header__actions")
        ?.appendChild(wrapper);
    } catch (err) {
      const loginBtn = headerActions.querySelector(".site-header__login-btn");
      if (loginBtn) loginBtn.insertAdjacentElement("afterend", wrapper);
      else headerActions.appendChild(wrapper);
    }

    // Also add a copy of the switch to the mobile offcanvas actions if present
    const offcanvas = document.getElementById("siteOffcanvas");
    if (offcanvas) {
      // place inside the bottom action row if present
      const bottomRow =
        offcanvas.querySelector(".mt-auto.d-flex") ||
        offcanvas.querySelector(".offcanvas-body");
      if (bottomRow) {
        // create a separate switch element for offcanvas (do not reuse nodes)
        const {
          wrapper: wrapper2,
          input: input2,
          label: label2,
        } = createSwitch("-off");
        // Sync initial state
        const currentLang = this.i18n.getCurrentLanguage();
        setLabel(currentLang);
        input2.checked = input.checked;
        label2.textContent = label.textContent;
        input2.addEventListener("change", async () => {
          const newLang = input2.checked ? "ja" : "en";
          if (newLang !== "en") {
            await this.i18n.loadLocale(newLang);
          }
          this.i18n.setLanguage(newLang);
          // keep header switch in sync (label shows current language)
          const headerInput = document.getElementById("lang-toggle");
          const headerLabel = document.getElementById("lang-toggle-label");
          if (headerInput) {
            headerInput.checked = input2.checked;
            headerInput.setAttribute("aria-checked", String(input2.checked));
          }
          if (headerLabel)
            headerLabel.textContent = newLang === "en" ? "English" : "日本語";
        });

        // Insert before Login in offcanvas bottom row if buttons exist
        const offLogin = bottomRow.querySelector(".btn-danger");
        if (offLogin) offLogin.insertAdjacentElement("afterend", wrapper2);
        else bottomRow.appendChild(wrapper2);
      }
    }
  }
}

// Start the application
new App();
