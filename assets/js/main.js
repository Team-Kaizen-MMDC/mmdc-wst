/**
 * main.js - Application Entry Point
 * Phase 2: Bootstrap 5.3.3 + Modern JavaScript (ES2024)
 *
 * Initializes all features and components based on the current page.
 */

import { MobileNav } from "./features/navigation/MobileNav.js";
import { SmoothScroll } from "./features/navigation/SmoothScroll.js";
import I18n from "./i18n.js";
import { initHeaderAuth } from "./modules/headerAuth.js";

/* Ensure Bootstrap Icons CSS is loaded globally (MK) */
(function ensureBootstrapIcons() {
  if (!document.querySelector('link[href*="bootstrap-icons"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css";
    document.head.appendChild(link);
  }
})();

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
    // Initialize header authentication state
    initHeaderAuth();

    // Initialize i18n loader and language toggle
    this.i18n = new I18n();
    this.i18n.init();
    this.ensureLanguageToggle();

    // Initialize mobile navigation
    new MobileNav();

    // Initialize smooth scrolling for anchor links
    new SmoothScroll();

    // Initialize dashboard tab styling (ADD THIS)
    this.initDashboardTabs();
    

    // Accessibility: return focus to toggler after offcanvas closes (if present)
    const offcanvasEl = document.getElementById("siteOffcanvas");
    if (offcanvasEl) {
      const toggler = document.querySelector(
        '[data-bs-toggle="offcanvas"][data-bs-target="#siteOffcanvas"]',
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
          return;
        }
        anchor._deferredNavFired = true;

        const doNavigate = () => {
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
            err,
          );
          // Fallback: remove show and dispatch hidden event synchronously
          offcanvasEl.classList.remove("show");
          const ev = new Event("hidden.bs.offcanvas");
          offcanvasEl.dispatchEvent(ev);
        }
      });
    }

    // Log successful initialization
  }

  //Nav Tab color link Active
  initDashboardTabs() {
    const tabButtons = document.querySelectorAll(
      '#dashboardTabs button[data-bs-toggle="tab"]',
    );

    if (tabButtons.length === 0) {
      // Not on a dashboard page, skip
      return;
    }

    tabButtons.forEach((button) => {
      button.addEventListener("shown.bs.tab", function () {
        tabButtons.forEach((btn) => {
          btn.classList.remove("text-danger", "fw-bold");
          btn.classList.add("text-secondary");
        });

        this.classList.remove("text-secondary");
        this.classList.add("text-danger", "fw-bold");
      });
    });
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

  // Only run contact form validation if we're on the contact page
  if (!form || !successMessage) {
    return;
  }

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
    } else {
      // Form is invalid: Display error messages
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

// --- Profile Summary Inline Edit Logic ---
function initializeApp() {
  // --- DOM Element References ---
  const readDisplay = document.getElementById("read-display");
  const textContent = document.getElementById("text-content");
  const editInput = document.getElementById("edit-input"); // This is the textarea element
  const charCount = document.getElementById("char-count");
  const editBtn = document.getElementById("edit-btn");
  const saveBtn = document.getElementById("save-btn");

  // Ensure all required elements exist before proceeding
  if (
    !readDisplay ||
    !textContent ||
    !editInput ||
    !charCount ||
    !editBtn ||
    !saveBtn
  ) {
    console.error(
      "One or more required profile dashboard elements are missing. Aborting initialization.",
    );
    return;
  }

  // Get max length property
  const maxLength = editInput.getAttribute("maxlength");

  /**
   * Updates the character count display.
   */
  const updateCount = () => {
    const currentLength = editInput.value.length;
    charCount.textContent = `${currentLength} / ${maxLength} characters`;
  };

  // Attach listener and perform initial count update
  editInput.addEventListener("input", updateCount);
  updateCount();

  /**
   * Toggles the editor between read mode and edit mode.
   * This function is attached to the window object so it can be called
   * directly from the HTML 'onclick' attributes.
   * @param {boolean} isEditing - True to enter edit mode, false to enter read mode (save).
   */
  window.toggleEditMode = function (isEditing) {
    if (isEditing) {
      // --- SWITCH TO EDIT MODE ---

      // 1. Transfer current text from read-only display to the textarea input
      editInput.value = textContent.textContent.trim();

      // 2. Toggle Visibility (Hide read, Show edit & character count)
      readDisplay.classList.add("d-none");
      editInput.classList.remove("d-none");
      charCount.classList.remove("d-none");

      // Re-update the count to reflect the text we just loaded into the input
      updateCount();

      // 3. Toggle Buttons (Hide edit button, Show save button)
      editBtn.classList.add("d-none");
      saveBtn.classList.remove("d-none");

      // 4. Focus on the textarea and move the cursor to the end
      editInput.focus();
      editInput.setSelectionRange(
        editInput.value.length,
        editInput.value.length,
      );
    } else {
      // --- SWITCH TO READ/SAVE MODE ---

      // 1. Get the new content from the textarea
      const newContent = editInput.value.trim();

      // 2. Update the read-only display with the new content
      textContent.textContent = newContent;

      // 3. Toggle Visibility (Show read, Hide edit & character count)
      editInput.classList.add("d-none");
      readDisplay.classList.remove("d-none");
      charCount.classList.add("d-none");

      // 4. Toggle Buttons (Show edit button, Hide save button)
      saveBtn.classList.add("d-none");
      editBtn.classList.remove("d-none");

      // NOTE: Add your Firestore update logic here in a real app.
    }
  };
}

// Listen for the DOMContentLoaded event to safely run the initialization function
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("read-display")) {
    initializeApp();
  }
});

//userMenu dropdown
document.addEventListener("DOMContentLoaded", () => {
  const userMenuBtn = document.getElementById("user-menu-btn");
  const userMenuDropdown = document.getElementById("user-menu-dropdown");

  // Only run if elements exist (company dashboard page)
  if (!userMenuBtn || !userMenuDropdown) {
    return;
  }

  // Apply cached profile for instant header update (if available)
  try {
    const cached = localStorage.getItem("userProfile");
    if (cached) {
      const lp = JSON.parse(cached);
      const first = lp.firstName || "";
      const last = lp.lastName || "";
      const display =
        first || last
          ? `${first} ${last}`.trim()
          : lp.email || userMenuBtn.textContent;
      const nameEl = userMenuDropdown.querySelector(
        ".user-menu-dropdown__userName",
      );
      const greetEl = userMenuDropdown.querySelector(
        ".user-menu-dropdown__greeting",
      );
      if (userMenuBtn && first) userMenuBtn.textContent = first;
      if (nameEl) nameEl.textContent = display;
      if (greetEl) greetEl.textContent = `Welcome back, ${first || "User"}!`;
    }
  } catch (e) {
    // non-fatal
  }

  // Function to toggle the menu's visibility
  function toggleMenu() {
    userMenuDropdown.classList.toggle("is-active");
  }

  // Event listener to open/close the menu when the button is clicked
  userMenuBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevents the link from navigating
    e.stopPropagation(); // Prevents the click from bubbling up to the document
    toggleMenu();
  });

  // Event listener to close the menu when clicking anywhere else on the page
  document.addEventListener("click", (e) => {
    // Check if the dropdown or button exists before checking contains/target
    if (
      userMenuDropdown &&
      userMenuBtn &&
      !userMenuDropdown.contains(e.target) &&
      e.target !== userMenuBtn
    ) {
      userMenuDropdown.classList.remove("is-active");
    }
  });
});

// Inject and handle Dark/Light Mode Toggle (Desktop + Mobile)
// Author: MK
document.addEventListener("DOMContentLoaded", function () {
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-bs-theme", savedTheme);

  const updateTheme = (isDark) => {
    const newTheme = isDark ? "dark" : "light";
    html.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Sync both toggles
    const headerIcon = document.querySelector("#theme-toggle-label i");
    const offIcon = document.querySelector("#theme-toggle-label-off i");
    if (headerIcon) headerIcon.className = isDark ? "bi bi-moon" : "bi bi-sun";
    if (offIcon) offIcon.className = isDark ? "bi bi-moon" : "bi bi-sun";

    const headerInput = document.getElementById("theme-toggle");
    const offInput = document.getElementById("theme-toggle-off");
    if (headerInput) headerInput.checked = isDark;
    if (offInput) offInput.checked = isDark;

    // Update navbar classes for consistent theme contrast
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.classList.toggle("navbar-dark", isDark);
      navbar.classList.toggle("navbar-light", !isDark);
    }
  };

  const createToggle = (idSuffix = "") => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "form-check form-switch m-0 d-flex align-items-center gap-2 theme-toggle-switch";
    wrapper.style.marginLeft = "0.75rem";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "form-check-input";
    input.id = `theme-toggle${idSuffix}`;
    input.checked = savedTheme === "dark";

    const label = document.createElement("label");
    label.className = "form-check-label mb-0";
    label.setAttribute("for", `theme-toggle${idSuffix}`);
    label.id = `theme-toggle-label${idSuffix}`;
    label.innerHTML = `<i class="bi ${
      savedTheme === "dark" ? "bi-moon" : "bi-sun"
    }"></i>`;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return { wrapper, input };
  };

  // ----- Show toggle only if logged in -----
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    return; // exit early, skip toggle injection entirely
  }

  // ----- Desktop toggle -----
  const headerActions = document.querySelector(".site-header__actions");
  if (headerActions && !document.getElementById("theme-toggle")) {
    const { wrapper, input } = createToggle();
    const langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
      langToggle
        .closest(".form-check")
        ?.insertAdjacentElement("afterend", wrapper);
    } else {
      headerActions.appendChild(wrapper);
    }
    input.addEventListener("change", () => updateTheme(input.checked));
  }

  // ----- Mobile toggle -----
  const offcanvas = document.getElementById("siteOffcanvas");
  if (offcanvas && !document.getElementById("theme-toggle-off")) {
    const bottomRow =
      offcanvas.querySelector(".mt-auto.d-flex") ||
      offcanvas.querySelector(".offcanvas-body");
    if (bottomRow) {
      const { wrapper, input } = createToggle("-off");
      const offLogin = bottomRow.querySelector(".btn-danger");
      if (offLogin) offLogin.insertAdjacentElement("afterend", wrapper);
      else bottomRow.appendChild(wrapper);
      input.addEventListener("change", () => updateTheme(input.checked));
    }
  }
});
// Logout Button Handler (Global) | Author: MK
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.querySelector(".logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault(); // prevent accidental navigation

      // Remove login-related data
      localStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");

      // Optional: Add a small delay for a smoother UX
      setTimeout(() => {
        window.location.href = "login.html";
      }, 300);
    });
  }
});
// --- FilterData (normalized) Job listed ---
const jobData = [
  {
    id: 1,
    title: "Mechanic Ground Support Haneda",
    company: "Japan Airline",
    location: "tokyo",
    industry: "aviation",
    salary: 220000,
    japaneseLevel: "n4",
    support: "yes",
    // static detail page exists
    slug: "mechanic-ground-support-haneda",
  },
  {
    id: 2,
    title: "Construction Worker",
    company: "Mitsubishi Heavy Industries",
    location: "kyoto",
    salary: 200000,
    industry: "construction",
    japaneseLevel: "N5",
    support: "yes",
    // static page created
    slug: "construction-worker",
  },
  {
    id: 3,
    title: "Food Service Staff",
    company: "Local Ramen Shop",
    location: "osaka",
    salary: 200000,
    industry: "food service",
    japaneseLevel: "N5",
    support: "yes",
    slug: "food-service-staff",
  },
  {
    id: 4,
    title: "Nursing Care Assistant",
    company: "Harmony Home",
    location: "kanagawa",
    salary: 220000,
    industry: "nursing care",
    japaneseLevel: "N3",
    support: "yes",
    slug: "nursing-care-assistant",
  },

  {
    id: 5,
    title: "Ground Handling Staff",
    company: "All Nippon Airway",
    location: "Tokyo",
    salary: 203000,
    industry: "aviation",
    japaneseLevel: "N3",
    support: "yes",
    slug: "ground-handling-staff",
  },

  {
    id: 6,
    title: "Cleaner Facilities Maintenance",
    company: "Yamaman General Services Co., Ltd.",
    location: "Kyoto",
    salary: 198000,
    industry: "Building Cleaning",
    japaneseLevel: "N3",
    support: "No",
    slug: "cleaner-facilities-maintenance",
  },

  {
    id: 7,
    title: "Construction Worker Site Support",
    company: "Adecco Co., Ltd. 1500",
    location: "Tokyo",
    salary: 286000,
    industry: "Building Cleaning",
    japaneseLevel: "N5",
    support: "No",
    slug: "construction-worker-site-support",
  },

  {
    id: 8,
    title: "Server Hospitality",
    company: "Skylark Corporation",
    location: "Tokyo",
    salary: 225000,
    industry: "Food Service",
    japaneseLevel: "N3",
    support: "No",
    slug: "server-hospitality",
  },

  {
    id: 9,
    title: "Ward Nursing Support",
    company: "Proud Partners",
    location: "Kagoshima",
    salary: 184000,
    industry: "Caregiver",
    japaneseLevel: "N3",
    support: "Yo",
    slug: "ward-nursing-support",
  },
];

// Expose job data to pages that may need to render a specific job detail
window.JOB_DATA = jobData;

// --- State (use lowercase tokens consistently) ---
const state = {
  search: "",
  support: ["all"],
  japaneseLevel: ["any"],
  location: ["all"],
  industry: ["all"],
  minSalary: [0],
};

// DOM refs
const jobListings = document.getElementById("jobListings");
const noResults = document.getElementById("noResults");
const resultCountEl = document.getElementById("resultCount");
const filterAnnouncement = document.getElementById("filterAnnouncement");
const filters = document.querySelectorAll("[data-filter-group]");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearFilters");

// Only initialize job filtering and rendering if jobListings element exists
if (jobListings) {
  // helper: render jobs
  function renderJobs(jobs) {
    jobListings.innerHTML = "";
    resultCountEl.textContent = jobs.length;

    if (!jobs.length) {
      noResults.classList.remove("d-none");
      // Announce to screen readers
      if (filterAnnouncement) {
        filterAnnouncement.textContent =
          "No jobs found. Try adjusting your filters.";
      }
      return;
    }
    noResults.classList.add("d-none");

    // Announce results to screen readers
    if (filterAnnouncement) {
      filterAnnouncement.textContent = `${jobs.length} job${
        jobs.length === 1 ? "" : "s"
      } found`;
    }

    jobs.forEach((job) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-6";
      col.setAttribute("role", "listitem");

      // --- Determine detail page URL: prefer explicit slug (static page),
      // otherwise fall back to dynamic detail page with query id ---
      const jobSlug = job.slug || createSlug(job.title);
      let detailUrl;
      if (job.slug) {
        // static page exists under pages/jobs/{slug}.html
        // Build a relative URL (no leading slash) so GitHub Pages' repo path
        // prefixes are preserved and links don't resolve to the site root.
        // Use `includes` because `window.location.pathname` may contain
        // the segment anywhere (e.g. when served from a subpath), and
        // startsWith could fail if the path contains additional prefix.
        if (window.location.pathname.includes("/pages/jobs/")) {
          detailUrl = `./${job.slug}.html`;
        } else {
          detailUrl = `pages/jobs/${job.slug}.html`;
        }
      } else {
        // fallback to a dynamic detail page handled by jobDetails.html
        if (window.location.pathname.includes("/pages/jobs/")) {
          detailUrl = `./jobDetails.html?id=${encodeURIComponent(
            String(job.id),
          )}`;
        } else {
          detailUrl = `pages/jobs/jobDetails.html?id=${encodeURIComponent(
            String(job.id),
          )}`;
        }
      }
      // ---------------------------------------------

      col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 job-card">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h5 class="fw-bold mb-1">${escapeHtml(job.title)}</h5>
           
                </div>
                <p class="text-muted mb-2">${escapeHtml(
                  job.company,
                )} · ${capitalize(job.location)}</p>
                <p class="small mb-1"><strong>Industry:</strong> ${capitalize(
                  job.industry,
                )}</p>
                <p class="small mb-1"><strong>Salary:</strong> ¥${job.salary.toLocaleString()}</p>
                     <p class="small mb-1"><strong>Industry:</strong> ${capitalize(
                       job.japaneseLevel,
                     )}</p>
                <p class="small mb-1"><strong>Visa Support:</strong> ${capitalize(
                  job.support,
                )}</p>
              </div>
              <div class="card-footer bg-transparent border-0">
                <a href="${detailUrl}" class="btn btn-primary w-100">View Details</a>
            </div>
            </div>
          `;
      jobListings.appendChild(col);
    });
  }

  // helpers
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"'>]/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }
  /**
   * Converts a string (like a title) into a URL-friendly slug.
   * @param {string} title
   * @returns {string} The URL slug.
   */
  function createSlug(title) {
    if (!title) return "";
    return (
      title
        .toLowerCase()
        // Replace non-alphanumeric characters (except spaces/dashes) with nothing
        .replace(/[^a-z0-9\s-]/g, "")
        // Trim leading/trailing whitespace
        .trim()
        // Replace all spaces with a single hyphen
        .replace(/\s+/g, "-")
    );
  }

  // update button styles for a group
  function updateButtons(groupKey) {
    const container = document.querySelector(
      `[data-filter-group="${groupKey}"]`,
    );
    if (!container) return;
    container.querySelectorAll("button[data-value]").forEach((btn) => {
      const val = String(btn.dataset.value).toLowerCase();
      const salary = parseInt(btn.dataset.salary || "0", 10);
      const active =
        groupKey === "minSalary"
          ? state[groupKey].includes(salary)
          : state[groupKey].includes(val);

      // Update visual state
      if (active) {
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-outline-primary", "active");
      } else {
        btn.classList.remove("btn-primary", "btn-outline-primary", "active");
        btn.classList.add("btn-outline-secondary");
      }

      // Update ARIA pressed state for accessibility
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  // main filter function
  function filterJobs() {
    const search = state.search;
    const isSupportAll = state.support.includes("all");
    const isJapaneseAny = state.japaneseLevel.includes("any");
    const isLocationAll = state.location.includes("all");
    const isIndustryAll = state.industry.includes("all");
    const minSalaryValue = Math.max(...state.minSalary);

    const filtered = jobData.filter((job) => {
      // search (title, company, location, japaneseLevel)
      if (search) {
        const hay = (
          job.title +
          " " +
          job.company +
          " " +
          job.location +
          " " +
          job.japaneseLevel
        ).toLowerCase();
        if (!hay.includes(search)) return false;
      }

      // support
      if (!isSupportAll && !state.support.includes(job.support)) return false;

      // japanese level
      if (!isJapaneseAny && !state.japaneseLevel.includes(job.japaneseLevel))
        return false;

      // location
      if (!isLocationAll && !state.location.includes(job.location))
        return false;

      // industry
      if (!isIndustryAll && !state.industry.includes(job.industry))
        return false;

      // salary
      if (job.salary < minSalaryValue) return false;

      return true;
    });

    renderJobs(filtered);
  }

  // wire up filter buttons (delegated per group)
  filters.forEach((groupEl) => {
    const groupKey = groupEl.dataset.filterGroup;
    groupEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-value]");
      if (!btn) return;

      const rawVal = btn.dataset.value;
      const val = String(rawVal).toLowerCase();
      const salary = parseInt(btn.dataset.salary || "0", 10);

      // determine key and whether clicked is reset/all option
      const isMinSalary = groupKey === "minSalary";
      const isReset =
        val === "all" ||
        val === "any" ||
        (!isMinSalary && val === "") ||
        (isMinSalary && salary === 0);

      const key = isMinSalary ? salary : val;

      // toggle selection
      if (state[groupKey].includes(key)) {
        // if more than 1 selected, remove; else keep (prevent empty)
        if (state[groupKey].length > 1) {
          state[groupKey] = state[groupKey].filter((v) => v !== key);
        }
      } else {
        // add new selection
        state[groupKey].push(key);
      }

      // if reset/all clicked and is now selected -> set alone
      if (isReset && state[groupKey].includes(key)) {
        state[groupKey] = [key];
      }

      // when non-reset selected, remove any 'all' default
      if (!isReset && state[groupKey].length > 1) {
        state[groupKey] = state[groupKey].filter((v) => {
          return !(v === "all" || v === "any" || v === 0);
        });
      }

      // ensure at least one default remains
      if (state[groupKey].length === 0) {
        if (groupKey === "support") state[groupKey] = ["all"];
        if (groupKey === "japaneseLevel") state[groupKey] = ["any"];
        if (groupKey === "location") state[groupKey] = ["all"];
        if (groupKey === "industry") state[groupKey] = ["all"];
        if (groupKey === "minSalary") state[groupKey] = [0];
      }

      updateButtons(groupKey);
      filterJobs();
    });
  });

  // search input
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value.toLowerCase().trim();
      filterJobs();
    });

    // Keyboard shortcuts for search input
    searchInput.addEventListener("keydown", (e) => {
      // Escape key clears the search
      if (e.key === "Escape") {
        searchInput.value = "";
        state.search = "";
        filterJobs();
        if (filterAnnouncement) {
          filterAnnouncement.textContent = "Search cleared";
        }
      }
    });
  }

  // clear filters
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      state.support = ["all"];
      state.japaneseLevel = ["any"];
      state.location = ["all"];
      state.industry = ["all"];
      state.minSalary = [0];

      // update all button groups visually
      ["support", "japaneseLevel", "location", "industry", "minSalary"].forEach(
        (k) => updateButtons(k),
      );
      if (searchInput) {
        searchInput.value = "";
        state.search = "";
      }
      filterJobs();

      // Announce to screen readers
      if (filterAnnouncement) {
        filterAnnouncement.textContent =
          "All filters cleared. Showing all jobs.";
      }

      // Return focus to search input for keyboard users
      if (searchInput) {
        searchInput.focus();
      }
    });
  }

  // Global keyboard shortcut: Ctrl+K or Cmd+K to focus search
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  // initial render
  window.addEventListener("DOMContentLoaded", () => {
    // ensure all groups reflect initial active button styles
    ["support", "japaneseLevel", "location", "industry", "minSalary"].forEach(
      (k) => updateButtons(k),
    );
    filterJobs();
  });
}

//  JOB ALERT
document.addEventListener("DOMContentLoaded", () => {
  // 1. Get references to the elements
  const emailInput = document.getElementById("newsletter-email");
  const signupButton = document.getElementById("signup-button");
  const jobAlertToastEl = document.getElementById("jobAlertToast");

  // Only run if elements exist
  if (!emailInput || !signupButton || !jobAlertToastEl) {
    return;
  }

  // 2. Initialize the Bootstrap Toast component
  // Note: bootstrap is available globally since the bundle script is loaded above
  const jobAlertToast = new bootstrap.Toast(jobAlertToastEl, {
    autohide: true,
    delay: 5000, // Toast will hide after 5 seconds
  });

  // 3. Function to update the button state
  const updateButtonState = () => {
    // Check for a non-empty value and basic email format (containing '@')
    const isValid =
      emailInput.value.trim() !== "" && emailInput.value.includes("@");
  };

  // 4. Enable/Disable the button based on input
  emailInput.addEventListener("input", updateButtonState);

  // Run once on load in case the browser pre-fills the input
  updateButtonState();

  // 5. Show the Toast on button click (Demo action)
  signupButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default form submission behavior (though this isn't a form, it's good practice)

    if (!signupButton.disabled) {
      //DEMO ACTION: Show the success Toast
      jobAlertToast.show();

      //DEMO ACTION: Clear the input field and disable the button after "signing up"
      emailInput.value = "";
      updateButtonState();
    }
  });
});

// --- Small, conservative utilities: active-nav auto-detect + aria fallbacks ---
(function () {
  // Active nav auto-detection: mark nav link matching current path as .active
  function applyActiveNav() {
    try {
      const links = document.querySelectorAll(
        ".navbar a.nav-link, .nav-link, nav a[href]",
      );
      if (!links || links.length === 0) return;

      const currentPath = window.location.pathname.replace(/\/+$/, "");
      const currentHash = window.location.hash;

      links.forEach((link) => {
        try {
          const href = link.getAttribute("href");
          if (!href) return;

          // Normalize
          let url;
          try {
            url = new URL(href, window.location.href);
          } catch (e) {
            // If href is something odd, skip
            return;
          }

          const linkPath = url.pathname.replace(/\/+$/, "");

          // Exact path match OR hash-only match
          if (
            linkPath === currentPath ||
            (url.hash && url.hash === currentHash) ||
            href === "#" + currentHash.replace(/^#/, "")
          ) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        } catch (errInner) {
          // ignore per-link errors
        }
      });
    } catch (err) {
      console.warn("Active-nav helper failed:", err);
    }
  }

  // Aria fallbacks: add conservative accessible names for unlabeled selects, empty anchors, and images without alt
  function applyAriaFallbacks() {
    try {
      // SELECTS: if no aria-label / aria-labelledby / associated label, try to infer
      document.querySelectorAll("select").forEach((sel) => {
        if (
          sel.getAttribute("aria-label") ||
          sel.getAttribute("aria-labelledby")
        )
          return;

        // If there's a label[for=id]
        const id = sel.id;
        if (id) {
          const lab = document.querySelector(`label[for="${id}"]`);
          if (lab && lab.textContent.trim()) {
            sel.setAttribute("aria-label", lab.textContent.trim());
            return;
          }
        }

        // If wrapped by a label
        const wrapperLabel = sel.closest("label");
        if (wrapperLabel && wrapperLabel.textContent.trim()) {
          sel.setAttribute("aria-label", wrapperLabel.textContent.trim());
          return;
        }

        // Try nearest heading or legend or small descriptive text
        let inferred = null;
        const heading = sel.closest("fieldset")
          ? sel.closest("fieldset").querySelector("legend")
          : null;
        if (heading && heading.textContent.trim())
          inferred = heading.textContent.trim();

        if (!inferred) {
          const prev = sel.previousElementSibling;
          if (prev && prev.textContent && prev.textContent.trim().length < 80)
            inferred = prev.textContent.trim();
        }

        if (!inferred) {
          const parentHeader = sel.closest(".card")
            ? sel.closest(".card").querySelector("h3,h4,h5,h6,h2,h1")
            : null;
          if (parentHeader && parentHeader.textContent.trim())
            inferred = parentHeader.textContent.trim();
        }

        if (inferred) sel.setAttribute("aria-label", inferred);
      });

      // IMAGES: add conservative alt text for images missing the attribute or empty alt
      document.querySelectorAll("img").forEach((img) => {
        try {
          const hasAlt = img.hasAttribute("alt");
          if (!hasAlt || (img.getAttribute("alt") || "").trim() === "") {
            // If the image has an adjacent caption or title, prefer that
            const title = img.getAttribute("title");
            if (title && title.trim()) {
              img.setAttribute("alt", title.trim());
              return;
            }

            const fig = img.closest("figure");
            if (fig) {
              const cap = fig.querySelector("figcaption");
              if (cap && cap.textContent.trim()) {
                img.setAttribute("alt", cap.textContent.trim());
                return;
              }
            }

            // Fallback conservative alt
            img.setAttribute("alt", "Image");
          }
        } catch (e) {
          // ignore image failures
        }
      });

      // EMPTY ANCHORS: label anchors that have no text and no aria-label
      document.querySelectorAll("a").forEach((a) => {
        try {
          if ((a.textContent || "").trim().length > 0) return;
          if (a.getAttribute("aria-label") || a.getAttribute("title")) return;

          // If anchor contains an image with alt text, use that
          const img = a.querySelector("img");
          if (img && (img.getAttribute("alt") || "").trim()) {
            a.setAttribute("aria-label", img.getAttribute("alt").trim());
            return;
          }

          // Otherwise infer from nearest header
          const header = a.closest(".card")
            ? a.closest(".card").querySelector("h3,h4,h5,h6,h2,h1")
            : null;
          if (header && header.textContent.trim()) {
            a.setAttribute("aria-label", header.textContent.trim());
            return;
          }

          // Last resort: use a generic label
          a.setAttribute("aria-label", "Link");
        } catch (e) {
          // ignore per-anchor errors
        }
      });
    } catch (err) {
      console.warn("Aria fallbacks failed:", err);
    }
  }

  // Run on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyActiveNav();
      applyAriaFallbacks();
    });
  } else {
    applyActiveNav();
    applyAriaFallbacks();
  }
})();


