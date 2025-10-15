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

        // Build an absolute URL for the href so we can reason about
        // same-origin vs external links. We will defer navigation for
        // same-origin navigations (including hash anchors and internal
        // page paths) so that the offcanvas can finish hiding first.
        // Allow external links (different origin), target=_blank, or
        // downloads to proceed immediately.
        let targetUrl;
        try {
          targetUrl = new URL(href, window.location.href);
        } catch (err) {
          // Malformed URL - don't interfere
          return;
        }

        // Respect explicit target attributes like _blank and download links
        const targetAttr = anchor.getAttribute("target");
        const hasDownload = anchor.hasAttribute("download");
        if (targetAttr === "_blank" || hasDownload) return;

        const isSameOrigin = targetUrl.origin === window.location.origin;
        // Defer navigation only for same-origin navigations (including hashes)
        if (!isSameOrigin) return; // external link - allow default

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

        // Guard against duplicate navigation for the same click target.
        // We'll create a unique token on the anchor so subsequent clicks
        // or re-entrancy won't trigger the same navigation twice.
        if (anchor._deferredNavFired) {
          console.debug(
            "Offcanvas: deferred nav already fired for this anchor",
            href
          );
          return;
        }
        anchor._deferredNavFired = true;

        const doNavigate = () => {
          console.debug(
            "Offcanvas: performing deferred navigation to",
            targetUrl.href
          );
          // If navigation is a hash-only change on the same page, use pushState
          if (
            targetUrl.hash &&
            targetUrl.pathname === window.location.pathname
          ) {
            if (history.pushState)
              history.pushState(null, null, targetUrl.hash);
            else window.location.hash = targetUrl.hash;
          } else {
            // Navigate to the internal page URL
            window.location.href = targetUrl.href;
          }
        };

        // Use the once option to ensure the handler runs only once.
        const onHidden = () => doNavigate();
        offcanvasEl.addEventListener("hidden.bs.offcanvas", onHidden, {
          once: true,
        });

        // Ensure the offcanvas is hidden. Calling hide() explicitly is
        // necessary because we've prevented the default click action which
        // would normally trigger Bootstrap's dismissal when
        // data-bs-dismiss is present.
        try {
          const existing = bootstrap?.Offcanvas?.getInstance?.(offcanvasEl);
          const bsOff = existing || new bootstrap.Offcanvas(offcanvasEl);
          // Only call hide if it's currently shown to avoid re-entrant
          // behavior that could confuse the hidden event ordering.
          if (offcanvasEl.classList.contains("show")) bsOff.hide();
          else {
            // If it's not shown for some reason, trigger the deferred navigation now
            doNavigate();
          }
        } catch (err) {
          console.warn(
            "Offcanvas: error while trying to hide offcanvas, triggering navigation fallback",
            err
          );
          // Fallback: remove show and dispatch hidden event synchronously
          offcanvasEl.classList.remove("show");
          const ev = new Event("hidden.bs.offcanvas");
          offcanvasEl.dispatchEvent(ev);
        }
      });
    }

    // Log successful initialization
    console.log("✅ All features initialized successfully");
  }

  ensureLanguageToggle() {
    // Add an accessible language switch (form-switch) to header actions
    // If a page doesn't include the `.site-header__actions` container (some
    // legacy pages omitted it), create one so the language toggle can be
    // appended. This makes the toggle resilient across pages that load the
    // `assets/js/main.js` module.
    let headerActions = document.querySelector(".site-header__actions");
    if (!headerActions) {
      const header = document.querySelector(".site-header");
      if (header) {
        // Create a minimal actions container matching the header contract
        headerActions = document.createElement("div");
        headerActions.className =
          "d-flex align-items-center gap-2 site-header__actions";

        // Prefer appending into the navbar if present so layout is consistent
        const navbar = header.querySelector(".navbar") || header;
        navbar.appendChild(headerActions);
        console.log(
          "ℹ️ Created missing .site-header__actions container for language toggle"
        );
      } else {
        // No header found; nothing we can do
        return;
      }
    }

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

// This script handles client-side validation and the simulation of a form submission.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successMessage = document.getElementById("successMessage");

  /**
   * Performs client-side validation using Bootstrap's built-in validation feedback.
   * Note: We rely on the 'form-control' class in the HTML being present.
   * @param {HTMLFormElement} formElement - The form to validate.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  function validateForm(formElement) {
    let isValid = true;

    // Clear all previous validation states
    formElement
      .querySelectorAll(".form-control, .form-select")
      .forEach((input) => {
        input.classList.remove("is-invalid");
        input.classList.remove("is-valid");
      });

    // Iterate through all required fields
    formElement.querySelectorAll("[required]").forEach((input) => {
      const value = input.value.trim();
      let fieldValid = true;

      if (!value) {
        fieldValid = false;
      } else if (
        input.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        // Basic email format validation
        fieldValid = false;
      }

      if (!fieldValid) {
        input.classList.add("is-invalid");
        isValid = false;
      } else {
        input.classList.add("is-valid");
      }
    });

    return isValid;
  }

  // Event listener for form submission
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop default form submission
    event.stopPropagation();

    if (validateForm(this)) {
      // Form is valid: Simulate successful submission

      // 1. Hide the form
      form.style.display = "none";

      // 2. Show the success message (with a nice fade effect)
      successMessage.style.opacity = "0";
      successMessage.style.display = "block";

      setTimeout(() => {
        successMessage.style.opacity = "1";
      }, 10); // Small delay to trigger transition

      console.log("Form submitted successfully (simulated)!");
    } else {
      // Form is invalid: Display error messages
      console.log(
        "Validation failed. Please fill out all required fields correctly."
      );
    }
  });

  // Add real-time validation feedback on input change (optional but good UX)
  form.querySelectorAll(".form-control, .form-select").forEach((input) => {
    input.addEventListener("blur", (e) => {
      const target = e.target;

      target.classList.remove("is-invalid");
      target.classList.remove("is-valid");

      if (target.value.trim()) {
        if (
          !target.checkValidity() ||
          (target.type === "email" &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target.value))
        ) {
          target.classList.add("is-invalid");
        } else {
          target.classList.add("is-valid");
        }
      }
    });
  });
});


//userMenu dropdown
document.addEventListener('DOMContentLoaded', () => {
            const userMenuBtn = document.getElementById('user-menu-btn');
            const userMenuDropdown = document.getElementById('user-menu-dropdown');

            // Function to toggle the menu's visibility
            function toggleMenu() {
                userMenuDropdown.classList.toggle('is-active');
            }

            // Event listener to open/close the menu when the button is clicked
            userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevents the link from navigating
                e.stopPropagation(); // Prevents the click from bubbling up to the document
                toggleMenu();
            });

            // Event listener to close the menu when clicking anywhere else on the page
            document.addEventListener('click', (e) => {
                if (!userMenuDropdown.contains(e.target) && e.target !== userMenuBtn) {
                    userMenuDropdown.classList.remove('is-active');
                }
            });
        });


        //Application Tracker Profile Dashboard

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Global Variables (injected by environment) ---
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig =
  typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};
const initialAuthToken =
  typeof __initial_auth_token !== "undefined" ? __initial_auth_token : null;

// --- DOM Ready Handler ---
document.addEventListener("DOMContentLoaded", async () => {
  const authStatusEl = document.getElementById("auth-status");
  const userInfoEl = document.getElementById("user-info");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Monitor Auth State
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        authStatusEl.textContent = `User ID: ${user.uid}`;
        authStatusEl.classList.replace("text-muted", "text-success");
        userInfoEl.textContent = "Authenticated successfully.";
      } else {
        // Try custom token sign-in first, fallback to anonymous
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            authStatusEl.textContent = `User ID: ${auth.currentUser.uid} (Custom)`;
          } else {
            await signInAnonymously(auth);
            authStatusEl.textContent = `User ID: ${auth.currentUser.uid} (Anonymous)`;
          }
          authStatusEl.classList.replace("text-muted", "text-success");
        } catch (error) {
          console.error("Authentication error:", error);
          authStatusEl.textContent = "Authentication failed.";
          authStatusEl.classList.add("text-danger");
        }
      }
    });

    // Optional UI adjustment after header loads
    document.querySelector("main").style.paddingTop = "60px";
  } catch (err) {
    console.error("Firebase initialization failed:", err);
    authStatusEl.textContent = "Firebase init error.";
    authStatusEl.classList.add("text-danger");
  }
});